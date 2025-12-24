-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('manufacturer', 'distributor', 'pharmacy', 'consumer', 'admin');

-- Create drug_status enum
CREATE TYPE public.drug_status AS ENUM ('created', 'distributed', 'in_pharmacy', 'sold', 'flagged');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create drugs table
CREATE TABLE public.drugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_name TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  manufacturer_id UUID NOT NULL REFERENCES auth.users(id),
  qr_code_hash TEXT UNIQUE NOT NULL,
  current_status drug_status NOT NULL DEFAULT 'created',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scan_logs table
CREATE TABLE public.scan_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  scanned_by_user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL,
  location TEXT,
  scan_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_result TEXT NOT NULL,
  ai_explanation TEXT
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drugs RLS policies
CREATE POLICY "Anyone can view drugs"
ON public.drugs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Public can view drugs for verification"
ON public.drugs FOR SELECT
TO anon
USING (true);

CREATE POLICY "Manufacturers can create drugs"
ON public.drugs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'manufacturer') AND manufacturer_id = auth.uid());

CREATE POLICY "Manufacturers can update their own drugs"
ON public.drugs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'manufacturer') AND manufacturer_id = auth.uid());

CREATE POLICY "Manufacturers can delete their own drugs"
ON public.drugs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'manufacturer') AND manufacturer_id = auth.uid());

CREATE POLICY "Distributors can update drug status"
ON public.drugs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'distributor'));

CREATE POLICY "Pharmacies can update drug status"
ON public.drugs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'pharmacy'));

CREATE POLICY "Admins can manage all drugs"
ON public.drugs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Scan logs RLS policies
CREATE POLICY "Authenticated users can view scan logs"
ON public.scan_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Public can view scan logs"
ON public.scan_logs FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated users can create scan logs"
ON public.scan_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anonymous users can create scan logs"
ON public.scan_logs FOR INSERT
TO anon
WITH CHECK (true);

-- Alerts RLS policies
CREATE POLICY "Authenticated users can view alerts"
ON public.alerts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Public can view alerts"
ON public.alerts FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated users can create alerts"
ON public.alerts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anonymous users can create alerts"
ON public.alerts FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Admins can manage alerts"
ON public.alerts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_drugs_updated_at
  BEFORE UPDATE ON public.drugs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.drugs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Also add roles for existing users so they can test (using pharmacy role as default)
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'pharmacy'::app_role
FROM public.profiles
WHERE user_id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT DO NOTHING;
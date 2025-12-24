import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DrugStatus = 'created' | 'distributed' | 'in_pharmacy' | 'sold' | 'flagged';

export interface Drug {
  id: string;
  drug_name: string;
  batch_number: string;
  expiry_date: string;
  manufacturer_id: string;
  qr_code_hash: string;
  current_status: DrugStatus;
  created_at: string;
  updated_at: string;
}

export interface ScanLog {
  id: string;
  drug_id: string;
  scanned_by_user_id: string | null;
  role: string;
  location: string | null;
  scan_time: string;
  verification_result: string;
  ai_explanation: string | null;
}

export interface Alert {
  id: string;
  drug_id: string;
  alert_type: string;
  description: string;
  created_at: string;
  resolved: boolean;
}

// Fetch all drugs
export const useDrugs = () => {
  return useQuery({
    queryKey: ['drugs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Drug[];
    }
  });
};

// Fetch drugs by manufacturer
export const useManufacturerDrugs = (manufacturerId: string | undefined) => {
  return useQuery({
    queryKey: ['drugs', 'manufacturer', manufacturerId],
    queryFn: async () => {
      if (!manufacturerId) return [];
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('manufacturer_id', manufacturerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Drug[];
    },
    enabled: !!manufacturerId
  });
};

// Fetch drug by QR hash
export const useDrugByQRHash = (qrHash: string | undefined) => {
  return useQuery({
    queryKey: ['drugs', 'qr', qrHash],
    queryFn: async () => {
      if (!qrHash) return null;
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('qr_code_hash', qrHash)
        .maybeSingle();
      
      if (error) throw error;
      return data as Drug | null;
    },
    enabled: !!qrHash
  });
};

// Fetch scan logs for a drug
export const useScanLogs = (drugId: string | undefined) => {
  return useQuery({
    queryKey: ['scan_logs', drugId],
    queryFn: async () => {
      if (!drugId) return [];
      const { data, error } = await supabase
        .from('scan_logs')
        .select('*')
        .eq('drug_id', drugId)
        .order('scan_time', { ascending: true });
      
      if (error) throw error;
      return data as ScanLog[];
    },
    enabled: !!drugId
  });
};

// Fetch all scan logs
export const useAllScanLogs = () => {
  return useQuery({
    queryKey: ['scan_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_logs')
        .select('*')
        .order('scan_time', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as ScanLog[];
    }
  });
};

// Fetch alerts
export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    }
  });
};

// Fetch alerts for a drug
export const useDrugAlerts = (drugId: string | undefined) => {
  return useQuery({
    queryKey: ['alerts', drugId],
    queryFn: async () => {
      if (!drugId) return [];
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('drug_id', drugId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!drugId
  });
};

// Create drug mutation
export const useCreateDrug = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (drug: {
      drug_name: string;
      batch_number: string;
      expiry_date: string;
      manufacturer_id: string;
    }) => {
      // Generate unique QR hash
      const qr_code_hash = `MED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('drugs')
        .insert({
          ...drug,
          qr_code_hash,
          current_status: 'created'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create initial scan log
      await supabase.from('scan_logs').insert({
        drug_id: data.id,
        scanned_by_user_id: drug.manufacturer_id,
        role: 'manufacturer',
        location: 'Manufacturing Facility',
        verification_result: 'created',
        ai_explanation: 'Drug registered in the system by manufacturer.'
      });
      
      return data as Drug;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      toast({
        title: "Drug Registered",
        description: "QR code generated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Update drug status mutation
export const useUpdateDrugStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      drugId,
      newStatus,
      userId,
      role,
      location
    }: {
      drugId: string;
      newStatus: DrugStatus;
      userId: string | null;
      role: string;
      location: string;
    }) => {
      // Update drug status
      const { error: updateError } = await supabase
        .from('drugs')
        .update({ current_status: newStatus })
        .eq('id', drugId);
      
      if (updateError) throw updateError;

      // Get AI explanation
      let aiExplanation = '';
      try {
        const { data: aiData } = await supabase.functions.invoke('ai-verification', {
          body: {
            type: 'explain',
            drugId,
            action: `Status updated to ${newStatus}`,
            role
          }
        });
        aiExplanation = aiData?.explanation || '';
      } catch {
        aiExplanation = `Drug status updated to ${newStatus} by ${role}.`;
      }

      // Create scan log
      const { error: logError } = await supabase.from('scan_logs').insert({
        drug_id: drugId,
        scanned_by_user_id: userId,
        role: role as 'manufacturer' | 'distributor' | 'pharmacy' | 'consumer' | 'admin',
        location,
        verification_result: newStatus,
        ai_explanation: aiExplanation
      });
      
      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      queryClient.invalidateQueries({ queryKey: ['scan_logs'] });
      toast({
        title: "Status Updated",
        description: "Drug status and scan log recorded"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Delete drug mutation
export const useDeleteDrug = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (drugId: string) => {
      const { error } = await supabase
        .from('drugs')
        .delete()
        .eq('id', drugId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      toast({
        title: "Drug Deleted",
        description: "Drug record removed from the system"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Create alert mutation
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: {
      drug_id: string;
      alert_type: string;
      description: string;
    }) => {
      const { data, error } = await supabase
        .from('alerts')
        .insert(alert)
        .select()
        .single();
      
      if (error) throw error;
      return data as Alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });
};

// Verify drug (public - for consumers)
export const useVerifyDrug = () => {
  return useMutation({
    mutationFn: async (qrHash: string) => {
      // Get drug by QR hash
      const { data: drug, error: drugError } = await supabase
        .from('drugs')
        .select('*')
        .eq('qr_code_hash', qrHash)
        .maybeSingle();
      
      if (drugError) throw drugError;
      if (!drug) return { drug: null, scanLogs: [], alerts: [], isAuthentic: false };

      // Get scan logs
      const { data: scanLogs } = await supabase
        .from('scan_logs')
        .select('*')
        .eq('drug_id', drug.id)
        .order('scan_time', { ascending: true });

      // Get alerts
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('drug_id', drug.id);

      // Record consumer scan
      await supabase.from('scan_logs').insert({
        drug_id: drug.id,
        role: 'consumer',
        location: 'Consumer Verification',
        verification_result: drug.current_status === 'flagged' ? 'flagged' : 'verified'
      });

      return {
        drug: drug as Drug,
        scanLogs: scanLogs as ScanLog[] || [],
        alerts: alerts as Alert[] || [],
        isAuthentic: drug.current_status !== 'flagged'
      };
    }
  });
};

// Get stats for dashboards
export const useDrugStats = () => {
  return useQuery({
    queryKey: ['drug_stats'],
    queryFn: async () => {
      const { data: drugs } = await supabase
        .from('drugs')
        .select('current_status');
      
      const { data: alerts } = await supabase
        .from('alerts')
        .select('id')
        .eq('resolved', false);

      const { data: scanLogs } = await supabase
        .from('scan_logs')
        .select('role');

      const statusCounts = {
        created: 0,
        distributed: 0,
        in_pharmacy: 0,
        sold: 0,
        flagged: 0
      };

      drugs?.forEach(d => {
        const status = d.current_status as DrugStatus;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });

      const roleCounts = {
        manufacturer: 0,
        distributor: 0,
        pharmacy: 0,
        consumer: 0,
        admin: 0
      };

      scanLogs?.forEach(s => {
        const role = s.role as keyof typeof roleCounts;
        if (role in roleCounts) {
          roleCounts[role]++;
        }
      });

      return {
        totalDrugs: drugs?.length || 0,
        statusCounts,
        alertCount: alerts?.length || 0,
        roleCounts,
        totalScans: scanLogs?.length || 0
      };
    }
  });
};

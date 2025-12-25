// Demo data for testing the verification system without database entries
import type { Drug, ScanLog, Alert } from '@/hooks/useDrugs';

export const DEMO_DRUGS: Record<string, {
  drug: Drug;
  scanLogs: ScanLog[];
  alerts: Alert[];
  isAuthentic: boolean;
}> = {
  'DEMO-AUTHENTIC-001': {
    drug: {
      id: 'demo-1',
      drug_name: 'Amoxicillin 500mg',
      batch_number: 'BATCH-2024-001',
      expiry_date: '2026-06-15',
      manufacturer_id: 'demo-manufacturer',
      qr_code_hash: 'DEMO-AUTHENTIC-001',
      current_status: 'sold',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-03-20T14:30:00Z'
    },
    scanLogs: [
      {
        id: 'log-1',
        drug_id: 'demo-1',
        scanned_by_user_id: 'manufacturer-1',
        role: 'manufacturer',
        location: 'PharmaCorp Manufacturing Facility, Mumbai',
        scan_time: '2024-01-15T10:00:00Z',
        verification_result: 'created',
        ai_explanation: 'Drug registered in the blockchain by verified manufacturer PharmaCorp. All documentation verified and compliant with FDA standards.'
      },
      {
        id: 'log-2',
        drug_id: 'demo-1',
        scanned_by_user_id: 'distributor-1',
        role: 'distributor',
        location: 'MediLogistics Distribution Center, Delhi',
        scan_time: '2024-02-01T09:15:00Z',
        verification_result: 'distributed',
        ai_explanation: 'Drug received by authorized distributor MediLogistics. Temperature records indicate proper cold-chain maintenance throughout transit.'
      },
      {
        id: 'log-3',
        drug_id: 'demo-1',
        scanned_by_user_id: 'pharmacy-1',
        role: 'pharmacy',
        location: 'HealthFirst Pharmacy, Bangalore',
        scan_time: '2024-02-15T11:30:00Z',
        verification_result: 'in_pharmacy',
        ai_explanation: 'Drug verified and accepted by licensed pharmacy HealthFirst. Storage conditions confirmed at required temperature range.'
      },
      {
        id: 'log-4',
        drug_id: 'demo-1',
        scanned_by_user_id: null,
        role: 'consumer',
        location: 'Consumer Purchase',
        scan_time: '2024-03-20T14:30:00Z',
        verification_result: 'sold',
        ai_explanation: 'Drug sold to consumer. Complete supply chain verified - this medicine is AUTHENTIC and safe to use.'
      }
    ],
    alerts: [],
    isAuthentic: true
  },
  'DEMO-FLAGGED-002': {
    drug: {
      id: 'demo-2',
      drug_name: 'Ibuprofen 400mg',
      batch_number: 'BATCH-2024-FAKE',
      expiry_date: '2025-12-20',
      manufacturer_id: 'demo-manufacturer',
      qr_code_hash: 'DEMO-FLAGGED-002',
      current_status: 'flagged',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-03-10T16:45:00Z'
    },
    scanLogs: [
      {
        id: 'log-5',
        drug_id: 'demo-2',
        scanned_by_user_id: 'manufacturer-1',
        role: 'manufacturer',
        location: 'Unknown Origin',
        scan_time: '2024-02-01T10:00:00Z',
        verification_result: 'created',
        ai_explanation: 'Initial registration detected but manufacturer verification FAILED. Batch number pattern does not match authorized manufacturer records.'
      },
      {
        id: 'log-6',
        drug_id: 'demo-2',
        scanned_by_user_id: 'distributor-2',
        role: 'distributor',
        location: 'Unauthorized Location',
        scan_time: '2024-02-20T08:00:00Z',
        verification_result: 'flagged',
        ai_explanation: 'ALERT: Duplicate QR code detected! This exact code was already scanned at a different location 3 days ago. Possible counterfeit drug.'
      }
    ],
    alerts: [
      {
        id: 'alert-1',
        drug_id: 'demo-2',
        alert_type: 'duplicate_scan',
        description: 'QR code scanned at multiple locations simultaneously - indicates possible counterfeit distribution',
        created_at: '2024-02-20T08:00:00Z',
        resolved: false
      },
      {
        id: 'alert-2',
        drug_id: 'demo-2',
        alert_type: 'manufacturer_mismatch',
        description: 'Batch number format does not match registered manufacturer patterns',
        created_at: '2024-02-20T08:05:00Z',
        resolved: false
      }
    ],
    isAuthentic: false
  },
  'DEMO-EXPIRED-003': {
    drug: {
      id: 'demo-3',
      drug_name: 'Paracetamol 500mg',
      batch_number: 'BATCH-2022-OLD',
      expiry_date: '2024-01-15',
      manufacturer_id: 'demo-manufacturer',
      qr_code_hash: 'DEMO-EXPIRED-003',
      current_status: 'flagged',
      created_at: '2022-01-10T10:00:00Z',
      updated_at: '2024-06-01T09:00:00Z'
    },
    scanLogs: [
      {
        id: 'log-7',
        drug_id: 'demo-3',
        scanned_by_user_id: 'manufacturer-1',
        role: 'manufacturer',
        location: 'PharmaCorp Manufacturing Facility',
        scan_time: '2022-01-10T10:00:00Z',
        verification_result: 'created',
        ai_explanation: 'Drug registered by verified manufacturer. Original production and packaging verified.'
      },
      {
        id: 'log-8',
        drug_id: 'demo-3',
        scanned_by_user_id: 'pharmacy-2',
        role: 'pharmacy',
        location: 'Local Pharmacy',
        scan_time: '2024-06-01T09:00:00Z',
        verification_result: 'flagged',
        ai_explanation: 'WARNING: Drug has EXPIRED. Expiry date was January 15, 2024. Do NOT consume this medication - it may be ineffective or harmful.'
      }
    ],
    alerts: [
      {
        id: 'alert-3',
        drug_id: 'demo-3',
        alert_type: 'expired',
        description: 'Drug has passed its expiration date and should not be consumed',
        created_at: '2024-06-01T09:00:00Z',
        resolved: false
      }
    ],
    isAuthentic: false
  }
};

export const isDemoQRCode = (qrHash: string): boolean => {
  return qrHash.startsWith('DEMO-') && qrHash in DEMO_DRUGS;
};

export const getDemoData = (qrHash: string) => {
  return DEMO_DRUGS[qrHash] || null;
};

export const DEMO_QR_CODES = Object.keys(DEMO_DRUGS);

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
  },
  'DEMO-INSULIN-004': {
    drug: {
      id: 'demo-4',
      drug_name: 'Insulin Glargine 100U/mL',
      batch_number: 'INS-2024-789',
      expiry_date: '2025-08-20',
      manufacturer_id: 'demo-manufacturer',
      qr_code_hash: 'DEMO-INSULIN-004',
      current_status: 'in_pharmacy',
      created_at: '2024-03-01T08:00:00Z',
      updated_at: '2024-04-15T10:30:00Z'
    },
    scanLogs: [
      {
        id: 'log-9',
        drug_id: 'demo-4',
        scanned_by_user_id: 'manufacturer-1',
        role: 'manufacturer',
        location: 'NovoMed Biologics, Pune',
        scan_time: '2024-03-01T08:00:00Z',
        verification_result: 'created',
        ai_explanation: 'Cold-chain insulin product registered. Temperature monitoring device attached. Requires 2-8°C storage.'
      },
      {
        id: 'log-10',
        drug_id: 'demo-4',
        scanned_by_user_id: 'distributor-1',
        role: 'distributor',
        location: 'ColdChain Logistics Hub, Chennai',
        scan_time: '2024-03-20T14:00:00Z',
        verification_result: 'distributed',
        ai_explanation: 'Temperature maintained at 4.2°C during transport. Cold-chain integrity verified via IoT sensors.'
      },
      {
        id: 'log-11',
        drug_id: 'demo-4',
        scanned_by_user_id: 'pharmacy-1',
        role: 'pharmacy',
        location: 'MediCare Pharmacy, Hyderabad',
        scan_time: '2024-04-15T10:30:00Z',
        verification_result: 'in_pharmacy',
        ai_explanation: 'Received in refrigerated storage. Product verified authentic. Ready for dispensing to patients.'
      }
    ],
    alerts: [],
    isAuthentic: true
  },
  'DEMO-ANTIBIOTIC-005': {
    drug: {
      id: 'demo-5',
      drug_name: 'Azithromycin 250mg',
      batch_number: 'AZI-2024-456',
      expiry_date: '2026-02-28',
      manufacturer_id: 'demo-manufacturer',
      qr_code_hash: 'DEMO-ANTIBIOTIC-005',
      current_status: 'distributed',
      created_at: '2024-05-10T09:00:00Z',
      updated_at: '2024-06-05T11:00:00Z'
    },
    scanLogs: [
      {
        id: 'log-12',
        drug_id: 'demo-5',
        scanned_by_user_id: 'manufacturer-1',
        role: 'manufacturer',
        location: 'Cipla Manufacturing, Goa',
        scan_time: '2024-05-10T09:00:00Z',
        verification_result: 'created',
        ai_explanation: 'Z-Pack antibiotic registered. Quality control passed. Batch tested for potency and purity.'
      },
      {
        id: 'log-13',
        drug_id: 'demo-5',
        scanned_by_user_id: 'distributor-1',
        role: 'distributor',
        location: 'PharmaDistro Warehouse, Mumbai',
        scan_time: '2024-06-05T11:00:00Z',
        verification_result: 'distributed',
        ai_explanation: 'Shipment received and verified. Currently in transit to retail pharmacies across Western region.'
      }
    ],
    alerts: [],
    isAuthentic: true
  },
  'DEMO-CARDIAC-006': {
    drug: {
      id: 'demo-6',
      drug_name: 'Atorvastatin 20mg',
      batch_number: 'ATV-2024-321',
      expiry_date: '2026-09-15',
      manufacturer_id: 'demo-manufacturer',
      qr_code_hash: 'DEMO-CARDIAC-006',
      current_status: 'sold',
      created_at: '2024-02-20T07:00:00Z',
      updated_at: '2024-05-18T16:00:00Z'
    },
    scanLogs: [
      {
        id: 'log-14',
        drug_id: 'demo-6',
        scanned_by_user_id: 'manufacturer-1',
        role: 'manufacturer',
        location: 'Sun Pharma, Vadodara',
        scan_time: '2024-02-20T07:00:00Z',
        verification_result: 'created',
        ai_explanation: 'Cholesterol-lowering statin registered. FDA-approved generic formulation.'
      },
      {
        id: 'log-15',
        drug_id: 'demo-6',
        scanned_by_user_id: 'distributor-1',
        role: 'distributor',
        location: 'MediSupply Center, Ahmedabad',
        scan_time: '2024-03-15T10:00:00Z',
        verification_result: 'distributed',
        ai_explanation: 'Standard distribution protocol followed. Ambient temperature maintained.'
      },
      {
        id: 'log-16',
        drug_id: 'demo-6',
        scanned_by_user_id: 'pharmacy-1',
        role: 'pharmacy',
        location: 'Apollo Pharmacy, Surat',
        scan_time: '2024-04-01T09:00:00Z',
        verification_result: 'in_pharmacy',
        ai_explanation: 'Pharmacy inventory updated. Product available for patient dispensing.'
      },
      {
        id: 'log-17',
        drug_id: 'demo-6',
        scanned_by_user_id: null,
        role: 'consumer',
        location: 'Patient Purchase',
        scan_time: '2024-05-18T16:00:00Z',
        verification_result: 'sold',
        ai_explanation: 'Verified authentic medication. Complete traceability from manufacturer to patient confirmed.'
      }
    ],
    alerts: [],
    isAuthentic: true
  },
  'DEMO-SUSPICIOUS-007': {
    drug: {
      id: 'demo-7',
      drug_name: 'Metformin 500mg',
      batch_number: 'MET-UNKNOWN',
      expiry_date: '2025-11-30',
      manufacturer_id: 'unknown-manufacturer',
      qr_code_hash: 'DEMO-SUSPICIOUS-007',
      current_status: 'flagged',
      created_at: '2024-04-01T12:00:00Z',
      updated_at: '2024-04-20T08:00:00Z'
    },
    scanLogs: [
      {
        id: 'log-18',
        drug_id: 'demo-7',
        scanned_by_user_id: null,
        role: 'consumer',
        location: 'Street Vendor, Unknown Location',
        scan_time: '2024-04-20T08:00:00Z',
        verification_result: 'flagged',
        ai_explanation: 'CRITICAL WARNING: This drug has NO manufacturing record in our system. No authorized manufacturer has registered this batch. HIGH PROBABILITY OF COUNTERFEIT. Do NOT consume. Report to authorities immediately.'
      }
    ],
    alerts: [
      {
        id: 'alert-4',
        drug_id: 'demo-7',
        alert_type: 'unregistered_product',
        description: 'Product not found in any authorized manufacturer database',
        created_at: '2024-04-20T08:00:00Z',
        resolved: false
      },
      {
        id: 'alert-5',
        drug_id: 'demo-7',
        alert_type: 'suspicious_origin',
        description: 'First scan from unauthorized retail location',
        created_at: '2024-04-20T08:01:00Z',
        resolved: false
      }
    ],
    isAuthentic: false
  },
  'DEMO-VACCINE-008': {
    drug: {
      id: 'demo-8',
      drug_name: 'COVID-19 Vaccine (Covaxin)',
      batch_number: 'COV-2024-BATCH-A1',
      expiry_date: '2025-03-01',
      manufacturer_id: 'demo-manufacturer',
      qr_code_hash: 'DEMO-VACCINE-008',
      current_status: 'in_pharmacy',
      created_at: '2024-01-05T06:00:00Z',
      updated_at: '2024-02-10T09:00:00Z'
    },
    scanLogs: [
      {
        id: 'log-19',
        drug_id: 'demo-8',
        scanned_by_user_id: 'manufacturer-1',
        role: 'manufacturer',
        location: 'Bharat Biotech, Hyderabad',
        scan_time: '2024-01-05T06:00:00Z',
        verification_result: 'created',
        ai_explanation: 'COVID-19 vaccine batch registered. Ultra-cold chain initiated at -20°C. Government authorized batch for national immunization program.'
      },
      {
        id: 'log-20',
        drug_id: 'demo-8',
        scanned_by_user_id: 'distributor-1',
        role: 'distributor',
        location: 'Government Medical Stores, Delhi',
        scan_time: '2024-01-25T10:00:00Z',
        verification_result: 'distributed',
        ai_explanation: 'Received at government cold storage. Temperature log shows consistent -18°C to -22°C range. Batch allocated to vaccination centers.'
      },
      {
        id: 'log-21',
        drug_id: 'demo-8',
        scanned_by_user_id: 'pharmacy-1',
        role: 'pharmacy',
        location: 'District Hospital Vaccination Center, Jaipur',
        scan_time: '2024-02-10T09:00:00Z',
        verification_result: 'in_pharmacy',
        ai_explanation: 'Vaccine batch received at vaccination center. Cold chain verified intact. Ready for administration.'
      }
    ],
    alerts: [],
    isAuthentic: true
  }
};

export const isDemoQRCode = (qrHash: string): boolean => {
  return qrHash.startsWith('DEMO-') && qrHash in DEMO_DRUGS;
};

export const getDemoData = (qrHash: string) => {
  return DEMO_DRUGS[qrHash] || null;
};

export const DEMO_QR_CODES = Object.keys(DEMO_DRUGS);

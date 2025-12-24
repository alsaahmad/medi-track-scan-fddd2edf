// Mock data for demo purposes AND database types
export interface Drug {
  id: string;
  name: string;
  batchNumber: string;
  manufacturer: string;
  manufacturerId: string;
  manufacturedDate: string;
  expiryDate: string;
  status: 'manufactured' | 'in-transit' | 'at-distributor' | 'at-pharmacy' | 'sold' | 'flagged' | 'created' | 'distributed' | 'in_pharmacy';
  isAuthentic: boolean;
  scanHistory: ScanLog[];
  qrCodeHash?: string;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  role: 'manufacturer' | 'distributor' | 'pharmacy' | 'consumer' | 'admin';
  location: string;
  action: string;
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manufacturer' | 'distributor' | 'pharmacy' | 'consumer' | 'admin';
  company?: string;
}

export const mockDrugs: Drug[] = [
  {
    id: 'MED-2024-001',
    name: 'Amoxicillin 500mg',
    batchNumber: 'BTH-AMX-2024-0156',
    manufacturer: 'PharmaCorp International',
    manufacturerId: 'MFR-001',
    manufacturedDate: '2024-01-15',
    expiryDate: '2026-01-15',
    status: 'at-pharmacy',
    isAuthentic: true,
    scanHistory: [
      { id: '1', timestamp: '2024-01-15T09:00:00Z', role: 'manufacturer', location: 'Mumbai, India', action: 'Manufactured & Registered', userId: 'usr-1', userName: 'Dr. Rajesh Kumar' },
      { id: '2', timestamp: '2024-01-20T14:30:00Z', role: 'distributor', location: 'Delhi, India', action: 'Received at Distribution Center', userId: 'usr-2', userName: 'Vikram Singh' },
      { id: '3', timestamp: '2024-02-01T11:15:00Z', role: 'pharmacy', location: 'Bangalore, India', action: 'Received at Pharmacy', userId: 'usr-3', userName: 'HealthPlus Pharmacy' },
    ]
  },
  {
    id: 'MED-2024-002',
    name: 'Paracetamol 650mg',
    batchNumber: 'BTH-PCM-2024-0892',
    manufacturer: 'MediLife Labs',
    manufacturerId: 'MFR-002',
    manufacturedDate: '2024-02-10',
    expiryDate: '2027-02-10',
    status: 'in-transit',
    isAuthentic: true,
    scanHistory: [
      { id: '4', timestamp: '2024-02-10T08:00:00Z', role: 'manufacturer', location: 'Chennai, India', action: 'Manufactured & Registered', userId: 'usr-4', userName: 'MediLife Labs' },
      { id: '5', timestamp: '2024-02-15T16:45:00Z', role: 'distributor', location: 'Hyderabad, India', action: 'In Transit to Pharmacy', userId: 'usr-5', userName: 'QuickMed Logistics' },
    ]
  },
  {
    id: 'MED-2024-003',
    name: 'Ibuprofen 400mg',
    batchNumber: 'BTH-IBU-2024-0234',
    manufacturer: 'Unknown',
    manufacturerId: 'FAKE',
    manufacturedDate: '2024-03-01',
    expiryDate: '2025-03-01',
    status: 'flagged',
    isAuthentic: false,
    scanHistory: [
      { id: '6', timestamp: '2024-03-05T10:00:00Z', role: 'consumer', location: 'Pune, India', action: 'FLAGGED - Counterfeit Detected', userId: 'usr-6', userName: 'Anonymous Consumer' },
    ]
  },
  {
    id: 'MED-2024-004',
    name: 'Metformin 500mg',
    batchNumber: 'BTH-MET-2024-0567',
    manufacturer: 'PharmaCorp International',
    manufacturerId: 'MFR-001',
    manufacturedDate: '2024-01-20',
    expiryDate: '2026-01-20',
    status: 'sold',
    isAuthentic: true,
    scanHistory: [
      { id: '7', timestamp: '2024-01-20T09:30:00Z', role: 'manufacturer', location: 'Mumbai, India', action: 'Manufactured & Registered', userId: 'usr-1', userName: 'Dr. Rajesh Kumar' },
      { id: '8', timestamp: '2024-01-25T13:00:00Z', role: 'distributor', location: 'Kolkata, India', action: 'Received at Distribution Center', userId: 'usr-7', userName: 'Bengal Distributors' },
      { id: '9', timestamp: '2024-02-05T10:30:00Z', role: 'pharmacy', location: 'Jaipur, India', action: 'Received at Pharmacy', userId: 'usr-8', userName: 'CareFirst Pharmacy' },
      { id: '10', timestamp: '2024-02-10T15:20:00Z', role: 'consumer', location: 'Jaipur, India', action: 'Verified & Purchased', userId: 'usr-9', userName: 'Consumer' },
    ]
  },
  {
    id: 'MED-2024-005',
    name: 'Aspirin 100mg',
    batchNumber: 'BTH-ASP-2024-0789',
    manufacturer: 'GenMed Pharmaceuticals',
    manufacturerId: 'MFR-003',
    manufacturedDate: '2024-03-01',
    expiryDate: '2027-03-01',
    status: 'manufactured',
    isAuthentic: true,
    scanHistory: [
      { id: '11', timestamp: '2024-03-01T07:00:00Z', role: 'manufacturer', location: 'Ahmedabad, India', action: 'Manufactured & Registered', userId: 'usr-10', userName: 'GenMed QC Team' },
    ]
  },
];

export const mockUsers: User[] = [
  { id: 'usr-1', name: 'Dr. Rajesh Kumar', email: 'rajesh@pharmacorp.com', role: 'manufacturer', company: 'PharmaCorp International' },
  { id: 'usr-2', name: 'Vikram Singh', email: 'vikram@quickmed.com', role: 'distributor', company: 'QuickMed Logistics' },
  { id: 'usr-3', name: 'Priya Sharma', email: 'priya@healthplus.com', role: 'pharmacy', company: 'HealthPlus Pharmacy' },
  { id: 'usr-4', name: 'Admin User', email: 'admin@meditrack.com', role: 'admin' },
];

export type DrugStatus = Drug['status'];

export const getStatusColor = (status: DrugStatus): string => {
  switch (status) {
    case 'manufactured':
    case 'created':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'in-transit':
    case 'distributed':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'at-distributor': 
      return 'bg-accent text-accent-foreground';
    case 'at-pharmacy':
    case 'in_pharmacy':
      return 'bg-success/10 text-success border-success/20';
    case 'sold': 
      return 'bg-muted text-muted-foreground';
    case 'flagged': 
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default: 
      return 'bg-muted text-muted-foreground';
  }
};

export const getStatusLabel = (status: DrugStatus): string => {
  switch (status) {
    case 'manufactured':
    case 'created':
      return 'Created';
    case 'in-transit':
    case 'distributed':
      return 'Distributed';
    case 'at-distributor': 
      return 'At Distributor';
    case 'at-pharmacy':
    case 'in_pharmacy':
      return 'At Pharmacy';
    case 'sold': 
      return 'Sold';
    case 'flagged': 
      return 'Flagged';
    default: 
      return String(status);
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'manufacturer': return 'bg-primary';
    case 'distributor': return 'bg-warning';
    case 'pharmacy': return 'bg-success';
    case 'consumer': return 'bg-accent-foreground';
    case 'admin': return 'bg-primary';
    default: return 'bg-muted';
  }
};

// Helper to convert database drug to UI drug format
export const mapDatabaseDrugToUI = (drug: {
  id: string;
  drug_name: string;
  batch_number: string;
  expiry_date: string;
  manufacturer_id: string;
  qr_code_hash: string;
  current_status: string;
  created_at: string;
}, manufacturerName?: string): Drug => {
  return {
    id: drug.id,
    name: drug.drug_name,
    batchNumber: drug.batch_number,
    manufacturer: manufacturerName || 'Unknown',
    manufacturerId: drug.manufacturer_id,
    manufacturedDate: drug.created_at,
    expiryDate: drug.expiry_date,
    status: drug.current_status as DrugStatus,
    isAuthentic: drug.current_status !== 'flagged',
    scanHistory: [],
    qrCodeHash: drug.qr_code_hash,
  };
};

// Helper to convert database scan log to UI format
export const mapDatabaseScanLogToUI = (log: {
  id: string;
  scan_time: string;
  role: string;
  location: string | null;
  verification_result: string;
  scanned_by_user_id: string | null;
  ai_explanation: string | null;
}): ScanLog => {
  return {
    id: log.id,
    timestamp: log.scan_time,
    role: log.role as ScanLog['role'],
    location: log.location || 'Unknown Location',
    action: getActionFromResult(log.verification_result),
    userId: log.scanned_by_user_id || '',
    userName: getRoleDisplayName(log.role),
  };
};

const getActionFromResult = (result: string): string => {
  switch (result) {
    case 'created': return 'Manufactured & Registered';
    case 'distributed': return 'Received at Distribution Center';
    case 'in_pharmacy': return 'Received at Pharmacy';
    case 'sold': return 'Verified & Sold';
    case 'flagged': return 'FLAGGED - Suspicious Activity';
    case 'verified': return 'Verified by Consumer';
    default: return result;
  }
};

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'manufacturer': return 'Manufacturer';
    case 'distributor': return 'Distributor';
    case 'pharmacy': return 'Pharmacy';
    case 'consumer': return 'Consumer';
    case 'admin': return 'Administrator';
    default: return role;
  }
};

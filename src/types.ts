export type DepartmentWorkspace =
  | 'HUB_OPERATIONS'
  | 'TECHNICAL_REVIEW'
  | 'CLINICAL_REVIEW'
  | 'SUPPORT_REVIEW'
  | 'MANAGEMENT_GATE'
  | 'LEGAL_ARBITRATION';

export type DenialStatus =
  | 'INTAKE_PENDING'
  | 'IN_REVIEW'
  | 'CODING_CORRECTION'
  | 'EHR_DOCUMENTATION_ATTACHED'
  | 'COB_UPDATED'
  | 'APPEAL_SUBMITTED'
  | 'WRITE_OFF_REQUESTED'
  | 'WRITE_OFF_APPROVED'
  | 'ESCALATED_NSA_IDR'
  | 'SETTLED'
  | 'OVERTURNED';

export interface CARCCodeInfo {
  code: string;
  name: string;
  category: 'Contractual' | 'Medical Necessity' | 'Coding/Billing' | 'Patient Demographics' | 'Timely Filing';
  recommendedWorkspace: DepartmentWorkspace;
  description: string;
}

export interface RARCCodeInfo {
  code: string;
  description: string;
}

export interface DenialDispute {
  id: string;
  claimNumber: string;
  patientControlNumber: string;
  patientName: string;
  dateOfService: string;
  billedAmount: number;
  allowedAmount: number;
  deniedAmount: number;
  paidAmount: number;
  carcCode: string;
  carcDescription: string;
  rarcCode: string;
  payerId: string;
  payerName: string;
  assignedDepartment: DepartmentWorkspace;
  status: DenialStatus;
  appealDeadline: string;
  writeOffRequiresManagement: boolean;
  isNoSurprisesActEligible: boolean;
  clinicalSummary?: string;
  icd10Codes?: string[];
  cptCodes?: string[];
  batchId: string;
  lastUpdated: string;
  reviewerNotes?: string;
}

export interface DenialProcessingError {
  id: string;
  batchId: string;
  rawRecordIndex: number;
  claimNumber: string;
  errorCategory: 'Malformed EDI 835 CLP' | 'Invalid CARC Code' | 'Unrecognized Payer ID' | 'Numeric Overflow' | 'Schema Constraint';
  errorDetail: string;
  rawLineSnippet: string;
  timestamp: string;
}

export interface IngestionBatch {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  errorRecords: number;
  totalChunks: number;
  processedChunks: number;
  status: 'PENDING_UPLOAD' | 'BLOB_STREAMING' | 'QUEUE_LEVELING' | 'PARALLEL_PROCESSING' | 'COMPLETED' | 'HALTED';
  recordsPerSecond: number;
  activeScaleWorkers: number;
  startedAt: string;
  completedAt?: string;
  blobSasUri?: string;
}

export interface BatchTelemetryUpdate {
  batchId: string;
  processedRecords: number;
  validRecords: number;
  errorRecords: number;
  processedChunks: number;
  recordsPerSecond: number;
  activeScaleWorkers: number;
  latestError?: DenialProcessingError;
  timestamp: string;
}

export interface ArchitectureCodeSnippet {
  id: string;
  title: string;
  layer: 'Backend API Gateway (.NET 9)' | 'Azure Functions Worker' | 'Database Schema (Azure SQL)' | 'Frontend SignalR Client';
  filePath: string;
  language: 'csharp' | 'sql' | 'typescript';
  description: string;
  code: string;
}

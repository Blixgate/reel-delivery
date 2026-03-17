// ============================================================
// DELIVERY SYSTEM TYPES
// ============================================================

export type DeliveryCategory =
  | 'cinema_masters'
  | 'video_digital'
  | 'audio'
  | 'trailer'
  | 'marketing'
  | 'legal'
  | 'music_rights'
  | 'metadata';

export type RequirementStatus = 'required' | 'if_available' | 'waived' | 'conditional';

export type FulfillmentStatus = 'missing' | 'partial' | 'uploaded' | 'verified' | 'rejected';

export interface DeliveryItem {
  id: string;
  name: string;
  category: DeliveryCategory;
  technicalSpecs: string;
  status: RequirementStatus;
  condition?: string;
  qcRequired: boolean;
  quantity: number;
  deliveryMethod: string;
  notes: string;
  completed: boolean;
  completedDate?: string;
  // Gap detection fields
  fulfillment: FulfillmentStatus;
  uploadedFiles: UploadedDocument[];
  gapDetails?: GapDetail;
}

export interface DeliverySchedule {
  id: string;
  filmTitle: string;
  distributor: string;
  distributorContact?: string;
  labRequirements?: string;
  items: DeliveryItem[];
  totalItems: number;
  requiredItems: number;
  completedItems: number;
  parsedDate: string;
  rawText: string;
}

export interface Project {
  id: string;
  title: string;
  distributor: string;
  schedules: DeliverySchedule[];
  documents: UploadedDocument[];
  gapReport?: GapReport;
  financePlan?: FinancePlan;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DOCUMENT & GAP DETECTION TYPES
// ============================================================

export type DocumentType =
  | 'delivery_schedule'
  | 'cast_agreement'
  | 'crew_agreement'
  | 'vendor_agreement'
  | 'music_license'
  | 'sync_license'
  | 'master_use_license'
  | 'composer_agreement'
  | 'chain_of_title'
  | 'copyright_registration'
  | 'eo_insurance'
  | 'lab_access_letter'
  | 'qc_report'
  | 'sales_agreement'
  | 'sales_estimates'
  | 'finance_plan'
  | 'script'
  | 'ccsl'
  | 'music_cue_sheet'
  | 'rating_certificate'
  | 'certificate_of_origin'
  | 'tax_credit_certificate'
  | 'other';

export interface UploadedDocument {
  id: string;
  filename: string;
  fileType: string;
  documentType: DocumentType;
  uploadedAt: string;
  extractedData: ExtractedContractData | null;
  // Which delivery items this document fulfills
  fulfills: string[]; // DeliveryItem IDs
  fileSize: number;
}

export interface ExtractedContractData {
  parties: ContractParty[];
  dealTerms: DealTerm[];
  effectiveDate?: string;
  expirationDate?: string;
  territory?: string;
  rights?: string[];
  deliverables?: string[];
  compensation?: string;
  credits?: string;
  rawSummary: string;
}

export interface ContractParty {
  name: string;
  role: string; // e.g., "Producer", "Director", "Actor", "Composer", "Distributor"
  company?: string;
  email?: string;
}

export interface DealTerm {
  type: string; // e.g., "fee", "deferral", "backend", "credit", "territory"
  description: string;
  value?: string;
}

// ============================================================
// GAP ANALYSIS TYPES
// ============================================================

export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type GapActionType = 'document_request' | 'info_request' | 'technical_delivery' | 'signature_needed';

export interface GapDetail {
  severity: GapSeverity;
  description: string;
  whatIsNeeded: string;
  whoToContact?: string;
  suggestedAction: GapActionType;
  templateMessage?: string; // Pre-drafted request message
  deadline?: string;
  blockedBy?: string[]; // Other gap IDs this depends on
}

export interface GapReport {
  id: string;
  projectId: string;
  generatedAt: string;
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  lowGaps: number;
  gapsByCategory: Record<DeliveryCategory, GapReportItem[]>;
  completionPercentage: number;
  estimatedCompletionDate?: string;
  actionItems: ActionItem[];
}

export interface GapReportItem {
  deliveryItemId: string;
  deliveryItemName: string;
  fulfillment: FulfillmentStatus;
  gap: GapDetail;
}

export interface ActionItem {
  id: string;
  priority: GapSeverity;
  action: GapActionType;
  description: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'sent' | 'completed';
  relatedGaps: string[];
  templateMessage?: string;
}

// ============================================================
// FINANCE PLAN TYPES
// ============================================================

export type FinancingSource =
  | 'presales'
  | 'gap_financing'
  | 'tax_credit'
  | 'equity'
  | 'deferral'
  | 'mezzanine'
  | 'soft_money'
  | 'in_kind'
  | 'bank_loan'
  | 'other';

export interface FinancePlan {
  id: string;
  filmTitle: string;
  totalBudget: number;
  currency: string;
  capitalStack: CapitalStackItem[];
  salesEstimates: TerritoryEstimate[];
  taxIncentives: TaxIncentive[];
  waterfall: WaterfallTier[];
  gapAnalysis: FinanceGapAnalysis;
  generatedAt: string;
}

export interface CapitalStackItem {
  source: FinancingSource;
  label: string;
  amount: number;
  percentage: number; // of total budget
  status: 'confirmed' | 'projected' | 'pending' | 'conditional';
  terms?: string;
  recoupmentPosition: number; // order in waterfall
  notes?: string;
}

export interface TerritoryEstimate {
  territory: string;
  territoryGroup?: string; // e.g., "English-Speaking", "Europe", "Asia"
  mgValue: number; // minimum guarantee
  status: 'sold' | 'estimated' | 'unsold';
  distributor?: string;
  commissionRate: number;
  netToProducer: number;
  allRights: boolean;
  rightsDetail?: string;
  term?: string; // e.g., "15 years"
}

export interface TaxIncentive {
  id: string;
  jurisdiction: string;
  country: string;
  programName: string;
  creditType: 'refundable' | 'transferable' | 'non_refundable' | 'rebate' | 'grant';
  percentage: number;
  qualifyingSpend: number;
  estimatedCredit: number;
  requirements: string[];
  capAmount?: number;
  minimumSpend?: number;
  residencyRequired: boolean;
  applicationDeadline?: string;
  notes?: string;
}

export interface WaterfallTier {
  position: number;
  label: string;
  recipientType: FinancingSource | 'sales_agent' | 'collection_agent' | 'producer';
  recipient: string;
  percentage?: number;
  fixedAmount?: number;
  cap?: number;
  description: string;
}

export interface FinanceGapAnalysis {
  totalBudget: number;
  totalSecured: number;
  totalProjected: number;
  gap: number;
  gapPercentage: number;
  suggestedSources: SuggestedFinancingSource[];
}

export interface SuggestedFinancingSource {
  source: FinancingSource;
  estimatedAmount: number;
  rationale: string;
  requirements: string[];
  timeToSecure: string; // e.g., "2-4 weeks"
}

// ============================================================
// TAX INCENTIVE DATABASE TYPES
// ============================================================

export interface TaxIncentiveProgram {
  id: string;
  jurisdiction: string;
  country: string;
  region?: string; // state/province
  programName: string;
  creditType: 'refundable' | 'transferable' | 'non_refundable' | 'rebate' | 'grant';
  basePercentage: number;
  bonusPercentages?: BonusIncentive[];
  qualifyingExpenses: string[];
  excludedExpenses: string[];
  minimumSpend?: number;
  capPerProject?: number;
  capAnnual?: number;
  residencyRequirements: string;
  applicationProcess: string;
  typicalTimeline: string;
  websiteUrl?: string;
  lastUpdated: string;
  active: boolean;
}

export interface BonusIncentive {
  description: string;
  additionalPercentage: number;
  requirements: string[];
}

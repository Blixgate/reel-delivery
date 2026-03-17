import { v4 as uuid } from 'uuid';
import {
  DeliverySchedule,
  DeliveryItem,
  UploadedDocument,
  DocumentType,
  GapReport,
  GapDetail,
  GapReportItem,
  GapSeverity,
  GapActionType,
  ActionItem,
  DeliveryCategory,
  FulfillmentStatus,
  RequirementStatus,
} from './types';

/**
 * Gap Analyzer Engine
 * Analyzes delivery schedules against uploaded documents to identify gaps,
 * classify documents, and generate actionable reports.
 */

// ============================================================
// KEYWORD MAPPINGS FOR DOCUMENT CLASSIFICATION
// ============================================================

const DOCUMENT_TYPE_KEYWORDS: Record<DocumentType, string[]> = {
  delivery_schedule: ['delivery', 'specifications', 'technical specs', 'deliverables', 'schedule'],
  cast_agreement: ['cast agreement', 'actor agreement', 'talent contract', 'performer'],
  crew_agreement: ['crew agreement', 'crew contract', 'crew deal', 'director agreement', 'cinematographer'],
  vendor_agreement: ['vendor', 'supplier', 'production services', 'rental agreement'],
  music_license: ['music license', 'music rights', 'music sync', 'master use', 'synchronization'],
  sync_license: ['sync license', 'synchronization', 'sync rights', 'licensed music'],
  master_use_license: ['master use', 'master license', 'sound recording', 'master rights'],
  composer_agreement: ['composer agreement', 'composer contract', 'original music', 'score'],
  chain_of_title: ['chain of title', 'copyright chain', 'title chain', 'right to distribute'],
  copyright_registration: ['copyright registration', 'copyright certificate', 'registered copyright', 'copyright office'],
  eo_insurance: ['eo insurance', 'errors & omissions', 'errors and omissions', 'e&o'],
  lab_access_letter: ['lab access', 'laboratory access', 'lab letter', 'access letter'],
  qc_report: ['qc report', 'quality control', 'technical report', 'inspection report'],
  sales_agreement: ['sales agreement', 'distribution agreement', 'distributor agreement', 'sales contract'],
  sales_estimates: ['sales estimate', 'box office', 'revenue projection', 'forecast'],
  finance_plan: ['finance plan', 'financing', 'budget', 'financing plan', 'capital stack'],
  script: ['script', 'screenplay', 'shooting script'],
  ccsl: ['ccsl', 'closed caption', 'sdh', 'closed captioning', 'accessible'],
  music_cue_sheet: ['cue sheet', 'music cue', 'cue list', 'music report'],
  rating_certificate: ['rating certificate', 'mpaa rating', 'bbfc', 'rating', 'certification'],
  certificate_of_origin: ['certificate of origin', 'origin certificate', 'country of origin'],
  tax_credit_certificate: ['tax credit', 'tax certificate', 'tax incentive', 'filming incentive'],
  other: [],
};

// ============================================================
// DELIVERY ITEM MATCHING PATTERNS
// ============================================================

interface ItemMatchPattern {
  documentTypes: DocumentType[];
  keywords: string[];
  categories: DeliveryCategory[];
}

const ITEM_MATCH_PATTERNS: Record<string, ItemMatchPattern> = {
  music_sync: {
    documentTypes: ['sync_license', 'music_license', 'music_cue_sheet'],
    keywords: ['sync', 'synchronization', 'licensed music', 'music rights'],
    categories: ['music_rights'],
  },
  music_master: {
    documentTypes: ['master_use_license', 'music_license'],
    keywords: ['master use', 'master license', 'sound recording'],
    categories: ['music_rights'],
  },
  music_composer: {
    documentTypes: ['composer_agreement', 'chain_of_title'],
    keywords: ['composer', 'original music', 'score'],
    categories: ['music_rights'],
  },
  cast_clearance: {
    documentTypes: ['cast_agreement', 'chain_of_title'],
    keywords: ['cast', 'actor', 'talent'],
    categories: ['legal'],
  },
  insurance: {
    documentTypes: ['eo_insurance'],
    keywords: ['e&o', 'errors and omissions', 'insurance'],
    categories: ['legal'],
  },
  dcp_cinema: {
    documentTypes: ['qc_report', 'lab_access_letter'],
    keywords: ['cinema', 'dcp', 'lab', 'master'],
    categories: ['cinema_masters'],
  },
  caption: {
    documentTypes: ['ccsl'],
    keywords: ['caption', 'ccsl', 'accessible', 'sdh'],
    categories: ['legal', 'video_digital'],
  },
};

// ============================================================
// CONTACT SUGGESTIONS BY CATEGORY
// ============================================================

const CATEGORY_CONTACTS: Record<DeliveryCategory, string> = {
  cinema_masters: 'Post House / Lab',
  video_digital: 'Post House / Distributor',
  audio: 'Post House / Sound Designer',
  trailer: 'Marketing / Post House',
  marketing: 'Marketing Team / Distributor',
  legal: 'Legal / Producer',
  music_rights: 'Music Supervisor / Composer',
  metadata: 'Distributor / Metadata Manager',
};

// ============================================================
// PRIMARY API FUNCTIONS
// ============================================================

/**
 * Analyzes gaps in a delivery schedule by comparing items against uploaded documents
 * @param schedule - The parsed delivery schedule
 * @param documents - List of uploaded documents
 * @returns A comprehensive GapReport with statistics and action items
 */
export function analyzeGaps(
  schedule: DeliverySchedule,
  documents: UploadedDocument[]
): GapReport {
  const gapsByCategory: Record<DeliveryCategory, GapReportItem[]> = {
    cinema_masters: [],
    video_digital: [],
    audio: [],
    trailer: [],
    marketing: [],
    legal: [],
    music_rights: [],
    metadata: [],
  };

  let criticalGaps = 0;
  let highGaps = 0;
  let mediumGaps = 0;
  let lowGaps = 0;

  // Analyze each delivery item
  const gapReportItems: GapReportItem[] = schedule.items
    .map((item) => {
      const fulfillmentStatus = determineFulfillmentStatus(item, documents);

      // Only create gap details for missing or partial items
      if (fulfillmentStatus === 'missing' || fulfillmentStatus === 'partial') {
        const gapDetail = generateGapDetail(item, fulfillmentStatus);
        const category = item.category;
        const reportItem: GapReportItem = {
          deliveryItemId: item.id,
          deliveryItemName: item.name,
          fulfillment: fulfillmentStatus,
          gap: gapDetail,
        };

        gapsByCategory[category].push(reportItem);

        // Count severity levels
        switch (gapDetail.severity) {
          case 'critical':
            criticalGaps++;
            break;
          case 'high':
            highGaps++;
            break;
          case 'medium':
            mediumGaps++;
            break;
          case 'low':
            lowGaps++;
            break;
        }

        return reportItem;
      }

      return null;
    })
    .filter((item): item is GapReportItem => item !== null);

  // Generate action items from gaps
  const actionItems = generateActionItems(gapReportItems);

  // Calculate completion percentage
  const completionPercentage = schedule.totalItems > 0
    ? Math.round((1 - gapReportItems.length / schedule.totalItems) * 100)
    : 100;

  return {
    id: uuid(),
    projectId: schedule.id,
    generatedAt: new Date().toISOString(),
    totalGaps: gapReportItems.length,
    criticalGaps,
    highGaps,
    mediumGaps,
    lowGaps,
    gapsByCategory,
    completionPercentage,
    actionItems,
  };
}

/**
 * Classifies a document based on its filename and extracted text
 * @param filename - The document filename
 * @param extractedText - Text extracted from the document
 * @returns The classified DocumentType
 */
export function classifyDocument(filename: string, extractedText: string): DocumentType {
  const lowerFilename = filename.toLowerCase();
  const lowerText = extractedText.toLowerCase();

  // Priority 1: Filename-based classification (most reliable)
  if (/delivery[\s_-]?schedule/i.test(lowerFilename) || /deliverables/i.test(lowerFilename)) {
    return 'delivery_schedule';
  }
  if (/sales[\s_-]?estimate/i.test(lowerFilename) || /for[\s_-]?sales/i.test(lowerFilename)) {
    return 'sales_estimates';
  }
  if (/finance[\s_-]?plan/i.test(lowerFilename)) {
    return 'finance_plan';
  }
  if (/chain[\s_-]?of[\s_-]?title/i.test(lowerFilename)) {
    return 'chain_of_title';
  }
  if (/cue[\s_-]?sheet/i.test(lowerFilename)) {
    return 'music_cue_sheet';
  }
  if (/qc[\s_-]?report/i.test(lowerFilename)) {
    return 'qc_report';
  }

  // Priority 2: Score each document type based on keyword matches in text only
  let bestMatch: DocumentType = 'other';
  let bestScore = 0;

  for (const [docType, keywords] of Object.entries(DOCUMENT_TYPE_KEYWORDS)) {
    if (keywords.length === 0) continue;

    const matches = keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase()));
    // Weight by both match ratio and absolute match count (require at least 2 matches)
    const score = (matches.length / keywords.length) + (matches.length * 0.1);

    if (score > bestScore && matches.length >= 2) {
      bestScore = score;
      bestMatch = docType as DocumentType;
    }
  }

  // Fallback: single keyword match with high ratio threshold
  if (bestMatch === 'other') {
    for (const [docType, keywords] of Object.entries(DOCUMENT_TYPE_KEYWORDS)) {
      if (keywords.length === 0) continue;
      const matches = keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase()));
      if (matches.length >= 1 && matches.length / keywords.length > 0.3) {
        bestMatch = docType as DocumentType;
        break;
      }
    }
  }

  return bestMatch;
}

/**
 * Determines which delivery items a document can fulfill
 * @param doc - The uploaded document
 * @param items - List of delivery items
 * @returns Array of matching delivery item IDs
 */
export function matchDocumentToDeliveryItems(
  doc: UploadedDocument,
  items: DeliveryItem[]
): string[] {
  const matches: string[] = [];

  for (const item of items) {
    if (canDocumentFulfillItem(doc, item)) {
      matches.push(item.id);
    }
  }

  return matches;
}

/**
 * Converts gaps into consolidated action items prioritized by severity
 * @param gaps - Array of gap report items
 * @returns Sorted array of action items
 */
export function generateActionItems(gaps: GapReportItem[]): ActionItem[] {
  // Group gaps by category and action type
  const groupedGaps: Map<string, GapReportItem[]> = new Map();

  for (const gap of gaps) {
    const key = `${gap.gap.suggestedAction}-${gap.deliveryItemName}`;
    if (!groupedGaps.has(key)) {
      groupedGaps.set(key, []);
    }
    groupedGaps.get(key)!.push(gap);
  }

  // Convert groups to action items
  const actionItems: ActionItem[] = [];

  for (const [, groupedGapItems] of groupedGaps) {
    const firstGap = groupedGapItems[0];
    const maxSeverity = getMaxSeverity(groupedGapItems.map((g) => g.gap.severity));

    // Consolidate description for related gaps
    const description =
      groupedGapItems.length === 1
        ? firstGap.gap.description
        : `${firstGap.gap.description} and ${groupedGapItems.length - 1} related item(s)`;

    actionItems.push({
      id: uuid(),
      priority: maxSeverity,
      action: firstGap.gap.suggestedAction,
      description,
      status: 'pending',
      relatedGaps: groupedGapItems.map((g) => g.deliveryItemId),
      templateMessage: firstGap.gap.templateMessage,
    });
  }

  // Sort by severity (critical > high > medium > low), then by action type
  const severityOrder: Record<GapSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return actionItems.sort(
    (a, b) => severityOrder[a.priority] - severityOrder[b.priority]
  );
}

/**
 * Generates a professional request message for a specific gap
 * @param gap - The gap detail
 * @param project - Project information (title and distributor)
 * @returns A ready-to-send message
 */
export function generateRequestMessage(
  gap: GapDetail,
  project: { title: string; distributor: string }
): string {
  const { whatIsNeeded, whoToContact, suggestedAction } = gap;
  const contactName = whoToContact || 'relevant party';

  // Build a professional, direct message
  const lines: string[] = [
    `Hi ${contactName},`,
    '',
    `We're working on the delivery requirements for "${project.title}" with ${project.distributor}.`,
    `As part of this process, we need the following:`,
    '',
    `${whatIsNeeded}`,
    '',
  ];

  // Add action-specific guidance
  if (suggestedAction === 'signature_needed') {
    lines.push(`Please sign and return this document at your earliest convenience.`);
  } else if (suggestedAction === 'document_request') {
    lines.push(`Could you provide this documentation? We can arrange any necessary format conversions.`);
  } else if (suggestedAction === 'info_request') {
    lines.push(`Please provide this information so we can complete our delivery package.`);
  } else if (suggestedAction === 'technical_delivery') {
    lines.push(`Please deliver this according to the technical specifications provided.`);
  }

  lines.push('', `Thanks for your help with this.`, '');

  return lines.join('\n');
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Determines the fulfillment status of a delivery item
 * based on uploaded documents
 */
function determineFulfillmentStatus(
  item: DeliveryItem,
  documents: UploadedDocument[]
): FulfillmentStatus {
  // If item is marked as completed, it's verified
  if (item.completed) {
    return 'verified';
  }

  // Check if any documents match this item
  const matchingDocs = documents.filter((doc) =>
    doc.fulfills.includes(item.id)
  );

  if (matchingDocs.length === 0) {
    return 'missing';
  }

  // For items with quantity > 1, check if all are fulfilled
  if (item.quantity > 1 && matchingDocs.length < item.quantity) {
    return 'partial';
  }

  return 'uploaded';
}

/**
 * Generates detailed gap information for an unfulfilled or partially
 * fulfilled delivery item
 */
function generateGapDetail(
  item: DeliveryItem,
  fulfillmentStatus: FulfillmentStatus
): GapDetail {
  const severity = calculateSeverity(item.status, item.category);
  const whoToContact = CATEGORY_CONTACTS[item.category];
  const suggestedAction = determineSuggestedAction(item.category);

  let description: string;
  let whatIsNeeded: string;

  if (fulfillmentStatus === 'partial') {
    description = `${item.name} is partially fulfilled (${item.quantity - 1} of ${item.quantity} received)`;
    whatIsNeeded = `Complete delivery of remaining ${item.quantity - 1} items for ${item.name}`;
  } else {
    description = `${item.name} has not been received`;
    whatIsNeeded = getSpecificRequirementDescription(item);
  }

  const templateMessage = buildTemplateMessage(
    item,
    whatIsNeeded,
    whoToContact,
    suggestedAction
  );

  return {
    severity,
    description,
    whatIsNeeded,
    whoToContact,
    suggestedAction,
    templateMessage,
  };
}

/**
 * Calculates the severity level of a gap based on item status
 * and category
 */
function calculateSeverity(
  requirementStatus: RequirementStatus,
  category: DeliveryCategory
): GapSeverity {
  // Critical: required items in legal or cinema_masters
  if (requirementStatus === 'required' && ['legal', 'cinema_masters'].includes(category)) {
    return 'critical';
  }

  // High: required items in other categories
  if (requirementStatus === 'required') {
    return 'high';
  }

  // Medium: if_available or conditional items
  if (['if_available', 'conditional'].includes(requirementStatus)) {
    return 'medium';
  }

  // Low: waived items (shouldn't normally appear as gaps)
  return 'low';
}

/**
 * Determines the type of action needed for a gap
 */
function determineSuggestedAction(category: DeliveryCategory): GapActionType {
  switch (category) {
    case 'legal':
    case 'music_rights':
      return 'document_request';
    case 'cinema_masters':
    case 'video_digital':
    case 'audio':
      return 'technical_delivery';
    case 'metadata':
      return 'info_request';
    default:
      return 'document_request';
  }
}

/**
 * Gets a specific, actionable description of what's needed
 */
function getSpecificRequirementDescription(item: DeliveryItem): string {
  const categoryDescriptions: Record<DeliveryCategory, (item: DeliveryItem) => string> = {
    cinema_masters: () => 'DCP and associated cinema master files (includes KDM delivery setup)',
    video_digital: () => 'Encoded digital delivery files (HD and/or 4K as specified)',
    audio: () => 'Delivered audio mix files and stems as per technical specifications',
    trailer: () => 'Edited and delivered trailer file(s) with required formats',
    marketing: () => 'Marketing materials and artwork deliverables',
    legal: () => item.name.includes('sync')
      ? 'Fully executed sync license for all non-original music in the Picture'
      : item.name.includes('cast') || item.name.includes('actor')
      ? 'Executed cast/talent clearance forms'
      : item.name.includes('insurance')
      ? 'Errors & Omissions (E&O) insurance certificate'
      : 'Required legal documentation',
    music_rights: () => item.name.includes('sync')
      ? 'Fully executed sync license for all non-original music in the Picture'
      : item.name.includes('master')
      ? 'Master use license from rights holder'
      : item.name.includes('cue')
      ? 'Complete music cue sheet with ASCAP/BMI information'
      : 'Music licensing documentation',
    metadata: () => 'Metadata information and delivery specifications',
  };

  const describer = categoryDescriptions[item.category];
  return describer ? describer(item) : `${item.name} as specified in technical requirements`;
}

/**
 * Checks if a document can fulfill a delivery item
 */
function canDocumentFulfillItem(doc: UploadedDocument, item: DeliveryItem): boolean {
  // Already marked as fulfilling
  if (doc.fulfills.includes(item.id)) {
    return true;
  }

  // Check category match
  if (!isCategoryMatch(doc.documentType, item.category)) {
    return false;
  }

  // Check for keyword matches in item name
  const itemNameLower = item.name.toLowerCase();
  const docTypeKeywords = DOCUMENT_TYPE_KEYWORDS[doc.documentType] || [];

  return docTypeKeywords.some((keyword) =>
    itemNameLower.includes(keyword.toLowerCase())
  );
}

/**
 * Determines if a document type matches a delivery category
 */
function isCategoryMatch(docType: DocumentType, category: DeliveryCategory): boolean {
  const categoryMatches: Record<DeliveryCategory, DocumentType[]> = {
    cinema_masters: ['qc_report', 'lab_access_letter', 'rating_certificate'],
    video_digital: ['qc_report', 'rating_certificate'],
    audio: ['qc_report'],
    trailer: ['qc_report', 'rating_certificate'],
    marketing: ['other'],
    legal: [
      'cast_agreement',
      'crew_agreement',
      'eo_insurance',
      'chain_of_title',
      'copyright_registration',
      'certificate_of_origin',
    ],
    music_rights: [
      'sync_license',
      'master_use_license',
      'composer_agreement',
      'music_license',
      'music_cue_sheet',
    ],
    metadata: ['other'],
  };

  const validTypes = categoryMatches[category];
  return validTypes.includes(docType);
}

/**
 * Determines the maximum severity from an array of severities
 */
function getMaxSeverity(severities: GapSeverity[]): GapSeverity {
  const order: Record<GapSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return severities.reduce((max, current) =>
    order[current] < order[max] ? current : max
  );
}

/**
 * Builds a template message for a specific gap
 */
function buildTemplateMessage(
  item: DeliveryItem,
  whatIsNeeded: string,
  whoToContact: string | undefined,
  suggestedAction: GapActionType
): string {
  const lines: string[] = [
    `Hi ${whoToContact || 'Team'},`,
    '',
    `We need to finalize delivery for the following item:`,
    '',
    `**${item.name}**`,
    `Category: ${item.category}`,
    '',
    `What we need: ${whatIsNeeded}`,
    '',
  ];

  if (item.technicalSpecs) {
    lines.push(`Technical Specs: ${item.technicalSpecs}`);
    lines.push('');
  }

  if (suggestedAction === 'technical_delivery') {
    lines.push(`Please deliver according to the technical specifications noted above.`);
  } else if (suggestedAction === 'document_request') {
    lines.push(`Please provide or confirm receipt of the required documentation.`);
  } else if (suggestedAction === 'signature_needed') {
    lines.push(`This requires your signature and confirmation.`);
  } else {
    lines.push(`Please provide the information needed to complete this item.`);
  }

  lines.push('', `Thanks for your attention to this.`, '');

  return lines.join('\n');
}

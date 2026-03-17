// AI Contract Reader - Extracts key terms, red flags, and delivery obligations from distribution agreements

export interface ContractAnalysis {
  documentType: string;
  parties: { licensor: string; licensee: string; };
  keyTerms: KeyTerm[];
  deliveryObligations: DeliveryObligation[];
  financialTerms: FinancialTerm[];
  redFlags: RedFlag[];
  territories: string[];
  rights: string[];
  termDates: { start?: string; end?: string; duration?: string; };
  summary: string;
}

export interface KeyTerm {
  category: string;
  term: string;
  value: string;
  clause?: string;
}

export interface DeliveryObligation {
  item: string;
  deadline?: string;
  specification?: string;
  penalty?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface FinancialTerm {
  type: string;
  description: string;
  amount?: string;
  percentage?: string;
  conditions?: string;
}

export interface RedFlag {
  severity: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  detail: string;
  recommendation: string;
}

// Keywords for detecting contract sections
const PARTY_PATTERNS = [
  /(?:between|by and between)\s+[""]?([^"""\n]+)[""]?\s+\(?(?:the\s+)?[""]?licensor[""]?\)?/i,
  /(?:between|by and between)\s+[""]?([^"""\n]+)[""]?\s+\(?(?:the\s+)?[""]?producer[""]?\)?/i,
  /[""]?licensor[""]?\s*(?:means|shall mean|refers to)\s+([^.\n]+)/i,
  /[""]?licensee[""]?\s*(?:means|shall mean|refers to)\s+([^.\n]+)/i,
  /[""]?distributor[""]?\s*(?:means|shall mean|refers to)\s+([^.\n]+)/i,
];

const TERRITORY_LIST = [
  'united states', 'united kingdom', 'canada', 'australia', 'germany', 'france',
  'japan', 'south korea', 'italy', 'spain', 'brazil', 'mexico', 'china',
  'india', 'scandinavia', 'benelux', 'eastern europe', 'latin america',
  'middle east', 'africa', 'asia', 'southeast asia', 'worldwide', 'world',
  'north america', 'europe', 'pan-asia', 'cis', 'russia',
];

const RIGHTS_KEYWORDS = [
  'theatrical', 'home video', 'television', 'vod', 'svod', 'avod', 'tvod',
  'pay tv', 'free tv', 'pay-per-view', 'airline', 'hotel', 'ship',
  'streaming', 'digital', 'ancillary', 'merchandising', 'soundtrack',
  'remake', 'sequel', 'all media', 'all rights',
];

const RED_FLAG_PATTERNS: { pattern: RegExp; severity: RedFlag['severity']; category: string; issue: string; recommendation: string; }[] = [
  {
    pattern: /in\s+perpetuity|perpetual\s+license|forever/i,
    severity: 'high',
    category: 'Term Length',
    issue: 'Perpetual license grant detected',
    recommendation: 'Negotiate a fixed term (typically 7-15 years for distribution agreements).',
  },
  {
    pattern: /cross[-\s]?collateral/i,
    severity: 'high',
    category: 'Financial',
    issue: 'Cross-collateralization clause found',
    recommendation: 'This allows the distributor to offset losses from one territory/medium against another. Negotiate territory-by-territory accounting.',
  },
  {
    pattern: /first\s+look|right\s+of\s+first\s+refusal|first\s+refusal/i,
    severity: 'medium',
    category: 'Future Projects',
    issue: 'First look or right of first refusal clause',
    recommendation: 'Ensure this is limited in scope and duration. Avoid open-ended first-look deals.',
  },
  {
    pattern: /(?:no|without)\s+(?:prior\s+)?approval|sole\s+discretion/i,
    severity: 'high',
    category: 'Approval Rights',
    issue: 'Distributor has sole discretion without producer approval',
    recommendation: 'Negotiate mutual approval rights for key decisions (marketing spend, release strategy, artwork).',
  },
  {
    pattern: /(?:expenses|costs|fees)\s+(?:shall be\s+)?(?:recouped|deducted)\s+(?:first|before|prior)/i,
    severity: 'medium',
    category: 'Financial',
    issue: 'Distributor expenses recouped before revenue share',
    recommendation: 'Cap distribution expenses and require approval for expenses over a threshold.',
  },
  {
    pattern: /(?:penalty|liquidated\s+damages|late\s+(?:delivery|fee))\s.*?\$[\d,]+/i,
    severity: 'high',
    category: 'Delivery',
    issue: 'Financial penalties for late delivery',
    recommendation: 'Negotiate reasonable cure periods and caps on penalties.',
  },
  {
    pattern: /terminate\s+(?:this|the)\s+agreement.*?(?:at\s+any\s+time|without\s+cause|for\s+convenience)/i,
    severity: 'high',
    category: 'Termination',
    issue: 'One-sided termination clause (without cause)',
    recommendation: 'Ensure termination rights are mutual and require cause with notice periods.',
  },
  {
    pattern: /(?:irrevocable|non[-\s]?revocable)\s+(?:license|grant|right)/i,
    severity: 'medium',
    category: 'Rights',
    issue: 'Irrevocable license grant',
    recommendation: 'Avoid irrevocable grants. Include reversion clauses if distributor fails to exploit rights.',
  },
  {
    pattern: /(?:worldwide|world)\s+(?:rights|license)/i,
    severity: 'low',
    category: 'Territory',
    issue: 'Worldwide rights grant',
    recommendation: 'Consider whether a territory-by-territory approach might yield better terms.',
  },
  {
    pattern: /holdback|hold[-\s]?back/i,
    severity: 'low',
    category: 'Windows',
    issue: 'Holdback period detected',
    recommendation: 'Review holdback windows to ensure they align with your release strategy.',
  },
];

export function analyzeContract(text: string): ContractAnalysis {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Detect document type
  const documentType = detectDocumentType(text);

  // Extract parties
  const parties = extractParties(text);

  // Extract key terms
  const keyTerms = extractKeyTerms(text);

  // Extract delivery obligations
  const deliveryObligations = extractDeliveryObligations(text);

  // Extract financial terms
  const financialTerms = extractFinancialTerms(text);

  // Detect red flags
  const redFlags = detectRedFlags(text);

  // Extract territories
  const territories = extractTerritories(text);

  // Extract rights
  const rights = extractRights(text);

  // Extract term dates
  const termDates = extractTermDates(text);

  // Generate summary
  const summary = generateSummary(documentType, parties, territories, rights, keyTerms, redFlags);

  return {
    documentType,
    parties,
    keyTerms,
    deliveryObligations,
    financialTerms,
    redFlags,
    territories,
    rights,
    termDates,
    summary,
  };
}

function detectDocumentType(text: string): string {
  const lower = text.toLowerCase();
  if (/distribution\s+agreement/i.test(text)) return 'Distribution Agreement';
  if (/license\s+agreement/i.test(text)) return 'License Agreement';
  if (/sales\s+agency\s+agreement/i.test(text)) return 'Sales Agency Agreement';
  if (/output\s+deal/i.test(text)) return 'Output Deal';
  if (/pre[-\s]?sale/i.test(text)) return 'Pre-Sale Agreement';
  if (/co[-\s]?production/i.test(text)) return 'Co-Production Agreement';
  if (lower.includes('deliverable') || lower.includes('delivery schedule')) return 'Delivery Schedule';
  return 'Contract';
}

function extractParties(text: string): { licensor: string; licensee: string } {
  let licensor = 'Unknown';
  let licensee = 'Unknown';

  for (const pattern of PARTY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].trim().replace(/[""]/g, '');
      if (/licensor|producer|seller/i.test(match[0])) {
        licensor = name;
      } else {
        licensee = name;
      }
    }
  }

  // Fallback: look for "between X and Y"
  if (licensor === 'Unknown' || licensee === 'Unknown') {
    const betweenMatch = text.match(/between\s+[""]?([^"""\n,]+)[""]?\s+(?:and|&)\s+[""]?([^"""\n,]+)[""]?/i);
    if (betweenMatch) {
      if (licensor === 'Unknown') licensor = betweenMatch[1].trim();
      if (licensee === 'Unknown') licensee = betweenMatch[2].trim();
    }
  }

  return { licensor, licensee };
}

function extractKeyTerms(text: string): KeyTerm[] {
  const terms: KeyTerm[] = [];

  // MG / Minimum Guarantee
  const mgMatch = text.match(/(?:minimum\s+guarantee|MG|advance)\s*(?:of|:|\s)\s*\$?([\d,]+(?:\.\d+)?(?:\s*(?:million|M|thousand|K))?)/i);
  if (mgMatch) {
    terms.push({ category: 'Financial', term: 'Minimum Guarantee', value: `$${mgMatch[1]}` });
  }

  // Commission Rate
  const commMatch = text.match(/(?:commission|sales\s+fee|distribution\s+fee)\s*(?:of|:|\s)\s*(\d+(?:\.\d+)?)\s*%/i);
  if (commMatch) {
    terms.push({ category: 'Financial', term: 'Commission Rate', value: `${commMatch[1]}%` });
  }

  // Term / Duration
  const termMatch = text.match(/(?:term|duration|period)\s*(?:of|:|\s)\s*(\d+)\s*(?:years?|months?)/i);
  if (termMatch) {
    terms.push({ category: 'Term', term: 'Agreement Duration', value: termMatch[0].trim() });
  }

  // Delivery deadline
  const deliveryMatch = text.match(/(?:delivery|deliver|materials)\s+(?:shall be|must be|to be)\s+(?:delivered|completed|provided)\s+(?:by|within|no later than)\s+([^.\n]+)/i);
  if (deliveryMatch) {
    terms.push({ category: 'Delivery', term: 'Delivery Deadline', value: deliveryMatch[1].trim() });
  }

  // Revenue split
  const splitMatch = text.match(/(\d+)\s*[/%]\s*(?:to\s+)?(?:licensor|producer|seller).*?(\d+)\s*[/%]\s*(?:to\s+)?(?:licensee|distributor|buyer)/i);
  if (splitMatch) {
    terms.push({ category: 'Financial', term: 'Revenue Split', value: `${splitMatch[1]}% Licensor / ${splitMatch[2]}% Distributor` });
  }

  // P&A Commitment
  const paMatch = text.match(/(?:P\s*&\s*A|prints?\s+and\s+advertising|marketing\s+spend|marketing\s+commitment)\s*(?:of|:|\s)\s*\$?([\d,]+(?:\.\d+)?(?:\s*(?:million|M|thousand|K))?)/i);
  if (paMatch) {
    terms.push({ category: 'Marketing', term: 'P&A Commitment', value: `$${paMatch[1]}` });
  }

  // Cap on expenses
  const capMatch = text.match(/(?:cap|maximum|not\s+to\s+exceed)\s+(?:on\s+)?(?:expenses?|costs?|fees?)\s*(?:of|:|\s)\s*\$?([\d,]+)/i);
  if (capMatch) {
    terms.push({ category: 'Financial', term: 'Expense Cap', value: `$${capMatch[1]}` });
  }

  return terms;
}

function extractDeliveryObligations(text: string): DeliveryObligation[] {
  const obligations: DeliveryObligation[] = [];
  const lines = text.split('\n');

  // Pattern matching for delivery items
  const deliverySection = text.match(/(?:delivery\s+(?:materials?|requirements?|schedule|items?|obligations?))[\s\S]*?(?=\n\n|\n[A-Z]{2,}|\n\d+\.\s+[A-Z])/gi);

  const deliveryItems = [
    { pattern: /(?:DCP|digital\s+cinema\s+package)/i, item: 'DCP (Digital Cinema Package)', priority: 'critical' as const },
    { pattern: /(?:HD\s+master|high\s+definition\s+master)/i, item: 'HD Master', priority: 'critical' as const },
    { pattern: /(?:4K|UHD)\s+master/i, item: '4K/UHD Master', priority: 'critical' as const },
    { pattern: /(?:M\s*&\s*E|music\s+and\s+effects)/i, item: 'M&E (Music & Effects) Mix', priority: 'critical' as const },
    { pattern: /(?:5\.1|surround)\s+(?:mix|audio|sound)/i, item: '5.1 Surround Sound Mix', priority: 'high' as const },
    { pattern: /(?:stereo\s+mix|2\.0\s+mix)/i, item: 'Stereo Mix', priority: 'high' as const },
    { pattern: /(?:closed\s+caption|CC|subtitl)/i, item: 'Closed Captions/Subtitles', priority: 'high' as const },
    { pattern: /(?:trailer|promo)/i, item: 'Trailer/Promo Materials', priority: 'high' as const },
    { pattern: /(?:key\s+art|poster|one[-\s]?sheet)/i, item: 'Key Art/Poster', priority: 'medium' as const },
    { pattern: /(?:still|photograph|behind.the.scene)/i, item: 'Production Stills', priority: 'medium' as const },
    { pattern: /(?:script|screenplay|dialogue\s+list)/i, item: 'Dialogue List/Script', priority: 'medium' as const },
    { pattern: /(?:chain\s+of\s+title|copyright)/i, item: 'Chain of Title Documentation', priority: 'critical' as const },
    { pattern: /(?:E\s*&\s*O|errors?\s+and\s+omissions)/i, item: 'E&O Insurance Certificate', priority: 'critical' as const },
    { pattern: /(?:music\s+cue\s+sheet)/i, item: 'Music Cue Sheet', priority: 'high' as const },
    { pattern: /(?:QCLTC|quality\s+control)/i, item: 'QC Report', priority: 'high' as const },
  ];

  const fullText = deliverySection ? deliverySection.join(' ') : text;

  for (const di of deliveryItems) {
    if (di.pattern.test(fullText)) {
      obligations.push({
        item: di.item,
        priority: di.priority,
      });
    }
  }

  // Look for deadline patterns near delivery items
  const deadlineMatch = text.match(/(?:delivery|materials?)\s+(?:within|by|no later than)\s+(\d+)\s+(days?|weeks?|months?)/i);
  if (deadlineMatch && obligations.length > 0) {
    obligations[0].deadline = `${deadlineMatch[1]} ${deadlineMatch[2]} from execution`;
  }

  return obligations;
}

function extractFinancialTerms(text: string): FinancialTerm[] {
  const terms: FinancialTerm[] = [];

  // Find all dollar amounts with context
  const dollarPattern = /([^.\n]{0,80})\$\s*([\d,]+(?:\.\d+)?(?:\s*(?:million|M|thousand|K))?)\s*([^.\n]{0,80})/gi;
  let match;
  while ((match = dollarPattern.exec(text)) !== null) {
    const context = (match[1] + match[3]).toLowerCase();
    const amount = `$${match[2]}`;

    let type = 'Other';
    if (/minimum\s+guarantee|mg|advance/i.test(context)) type = 'Minimum Guarantee';
    else if (/p\s*&\s*a|marketing|advertising/i.test(context)) type = 'P&A / Marketing';
    else if (/cap|maximum|limit/i.test(context)) type = 'Expense Cap';
    else if (/penalty|damage|late/i.test(context)) type = 'Penalty';
    else if (/bonus|milestone/i.test(context)) type = 'Bonus/Milestone';

    if (type !== 'Other') {
      terms.push({
        type,
        description: match[0].trim().slice(0, 120),
        amount,
      });
    }
  }

  // Commission percentages
  const pctPattern = /(\d+(?:\.\d+)?)\s*%\s*([^.\n]{0,60})/gi;
  while ((match = pctPattern.exec(text)) !== null) {
    const context = match[2].toLowerCase();
    if (/commission|fee|share|split|royalt/i.test(context)) {
      terms.push({
        type: 'Commission/Fee',
        description: match[0].trim().slice(0, 120),
        percentage: `${match[1]}%`,
      });
    }
  }

  return terms;
}

function detectRedFlags(text: string): RedFlag[] {
  const flags: RedFlag[] = [];

  for (const rf of RED_FLAG_PATTERNS) {
    const match = text.match(rf.pattern);
    if (match) {
      // Extract surrounding context
      const idx = text.indexOf(match[0]);
      const start = Math.max(0, idx - 60);
      const end = Math.min(text.length, idx + match[0].length + 60);
      const detail = text.slice(start, end).trim().replace(/\s+/g, ' ');

      flags.push({
        severity: rf.severity,
        category: rf.category,
        issue: rf.issue,
        detail: `"...${detail}..."`,
        recommendation: rf.recommendation,
      });
    }
  }

  return flags;
}

function extractTerritories(text: string): string[] {
  const lower = text.toLowerCase();
  return TERRITORY_LIST.filter(t => lower.includes(t))
    .map(t => t.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' '));
}

function extractRights(text: string): string[] {
  const lower = text.toLowerCase();
  return RIGHTS_KEYWORDS.filter(r => lower.includes(r))
    .map(r => r.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' '));
}

function extractTermDates(text: string): { start?: string; end?: string; duration?: string } {
  const result: { start?: string; end?: string; duration?: string } = {};

  const durationMatch = text.match(/(?:term|duration|period)\s*(?:of|:|\s)\s*(\d+)\s*(years?|months?)/i);
  if (durationMatch) {
    result.duration = `${durationMatch[1]} ${durationMatch[2]}`;
  }

  // Date patterns
  const datePattern = /(?:commenc|start|begin|effective)\s*(?:ing|s)?\s*(?:on|date)?\s*(?::)?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i;
  const startMatch = text.match(datePattern);
  if (startMatch) result.start = startMatch[1];

  const endPattern = /(?:expir|end|terminat)\s*(?:ing|s|es|ion)?\s*(?:on|date)?\s*(?::)?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i;
  const endMatch = text.match(endPattern);
  if (endMatch) result.end = endMatch[1];

  return result;
}

function generateSummary(
  docType: string,
  parties: { licensor: string; licensee: string },
  territories: string[],
  rights: string[],
  keyTerms: KeyTerm[],
  redFlags: RedFlag[]
): string {
  const parts: string[] = [];

  parts.push(`This ${docType} is between ${parties.licensor} (Licensor) and ${parties.licensee} (Licensee/Distributor).`);

  if (territories.length > 0) {
    parts.push(`Territories covered: ${territories.slice(0, 5).join(', ')}${territories.length > 5 ? ` and ${territories.length - 5} more` : ''}.`);
  }

  if (rights.length > 0) {
    parts.push(`Rights granted include: ${rights.join(', ')}.`);
  }

  const mg = keyTerms.find(t => t.term === 'Minimum Guarantee');
  if (mg) {
    parts.push(`Minimum Guarantee: ${mg.value}.`);
  }

  const highFlags = redFlags.filter(f => f.severity === 'high');
  if (highFlags.length > 0) {
    parts.push(`${highFlags.length} high-severity issue${highFlags.length > 1 ? 's' : ''} detected that require${highFlags.length === 1 ? 's' : ''} attention.`);
  }

  return parts.join(' ');
}

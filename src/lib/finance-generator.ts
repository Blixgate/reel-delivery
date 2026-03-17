import { v4 as uuid } from 'uuid';
import {
  FinancePlan,
  CapitalStackItem,
  TerritoryEstimate,
  WaterfallTier,
  FinanceGapAnalysis,
  FinancingSource,
  TaxIncentive,
  SuggestedFinancingSource,
} from './types';
import { searchIncentives, calculateEstimatedCredit } from './tax-incentives';

/**
 * Territory grouping map for film distribution
 */
const TERRITORY_GROUPS: Record<string, string[]> = {
  'English-Speaking': [
    'north america',
    'usa',
    'us',
    'united states',
    'canada',
    'uk',
    'united kingdom',
    'ireland',
    'australia',
    'australia/nz',
    'new zealand',
    'nz',
  ],
  'Western Europe': [
    'germany',
    'france',
    'spain',
    'italy',
    'netherlands',
    'benelux',
    'belgium',
    'luxembourg',
    'scandinavia',
    'sweden',
    'norway',
    'denmark',
    'finland',
    'austria',
    'switzerland',
    'greece',
    'portugal',
  ],
  'Eastern Europe': [
    'eastern europe',
    'poland',
    'czech republic',
    'slovakia',
    'hungary',
    'romania',
    'bulgaria',
    'serbia',
    'croatia',
    'slovenia',
    'baltic',
    'estonia',
    'latvia',
    'lithuania',
    'ukraine',
    'cis',
    'russia',
  ],
  Asia: [
    'japan',
    'south korea',
    'korea',
    'china',
    'hong kong',
    'taiwan',
    'singapore',
    'malaysia',
    'thailand',
    'vietnam',
    'philippines',
    'indonesia',
    'southeast asia',
    'india',
    'pakistan',
  ],
  'Latin America': [
    'latin america',
    'mexico',
    'argentina',
    'brazil',
    'chile',
    'colombia',
    'peru',
    'venezuela',
    'central america',
    'caribbean',
  ],
  'Middle East & Africa': [
    'middle east',
    'africa',
    'israel',
    'uae',
    'emirates',
    'saudi',
    'turkey',
    'egypt',
    'south africa',
    'nigeri',
  ],
};

/**
 * Parse a monetary value string into a number.
 * Handles: $1,500,000  |  1500000  |  1.5M  |  1.5m  |  500K  |  500k  |  $1.5M
 */
function parseMoneyValue(raw: string): number {
  // Remove $ and whitespace
  let cleaned = raw.replace(/[$\s]/g, '').trim();
  if (cleaned.length === 0) return 0;

  // Handle M/K suffixes (case-insensitive)
  const suffixMatch = cleaned.match(/^([\d,.]+)\s*([mkMK])$/);
  if (suffixMatch) {
    const num = parseFloat(suffixMatch[1].replace(/,/g, ''));
    const suffix = suffixMatch[2].toLowerCase();
    if (suffix === 'm') return num * 1_000_000;
    if (suffix === 'k') return num * 1_000;
  }

  // Remove commas and parse as float
  const num = parseFloat(cleaned.replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Parse sales estimates text from PDF/DOCX into structured territory data
 */
export function parseSalesEstimates(text: string): TerritoryEstimate[] {
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  const estimates: TerritoryEstimate[] = [];

  // Skip header/metadata keywords (lines starting with these are not territories)
  const SKIP_KEYWORDS = [
    'territory', 'estimated', 'value', 'total', 'header',
    'sales estimates', 'minimum guarantee', 'mg value',
    'title', 'producer', 'director', 'cast', 'review date',
    'is film', 'actual budget', 'proposed budget', 'budget',
    'market overhead', 'sales expenses', 'sales fee',
    'financing fee', 'tax credit', 'prepared on', 'rights',
    'ask', 'take', 'offer', 'sold', 'target',
    'hfg', 'grand total', 'worldwide', 'surplus', 'shortfall',
    'airline', 'pan-', 'pan ',
  ];

  // Known territory names for validation (avoids picking up buyer/distributor names as territories)
  const KNOWN_TERRITORIES = [
    ...Object.values(TERRITORY_GROUPS).flat(),
    'benelux', 'scandinavia', 'pan-asia', 'pan-l. america', 'pan asia',
    'ex-yugo', 'czech republic', 'hong kong', 'south africa', 'east and west africa',
    'middle east', 'eastern europe', 'southeast asia', 'central america',
    'caribbean', 'baltic', 'cis', 'taiwan', 'vietnam', 'indonesia',
    'malaysia', 'philippines', 'singapore', 'thailand',
    'france', 'germany', 'greece', 'italy', 'portugal', 'spain',
    'bulgaria', 'hungary', 'poland', 'romania', 'turkey', 'israel',
    'argentina', 'brazil', 'chile', 'colombia', 'mexico', 'peru', 'venezuela',
  ];

  for (const line of lines) {
    const trimmed = line.trim();

    // Strategy 1: Pipe-delimited format
    // e.g. "North America | $1,500,000 | All Rights | 15 years"
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map((p) => p.trim());
      if (parts.length < 2) continue;

      const territory = parts[0].toLowerCase();

      // Skip header rows
      if (SKIP_KEYWORDS.some((kw) => territory.includes(kw))) continue;
      if (territory.length < 2) continue;

      // Find the money value — it's the first part that contains a digit after the territory
      let mgValue = 0;
      let rights = 'all rights';
      let term = '15 years';

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        // Check if this part looks like a money value ($, digits, commas, K/M)
        if (/[\d]/.test(part) && /[$\d,]+[kKmM]?/.test(part) && mgValue === 0) {
          // But not if it looks like a term (e.g. "15 years")
          if (/years?/i.test(part)) {
            term = part;
          } else {
            mgValue = parseMoneyValue(part);
          }
        } else if (/years?/i.test(part)) {
          term = part;
        } else if (part.length > 0 && !/[\d$]/.test(part)) {
          rights = part;
        }
      }

      if (mgValue <= 0) continue;

      const allRights = rights.toLowerCase().includes('all');

      let territoryGroup = 'Other';
      for (const [group, territories] of Object.entries(TERRITORY_GROUPS)) {
        if (territories.some((t) => territory.includes(t))) {
          territoryGroup = group;
          break;
        }
      }

      estimates.push({
        territory: capitalizeTerritory(territory),
        territoryGroup,
        mgValue,
        status: 'estimated',
        commissionRate: 15,
        netToProducer: mgValue * 0.85,
        allRights,
        rightsDetail: rights,
        term,
      });
      continue;
    }

    // Strategy 2: Tab or multi-space delimited format
    // e.g. "North America    $1,500,000    All Rights    15 years"
    const tabParts = trimmed.split(/\t+/).map((p) => p.trim());
    const spaceParts = trimmed.split(/\s{2,}/).map((p) => p.trim());
    const parts = tabParts.length >= 2 ? tabParts : spaceParts;

    if (parts.length < 2) continue;

    const territoryRaw = parts[0].trim();
    const territory = territoryRaw.toLowerCase();
    if (SKIP_KEYWORDS.some((kw) => territory.includes(kw))) continue;
    if (territory.length < 2) continue;

    // Skip section headers like "Europe:", "Asia:" and "Total" rows
    if (/^[a-z\s]+:$/i.test(territoryRaw)) continue;
    if (/^total/i.test(territory)) continue;

    // For multi-column data (tabs or multiple spaces), validate against known territories
    // This prevents distributor names (AMAZON, LIONSGATE) from being treated as territories
    if (parts.length >= 2) {
      const isKnown = KNOWN_TERRITORIES.some((t) =>
        territory.includes(t) || t.includes(territory)
      );
      if (!isKnown) continue;
    }

    // Collect all numeric values from remaining columns
    const numericValues: number[] = [];
    let rights = 'all rights';
    let term = '15 years';
    let distributor: string | undefined;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (/years?/i.test(part)) {
        term = part;
      } else if (/^\d/.test(part) || /^\$/.test(part)) {
        if (/%/.test(part)) continue; // Skip percentage columns
        const val = parseMoneyValue(part);
        if (val >= 0) numericValues.push(val);
      } else if (/^[A-Z]/.test(part) && part.length > 1 && !/^[TVPFA]$/.test(part)) {
        distributor = part;
      } else if (part.length > 2 && !/^[$\d,.\s%]+$/.test(part) && !/^[TVPFA]$/.test(part)) {
        rights = part;
      }
    }

    // For HFG-style: first number = Ask (high), second = Take (conservative)
    // Use "Take" if available, otherwise "Ask"
    let mgValue = 0;
    if (numericValues.length >= 2) {
      mgValue = numericValues[1] > 0 ? numericValues[1] : numericValues[0];
    } else if (numericValues.length === 1) {
      mgValue = numericValues[0];
    }

    if (mgValue <= 0) continue;

    const allRights = rights.toLowerCase().includes('all');

    let territoryGroup = 'Other';
    for (const [group, territories] of Object.entries(TERRITORY_GROUPS)) {
      if (territories.some((t) => territory.includes(t))) {
        territoryGroup = group;
        break;
      }
    }

    estimates.push({
      territory: capitalizeTerritory(territory),
      territoryGroup,
      mgValue,
      status: distributor ? 'sold' : 'estimated',
      distributor,
      commissionRate: 15,
      netToProducer: mgValue * 0.85,
      allRights,
      rightsDetail: rights,
      term,
    });
  }

  // Strategy 3: Inline regex fallback for "Territory: $1,500,000" or "Territory - $500K" formats
  if (estimates.length === 0) {
    const inlineRegex = /^([a-z][a-z\s\-\/&]+?)[\s:\-–—]+\$?([\d,]+\.?\d*)\s*([mkMK])?/i;
    for (const line of lines) {
      const match = line.trim().match(inlineRegex);
      if (!match) continue;

      const territory = match[1].trim().toLowerCase();
      if (SKIP_KEYWORDS.some((kw) => territory.includes(kw))) continue;
      if (territory.length < 2) continue;

      let mgValue = parseFloat(match[2].replace(/,/g, ''));
      if (match[3]) {
        const suffix = match[3].toLowerCase();
        if (suffix === 'm') mgValue *= 1_000_000;
        if (suffix === 'k') mgValue *= 1_000;
      }

      if (isNaN(mgValue) || mgValue <= 0) continue;

      let territoryGroup = 'Other';
      for (const [group, territories] of Object.entries(TERRITORY_GROUPS)) {
        if (territories.some((t) => territory.includes(t))) {
          territoryGroup = group;
          break;
        }
      }

      estimates.push({
        territory: capitalizeTerritory(territory),
        territoryGroup,
        mgValue,
        status: 'estimated',
        commissionRate: 15,
        netToProducer: mgValue * 0.85,
        allRights: true,
        rightsDetail: 'All Rights',
        term: '15 years',
      });
    }
  }

  return estimates;
}

/**
 * Parse sales agency agreement text and extract key terms
 */
export function parseSalesAgencyAgreement(text: string): {
  salesAgent: string;
  commissionRate: number;
  territories: string[];
  term: string;
  expenses: number;
  deliveryDate?: string;
} {
  const result = {
    salesAgent: '',
    commissionRate: 15,
    territories: [] as string[],
    term: '',
    expenses: 0,
    deliveryDate: undefined as string | undefined,
  };

  const lines = text.toLowerCase();

  // Extract sales agent name
  const agentMatches = [
    /(?:sales agent|representation|exclusive|agent)[\s:]+([\w\s&,]+?)(?:\n|agreement)/i,
    /(?:between|party)[\s:]+([\w\s&,]+?)\s+and\s+/i,
  ];

  for (const regex of agentMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      result.salesAgent = match[1].trim();
      break;
    }
  }

  // Extract commission rate
  const commissionMatches = [
    /commission[\s:]+([\d.]+)%/i,
    /commission[\s:]+(\d+)%/i,
    /([\d.]+)%[\s:]+(?:commission|agent)/i,
  ];

  for (const regex of commissionMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const rate = parseFloat(match[1]);
      if (rate > 0 && rate < 100) {
        result.commissionRate = rate;
        break;
      }
    }
  }

  // Extract territories
  const territoryMatches = text.match(
    /(?:territories?|rights)[\s:]+([a-z\s,\-&\/]+?)(?:\n|agreement|term)/i
  );
  if (territoryMatches && territoryMatches[1]) {
    const territoryStr = territoryMatches[1].trim();
    result.territories = territoryStr
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  // Extract agreement term
  const termMatches = [/term[\s:]+(\d+[\s\-]?years?)/i, /(\d+)[\s\-]?year\s+(?:term|agreement)/i];

  for (const regex of termMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      result.term = match[1].trim();
      break;
    }
  }

  // Extract marketing expenses cap
  const expenseMatches = [
    /(?:marketing|expenses?)[\s:]+(?:cap|maximum|up to)[\s:]+\$?([\d.]+)(?:m|k)?/i,
    /(?:budget|allocation)[\s:]+\$?([\d.]+)(?:m|k)?/i,
  ];

  for (const regex of expenseMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      let amount = parseFloat(match[1]);
      if (match[0].includes('m')) {
        amount = amount * 1000000;
      } else if (match[0].includes('k')) {
        amount = amount * 1000;
      }
      if (amount > 0) {
        result.expenses = amount;
        break;
      }
    }
  }

  // Extract delivery date if available
  const dateMatches = /(?:delivery|delivery date)[\s:]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i;
  const dateMatch = text.match(dateMatches);
  if (dateMatch && dateMatch[1]) {
    result.deliveryDate = dateMatch[1].trim();
  }

  return result;
}

/**
 * Generate a complete finance plan from provided parameters
 */
export function generateFinancePlan(params: {
  filmTitle: string;
  totalBudget: number;
  salesEstimates: TerritoryEstimate[];
  taxIncentives: TaxIncentive[];
  presalesConfirmed?: number;
  equityConfirmed?: number;
  deferrals?: number;
  salesAgentCommission?: number;
  collectionAgentFee?: number;
}): FinancePlan {
  const planId = uuid();

  // Build capital stack from available sources
  const capitalStack: CapitalStackItem[] = [];
  let totalSecured = 0;

  // Add presales
  if (params.presalesConfirmed && params.presalesConfirmed > 0) {
    const presalesAmount = params.presalesConfirmed;
    capitalStack.push({
      source: 'presales',
      label: 'Presales',
      amount: presalesAmount,
      percentage: (presalesAmount / params.totalBudget) * 100,
      status: 'confirmed',
      recoupmentPosition: 6,
      terms: 'First position in waterfall',
    });
    totalSecured += presalesAmount;
  }

  // Add tax incentives
  for (const incentive of params.taxIncentives) {
    if (incentive.estimatedCredit > 0) {
      capitalStack.push({
        source: 'tax_credit',
        label: `${incentive.jurisdiction} Tax ${
          incentive.creditType === 'refundable' ? 'Credit' : 'Relief'
        }`,
        amount: incentive.estimatedCredit,
        percentage: (incentive.estimatedCredit / params.totalBudget) * 100,
        status: 'projected',
        recoupmentPosition: 5,
        notes: `${incentive.programName} - ${incentive.percentage}% of qualifying spend`,
      });
      totalSecured += incentive.estimatedCredit;
    }
  }

  // Add equity
  if (params.equityConfirmed && params.equityConfirmed > 0) {
    capitalStack.push({
      source: 'equity',
      label: 'Equity Investment',
      amount: params.equityConfirmed,
      percentage: (params.equityConfirmed / params.totalBudget) * 100,
      status: 'confirmed',
      recoupmentPosition: 7,
      terms: 'Last position, after all other recoupment',
    });
    totalSecured += params.equityConfirmed;
  }

  // Add deferrals
  if (params.deferrals && params.deferrals > 0) {
    capitalStack.push({
      source: 'deferral',
      label: 'Deferred Payments',
      amount: params.deferrals,
      percentage: (params.deferrals / params.totalBudget) * 100,
      status: 'confirmed',
      recoupmentPosition: 8,
      notes: 'Deferred cast/crew payments',
    });
    totalSecured += params.deferrals;
  }

  // Calculate sales-based revenue
  const collectibleRevenue = calculateCollectibleRevenue(
    params.salesEstimates,
    params.salesAgentCommission || 15,
    0
  );

  // If significant presales, add to capital stack
  if (collectibleRevenue.netAfterExpenses > 0) {
    capitalStack.push({
      source: 'presales',
      label: 'Projected Sales Revenue',
      amount: collectibleRevenue.netAfterExpenses,
      percentage: (collectibleRevenue.netAfterExpenses / params.totalBudget) * 100,
      status: 'projected',
      recoupmentPosition: 4,
      notes: `From ${params.salesEstimates.length} territories (after commissions)`,
    });
  }

  // Calculate gap
  const totalProjected = capitalStack.reduce((sum, item) => sum + item.amount, 0);
  const gap = Math.max(0, params.totalBudget - totalProjected);

  // Generate waterfall
  const waterfall = generateWaterfall(
    capitalStack,
    params.salesAgentCommission || 15,
    params.collectionAgentFee || 0
  );

  // Generate gap analysis
  const gapAnalysis: FinanceGapAnalysis = {
    totalBudget: params.totalBudget,
    totalSecured: totalSecured,
    totalProjected: totalProjected,
    gap,
    gapPercentage: (gap / params.totalBudget) * 100,
    suggestedSources: generateSuggestedSources(gap, params.totalBudget),
  };

  return {
    id: planId,
    filmTitle: params.filmTitle,
    totalBudget: params.totalBudget,
    currency: 'USD',
    capitalStack: capitalStack.sort((a, b) => a.recoupmentPosition - b.recoupmentPosition),
    salesEstimates: params.salesEstimates,
    taxIncentives: params.taxIncentives,
    waterfall,
    gapAnalysis,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Build industry-standard waterfall from capital stack
 */
export function generateWaterfall(
  capitalStack: CapitalStackItem[],
  salesAgentCommission: number,
  collectionAgentFee: number
): WaterfallTier[] {
  const waterfall: WaterfallTier[] = [];
  let position = 1;

  // 1. Collection agent fee
  if (collectionAgentFee > 0) {
    waterfall.push({
      position: position++,
      label: 'Collection Agent Fee',
      recipientType: 'collection_agent',
      recipient: 'Collection Agent',
      percentage: collectionAgentFee,
      description: `First position: ${collectionAgentFee}% of gross sales`,
    });
  }

  // 2. Sales agent commission
  if (salesAgentCommission > 0) {
    waterfall.push({
      position: position++,
      label: 'Sales Agent Commission',
      recipientType: 'sales_agent',
      recipient: 'Sales Agent',
      percentage: salesAgentCommission,
      description: `Sales agent commission: ${salesAgentCommission}% of net sales (after collection fees)`,
    });
  }

  // 3-N. Capital stack items in order of recoupment
  const sortedStack = capitalStack.sort((a, b) => a.recoupmentPosition - b.recoupmentPosition);

  for (const item of sortedStack) {
    waterfall.push({
      position: position++,
      label: item.label,
      recipientType: item.source,
      recipient: item.label,
      fixedAmount: item.amount,
      cap: item.amount,
      description: `${item.label}: ${item.notes || ''}`,
    });
  }

  // Final: Producer gets remaining
  waterfall.push({
    position: position++,
    label: 'Producer Corridor',
    recipientType: 'producer',
    recipient: 'Producer',
    percentage: 100,
    description: 'Producer receives 100% of remaining revenue',
  });

  return waterfall;
}

/**
 * Calculate actual collectible revenue after commissions and expenses
 */
export function calculateCollectibleRevenue(
  salesEstimates: TerritoryEstimate[],
  commissionRate: number,
  expensesCap: number
): {
  grossSales: number;
  netAfterCommission: number;
  netAfterExpenses: number;
} {
  const grossSales = salesEstimates.reduce((sum, est) => sum + est.mgValue, 0);
  const totalCommission = grossSales * (commissionRate / 100);
  const netAfterCommission = grossSales - totalCommission;
  const netAfterExpenses = Math.max(0, netAfterCommission - expensesCap);

  return {
    grossSales,
    netAfterCommission,
    netAfterExpenses,
  };
}

/**
 * Generate suggested financing sources to fill gap
 */
function generateSuggestedSources(gap: number, totalBudget: number): SuggestedFinancingSource[] {
  if (gap <= 0) {
    return [];
  }

  const suggestions: SuggestedFinancingSource[] = [];
  const gapPercentage = (gap / totalBudget) * 100;

  // Gap financing/mezzanine
  if (gapPercentage > 5) {
    suggestions.push({
      source: 'gap_financing',
      estimatedAmount: gap * 0.5,
      rationale:
        'Gap financing covers shortfall between presales and production budget, typically secured against sales estimates',
      requirements: [
        'Completed sales estimates',
        'International presales agreements',
        'Completion guarantor (optional)',
      ],
      timeToSecure: '4-8 weeks',
    });
  }

  // Mezzanine/subordinated financing
  if (gapPercentage > 10) {
    suggestions.push({
      source: 'mezzanine',
      estimatedAmount: gap * 0.3,
      rationale:
        'Mezzanine financing sits between senior bank debt and equity, offering higher returns than bank loans',
      requirements: [
        'Strong production credentials',
        'Minimum gap coverage of 30%',
        'Completion guarantee',
      ],
      timeToSecure: '6-10 weeks',
    });
  }

  // Equity top-up
  suggestions.push({
    source: 'equity',
    estimatedAmount: gap * 0.2,
    rationale:
      'Additional equity investment can fill remaining gap and reduce debt burden, participate in backend',
    requirements: [
      'Producer investment or investor commitment',
      'Business plan demonstrating return potential',
    ],
    timeToSecure: '2-6 weeks',
  });

  // Soft money / grants
  suggestions.push({
    source: 'soft_money',
    estimatedAmount: gap * 0.15,
    rationale:
      'Cultural grants, film board funding, and institutional support can provide non-repayable capital',
    requirements: [
      'Eligible production (genre, shoot location)',
      'Grant application and approval',
      'Timeline typically 6-12 weeks',
    ],
    timeToSecure: '8-16 weeks',
  });

  return suggestions.filter((s) => s.estimatedAmount > 1000); // Only show if > $1000
}

/**
 * Utility: Capitalize territory names for display
 */
function capitalizeTerritory(territory: string): string {
  return territory
    .split(/[\s\-\/]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

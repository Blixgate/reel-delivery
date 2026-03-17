import { TaxIncentiveProgram, BonusIncentive } from './types';

/**
 * COMPREHENSIVE TAX INCENTIVE DATABASE FOR FILM & TELEVISION PRODUCTION
 *
 * IMPORTANT: Tax incentive programs, rates, caps, and eligibility requirements change frequently.
 * These rates reflect the best information as of 2025-06. Before applying for any incentive:
 * 1. Verify current rates and requirements with official government sources
 * 2. Consult with a tax credit specialist in the relevant jurisdiction
 * 3. Check for recent legislative changes
 * 4. Confirm eligibility for your specific project
 *
 * Rates are approximate and may vary based on:
 * - Specific project genre and budget
 * - Employment location (in-state/local vs. out-of-state talent)
 * - Infrastructure investments
 * - Post-production location
 * - Changes in government policy
 */

export const TAX_INCENTIVE_DATABASE: TaxIncentiveProgram[] = [
  // ===== AUSTRALIA =====
  {
    id: 'au-producer-offset-feature',
    jurisdiction: 'Australia (Federal)',
    country: 'Australia',
    programName: 'Producer Offset - Feature Films',
    creditType: 'refundable',
    basePercentage: 40,
    qualifyingExpenses: [
      'Wages and salaries for Australian residents',
      'Payments to Australian companies',
      'Post-production and VFX in Australia',
      'Music composition and performance',
      'Equipment rental',
      'Location fees and permits',
    ],
    excludedExpenses: [
      'Non-Australian labor costs (above permitted amount)',
      'Finance costs',
      'Contingency reserves',
      'Deferral payments',
    ],
    minimumSpend: 15000000, // AUD 15M minimum
    residencyRequirements:
      'At least 40% of principal photography must occur in Australia. Key creatives (director, producer, screenwriter) should be Australian nationals or permanent residents.',
    applicationProcess:
      'Application lodged with Screen Australia after production completion. Requires comprehensive documentation of spend and evidence of Australian residency.',
    typicalTimeline: '6-12 months from application to approval',
    websiteUrl: 'https://www.screenaustralia.gov.au',
    lastUpdated: '2025-06',
    active: true,
    bonusPercentages: [
      {
        description: 'Documentaries and children\'s programs',
        additionalPercentage: 0, // Same as feature rate
        requirements: ['Genre must be documentary or children\'s television'],
      },
    ],
  },
  {
    id: 'au-producer-offset-other',
    jurisdiction: 'Australia (Federal)',
    country: 'Australia',
    programName: 'Producer Offset - TV & Other',
    creditType: 'refundable',
    basePercentage: 20,
    qualifyingExpenses: [
      'Wages and salaries for Australian residents',
      'Payments to Australian companies',
      'Post-production and VFX in Australia',
      'Equipment rental',
      'Location fees and permits',
    ],
    excludedExpenses: [
      'Non-Australian labor costs',
      'Finance costs',
      'Contingencies',
    ],
    minimumSpend: 1000000, // AUD 1M minimum
    residencyRequirements:
      'Principal photography must occur in Australia. At least 40% Australian principal photography or Australian producer/key creatives.',
    applicationProcess:
      'Application through Screen Australia with detailed production accounts and Australian spend documentation.',
    typicalTimeline: '6-12 months from application to approval',
    websiteUrl: 'https://www.screenaustralia.gov.au',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'au-location-offset',
    jurisdiction: 'Australia (Federal)',
    country: 'Australia',
    programName: 'Location Offset',
    creditType: 'refundable',
    basePercentage: 16.5,
    qualifyingExpenses: [
      'Location fees and permits',
      'Location catering',
      'Accommodation for cast and crew',
      'Ground transportation',
      'Local production services',
    ],
    excludedExpenses: [
      'International travel',
      'Overseas accommodation',
      'Crafts and equipment purchases',
    ],
    minimumSpend: 500000, // AUD 500k minimum
    residencyRequirements:
      'Must have significant location-based spend in Australia. Open to productions from any country.',
    applicationProcess:
      'Separate application from Producer Offset. Administered by Screen Australia. Requires itemized location spend documentation.',
    typicalTimeline: '6-9 months from application',
    websiteUrl: 'https://www.screenaustralia.gov.au',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'au-pdv-offset',
    jurisdiction: 'Australia (Federal)',
    country: 'Australia',
    programName: 'Post, Digital & Visual Effects (PDV) Offset',
    creditType: 'refundable',
    basePercentage: 30,
    qualifyingExpenses: [
      'Post-production services in Australia',
      'Visual effects in Australia',
      'Color grading and mastering',
      'Sound design and mixing',
      'Music composition',
      'Subtitling and captioning',
    ],
    excludedExpenses: [
      'International post-production',
      'Equipment purchase (non-rental)',
      'Insurance and finance costs',
    ],
    minimumSpend: 500000, // AUD 500k minimum
    residencyRequirements:
      'Post-production must occur in Australia. Open to international productions.',
    applicationProcess:
      'Application to Screen Australia with post-production facility invoices and evidence of Australian residency of service providers.',
    typicalTimeline: '6-12 months from completion',
    websiteUrl: 'https://www.screenaustralia.gov.au',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'au-nsw-screen',
    jurisdiction: 'New South Wales',
    country: 'Australia',
    region: 'NSW',
    programName: 'Screen NSW Production Funding',
    creditType: 'grant',
    basePercentage: 15,
    qualifyingExpenses: [
      'Productions filmed in NSW',
      'Post-production in NSW',
      'Local crew and talent',
    ],
    excludedExpenses: [
      'Marketing and distribution',
      'Development costs',
    ],
    minimumSpend: 2000000, // AUD 2M minimum
    residencyRequirements:
      'Minimum 70% of principal photography in NSW. Preference for NSW-based producers.',
    applicationProcess:
      'Application to Screen NSW. Competitive funding program requiring production plan and budget.',
    typicalTimeline: '4-6 weeks decision, funds paid on milestones',
    websiteUrl: 'https://www.screen.nsw.gov.au',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'au-qld-screen',
    jurisdiction: 'Queensland',
    country: 'Australia',
    region: 'QLD',
    programName: 'Screen Queensland Production Loans & Support',
    creditType: 'grant',
    basePercentage: 12,
    qualifyingExpenses: [
      'Productions filmed in Queensland',
      'Local services and crew',
      'Equipment rental in QLD',
    ],
    excludedExpenses: [
      'Financing costs',
      'Marketing',
    ],
    minimumSpend: 1500000, // AUD 1.5M minimum
    residencyRequirements:
      'Significant Queensland production. Support available for local and international productions.',
    applicationProcess:
      'Application to Screen Queensland. May include production loans and investment support.',
    typicalTimeline: '6-8 weeks review period',
    websiteUrl: 'https://www.screenqueensland.com.au',
    lastUpdated: '2025-06',
    active: true,
  },

  // ===== USA - GEORGIA =====
  {
    id: 'us-ga-film-tax-credit',
    jurisdiction: 'Georgia',
    country: 'United States',
    region: 'GA',
    programName: 'Georgia Film Tax Credit',
    creditType: 'refundable',
    basePercentage: 20,
    qualifyingExpenses: [
      'In-state wages for Georgia residents',
      'Equipment rental from Georgia vendors',
      'Location fees within Georgia',
      'Local catering and lodging',
      'Goods purchased from Georgia vendors',
      'In-state post-production services',
    ],
    excludedExpenses: [
      'Out-of-state labor',
      'Out-of-state equipment purchases',
      'Cast travel and accommodation',
      'Insurance and bonding',
    ],
    minimumSpend: 500000,
    capPerProject: 10000000,
    residencyRequirements:
      'At least 60% of principal photography must occur in Georgia. Jobs must go to Georgia residents for maximum credit.',
    applicationProcess:
      'Pre-production notification to Georgia Film Office. Detailed spend tracking throughout production. Post-production audit.',
    typicalTimeline: '4-6 months post-production completion to credit approval',
    websiteUrl: 'https://www.georgia.org/film',
    lastUpdated: '2025-06',
    active: true,
    bonusPercentages: [
      {
        description: 'Georgia resident hiring bonus',
        additionalPercentage: 10,
        requirements: [
          '100% of above-the-line jobs to Georgia residents',
          'At least 75% of below-the-line jobs to Georgia residents',
        ],
      },
    ],
  },

  // ===== USA - NEW MEXICO =====
  {
    id: 'us-nm-film-tax-credit',
    jurisdiction: 'New Mexico',
    country: 'United States',
    region: 'NM',
    programName: 'New Mexico Film Tax Credit',
    creditType: 'refundable',
    basePercentage: 25,
    qualifyingExpenses: [
      'Below-the-line crew wages',
      'Equipment rental and production services',
      'Lodging and meals for out-of-state crew',
      'Location fees',
      'In-state post-production',
      'Visual effects production',
    ],
    excludedExpenses: [
      'Above-the-line costs (director, producer, star actors)',
      'Insurance',
      'Contingency',
      'Out-of-state post-production',
    ],
    minimumSpend: 500000,
    capPerProject: 25000000,
    residencyRequirements:
      'Production must shoot primarily in New Mexico. State offers particularly favorable treatment of out-of-state labor housing costs.',
    applicationProcess:
      'Advance notification. Detailed production accounts. Reconciliation audit with independent CPA.',
    typicalTimeline: '60-90 days from submission',
    websiteUrl: 'https://www.edd.state.nm.us/films/',
    lastUpdated: '2025-06',
    active: true,
    bonusPercentages: [
      {
        description: 'Higher rate for productions with strong in-state economic impact',
        additionalPercentage: 5,
        requirements: [
          'Significant New Mexico crew hiring',
          'Strong local vendor engagement',
        ],
      },
    ],
  },

  // ===== USA - LOUISIANA =====
  {
    id: 'us-la-film-tax-credit',
    jurisdiction: 'Louisiana',
    country: 'United States',
    region: 'LA',
    programName: 'Louisiana Motion Picture Tax Credit',
    creditType: 'refundable',
    basePercentage: 25,
    qualifyingExpenses: [
      'Louisiana crew wages',
      'Equipment rental from Louisiana vendors',
      'Location fees and permits',
      'Post-production services in Louisiana',
      'Catering and lodging',
    ],
    excludedExpenses: [
      'Out-of-state payroll',
      'Pre-production development',
      'Insurance and contingency',
    ],
    minimumSpend: 1000000,
    capPerProject: 35000000,
    residencyRequirements:
      'Substantial portion of production must occur in Louisiana. Strong incentive for Louisiana resident hiring.',
    applicationProcess:
      'Production must register with Louisiana Department of Economic Development. Quarterly spend reports. Final reconciliation.',
    typicalTimeline: '60-90 days for approval, 6 months for payment',
    websiteUrl: 'https://www.louisiana.gov/business/film/',
    lastUpdated: '2025-06',
    active: true,
    bonusPercentages: [
      {
        description: 'LIFT (Louisiana Investor Tax Credit) bonus',
        additionalPercentage: 10,
        requirements: [
          'Louisiana resident or entity investor participation',
          'Use of local post-production facilities',
        ],
      },
    ],
  },

  // ===== USA - NEW YORK =====
  {
    id: 'us-ny-film-tax-credit',
    jurisdiction: 'New York',
    country: 'United States',
    region: 'NY',
    programName: 'New York State Film Tax Credit',
    creditType: 'refundable',
    basePercentage: 25,
    qualifyingExpenses: [
      'New York resident payroll',
      'Equipment rental from NY vendors',
      'Location fees and permits within NY',
      'Post-production services in NY',
      'Production services from NY vendors',
    ],
    excludedExpenses: [
      'Out-of-state crew labor',
      'Pre-production and development',
      'Insurance, legal, accounting',
      'Contingency reserves',
    ],
    minimumSpend: 250000,
    capPerProject: 6000000,
    residencyRequirements:
      'At least 75% of production must occur in New York. Preference for New York resident hiring.',
    applicationProcess:
      'Application to NY Department of Economic Development. Production account audit. Certification required.',
    typicalTimeline: '30-45 days for approval',
    websiteUrl: 'https://esd.ny.gov/film',
    lastUpdated: '2025-06',
    active: true,
  },

  // ===== USA - CALIFORNIA =====
  {
    id: 'us-ca-film-tax-credit',
    jurisdiction: 'California',
    country: 'United States',
    region: 'CA',
    programName: 'California Film & Television Tax Credit',
    creditType: 'refundable',
    basePercentage: 20,
    qualifyingExpenses: [
      'California resident wages and payroll',
      'California-based vendor services',
      'Equipment rental from CA companies',
      'Post-production in California',
      'Location fees and permits',
    ],
    excludedExpenses: [
      'Out-of-state payroll',
      'Contingency and deferments',
      'Insurance and bonding',
    ],
    minimumSpend: 1000000,
    capPerProject: 30000000,
    capAnnual: 330000000,
    residencyRequirements:
      'Significant California production. California resident hiring preferred.',
    applicationProcess:
      'Application through Go-Biz. Allocation from competitive pool. Post-production account audit.',
    typicalTimeline: '60-90 days allocation decision, longer for final approval',
    websiteUrl: 'https://business.ca.gov/californiafilm',
    lastUpdated: '2025-06',
    active: true,
    bonusPercentages: [
      {
        description: 'Small production / local hiring bonus',
        additionalPercentage: 5,
        requirements: [
          'Budget under $10 million',
          '50%+ California resident hiring',
        ],
      },
    ],
  },

  // ===== USA - ILLINOIS =====
  {
    id: 'us-il-film-tax-credit',
    jurisdiction: 'Illinois',
    country: 'United States',
    region: 'IL',
    programName: 'Illinois Film and High-Tech Digital Media Tax Credit',
    creditType: 'refundable',
    basePercentage: 30,
    qualifyingExpenses: [
      'Illinois production crew and equipment',
      'Location fees and permits in Illinois',
      'Post-production services',
      'Special effects and animation',
      'Music composition and licensing',
    ],
    excludedExpenses: [
      'Out-of-state payroll above limits',
      'Executive producer and star salaries',
      'Financing costs',
    ],
    minimumSpend: 100000,
    capPerProject: 40000000,
    residencyRequirements:
      'Significant Illinois production activities. State actively courts independent and international productions.',
    applicationProcess:
      'Application to Illinois Department of Commerce and Economic Opportunity. Production account documentation.',
    typicalTimeline: '45-60 days for approval',
    websiteUrl: 'https://www2.illinois.gov/dceo/SmallBusiness/Pages/default.aspx',
    lastUpdated: '2025-06',
    active: true,
  },

  // ===== USA - MASSACHUSETTS =====
  {
    id: 'us-ma-film-tax-credit',
    jurisdiction: 'Massachusetts',
    country: 'United States',
    region: 'MA',
    programName: 'Massachusetts Film Tax Credit',
    creditType: 'refundable',
    basePercentage: 25,
    qualifyingExpenses: [
      'Massachusetts resident wages',
      'Massachusetts vendor services and equipment',
      'Post-production in Massachusetts',
      'Location fees',
      'Equipment rental from MA companies',
    ],
    excludedExpenses: [
      'Out-of-state payroll',
      'Star and above-the-line costs above limits',
      'Insurance and contingency',
    ],
    minimumSpend: 50000,
    capPerProject: 10000000,
    residencyRequirements:
      'Substantial Massachusetts production. Massachusetts resident hiring prioritized.',
    applicationProcess:
      'Application to Massachusetts Film Office. Production account audit and certification.',
    typicalTimeline: '30-45 days',
    websiteUrl: 'https://www.mass.gov/film',
    lastUpdated: '2025-06',
    active: true,
  },

  // ===== USA - PENNSYLVANIA =====
  {
    id: 'us-pa-film-tax-credit',
    jurisdiction: 'Pennsylvania',
    country: 'United States',
    region: 'PA',
    programName: 'Pennsylvania Film Tax Credit',
    creditType: 'refundable',
    basePercentage: 25,
    qualifyingExpenses: [
      'Pennsylvania crew and vendor costs',
      'Equipment rental from PA vendors',
      'Post-production services',
      'Location fees and permits',
      'Lodging and meals for out-of-state crew',
    ],
    excludedExpenses: [
      'Out-of-state payroll',
      'Executive producer and star costs (above cap)',
      'Development and pre-production',
    ],
    minimumSpend: 1000000,
    capPerProject: 30000000,
    residencyRequirements:
      'Principal production must occur in Pennsylvania. Favorable treatment of out-of-state labor housing.',
    applicationProcess:
      'Application to Pennsylvania Department of Community and Economic Development. Production account reconciliation.',
    typicalTimeline: '30-60 days for approval',
    websiteUrl: 'https://www.pa.gov/business/filmoffice/',
    lastUpdated: '2025-06',
    active: true,
  },

  // ===== UK & EUROPE =====
  {
    id: 'uk-film-tax-relief',
    jurisdiction: 'United Kingdom',
    country: 'United Kingdom',
    programName: 'UK Film Tax Relief',
    creditType: 'refundable',
    basePercentage: 25.5,
    qualifyingExpenses: [
      'Production payroll and crew',
      'Post-production services',
      'Visual effects and animation',
      'Music composition',
      'Facility and equipment rental',
      'Catering and accommodation',
      'Location fees and permits',
    ],
    excludedExpenses: [
      'Financing costs and interest',
      'Development costs',
      'Above-the-line costs (above limits)',
      'Marketing and distribution',
    ],
    minimumSpend: 500000, // GBP
    residencyRequirements:
      'Production must be a qualifying British film under DCMS guidelines. Significant UK production required.',
    applicationProcess:
      'Application to BFI (British Film Institute) during production. Annual reconciliation with HMRC.',
    typicalTimeline: '8-12 weeks from completion of production',
    websiteUrl: 'https://www.bfi.org.uk',
    lastUpdated: '2025-06',
    active: true,
    bonusPercentages: [
      {
        description: 'Video games tax relief (if applicable)',
        additionalPercentage: 0, // Separate scheme
        requirements: ['Qualifying video game production'],
      },
    ],
  },
  {
    id: 'ie-section-481',
    jurisdiction: 'Ireland',
    country: 'Ireland',
    programName: 'Section 481 Film & Television Tax Relief',
    creditType: 'rebate',
    basePercentage: 32,
    qualifyingExpenses: [
      'Production crew and payroll',
      'Post-production services in Ireland',
      'Equipment rental',
      'Location fees within Ireland',
      'Visual effects and animation',
      'Music composition (Irish resident)',
      'Catering for cast and crew',
    ],
    excludedExpenses: [
      'Non-Irish post-production',
      'Development costs',
      'Marketing and distribution',
      'Star actor fees (above limits)',
    ],
    minimumSpend: 100000, // EUR
    capPerProject: 70000000, // EUR
    residencyRequirements:
      'Significant Irish production required. Post-production must include substantial Irish services.',
    applicationProcess:
      'Application to Irish Film Commission. Interim and final tax relief certificates. Reconciliation audit.',
    typicalTimeline: '4-6 months from application',
    websiteUrl: 'https://www.ifb.ie',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'france-tax-relief',
    jurisdiction: 'France',
    country: 'France',
    programName: 'French Audio-Visual Tax Relief (CIC)',
    creditType: 'rebate',
    basePercentage: 30,
    qualifyingExpenses: [
      'French production crew payroll',
      'Post-production in France',
      'French vendor services',
      'Equipment rental from French companies',
      'Location fees and permits',
    ],
    excludedExpenses: [
      'Non-French payroll above limits',
      'Distribution and marketing',
      'Development costs',
    ],
    minimumSpend: 100000, // EUR
    residencyRequirements:
      'Co-production agreement with French company often required. Significant French production activities.',
    applicationProcess:
      'Application through French co-producer. Documentation of French spend. Administrative approval process.',
    typicalTimeline: '3-6 months from application',
    websiteUrl: 'https://www.cnc.fr',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'hungary-film-tax-relief',
    jurisdiction: 'Hungary',
    country: 'Hungary',
    programName: 'Hungarian Film Tax Relief',
    creditType: 'rebate',
    basePercentage: 30,
    qualifyingExpenses: [
      'Hungarian crew and payroll',
      'Post-production in Hungary',
      'Equipment rental from Hungarian vendors',
      'Location fees',
      'Visual effects and animation services',
    ],
    excludedExpenses: [
      'International talent fees (above limits)',
      'Development costs',
      'Financing costs',
    ],
    minimumSpend: 500000, // EUR
    residencyRequirements:
      'Co-production with Hungarian partner often required. Significant Hungarian services.',
    applicationProcess:
      'Application to Hungarian Film Commission. Production account documentation.',
    typicalTimeline: '8-12 weeks',
    websiteUrl: 'https://www.filmcommission.hu',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'canada-federal-ropg',
    jurisdiction: 'Canada (Federal)',
    country: 'Canada',
    programName: 'Canadian Film or Video Production Tax Credit (CPTC)',
    creditType: 'refundable',
    basePercentage: 25,
    qualifyingExpenses: [
      'Canadian production crew wages',
      'Canadian equipment and facility rental',
      'Canadian post-production services',
      'Canadian vendor services',
    ],
    excludedExpenses: [
      'Non-Canadian payroll',
      'Equipment purchase',
      'Development and financing costs',
    ],
    minimumSpend: 1000000, // CAD
    residencyRequirements:
      'Must be a Canadian-controlled production. Key creative roles typically require Canadian residents.',
    applicationProcess:
      'Application to Canadian Heritage. Certification of production status. Final reconciliation audit.',
    typicalTimeline: '6-9 months from application',
    websiteUrl: 'https://www.canada.ca/en/canadian-heritage/services/funding/tax-credit.html',
    lastUpdated: '2025-06',
    active: true,
  },
  {
    id: 'canada-bc-provincial',
    jurisdiction: 'British Columbia',
    country: 'Canada',
    region: 'BC',
    programName: 'BC Film Tax Credit',
    creditType: 'refundable',
    basePercentage: 25,
    qualifyingExpenses: [
      'BC resident payroll',
      'BC vendor and equipment rental',
      'BC post-production services',
      'Location fees in BC',
    ],
    excludedExpenses: [
      'Out-of-province payroll',
      'Development and financing',
      'Executive producer fees',
    ],
    minimumSpend: 200000, // CAD
    capPerProject: 20000000, // CAD
    residencyRequirements:
      'Principal photography in BC. BC resident hiring strongly preferred.',
    applicationProcess:
      'Application to BC Film Commission. Production account audit.',
    typicalTimeline: '30-60 days for approval',
    websiteUrl: 'https://www.bcfilmcommission.com',
    lastUpdated: '2025-06',
    active: true,
  },
];

/**
 * Search and filter tax incentive programs by country, region, or minimum percentage
 */
export function searchIncentives(
  country?: string,
  region?: string,
  minPercentage?: number
): TaxIncentiveProgram[] {
  return TAX_INCENTIVE_DATABASE.filter((program) => {
    if (country && program.country.toLowerCase() !== country.toLowerCase()) {
      return false;
    }
    if (region && program.region?.toLowerCase() !== region.toLowerCase()) {
      return false;
    }
    if (minPercentage && program.basePercentage < minPercentage) {
      return false;
    }
    return program.active;
  });
}

/**
 * Calculate estimated tax credit for a specific program and spend amount
 * Takes into account caps, minimum spend, and applicable bonuses
 */
export function calculateEstimatedCredit(
  programId: string,
  qualifyingSpend: number
): {
  estimatedCredit: number;
  effectiveRate: number;
  notes: string;
} {
  const program = TAX_INCENTIVE_DATABASE.find((p) => p.id === programId);

  if (!program) {
    return {
      estimatedCredit: 0,
      effectiveRate: 0,
      notes: 'Program not found',
    };
  }

  // Check minimum spend requirement
  if (program.minimumSpend && qualifyingSpend < program.minimumSpend) {
    return {
      estimatedCredit: 0,
      effectiveRate: 0,
      notes: `Qualifying spend (${qualifyingSpend}) below minimum of ${program.minimumSpend}`,
    };
  }

  // Calculate base credit
  let creditAmount = qualifyingSpend * (program.basePercentage / 100);

  // Apply per-project cap
  if (program.capPerProject && creditAmount > program.capPerProject) {
    creditAmount = program.capPerProject;
  }

  // Calculate effective rate (accounting for caps)
  const effectiveRate = (creditAmount / qualifyingSpend) * 100;

  // Generate notes
  const notes: string[] = [];
  if (program.capPerProject && creditAmount >= program.capPerProject) {
    notes.push(`Credit capped at ${program.capPerProject}`);
  }
  if (program.bonusPercentages && program.bonusPercentages.length > 0) {
    notes.push(
      `Potential bonus of +${program.bonusPercentages.map((b) => b.additionalPercentage).join(', ')}% available if requirements met`
    );
  }

  return {
    estimatedCredit: Math.round(creditAmount),
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    notes: notes.join('; ') || 'Standard calculation',
  };
}

/**
 * Get recommended tax incentive programs for a given budget and shoot location
 * Returns programs sorted by estimated total value
 */
export function getBestIncentivesForBudget(
  totalBudget: number,
  shootLocation: string,
  postLocation?: string
): TaxIncentiveProgram[] {
  // Normalize location input
  const normalizedLocation = shootLocation.trim().toLowerCase();

  // Map common location references to country codes
  const locationMap: Record<string, { country: string; region?: string }> = {
    // Australia
    australia: { country: 'Australia' },
    australia_federal: { country: 'Australia' },
    sydney: { country: 'Australia', region: 'NSW' },
    nsw: { country: 'Australia', region: 'NSW' },
    'new south wales': { country: 'Australia', region: 'NSW' },
    brisbane: { country: 'Australia', region: 'QLD' },
    qld: { country: 'Australia', region: 'QLD' },
    queensland: { country: 'Australia', region: 'QLD' },

    // USA - Georgia
    georgia: { country: 'United States', region: 'GA' },
    atlanta: { country: 'United States', region: 'GA' },

    // USA - New Mexico
    'new mexico': { country: 'United States', region: 'NM' },
    albuquerque: { country: 'United States', region: 'NM' },
    santa: { country: 'United States', region: 'NM' },

    // USA - Louisiana
    louisiana: { country: 'United States', region: 'LA' },
    'new orleans': { country: 'United States', region: 'LA' },
    baton: { country: 'United States', region: 'LA' },

    // USA - New York
    'new york': { country: 'United States', region: 'NY' },
    nyc: { country: 'United States', region: 'NY' },

    // USA - California
    california: { country: 'United States', region: 'CA' },
    'los angeles': { country: 'United States', region: 'CA' },
    la: { country: 'United States', region: 'CA' },
    'san francisco': { country: 'United States', region: 'CA' },

    // USA - Illinois
    illinois: { country: 'United States', region: 'IL' },
    chicago: { country: 'United States', region: 'IL' },

    // USA - Massachusetts
    massachusetts: { country: 'United States', region: 'MA' },
    boston: { country: 'United States', region: 'MA' },

    // USA - Pennsylvania
    pennsylvania: { country: 'United States', region: 'PA' },
    philadelphia: { country: 'United States', region: 'PA' },
    pittsburgh: { country: 'United States', region: 'PA' },

    // UK
    'united kingdom': { country: 'United Kingdom' },
    uk: { country: 'United Kingdom' },
    london: { country: 'United Kingdom' },
    england: { country: 'United Kingdom' },

    // Ireland
    ireland: { country: 'Ireland' },
    dublin: { country: 'Ireland' },

    // France
    france: { country: 'France' },
    paris: { country: 'France' },

    // Hungary
    hungary: { country: 'Hungary' },
    budapest: { country: 'Hungary' },

    // Canada
    canada: { country: 'Canada' },
    'british columbia': { country: 'Canada', region: 'BC' },
    bc: { country: 'Canada', region: 'BC' },
    vancouver: { country: 'Canada', region: 'BC' },
  };

  const locationInfo = locationMap[normalizedLocation];
  if (!locationInfo) {
    // Return all active incentives if location not recognized
    return TAX_INCENTIVE_DATABASE.filter((p) => p.active);
  }

  // Find matching programs
  let matches = TAX_INCENTIVE_DATABASE.filter((program) => {
    if (!program.active) return false;
    if (program.country !== locationInfo.country) return false;
    if (locationInfo.region && program.region !== locationInfo.region) {
      // For countries with multiple programs, include federal/country-level programs
      return program.region === undefined;
    }
    return true;
  });

  // Calculate estimated credit for each program and sort by value
  const programsWithEstimates = matches
    .map((program) => {
      // Estimate qualifying spend as percentage of total budget
      let estimatedQualifyingSpend = totalBudget;

      // Adjust for common expense ratios
      if (
        program.basePercentage > 25 ||
        program.qualifyingExpenses.some((e) => e.includes('crew') || e.includes('payroll'))
      ) {
        // Production and crew-heavy incentives typically only apply to 70-80% of budget
        estimatedQualifyingSpend = totalBudget * 0.75;
      }

      const creditCalc = calculateEstimatedCredit(program.id, estimatedQualifyingSpend);
      return {
        program,
        estimatedCredit: creditCalc.estimatedCredit,
      };
    })
    .sort((a, b) => b.estimatedCredit - a.estimatedCredit);

  return programsWithEstimates.map((item) => item.program);
}

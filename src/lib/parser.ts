import { v4 as uuidv4 } from 'uuid';
import {
  DeliveryItem,
  DeliverySchedule,
  DeliveryCategory,
  RequirementStatus,
} from './types';

/**
 * Category keywords — ordered by specificity so more specific matches win.
 * The first match wins, so order within the record matters.
 */
const CATEGORY_KEYWORDS: Record<DeliveryCategory, string[]> = {
  cinema_masters: [
    'dcdm',
    'digital cinema distribution master',
    'digital cinema package',
    'dkdm',
    'dpx',
    'digital picture exchange',
    'dcp',
    'jpeg 2000',
    'jpeg2000',
    'digital cinema',
    'tiff files',
    'tiff',
    'hdr tiff',
  ],
  video_digital: [
    'prores 4444',
    'prores 422',
    'prores',
    'apple prores',
    'mezzanine file',
    'mezzanine',
    'hd master',
    'uhd',
    'hdr digital',
    'hdr mezzanine',
    'sdr',
    'videotape',
    'television version',
    'airline version',
    'textless title',
    'textless background',
    'textless overlay',
    'textless element',
    'textless',
    'closed caption',
    'caption',
    '.scc',
    '.cap',
    'screener',
    'reference screener',
    'watermark',
    'blu-ray',
    'bluray',
    'h.264',
    'h264',
    'mp4',
    'quicktime',
    'ccsl',
    'combined continuity',
    'spotting list',
    'font',
  ],
  audio: [
    '5.1 surround',
    '5.1 printmaster',
    '5.1 m&e',
    '5.1 dme',
    '5.1 music',
    '5.1 stereo',
    '5.1',
    '7.1',
    'surround mix',
    'surround print',
    'printmaster',
    'print master',
    'm&e',
    'music and effects',
    'music & effects',
    'dme stem',
    'dme',
    'dialogue stem',
    'music stem',
    'effects stem',
    'stems',
    'dolby atmos',
    'atmos',
    'lt-rt',
    'stereo mix',
    'stereo 2-track',
    'stereo printmaster',
    'nearfield',
    'audio descriptive',
    'audio description',
    'pro tools session',
    'pro tools',
    'sound element',
    'audio element',
    'foreign language dub',
    'subtitle',
    'dub',
    'lpcm',
    'aiff',
    '.wav',
  ],
  trailer: [
    'trailer element',
    'trailer sound',
    'trailer - sound',
    'trailer digital mezzanine',
    'trailer reference',
    'trailer dcp',
    'texted trailer',
    'textless trailer',
    'trailer prores',
    'trailer screener',
    'trailer master',
    'trailer mix',
    'trailer version',
    'behind-the-scenes',
    'behind the scenes',
    'epk footage',
    'b-roll',
    'trailer',
  ],
  music_rights: [
    'music cue sheet',
    'cue sheet',
    'sync license',
    'synchronization license',
    'master use license',
    'composer agreement',
    'music license',
    'music recording',
    'music score',
    'musical score',
    'source music',
    'performing rights',
    'music publishing',
  ],
  marketing: [
    'key art',
    'poster',
    'one-sheet',
    'one sheet',
    'production still',
    'stills',
    'photography',
    'headshot',
    'bio',
    'biography',
    'press kit',
    'epk',
    'electronic press kit',
    'synopsis',
    'publicity',
    'social media',
    'artwork',
    'promotional material',
    'advertising material',
    'logo',
    'marketing',
    'ad mat',
  ],
  legal: [
    'chain of title',
    'copyright registration',
    'copyright certificate',
    'copyright',
    'e&o insurance',
    'e&o',
    'errors and omissions',
    'errors & omissions',
    'insurance certificate',
    'insurance',
    'laboratory access letter',
    'lab access',
    'talent agreement',
    'writer agreement',
    'director agreement',
    'mpaa',
    'motion picture association',
    'rating certificate',
    'certificate of origin',
    'certificate of nationality',
    'tax credit',
    'completion bond',
    'distribution agreement',
    'license agreement',
    'literary agreement',
    'underlying rights',
    'quitclaim',
    'assignment',
    'guild',
    'wga',
    'dga',
    'sag',
    'aftra',
    'iatse',
    'residual',
  ],
  metadata: [
    'isan',
    'eidr',
    'imdb',
    'cast list',
    'credit block',
    'billing',
    'end credits',
    'main credits',
    'credit',
    'running time',
    'aspect ratio',
    'language',
    'shooting script',
    'script',
    'dialogue list',
    'continuity',
  ],
};

/**
 * Categorize a deliverable item based on keyword matching.
 * Uses the ordered CATEGORY_KEYWORDS — first category to match wins.
 */
export function categorizeItem(text: string): DeliveryCategory {
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category as DeliveryCategory;
      }
    }
  }

  // Default fallback
  return 'metadata';
}

/**
 * Detect requirement status from the text context.
 */
export function detectStatus(text: string): RequirementStatus {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('waived') || lowerText.includes('not required')) {
    return 'waived';
  }

  if (
    lowerText.includes('if available') ||
    lowerText.includes('if applicable') ||
    lowerText.includes('if created') ||
    lowerText.includes('if existing') ||
    lowerText.includes('if obtained')
  ) {
    return 'if_available';
  }

  if (
    lowerText.includes('if releasing theatrically') ||
    lowerText.includes('if released theatrically') ||
    lowerText.includes('if territory includes') ||
    lowerText.includes('if the picture is') ||
    lowerText.includes('if any portion') ||
    /\bif\b.*\brequired\b/i.test(lowerText)
  ) {
    return 'conditional';
  }

  return 'required';
}

/**
 * Extract the film title from the document text.
 * Delivery schedules typically reference the film from a "Main Agreement"
 * rather than stating it directly, so we look for several patterns.
 */
function extractFilmTitle(text: string, filename?: string): string {
  // Pattern 0: Extract from filename if provided
  // Common patterns: "Delivery Schedule (Film Title) date.docx" or "Film Title Delivery Schedule.docx"
  if (filename) {
    // Remove extension
    const nameOnly = filename.replace(/\.(docx|pdf|txt)$/i, '');
    // Try to extract title from parentheses
    const parenMatch = nameOnly.match(/\(([^)]+)\)/);
    if (parenMatch) {
      // Clean up: "Enemy Within, An" -> "An Enemy Within"
      let title = parenMatch[1].trim();
      const commaFlip = title.match(/^(.+),\s*(\w+)$/);
      if (commaFlip) {
        title = `${commaFlip[2]} ${commaFlip[1]}`;
      }
      return title;
    }
    // Try removing common words to find the title
    const cleaned = nameOnly
      .replace(/delivery\s*schedule/i, '')
      .replace(/\d{4,}/g, '') // dates
      .replace(/\(\d+\)/g, '') // version numbers
      .replace(/[_-]+/g, ' ')
      .replace(/\bww\b/i, '')
      .replace(/\b\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{2,4}\b/g, '')
      .replace(/\b\d{1,2}\s+\d{1,2}\s+\d{2,4}\b/g, '') // spaced dates
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length > 3 && cleaned.length < 60) {
      // Don't use if it's just a distributor name or too generic
      if (!cleaned.match(/^(HFG\s*.*|The Avenue\s*.*|Highland Film Group|4K|HD|SDR|HDR)$/i) &&
          !cleaned.match(/^HFG/i) &&
          !cleaned.match(/^The Avenue/i) &&
          !cleaned.match(/^\s*$/)) {
        return cleaned;
      }
    }
  }

  // Pattern 1: "Picture" or "Film" followed by a title in quotes (smart or straight)
  const quotedTitle = text.match(
    /(?:picture|film|project)\s*(?:entitled|titled|known as|:)\s*["\u201C"']([^"\u201D"']+)["\u201D"']/i
  );
  if (quotedTitle) return quotedTitle[1].trim();

  // Pattern 2: Title in quotes near the top (but not "Main Agreement", "Producer", etc.)
  const earlyQuotes = text.substring(0, 3000).matchAll(/["\u201C]([^"\u201D]{2,60})["\u201D]/g);
  for (const match of earlyQuotes) {
    const candidate = match[1].trim();
    if (
      candidate.length > 2 &&
      !candidate.match(/^(main agreement|producer|distributor|grantor|sales agent|picture|delivery|schedule|licensor)/i)
    ) {
      return candidate;
    }
  }

  // Pattern 3: "RE:" or "Re:" pattern
  const reMatch = text.match(/re:\s*(.+?)(?:\n|$)/i);
  if (reMatch && reMatch[1].trim().length > 2) return reMatch[1].trim();

  // Pattern 4: Look for a title-like line near the top
  const skipPatterns = /^(DELIVERY|SCHEDULE|ACCEPTANCE|THE FOLLOWING|FOR THESE|ATTACHMENT|NOTE|SECTION|PAGE|ALL |NO |FOR |TECHNICAL|_+$|MAIN AGREEMENT)/i;
  const lines = text.split('\n').slice(0, 30);
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length > 2 &&
      trimmed.length < 60 &&
      /^[A-Z]/.test(trimmed) &&
      !skipPatterns.test(trimmed) &&
      !/^_+$/.test(trimmed) &&
      trimmed !== trimmed.replace(/[a-zA-Z]/g, '') // not all non-alpha
    ) {
      return trimmed;
    }
  }

  return 'Untitled Film';
}

/**
 * Extract the distributor name from the document text.
 */
function extractDistributor(text: string): string {
  const distributorNames = [
    'Highland Film Group',
    'The Avenue',
    'Avenue Entertainment',
    'Lionsgate',
    'A24',
    'Neon',
    'Magnolia Pictures',
    'IFC Films',
    'Well Go USA',
    'RLJE Films',
    'Saban Films',
    'Saban',
    'Screen Media',
    'Voltage Pictures',
    'FilmNation',
    'STX Entertainment',
    'Bleecker Street',
    'Gravitas Ventures',
    'Samuel Goldwyn Films',
    'Vertical Entertainment',
    'Signature Entertainment',
    'Millennium Media',
    'Nu Image',
    'Myriad Pictures',
    'Grindstone Entertainment',
    'Aperture Entertainment',
    'HFG',
  ];

  // Find the distributor that appears EARLIEST in the document
  // (the entity whose name appears first is most likely the actual distributor)
  const lowerText = text.toLowerCase();
  let earliestPos = Infinity;
  let bestMatch = '';

  for (const name of distributorNames) {
    const pos = lowerText.indexOf(name.toLowerCase());
    if (pos !== -1 && pos < earliestPos) {
      earliestPos = pos;
      bestMatch = name;
    }
  }

  if (bestMatch) return bestMatch;

  // Fallback: Look for company-style names
  const companyMatch = text.substring(0, 3000).match(
    /([A-Z][A-Za-z\s]+(?:Films?|Entertainment|Pictures|Media|Studios?|Distribution|Group|Inc\.?|LLC|Ltd\.?))/
  );
  if (companyMatch) return companyMatch[1].trim();

  return 'Unknown Distributor';
}

/**
 * Extract QC/lab requirements from the document.
 */
function extractLabRequirements(text: string): string {
  const qcMatch = text.match(
    /quality control[^.]*\.\s*[^.]*\./i
  );
  if (qcMatch) return qcMatch[0].trim();

  const labMatch = text.match(
    /visual data media services[^.]*\./i
  );
  if (labMatch) return labMatch[0].trim();

  return '';
}

/**
 * Main parsing function — splits the document into deliverable items
 * and extracts structured data from each.
 */
export function parseDeliverySchedule(text: string, filename?: string): DeliverySchedule {
  const id = uuidv4();
  const parsedDate = new Date().toISOString();

  const filmTitle = extractFilmTitle(text, filename);
  const distributor = extractDistributor(text);
  const labRequirements = extractLabRequirements(text);

  const items: DeliveryItem[] = [];
  const seenNames = new Set<string>();

  // Split into logical blocks by looking for deliverable-like content
  const lines = text.split('\n');
  let currentBlock = '';
  let blockCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentBlock.trim().length > 10) {
        processBlock(currentBlock.trim(), items, seenNames);
        blockCount++;
      }
      currentBlock = '';
      continue;
    }

    // Check if this line starts a new numbered/lettered item
    const isNewItem = /^(?:\d+[\.\)]\s|[a-z]\)\s|[A-Z]\.\s|\([a-z]\)\s|\([ivxlc]+\)\s)/.test(line);

    if (isNewItem && currentBlock.trim().length > 10) {
      processBlock(currentBlock.trim(), items, seenNames);
      blockCount++;
      currentBlock = line;
    } else {
      currentBlock += (currentBlock ? ' ' : '') + line;
    }
  }

  // Don't forget last block
  if (currentBlock.trim().length > 10) {
    processBlock(currentBlock.trim(), items, seenNames);
  }

  // If we got very few items, try the section-header approach
  if (items.length < 10) {
    items.length = 0; // Clear and retry
    seenNames.clear();
    parseByHeaders(text, items, seenNames);
  }

  // Calculate totals
  const requiredItems = items.filter((item) => item.status === 'required').length;
  const completedItems = items.filter((item) => item.completed).length;

  return {
    id,
    filmTitle,
    distributor,
    distributorContact: '',
    labRequirements,
    items,
    totalItems: items.length,
    requiredItems,
    completedItems,
    parsedDate,
    rawText: text,
  };
}

/**
 * Process a text block and determine if it represents a deliverable item.
 * Filters out boilerplate, legal preambles, and non-deliverable content.
 */
function processBlock(
  block: string,
  items: DeliveryItem[],
  seenNames: Set<string>
): void {
  // Skip boilerplate / preamble / structural items
  const lowerBlock = block.toLowerCase();
  if (
    lowerBlock.includes('acceptance by distributor') ||
    lowerBlock.includes('the following delivery schedule') ||
    lowerBlock.includes('no waiver of delivery') ||
    lowerBlock.includes('all delivery materials must') ||
    lowerBlock.includes('for these purposes') ||
    (lowerBlock.includes('quality control') && lowerBlock.includes('visual data') && block.length < 500) ||
    (lowerBlock.startsWith('note:') && block.length < 200) ||
    lowerBlock.startsWith('attachment') ||
    /^page \d+/i.test(block) ||
    /^\d{2}:\d{2}:\d{2}:\d{2}/.test(block) || // timecodes
    /^please indicate/i.test(block) ||
    /^all physical/i.test(block) && block.length < 300 ||
    lowerBlock === 'if available' ||
    /^resolution the picture/i.test(block) ||
    /^audio information/i.test(block) && block.length < 50
  ) {
    return;
  }

  // Check if this block contains deliverable-like content
  const isDeliverable = isDeliverableContent(block);
  if (!isDeliverable) return;

  // Clean the item name — take the first sentence or clause
  let name = block
    .replace(/^\s*(?:\d+[\.\)]\s*|[a-z]\)\s*|[A-Z]\.\s*|\([a-z]\)\s*|\([ivxlc]+\)\s*)/, '')
    .trim();

  // Get a clean short name (first meaningful clause)
  const shortName = extractShortName(name);

  // Skip if we've already seen this exact name
  if (seenNames.has(shortName.toLowerCase())) return;
  seenNames.add(shortName.toLowerCase());

  // Skip very short or non-descriptive names
  if (shortName.length < 4) return;

  const item: DeliveryItem = {
    id: uuidv4(),
    name: shortName,
    category: categorizeItem(block),
    technicalSpecs: extractTechnicalSpecs(block),
    status: detectStatus(block),
    condition: extractCondition(block),
    qcRequired: /qc|quality control|inspection/i.test(block),
    quantity: extractQuantity(block),
    deliveryMethod: extractDeliveryMethod(block),
    notes: name.length > 200 ? name.substring(0, 200) + '...' : name,
    completed: false,
    fulfillment: 'missing',
    uploadedFiles: [],
  };

  items.push(item);
}

/**
 * Determine if a text block represents an actual deliverable item
 * rather than boilerplate, definitions, or procedural text.
 */
function isDeliverableContent(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Positive signals — technical delivery terms
  const deliverableSignals = [
    'one (1)', 'one copy', 'two (2)', 'copies',
    'prores', 'dcp', 'dcdm', 'dpx', 'tiff', 'mezzanine',
    '5.1', 'stereo', 'surround', 'm&e', 'printmaster', 'atmos',
    'trailer', 'textless', 'screener', 'subtitle',
    'music cue', 'cue sheet', 'sync license',
    'chain of title', 'copyright', 'e&o', 'insurance',
    'key art', 'poster', 'stills', 'photography', 'synopsis',
    'shall deliver', 'must deliver', 'shall provide', 'must provide',
    'hd', 'uhd', '4k', '2k', 'resolution',
    'digital cinema', 'jpeg 2000', 'h.264',
    'pro tools', 'session file',
    'access letter', 'lab access',
    'shooting script', 'script',
    'credit', 'billing',
    'certificate', 'agreement',
    'logo', 'font',
    'aiff', '.wav', 'audio',
    'ccsl', 'continuity', 'spotting list',
    'qc report', 'quality control',
  ];

  let signalCount = 0;
  for (const signal of deliverableSignals) {
    if (lowerText.includes(signal)) signalCount++;
  }

  return signalCount >= 1;
}

/**
 * Extract a clean, concise name from a block of text.
 */
function extractShortName(text: string): string {
  // If there's a colon, take what's before it (usually the item name)
  const colonIndex = text.indexOf(':');
  if (colonIndex > 0 && colonIndex < 120) {
    const beforeColon = text.substring(0, colonIndex).trim();
    if (beforeColon.length > 4 && beforeColon.length < 120) {
      return beforeColon;
    }
  }

  // Take first sentence
  const sentenceEnd = text.match(/^(.{10,150}?)(?:\.\s|$)/);
  if (sentenceEnd) {
    return sentenceEnd[1].trim();
  }

  // Fall back to first 100 chars
  return text.substring(0, 100).trim();
}

/**
 * Extract conditional text (what triggers the requirement).
 */
function extractCondition(text: string): string | undefined {
  const condMatch = text.match(
    /if\s+(releasing theatrically|released theatrically|territory includes|the picture is|any portion|applicable|available|created)/i
  );
  if (condMatch) {
    return condMatch[0].trim();
  }
  return undefined;
}

/**
 * Fallback parser: split by section headers (all-caps or bold-style lines).
 */
function parseByHeaders(
  text: string,
  items: DeliveryItem[],
  seenNames: Set<string>
): void {
  const lines = text.split('\n');
  let currentSection = '';
  let currentContent = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers (all caps, short lines)
    if (
      trimmed.length > 3 &&
      trimmed.length < 80 &&
      /^[A-Z][A-Z\s\-\/&:]+$/.test(trimmed) &&
      !trimmed.match(/^(DELIVERY SCHEDULE|ATTACHMENT|PAGE|NOTE|SECTION)/)
    ) {
      // Save previous section
      if (currentSection && currentContent) {
        processBlock(
          currentSection + ': ' + currentContent.trim(),
          items,
          seenNames
        );
      }
      currentSection = trimmed;
      currentContent = '';
    } else if (trimmed) {
      currentContent += ' ' + trimmed;
    }
  }

  // Last section
  if (currentSection && currentContent) {
    processBlock(
      currentSection + ': ' + currentContent.trim(),
      items,
      seenNames
    );
  }
}

function extractTechnicalSpecs(text: string): string {
  const specs: string[] = [];

  // Resolution
  const resMatch = text.match(
    /\b(4k|2k|uhd|hd|sd|1080[pi]|720p|2160p|3840\s*x\s*2160|1920\s*x\s*1080|2048\s*x\s*858|4096\s*x\s*\d+)\b/i
  );
  if (resMatch) specs.push(resMatch[1]);

  // Codec/Format
  const formatMatch = text.match(
    /\b(prores\s*4444\s*xq|prores\s*4444|prores\s*422\s*hq|prores\s*422|prores|h\.264|h264|jpeg\s*2000|jpeg2000|dpx|tiff|avc|hevc)\b/i
  );
  if (formatMatch) specs.push(formatMatch[0].trim());

  // Audio format
  const audioMatch = text.match(
    /\b(5\.1\s*surround|5\.1|7\.1|2\.0|stereo|mono|dolby\s*atmos|atmos|dts|lpcm|lt-?rt)\b/i
  );
  if (audioMatch) specs.push(audioMatch[0].trim());

  // Frame rate
  const fpsMatch = text.match(/\b(\d+\.?\d*\s*fps|23\.98|24p|25p|29\.97|24fps|25fps|30fps)\b/i);
  if (fpsMatch) specs.push(fpsMatch[0].trim());

  // Color space
  const colorMatch = text.match(
    /\b(hdr|sdr|rec\.?\s*709|rec\.?\s*2020|p3\s*d65|xyz\s*color|dci-?p3|bt\.?2020|4000\s*nit|1000\s*nit)\b/i
  );
  if (colorMatch) specs.push(colorMatch[0].trim());

  // Bit depth
  const bitMatch = text.match(/\b(16\s*bit|10\s*bit|8\s*bit|24\s*bit)\b/i);
  if (bitMatch) specs.push(bitMatch[0].trim());

  // File format
  const fileMatch = text.match(/\b(\.srt|\.scc|\.cap|\.aiff|\.wav|\.mov|\.mp4|\.mxf)\b/i);
  if (fileMatch) specs.push(fileMatch[0].trim());

  return specs.join(', ');
}

function extractQuantity(text: string): number {
  // Look for "One (1)", "Two (2)", etc.
  const spellMatch = text.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*\((\d+)\)/i
  );
  if (spellMatch) return parseInt(spellMatch[2], 10);

  const match = text.match(/(\d+)\s*(?:copies|copy|sets?|files?|reels?|versions?)\b/i);
  if (match) return parseInt(match[1], 10);

  return 1;
}

function extractDeliveryMethod(text: string): string {
  const methods: string[] = [];

  if (/\b(?:hard\s*drive|usb|external\s*drive)\b/i.test(text)) methods.push('Hard Drive');
  if (/\b(?:ftp|sftp|aspera|signiant)\b/i.test(text)) methods.push('Digital Transfer');
  if (/\blto\b/i.test(text)) methods.push('LTO Tape');
  if (/\b(?:digital(?:ly)?|online|upload)\b/i.test(text)) methods.push('Digital');

  return methods.length > 0 ? methods.join(', ') : '';
}

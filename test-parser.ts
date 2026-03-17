import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { parseDeliverySchedule } from './src/lib/parser';

const UPLOADS = '/sessions/dazzling-inspiring-mendel/mnt/uploads';

async function testFile(filePath: string) {
  const filename = path.basename(filePath);
  console.log('\n' + '='.repeat(80));
  console.log(`TESTING: ${filename}`);
  console.log('='.repeat(80));

  const buffer = fs.readFileSync(filePath);
  let text = '';

  if (filePath.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (filePath.endsWith('.txt')) {
    text = buffer.toString('utf-8');
  }

  // Show raw text sample
  console.log('\n--- RAW TEXT SAMPLE (first 500 chars) ---');
  console.log(text.substring(0, 500));
  console.log('...');
  console.log(`\nTotal text length: ${text.length} chars`);

  // Parse
  const schedule = parseDeliverySchedule(text);

  console.log('\n--- PARSE RESULTS ---');
  console.log(`Film Title: ${schedule.filmTitle}`);
  console.log(`Distributor: ${schedule.distributor}`);
  console.log(`Total Items: ${schedule.totalItems}`);
  console.log(`Required: ${schedule.requiredItems}`);

  // Category breakdown
  const categories: Record<string, number> = {};
  for (const item of schedule.items) {
    categories[item.category] = (categories[item.category] || 0) + 1;
  }
  console.log('\n--- CATEGORY BREAKDOWN ---');
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Status breakdown
  const statuses: Record<string, number> = {};
  for (const item of schedule.items) {
    statuses[item.status] = (statuses[item.status] || 0) + 1;
  }
  console.log('\n--- STATUS BREAKDOWN ---');
  for (const [status, count] of Object.entries(statuses)) {
    console.log(`  ${status}: ${count}`);
  }

  // Show first 10 items
  console.log('\n--- FIRST 15 ITEMS ---');
  for (const item of schedule.items.slice(0, 15)) {
    console.log(`  [${item.category}] [${item.status}] ${item.name}`);
    if (item.technicalSpecs) console.log(`    specs: ${item.technicalSpecs}`);
  }

  return schedule;
}

async function main() {
  const files = [
    path.join(UPLOADS, 'Delivery Schedule (Enemy Within, An) 250804 (2).docx'),
    path.join(UPLOADS, 'HFG Delivery Schedule - 4K - 6-10-21.docx'),
    path.join(UPLOADS, 'The Avenue WW Delivery Schedule - 1-8-21.docx'),
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      await testFile(file);
    } else {
      console.log(`File not found: ${file}`);
    }
  }
}

main().catch(console.error);

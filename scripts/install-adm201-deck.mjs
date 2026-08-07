/**
 * Install the merged + corrected ADM-201 questions as a deck.
 *
 * Copies the staged file out of freecram-scraper/ into public/decks/, assigns a
 * topic to every question, and registers the deck in manifest.json.
 *
 * WHY TOPICS ARE ASSIGNED HERE: the scraper stamps one flat `_cat` on every row,
 * but `_cat` is what drives the topic list, the per-topic breakdown on the
 * completion screen, and the topic filter in review. A deck where all 154
 * questions share a category leaves all three features showing a single useless
 * bucket. The categorized decks in this repo (Integration Architect, Dev
 * Lifecycle) use the certification's own exam domains, so this follows suit with
 * the seven official Salesforce Administrator domains.
 *
 * Ids are NOT assigned here — run add-question-ids.mjs afterwards, which hashes
 * the final content so the id matches what the app stores against comments.
 *
 *   node scripts/install-adm201-deck.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'freecram-scraper', 'questions_adm201_merged.json');
const DECKS = join(ROOT, 'public', 'decks');
const DEST_FILE = 'salesforce_admin_questions.json';
const DRY = process.argv.includes('--dry');

const CONFIG = 'Configuration and Setup';
const OBJECTS = 'Object Manager and Lightning App Builder';
const SALES = 'Sales and Marketing Applications';
const SERVICE = 'Service and Support Applications';
const PRODUCTIVITY = 'Productivity and Collaboration';
const DATA = 'Data and Analytics Management';
const AUTOMATION = 'Workflow and Process Automation';

/** 1-based question number -> exam domain. Every question is listed exactly once. */
const TOPICS = {
  [CONFIG]: [
    6, 9, 10, 12, 16, 23, 33, 34, 36, 38, 47, 50, 55, 56, 73, 78, 79, 83, 85, 93,
    103, 104, 107, 109, 113, 119, 120, 125, 126, 129, 132, 142, 143, 144, 149, 151, 154,
  ],
  [OBJECTS]: [
    2, 19, 27, 35, 40, 42, 48, 51, 62, 69, 89, 91, 94, 95, 98, 105, 108, 117, 123,
    124, 130, 131, 135, 138, 145, 148, 150,
  ],
  [SALES]: [3, 4, 29, 37, 43, 52, 61, 80, 84, 86, 87, 88, 90, 99, 100, 114, 121, 153],
  [SERVICE]: [
    8, 13, 24, 25, 26, 28, 49, 53, 54, 57, 59, 60, 70, 71, 72, 74, 75, 77, 101, 110, 112, 141,
  ],
  [PRODUCTIVITY]: [15, 18, 39, 133],
  [DATA]: [7, 11, 14, 21, 30, 41, 44, 45, 46, 58, 64, 67, 68, 92],
  [AUTOMATION]: [
    1, 5, 17, 20, 22, 31, 32, 63, 65, 66, 76, 81, 82, 96, 97, 102, 106, 111, 115, 116,
    118, 122, 127, 128, 134, 136, 137, 139, 140, 146, 147, 152,
  ],
};

const DECK_ENTRY = {
  id: 'salesforce-admin',
  name: 'Salesforce Certified Administrator',
  shortName: 'Administrator',
  description:
    'Foundational certification covering configuration and setup, object management and the ' +
    'Lightning App Builder, sales and service applications, data and analytics, and process automation.',
  file: DEST_FILE,
  accentColor: '#F062C0',
};

const questions = JSON.parse(readFileSync(SRC, 'utf8'));

// Invert the map, failing loudly on a number claimed twice.
const byNumber = new Map();
for (const [topic, numbers] of Object.entries(TOPICS)) {
  for (const n of numbers) {
    if (byNumber.has(n)) {
      console.error(`#${n} is assigned to both "${byNumber.get(n)}" and "${topic}".`);
      process.exit(1);
    }
    byNumber.set(n, topic);
  }
}

const missing = [];
for (let n = 1; n <= questions.length; n++) if (!byNumber.has(n)) missing.push(n);
const extra = [...byNumber.keys()].filter((n) => n < 1 || n > questions.length);
if (missing.length || extra.length) {
  if (missing.length) console.error(`No topic for question(s): ${missing.join(', ')}`);
  if (extra.length) console.error(`Topic assigned to nonexistent question(s): ${extra.join(', ')}`);
  process.exit(1);
}

questions.forEach((q, i) => {
  q._cat = byNumber.get(i + 1);
});

const manifestPath = join(DECKS, 'manifest.json');
const manifestRaw = readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(manifestRaw);

const existing = manifest.decks.findIndex((d) => d.id === DECK_ENTRY.id);
if (existing === -1) manifest.decks.push(DECK_ENTRY);
else manifest.decks[existing] = DECK_ENTRY;

const clash = manifest.decks.filter(
  (d) => d.id !== DECK_ENTRY.id && d.accentColor.toLowerCase() === DECK_ENTRY.accentColor.toLowerCase(),
);
if (clash.length) {
  console.error(`Accent ${DECK_ENTRY.accentColor} already used by ${clash.map((d) => d.id).join(', ')}.`);
  process.exit(1);
}

console.log(`${questions.length} questions -> ${DEST_FILE}`);
for (const [topic, numbers] of Object.entries(TOPICS)) {
  console.log(`  ${topic.padEnd(42)} ${String(numbers.length).padStart(3)}`);
}
console.log(`\nmanifest: ${existing === -1 ? 'added' : 'updated'} "${DECK_ENTRY.id}" (${DECK_ENTRY.accentColor})`);

if (!DRY) {
  writeFileSync(join(DECKS, DEST_FILE), JSON.stringify(questions, null, 2) + '\n', 'utf8');
  let out = JSON.stringify(manifest, null, 2) + '\n';
  if (manifestRaw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(manifestPath, out, 'utf8');
  console.log('\nWritten. Next: node scripts/add-question-ids.mjs');
} else {
  console.log('\n[dry run] nothing written');
}

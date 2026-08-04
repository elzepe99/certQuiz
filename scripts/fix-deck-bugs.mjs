/**
 * Structural repairs to questions that are broken in the app, found by the
 * deck validator rather than by user comments.
 *
 * Three Sharing & Visibility questions were scraped as statements: every option
 * is an empty string and the answer text sits in `correct` as prose, so the app
 * renders no choices at all. Two more questions carry duplicate option text.
 *
 * Keyed on each question's permanent `id`.
 *
 *   node scripts/fix-deck-bugs.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stampCorrection } from './lib/corrections.mjs';

const DECKS = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'decks');
const DRY = process.argv.includes('--dry');

/**
 * The `correct` value each question carried before this ran. Pinned so a second
 * run cannot lose it. The three Sharing & Visibility entries held prose rather
 * than option letters, which is the bug being repaired.
 *
 * Note that a prose entry here is not evidence the answer moved: for those
 * three, the prose *became* the lettered option with the same meaning, so their
 * fixes set `answerMoved: false` and no from/to is recorded.
 */
const ORIGINAL_ANSWER = {
  '46cf2c6f': 'Executive, Manager, and User',
  d603efad: 'Granular Locking',
  e53d2012: 'Super user permission',
  f3b19bee: 'D',
};

const FIXES = {
  'sharing_visibility_questions_corrected.json': {
    '46cf2c6f': {
      answerMoved: false,
      note: 'Q57 had no options and "Executive, Manager, and User" as the correct field; built the choice set and tidied the stem.',
      set: {
        question:
          'Universal Containers has set up Partner users, who will see records owned by partner users in roles below them in the hierarchy. Which three roles make up the partner role hierarchy?',
        optionA: 'Owner, Manager, and User',
        optionB: 'Executive, Manager, and Worker',
        optionC: 'Executive, Manager, and User',
        optionD: 'Administrator, Manager, and User',
        optionE: '',
        correct: 'C',
        explanation:
          'Enabling a partner account creates a three-tier role hierarchy beneath that account — Partner Executive, Partner Manager, and Partner User (C). A partner user sees records owned by partner users at the roles below their own within that account, so an Executive sees Manager- and User-owned records, a Manager sees User-owned records, and a User sees only their own. The other option sets rename or invent tiers that the platform does not create.',
      },
    },
    d603efad: {
      answerMoved: false,
      note: 'Q71 had no options and "Granular Locking" as the correct field; turned the statement into a question and built the choice set.',
      set: {
        question:
          'When you make changes to roles and groups, Salesforce locks the entire group membership table, which makes it impossible to process group changes in multiple threads to increase throughput on updates. Which feature should be enabled to address this?',
        optionA: 'Deferred Sharing Maintenance',
        optionB: 'Granular Locking',
        optionC: 'Parallel Sharing Rule Recalculation',
        optionD: 'Implicit Sharing',
        optionE: '',
        correct: 'B',
        explanation:
          'Granular Locking (B) replaces the single lock over the whole group membership table with locks scoped to the affected membership subsets, so unrelated role and group changes can be processed concurrently instead of serialising behind one another. Deferred Sharing Maintenance (A) postpones recalculation to a maintenance window rather than allowing parallel processing; Parallel Sharing Rule Recalculation (C) speeds up sharing rule recalculation specifically, not group membership updates; and Implicit Sharing (D) is built-in record access between accounts and their child records, not a concurrency control.',
      },
    },
    e53d2012: {
      answerMoved: false,
      note: 'Q136 had no options and "Super user permission" as the correct field; built the choice set.',
      set: {
        optionA: 'Delegated External User Administrator',
        optionB: 'A sharing set granting access through the account',
        optionC: 'View All permission on each object',
        optionD: 'Partner Super User permission',
        optionE: '',
        correct: 'D',
        explanation:
          "The Partner Super User permission (D) is what lets a partner user reach Cases, Leads, Opportunities, and custom object records owned by other users in their own account at the same role or below in the hierarchy. Delegated External User Administrator (A) grants the ability to manage other external users, not to see their records. Sharing sets (B) apply to Customer Community licences that have no role hierarchy, which is precisely the mechanism this question is not describing. View All (C) would expose every record of the object org-wide, far beyond the account-scoped access required.",
      },
    },
    b26eae84: {
      note: 'Q126 options A and D were identical; replaced D with a distinct distractor.',
      set: {
        optionD:
          'While logged in as the System Administrator, review the organization-wide default settings for the Account object under Sharing Settings.',
        correct: 'B',
        explanation:
          'Logging in as an affected staff member and opening the Sharing button on a sample Account (B) lists every user and group with access to that specific record together with the row cause, which names the exact mechanism — role hierarchy, sharing rule, or team — that granted it. The Field Accessibility Viewer (A) reports on field-level security and says nothing about record access. Inspecting the profile and role membership (C) shows what the user is, not why one record reached them. Reviewing organization-wide defaults (D) describes the baseline for all Accounts and cannot explain access to a particular one.',
      },
    },
  },

  'agentforce_specialist_questions.json': {
    '680ae5b4': {
      answerMoved: false,
      note: 'Q31 the explanation rebutted a non-existent "Option D"; the text it argues against is option B. Letter corrected, answer C unchanged.',
      set: {
        explanation:
          'When a prompt template version is immutable, it means that once the version is activated, it cannot be edited or modified. This ensures consistency in production environments where changes could disrupt workflows.\n* Option A is incorrect: Any version (not just the latest) can be activated, depending on the use case.\n* Option B is incorrect: Modifications require manually creating a new version; automatic versioning is not enforced.\n* Option C is correct: Activation locks the version, enforcing immutability.\nReferences:\n* Salesforce Help: Prompt Template Versioning\n* States that "activated prompt template versions are immutable and cannot be edited."',
      },
    },
  },

  'data_cloud_consultant_questions.json': {
    f3b19bee: {
      // Caught by the validator, but a reader had flagged the same thing.
      via: 'comments',
      note: 'Q61 had options B and D identical and C repeating one string twice; deduped, and moved the answer to A, which is what the explanation already argued for.',
      set: {
        optionA: "Cities containing 'San Jose', 'SAN JOSE', 'san jose', or 'San jose'",
        optionB: "Cities only containing 'San Jose' or 'san jose'",
        optionC: "Cities only containing 'San Jose'",
        optionD: "Cities only containing 'San Jose' or 'SAN JOSE'",
        optionE: '',
        correct: 'A',
        explanation:
          "Salesforce documents segmentation queries as honoring exact matching on special characters and accents while not being case-sensitive. So 'Is Equal To' on City matches every casing of the entered value — 'San Jose', 'SAN JOSE', 'san jose', and 'San jose' alike (A) — and the remaining options each admit only a subset of those casings. Two boundaries are worth holding onto: case-insensitive is not a partial match, so 'San Jose, CA' is still excluded; and accents are matched exactly, which is why Salesforce's own example notes that a query for 'Canon City' finds 'canon city' but does not find 'Cañon City'.",
      },
    },
  },
};

let applied = 0;
const missing = [];

for (const [file, fixes] of Object.entries(FIXES)) {
  const path = join(DECKS, file);
  const raw = readFileSync(path, 'utf8');
  const questions = JSON.parse(raw);
  const byId = new Map(questions.map((q, i) => [q.id, { q, number: i + 1 }]));
  let touched = 0;

  for (const [id, fix] of Object.entries(fixes)) {
    const hit = byId.get(id);
    if (!hit) {
      missing.push(`${file}:${id}`);
      continue;
    }
    const before = ORIGINAL_ANSWER[id] ?? hit.q.correct;
    Object.assign(hit.q, fix.set);
    stampCorrection(hit.q, {
      via: fix.via ?? 'validation',
      note: fix.note,
      // `answerMoved: false` means the answer was only *relabelled* — giving an
      // existing answer a letter is not a change of answer, and rendering it as
      // "Granular Locking -> B" tells the reader something untrue.
      from: fix.answerMoved === false ? undefined : before,
    });
    console.log(`${file.replace(/_questions.*|\.json/g, '').padEnd(20)} Q${String(hit.number).padStart(3)}  ${id}`);
    console.log(`  ${fix.note}`);
    touched++;
    applied++;
  }

  if (!DRY && touched > 0) {
    let out = JSON.stringify(questions, null, 2) + '\n';
    if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
    writeFileSync(path, out, 'utf8');
  }
}

if (missing.length) {
  console.error(`\nIds not found: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`\n${DRY ? '[dry run] ' : ''}${applied} questions repaired.`);

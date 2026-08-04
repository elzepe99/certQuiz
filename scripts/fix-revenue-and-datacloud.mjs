/**
 * Corrections to the Revenue Cloud and Data Cloud decks, from questions flagged
 * via in-app comments. Keyed on each question's permanent `id`.
 *
 *   node scripts/fix-revenue-and-datacloud.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stampCorrection } from './lib/corrections.mjs';

const DECKS = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'decks');
const DRY = process.argv.includes('--dry');

/** Answers before this ran; pinned so a second run cannot lose them. */
const ORIGINAL_ANSWER = {
  f6c30064: 'C',
  d0a0a5f3: 'D',
  '0b702723': 'B',
  ff10adbd: 'C,D',
  '6f59e427': 'A',
  f769f864: 'C',
};

const FIXES = {
  'data_cloud_consultant_questions.json': {
    d0a0a5f3: {
      note: 'Q24 D->B. More match rules means more chances to match, which raises the consolidation rate; the old answer had the logic inverted.',
      set: {
        correct: 'B',
        explanation:
          'The consolidation rate measures how far source records collapse into unified profiles, so raising it means matching more aggressively. Match rules within a ruleset are evaluated independently — a record pair unified by any one of them is merged — so adding rules gives records more chances to match and drives the rate up (B). The other options all tighten matching or miss the mechanism: adding attributes to an existing rule (C) piles on criteria that must all be satisfied at once, reducing matches; removing rules (D) removes opportunities to match and lowers the rate further; and reconciliation rules (A) only decide which value wins on an already-unified profile, never whether two records match.',
      },
    },
    '0b702723': {
      note: 'Q33 B->C. Streaming insights cannot be used in segmentation, which the stem explicitly requires.',
      set: {
        correct: 'C',
        explanation:
          'The stem imposes two requirements, and one of them is decisive: the result must be available for segmentation. Streaming insights cannot be used in the segmentation or activation phases of Data Cloud, which rules out option B however well its real-time character otherwise fits a 24-hour window. A calculated insight can aggregate the visit count per candidate and is usable as a segmentation attribute (C), and the resulting segment can then be activated to the recruiting system, satisfying both halves of the requirement. Streaming and batch data transforms (A and D) reshape data without evaluating a threshold condition at all.',
      },
    },
    ff10adbd: {
      note: 'Q78 C,D->A,C. Deletion requests are reprocessed at 30/60/90 days, and they are NOT propagated to connected clouds — you must submit separately.',
      set: {
        correct: 'A,C',
        explanation:
          'Two considerations matter when Consent API is used for right-to-be-forgotten. Deletion requests are reprocessed at 30, 60, and 90 days, so that any data for the individual that arrived after the original request is also removed and full deletion can be verified (A), and requests are submitted against Individual profiles, which is the entity Data Cloud deletes by (C). Option D inverts the actual behaviour and is the trap here: a deletion request submitted to Data Cloud is not propagated outward, and Salesforce is explicit that you must submit deletion requests separately in every connected system and Salesforce cloud. The one-hour processing claim (B) is not the documented commitment.',
      },
    },
  },

  'salesforce-revenue-cloud.json': {
    f6c30064: {
      note: 'Q30 answer C confirmed against the Trailhead attribute-based pricing module; the flag is set per-product under Overridden Inherited Attributes. Explanation rewritten around the documented click path, replacing invented references.',
      set: {
        explanation:
          "Salesforce's own walkthrough sets this flag from the product, not from the classification: open the product, and on its Related tab under Overridden Inherited Attributes open the attribute, then on the Product Attribute Definition page select Is Price Impacting. That is an override of an attribute the product inherited, which is exactly what \"for this product only\" calls for (C). Setting the flag on the classification's attribute (A) would apply it to every product sharing that class, and the attribute definition (B) is global metadata describing the attribute itself — neither can scope pricing relevance to a single product. Once the two attributes are marked, Attribute-Based Adjustment records define the actual price changes per attribute-value combination.",
      },
    },
    '6f59e427': {
      note: 'Q85 A->B. Collaborative redlining runs through the Microsoft 365 Word integration. Also replaced the placeholder explanation, which read "?????? OR B".',
      set: {
        correct: 'B',
        explanation:
          "Salesforce Contracts handles contract authoring and collaborative redlining through an integration with Microsoft 365 — document templates are built with Microsoft 365 Word as the template type, and negotiation happens in Word via the Salesforce Contracts Connector add-in, with changes synchronised back to the contract record. That places Microsoft Azure as the cloud provider Salesforce must integrate with for this capability (B). Google Cloud Platform and Amazon Web Services underpin other parts of the Salesforce estate but are not what CLM redlining depends on.",
      },
    },
    f769f864: {
      note: 'Q91 C->B. Renewal is driven from the Asset record; Product2 has no Auto Renew field.',
      set: {
        correct: 'B',
        explanation:
          "Renewal behaviour in Revenue Cloud lives on the asset that represents the customer's subscription, not on the product definition. Salesforce's Subscription Management guide directs you to update the Asset record before a renewal order can be created and priced, using fields such as RenewalTerm, RenewalTermUnit, and RenewalPricingType — so marking the subscription to renew without user interaction is done on the Asset (B). Product2 carries no Auto Renew field, which is what makes option C wrong however plausible it reads, and the product selling model (A) governs how the product is sold — one-time, recurring, or usage-based — rather than what happens at the end of a term.",
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
    stampCorrection(hit.q, { via: 'comments', note: fix.note, from: before });
    console.log(`Q${String(hit.number).padStart(3)}  ${id}  ${before} -> ${hit.q.correct}`);
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
console.log(`\n${DRY ? '[dry run] ' : ''}${applied} questions corrected.`);

/**
 * Triage candidate documentation URLs before citing them.
 *
 * The trap this guards against: help.salesforce.com is a single-page app that
 * returns HTTP 200 and a byte-identical shell for every article id, real or
 * invented. Fetching such a URL tells you nothing, and a search-result listing is
 * not proof either — a dead Spring '20 release-note link once passed both checks
 * and shipped into a deck.
 *
 * So this script does what it can and is explicit about what it cannot: URLs on
 * SPA hosts are reported NEEDS_BROWSER, meaning open them and read the rendered
 * title. Everything else is checked properly.
 *
 *   node check-urls.mjs urls.txt        # one URL per line, # comments allowed
 *   node check-urls.mjs https://a https://b
 */
import { readFileSync, existsSync } from 'node:fs';

/**
 * Locations that render client-side, so a fetch cannot distinguish live from
 * dead. Some are whole hosts; developer.salesforce.com is mixed — its /docs/atlas.*
 * developer guides are a SPA that answers any book/section id with the generic
 * title "Salesforce Developers", while the rest of the host serves real HTML.
 * Each entry is tested against `${hostname}${pathname}`.
 */
const SPA_LOCATIONS = [
  /^(.*\.)?help\.salesforce\.com\//i,
  /^(.*\.)?trailhead\.salesforce\.com\//i,
  /^(.*\.)?developer\.salesforce\.com\/docs\/atlas\./i,
];

/** Body text that means "not found" even when the status was 200. */
const NOT_FOUND = [
  /we looked high and low but couldn'?t find that page/i,
  /page not found/i,
  /the page you (?:requested|were looking for) (?:was )?(?:could not be found|doesn'?t exist)/i,
  /404 - not found/i,
];

const args = process.argv.slice(2);
if (!args.length) {
  console.error('usage: node check-urls.mjs <urls.txt | url...>');
  process.exit(1);
}

let urls;
if (args.length === 1 && existsSync(args[0])) {
  urls = readFileSync(args[0], 'utf8')
    .split(/\r?\n/)
    // Strip comments, but NOT URL fragments: `#` only starts a comment at the
    // beginning of a line or after whitespace. Without this guard an anchored
    // citation like `…/integration-patterns.html#Remote_Call_In` silently
    // collapses to the base URL and the anchor never gets checked.
    .map((l) => l.replace(/(^|\s)#.*$/, '').trim())
    .filter(Boolean);
} else {
  urls = args.filter((a) => !a.startsWith('--'));
}
urls = [...new Set(urls)];

const isSpa = (u) => {
  try {
    const { hostname, pathname } = new URL(u);
    return SPA_LOCATIONS.some((re) => re.test(`${hostname}${pathname}`));
  } catch {
    return false;
  }
};

async function check(url) {
  if (!/^https:\/\//i.test(url)) return { url, verdict: 'INVALID', detail: 'not an https URL' };
  if (isSpa(url)) {
    return { url, verdict: 'NEEDS_BROWSER', detail: 'client-rendered host — open it and read the title' };
  }
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return { url, verdict: 'DEAD', detail: `HTTP ${res.status}` };

    // A retired doc URL often 200s by REDIRECTING into a SPA that renders its
    // "not found" client-side. Judging the origin host alone passes those. The
    // dead Spring '20 release note behaved exactly this way — it lands on
    // help.salesforce.com and looks healthy to fetch.
    if (res.url && res.url !== url && isSpa(res.url)) {
      return {
        url,
        verdict: 'NEEDS_BROWSER',
        detail: `redirects into a client-rendered host (${new URL(res.url).hostname}) — open it and read the title`,
      };
    }

    const body = await res.text();
    const hit = NOT_FOUND.find((re) => re.test(body));
    if (hit) return { url, verdict: 'DEAD', detail: 'soft 404 — not-found text in a 200 response' };
    if (body.length < 1500) {
      return { url, verdict: 'NEEDS_BROWSER', detail: `thin body (${body.length} bytes) — likely a shell` };
    }

    const title = (body.match(/<title[^>]*>([\s\S]{0,160}?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
    // A bare product name is the shell's own title, not an article's.
    if (/^(salesforce help|salesforce help \| article|salesforce developers|loading)\s*$/i.test(title)) {
      return { url, verdict: 'NEEDS_BROWSER', detail: `generic shell title (${title || 'none'}) — open it` };
    }
    return { url, verdict: 'ALIVE', detail: title || `${body.length} bytes` };
  } catch (e) {
    return { url, verdict: 'DEAD', detail: `${e.name}: ${String(e.message).slice(0, 70)}` };
  }
}

const results = await Promise.all(urls.map(check));
const order = { DEAD: 0, INVALID: 1, NEEDS_BROWSER: 2, ALIVE: 3 };
results.sort((a, b) => order[a.verdict] - order[b.verdict]);

for (const r of results) console.log(`${r.verdict.padEnd(14)} ${r.url}\n${' '.repeat(15)}${r.detail}`);

const tally = results.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] ?? 0) + 1), a), {});
console.log(
  `\n${results.length} URL(s): ` +
    Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(', '),
);
if (tally.NEEDS_BROWSER) {
  console.log('\nNEEDS_BROWSER is not a pass. Open each one and confirm the rendered title matches the article you meant to cite.');
}
process.exit(tally.DEAD || tally.INVALID ? 1 : 0);

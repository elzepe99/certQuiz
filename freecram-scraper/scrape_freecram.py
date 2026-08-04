#!/usr/bin/env python3
"""
Scrape Freecram question pages for a single exam slug and emit JSON matching the user's template.

Usage:
  python scrape_freecram.py --seed-url "https://www.freecram.net/question/..." -o questions.json

If the site returns 403, try:
  pip install playwright && playwright install chromium
  python scrape_freecram.py ... --playwright

Rate limiting is the main thing that goes wrong. Freecram throttles by IP and
answers a throttled request with a short JS interstitial — sometimes as a 429,
sometimes as a 200 carrying that page instead of the question. Both are detected
and treated the same way: wait it out. The throttle is time-based and always
clears on its own, so the fix is patience, never a different client.

Defaults pace requests ~8s apart plus up to ~3s jitter (--delay / --delay-jitter),
which has run 125 questions without a single retry. When throttling does hit, the
run sleeps --cooldown seconds (growing each attempt) rather than dying; urllib3's
own retry budget is spent far too quickly to outlast it.
"""

from __future__ import annotations

import argparse
import json
import random
import re
import sys
import time
from collections.abc import Callable
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Matches "Correct Answer:", "Correct Answers:", or plain "Answer:"
_CORRECT_RE = re.compile(r"^(?:Correct\s+)?Answers?\s*:\s*(.*)$", re.I)

# Matches an option line like "A. text" or "A) text"
_OPTION_RE = re.compile(r"^([A-E])[\.\)]\s*(.*)$")

# Matches the next-option or correct-answer line — used to stop multi-line continuation
_STOP_CONTINUATION_RE = re.compile(
    r"^(?:[A-E][\.\)]\s*|(?:Correct\s+)?Answers?\s*:)", re.I
)


@dataclass(frozen=True)
class QuestionLink:
    num: int
    url: str


def build_requests_session(total_retries: int, backoff_factor: float) -> requests.Session:
    s = requests.Session()
    s.headers.update(DEFAULT_HEADERS)
    retry = Retry(
        total=total_retries,
        connect=total_retries,
        read=total_retries,
        status=total_retries,
        backoff_factor=backoff_factor,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET", "HEAD"),
        raise_on_status=False,
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=10)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    return s


class ThrottledError(Exception):
    """The site is rate-limiting us. Backing off long enough always clears it."""


# Freecram answers a rate-limited request with an interstitial that sets a cookie
# from JS. It can arrive as a 429 *or* as a 200 with this body instead of the
# question, so status alone is not enough to detect it.
_CHALLENGE_MARKERS = ("__ckreal", "navigator.webdriver")


def looks_like_challenge(html: str) -> bool:
    # The interstitial is a few hundred bytes; a real question page is ~60 KB.
    if len(html) > 4000:
        return False
    return any(m in html for m in _CHALLENGE_MARKERS)


def fetch_html_requests(session: requests.Session, url: str, timeout: float) -> str:
    r = session.get(url, timeout=timeout)
    if r.status_code == 429:
        raise ThrottledError(f"429 for {url}")
    r.raise_for_status()
    if looks_like_challenge(r.text):
        raise ThrottledError(f"challenge interstitial for {url}")
    return r.text


def fetch_with_cooldown(
    fetch: Callable[[str], str],
    url: str,
    cooldown_s: float,
    attempts: int,
) -> str:
    """Retry `fetch` through rate limiting, waiting longer after each rebuff.

    urllib3's own retry budget is spent in well under a minute, which is shorter
    than the throttle actually lasts — hence the separate, much slower loop here.
    """
    for attempt in range(1, attempts + 1):
        try:
            return fetch(url)
        except ThrottledError as e:
            if attempt == attempts:
                raise
            wait = cooldown_s * attempt
            print(
                f"  -> throttled ({e}); cooling down {wait:.0f}s "
                f"[attempt {attempt}/{attempts}]",
                file=sys.stderr,
            )
            time.sleep(wait)
    raise AssertionError("unreachable")


class PlaywrightFetcher:
    """Manages a single Chromium browser instance for the whole scraping run."""

    def __init__(self, timeout_ms: int, attempts: int, backoff_s: float) -> None:
        self.timeout_ms = timeout_ms
        self.attempts = attempts
        self.backoff_s = backoff_s
        self._pw_cm = None
        self._pw = None
        self._browser = None

    def __enter__(self) -> "PlaywrightFetcher":
        from playwright.sync_api import sync_playwright

        self._pw_cm = sync_playwright()
        self._pw = self._pw_cm.__enter__()
        self._browser = self._pw.chromium.launch(headless=True)
        return self

    def __exit__(self, *args: object) -> None:
        if self._browser:
            self._browser.close()
        if self._pw_cm:
            self._pw_cm.__exit__(*args)

    def fetch(self, url: str) -> str:
        last_err: Exception | None = None
        for attempt in range(self.attempts):
            page = self._browser.new_page(user_agent=DEFAULT_HEADERS["User-Agent"])
            try:
                page.goto(url, wait_until="load", timeout=self.timeout_ms)
                html = page.content()
                # Same throttle interstitial the requests path guards against;
                # let the caller's cooldown handle it rather than parsing junk.
                if looks_like_challenge(html):
                    raise ThrottledError(f"challenge interstitial for {url}")
                return html
            except ThrottledError:
                raise
            except Exception as e:
                last_err = e
                if attempt + 1 < self.attempts:
                    time.sleep(self.backoff_s * (2**attempt) + random.uniform(0, 0.5))
            finally:
                page.close()
        assert last_err is not None
        raise last_err


def base_url_from_seed(seed_url: str) -> str:
    p = urlparse(seed_url)
    return f"{p.scheme}://{p.netloc}"


def exam_slug_from_seed(seed_url: str) -> str:
    m = re.search(r"/question/([^/]+)/", seed_url)
    if not m:
        raise ValueError(f"Could not parse exam slug from URL: {seed_url}")
    return m.group(1)


def canonical_url(url: str) -> str:
    u = url.strip().split("#")[0].rstrip("/")
    if u.startswith("//"):
        return "https:" + u
    return u


def _link_question_number(text: str) -> int:
    text = text.strip()
    if not text:
        return 0
    # "Question 1:" or "Question 1" (colon optional)
    m = re.search(r"Question\s+(\d+)\s*:?", text, re.I)
    if m:
        return int(m.group(1))
    m = re.match(r"^(\d+)\s*[.:]", text)
    if m:
        return int(m.group(1))
    return 0


def discover_question_links(
    html: str, base_url: str, exam_slug: str, min_links: int
) -> list[QuestionLink]:
    soup = BeautifulSoup(html, "lxml")
    prefix = f"/question/{exam_slug}/"
    seen: dict[int, str] = {}

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        full = canonical_url(urljoin(base_url, href))
        parsed = urlparse(full)
        path = parsed.path
        if not path.startswith(prefix):
            continue
        slug = path[len(prefix):].strip("/")
        if not slug:
            continue
        text = a.get_text(" ", strip=True)
        num = _link_question_number(text)
        if num <= 0:
            continue
        seen.setdefault(num, full)

    if len(seen) < min_links:
        raise RuntimeError(
            f"Only found {len(seen)} indexed links (need at least {min_links}). "
            "Try --playwright if the page is incomplete, or lower --min-links for short exams."
        )

    return [QuestionLink(num=n, url=u) for n, u in sorted(seen.items())]


def strip_noise(text: str) -> str:
    cut_markers = (
        "\nLEAVE A REPLY",
        "\nLeave a Reply",
        "\nleave a reply",
        "\nQuestion List",
        "\nDownload PDF",
        "\nEnter your email",
        "\nRecent Comments",
        "\nrecent comments",
    )
    for marker in cut_markers:
        idx = text.lower().find(marker.lower())
        if idx != -1:
            text = text[:idx]
    return text.strip()


def normalize_correct(raw: str) -> str:
    s = raw.strip()
    s = re.sub(r"\s+", "", s.upper())
    s = s.replace("AND", ",").replace("|", ",")
    letters = re.findall(r"[A-E]", s)
    if not letters:
        return raw.strip()
    return ",".join(dict.fromkeys(letters))


def parse_question_html(html: str, category: str) -> dict | None:
    soup = BeautifulSoup(html, "lxml")
    article = (
        soup.select_one("article")
        or soup.select_one(".entry-content")
        or soup.select_one(".post-content")
        or soup.select_one("#content")
        or soup.body
    )
    if not article:
        return None

    raw_text = article.get_text("\n")
    raw_text = strip_noise(raw_text)

    q_head = re.search(r"Question\s+(\d+)\s*(?:/\s*|of\s+)(\d+)", raw_text, re.I)
    if not q_head:
        return None

    after_head = raw_text[q_head.end():].lstrip("\n")
    lines = [ln.strip() for ln in after_head.splitlines()]
    lines = [ln for ln in lines if ln]

    question_lines: list[str] = []
    opt: dict[str, str] = {}
    phase = "question"
    i = 0
    while i < len(lines):
        ln = lines[i]

        om = _OPTION_RE.match(ln)
        if om:
            phase = "options"
            letter = om.group(1).upper()
            body = om.group(2).strip()
            while i + 1 < len(lines) and not _STOP_CONTINUATION_RE.match(lines[i + 1]):
                nxt = lines[i + 1]
                if re.match(r"^Question\s+\d+", nxt, re.I):
                    break
                body = (body + " " + nxt).strip()
                i += 1
            opt[letter] = body
            i += 1
            continue

        cm = _CORRECT_RE.match(ln)
        if cm and phase == "options":
            correct_raw = cm.group(1).strip()
            j = i + 1
            if not correct_raw and j < len(lines):
                if re.fullmatch(r"[A-E](?:\s*,\s*[A-E])*", lines[j], re.I):
                    correct_raw = lines[j].strip()
                    j += 1
            rest = "\n".join(lines[j:]).strip()
            explanation = strip_noise(rest)
            return {
                "question": " ".join(question_lines).strip(),
                "optionA": opt.get("A", ""),
                "optionB": opt.get("B", ""),
                "optionC": opt.get("C", ""),
                "optionD": opt.get("D", ""),
                "optionE": opt.get("E", ""),
                "correct": normalize_correct(correct_raw),
                "explanation": explanation,
                "_cat": category,
            }

        if phase == "question":
            question_lines.append(ln)
        i += 1

    return None


def suspect_options(row: dict) -> list[str]:
    """Flag rows whose options look mis-split, without guessing at a fix.

    Freecram sometimes runs two options together under a single letter. The tell
    is an explanation that argues about a letter which carries no text of its
    own. Splitting it automatically would risk mangling legitimate options, so
    this only reports — the fix stays a human call.
    """
    warnings: list[str] = []
    letters = "ABCDE"
    present = {ch for ch in letters if row.get(f"option{ch}", "").strip()}

    for letter in (c.strip().upper() for c in row.get("correct", "").split(",")):
        if letter and letter not in present:
            warnings.append(f"correct answer {letter} has no option text")

    explanation = row.get("explanation", "")
    for i, letter in enumerate(letters):
        if letter in present or not re.search(rf"\bOptions?\s+{letter}\b", explanation):
            continue
        culprit = f"; may be merged into {letters[i - 1]}" if i else ""
        warnings.append(f"explanation discusses option {letter} but it is empty{culprit}")

    return warnings


def scrape_all(
    seed_url: str,
    delay_s: float,
    delay_jitter_s: float,
    timeout: float,
    use_playwright: bool,
    limit: int | None,
    category: str,
    total_retries: int,
    backoff_factor: float,
    playwright_attempts: int,
    min_links: int,
    checkpoint_path: str | None = None,
    cooldown_s: float = 120.0,
    cooldown_attempts: int = 5,
) -> list[dict]:
    exam_slug = exam_slug_from_seed(seed_url)
    base_url = base_url_from_seed(seed_url)
    # Always use requests for the seed page (link discovery) — JS rendering often
    # changes the DOM so Playwright doesn't expose the sidebar navigation links.
    session = build_requests_session(total_retries=total_retries, backoff_factor=backoff_factor)

    pw_fetcher: PlaywrightFetcher | None = None

    def fetch_page(url: str) -> str:
        if pw_fetcher is not None:
            return pw_fetcher.fetch(url)
        return fetch_html_requests(session, url, timeout=timeout)

    def fetch_page_patient(url: str) -> str:
        return fetch_with_cooldown(fetch_page, url, cooldown_s, cooldown_attempts)

    seed_canon = canonical_url(seed_url)

    # Discover links via plain requests regardless of --playwright so we reliably
    # get the static sidebar links that Playwright's JS rendering may omit/rewrite.
    seed_html_for_links = fetch_with_cooldown(
        lambda u: fetch_html_requests(session, u, timeout=timeout),
        seed_canon,
        cooldown_s,
        cooldown_attempts,
    )
    links = discover_question_links(seed_html_for_links, base_url, exam_slug, min_links=min_links)
    if not links:
        raise RuntimeError("No question links found; HTML structure may have changed.")

    by_url = {ql.url: ql.num for ql in links}
    ordered_urls = [ql.url for ql in links]
    if limit is not None:
        ordered_urls = ordered_urls[:limit]

    max_num = max(by_url.values())
    missing = set(range(1, max_num + 1)) - set(by_url.values())
    if missing:
        sample = sorted(missing)[:20]
        suffix = "..." if len(missing) > 20 else ""
        print(
            f"Warning: missing question numbers in index: {sample}{suffix}",
            file=sys.stderr,
        )

    # Load checkpoint if resuming
    done_urls: set[str] = set()
    results: list[dict] = []
    if checkpoint_path:
        try:
            with open(checkpoint_path, encoding="utf-8") as f:
                results = json.load(f)
            done_urls = {r["_url"] for r in results if "_url" in r}
            done_urls |= {
                canonical_url(ordered_urls[i])
                for i, r in enumerate(results)
                if "_url" not in r and i < len(ordered_urls)
            }
            print(f"Resuming from checkpoint: {len(results)} already done", file=sys.stderr)
        except (FileNotFoundError, json.JSONDecodeError):
            pass

    if use_playwright:
        pw_fetcher = PlaywrightFetcher(
            timeout_ms=int(timeout * 1000),
            attempts=playwright_attempts,
            backoff_s=backoff_factor,
        ).__enter__()

    try:
        total = len(ordered_urls)
        pending = [u for u in ordered_urls if canonical_url(u) not in done_urls]

        for idx, url in enumerate(pending):
            overall = ordered_urls.index(url) + 1
            print(f"[{overall}/{total}] #{by_url.get(url)} {url}", file=sys.stderr)
            try:
                html = (
                    seed_html_for_links
                    if canonical_url(url) == seed_canon
                    else fetch_page_patient(url)
                )
            except Exception as e:
                # One unreachable question must not throw away the whole run —
                # the row is marked and the checkpoint lets a rerun retry it.
                print(f"  -> fetch failed: {type(e).__name__}: {e}", file=sys.stderr)
                html = None

            parsed = parse_question_html(html, category=category) if html else None
            if not parsed:
                if html:
                    print(f"  -> parse failed", file=sys.stderr)
                parsed = {
                    "question": "",
                    "optionA": "",
                    "optionB": "",
                    "optionC": "",
                    "optionD": "",
                    "optionE": "",
                    "correct": "",
                    "explanation": "",
                    "_cat": category,
                    "_error": "parse_failed" if html else "fetch_failed",
                    "_url": url,
                }
            else:
                parsed["_url"] = url
                for warning in suspect_options(parsed):
                    print(f"  -> warning: {warning}", file=sys.stderr)
            results.append(parsed)

            if checkpoint_path:
                with open(checkpoint_path, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)

            if idx + 1 < len(pending):
                jitter = random.uniform(0, delay_jitter_s) if delay_jitter_s > 0 else 0.0
                time.sleep(delay_s + jitter)

    finally:
        if pw_fetcher is not None:
            pw_fetcher.__exit__(None, None, None)

    return results


def main() -> int:
    ap = argparse.ArgumentParser(description="Scrape Freecram exam questions to JSON.")
    ap.add_argument(
        "--seed-url",
        required=True,
        help="Any question URL for the exam set (must contain /question/<slug>/...)",
    )
    ap.add_argument("-o", "--output", default="questions.json", help="Output JSON path")
    ap.add_argument(
        "--delay",
        type=float,
        default=8.0,
        help="Base delay between requests (seconds); add --delay-jitter to vary",
    )
    ap.add_argument(
        "--delay-jitter",
        type=float,
        default=3.0,
        metavar="SEC",
        help="Extra random delay uniform [0, SEC] after each base delay (default: 3)",
    )
    ap.add_argument("--timeout", type=float, default=60.0, help="Per-request timeout (seconds)")
    ap.add_argument(
        "--retries",
        type=int,
        default=8,
        help="HTTP retries for transient errors (429/5xx); urllib3 honors Retry-After",
    )
    ap.add_argument(
        "--backoff-factor",
        type=float,
        default=1.5,
        help="Exponential backoff factor between HTTP retries (urllib3)",
    )
    ap.add_argument(
        "--playwright-attempts",
        type=int,
        default=3,
        help="Full browser retries when using --playwright",
    )
    ap.add_argument(
        "--min-links",
        type=int,
        default=10,
        help="Minimum sidebar links required to trust discovery (lower for short exams)",
    )
    ap.add_argument(
        "--playwright",
        action="store_true",
        help="Use Playwright Chromium instead of requests (helps with some bot blocks)",
    )
    ap.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only scrape the first N questions (useful for smoke tests)",
    )
    ap.add_argument(
        "--category",
        default="Salesforce Platform App Builder",
        help='Value for the "_cat" field on each row',
    )
    ap.add_argument(
        "--cooldown",
        type=float,
        default=120.0,
        metavar="SEC",
        help="Wait this long after being rate-limited, growing each time (default: 120)",
    )
    ap.add_argument(
        "--cooldown-attempts",
        type=int,
        default=5,
        help="How many cooldowns to sit through before giving up on a page",
    )
    ap.add_argument(
        "--checkpoint",
        default=None,
        metavar="PATH",
        help="Save progress to PATH after each question and resume from it if interrupted",
    )
    args = ap.parse_args()

    checkpoint = args.checkpoint or (args.output + ".checkpoint.json")

    rows = scrape_all(
        seed_url=args.seed_url.strip(),
        delay_s=args.delay,
        delay_jitter_s=max(0.0, args.delay_jitter),
        timeout=args.timeout,
        use_playwright=args.playwright,
        limit=args.limit,
        category=args.category,
        total_retries=max(0, args.retries),
        backoff_factor=max(0.1, args.backoff_factor),
        playwright_attempts=max(1, args.playwright_attempts),
        min_links=max(1, args.min_links),
        checkpoint_path=checkpoint,
        cooldown_s=max(0.0, args.cooldown),
        cooldown_attempts=max(1, args.cooldown_attempts),
    )

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
        f.write("\n")

    ok = sum(1 for r in rows if not r.get("_error"))
    print(f"Wrote {len(rows)} rows to {args.output} ({ok} parsed OK)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# Audit: salesforce_iam_architect_questions_corrected.json
122 questions

---

## Methodology

Checks applied manually using the same logic as `scripts/audit-deck.mjs`:

1. **Contradiction** — explanation keyword-overlap score favours non-key options by ≥ 0.34 margin, with the favoured set scoring ≥ 0.60.
2. **Count mismatch** — "Choose N" wording in stem does not match the number of letters in `correct`.
3. **Key points at missing option** — a letter in `correct` maps to an empty/absent `optionX` field.
4. **Duplicate option text** — two options within the same question share identical normalised text.
5. **Duplicate stems** — two questions share an identical normalised question stem.
6. **Empty explanation** — the `explanation` field is blank or whitespace-only.

---

## Results

### Explanation argues against its own key: 0

No questions cleared the threshold (favoured-floor ≥ 0.60, margin ≥ 0.34).

**Near-miss worth human review — #17  → RESOLVED, and it was a real wrong answer**
```
#17   key=A (at audit time)      stem: Northern Trail Outfitters (NTO) has an off-boarding process…
```
Option A reads "Configure an **authentication provider** to delegate authentication to the LDAP directory." The explanation discusses **Delegated Authentication** (the SOAP-based Salesforce feature), not an Auth Provider (a separate concept). Option D ("Use a login flow to make a callout to the LDAP directory") accumulates explanation keywords (*login, flow, callout, LDAP, user, Salesforce*) at a score of ≈ 0.667 vs A's ≈ 0.333 — margin ≈ 0.334, just under the 0.34 fire threshold. The wording of option A is worth reviewing: the explanation never uses the phrase "authentication provider", which is a distinct Salesforce feature.

**Resolution (2026-08-09):** checked against the documentation, and the near-miss
was a genuine defect rather than a wording quibble. Salesforce documents an
Authentication Provider as SSO with a third party "with OpenID Connect or with a
custom OAuth 2.0 configuration" — LDAP is neither protocol, so an auth provider
that delegates to LDAP is not something you can configure. The feature that has
Salesforce "rely on a Lightweight Directory Access Protocol (LDAP) server to
validate credentials" is Delegated Authentication, configured under Single
Sign-On Settings. **The key moved A → B** (IdP authenticating against LDAP,
federated by SSO, with Login Form authentication disabled), since disabling the
login form is what actually removes the local-password fallback that left the
24-hour window open. See the correction stamp on the question.

This is a good argument for keeping the near-miss band in the report rather than
only what clears the threshold: the check scored it 0.334 against a 0.34 gate and
was right anyway.

---

### Answer count does not match "choose N": 0

All 36 multi-select questions were checked:

| # | Stem excerpt | Want | Got | Key |
|---|---|---|---|---|
| 1 | Which two capabilities does My Domain enable… | 2 | 2 | C,D ✓ |
| 7 | Which two role combinations are represented… | 2 | 2 | C,D ✓ |
| 8 | Which two options should the identity architect recommend… | 2 | 2 | A,C ✓ |
| 12 | Which two security risks can be mitigated by enabling 2FA… | 2 | 2 | B,C ✓ |
| 18 | Which two Salesforce tools should an identity architect recommend… | 2 | 2 | A,B ✓ |
| 20 | Which three OAuth concepts apply to this flow… | 3 | 3 | A,B,D ✓ |
| 22 | Which two actions should the architect recommend… | 2 | 2 | A,B ✓ |
| 24 | Which three steps are required to make this happen… | 3 | 3 | B,D,E ✓ |
| 25 | Which two capabilities of an Identity Provider… | 2 | 2 | B,C ✓ |
| 26 | Which two roles are being performed by Salesforce… | 2 | 2 | A,B ✓ |
| 31 | Which two features should be utilized… | 2 | 2 | A,C ✓ |
| 32 | Which two actions should the architect recommend… (Variant) | 2 | 2 | B,D ✓ |
| 35 | Which three steps should the identity architect use… | 3 | 3 | A,B,C ✓ |
| 40 | Which two options should the identity architect consider… | 2 | 2 | A,B ✓ |
| 47 | Which two licenses are needed… | 2 | 2 | A,C ✓ |
| 50 | Which three steps should an identity architect take… | 3 | 3 | A,B,D ✓ |
| 56 | Which are two recommended practices… | 2 | 2 | B,C ✓ |
| 59 | Which two activities must be performed… | 2 | 2 | C,D ✓ |
| 60 | Which two recommendations should the Salesforce IAM architect make… | 2 | 2 | A,C ✓ |
| 62 | Which two OAuth scopes should UC configure… | 2 | 2 | B,D ✓ |
| 63 | Which two recommendations should an identity architect make… | 2 | 2 | A,D ✓ |
| 64 | Which two reasons are the source of the issue… | 2 | 2 | A,D ✓ |
| 65 | Which two scope values should an architect recommend… | 2 | 2 | A,C ✓ |
| 67 | Which two activities must be performed… (Variant) | 2 | 2 | A,C ✓ |
| 72 | Which three OAuth concepts apply to this flow… (User-Agent) | 3 | 3 | C,D,E ✓ |
| 75 | Which two are valid choices for digital certificates… | 2 | 2 | A,D ✓ |
| 87 | Which two are recommendations to make to UC… | 2 | 2 | A,B ✓ |
| 89 | Which three items should UC take into consideration… | 3 | 3 | A,B,E ✓ |
| 92 | Which two options should be utilized… | 2 | 2 | A,C ✓ |
| 96 | Which two options are correct… | 2 | 2 | A,D ✓ |
| 98 | Which three different attributes can be used to identify… | 3 | 3 | B,D,E ✓ |
| 103 | Which two considerations should the UC architect provide… | 2 | 2 | A,D ✓ |
| 107 | Which two page types are valid login page types… | 2 | 2 | A,B ✓ |
| 108 | Which three steps need to be configured… | 3 | 3 | A,B,C ✓ |
| 117 | What are two key benefits of Customer 360 Identity… | 2 | 2 | A,C ✓ |
| 122 | Which two considerations should an architect point out… | 2 | 2 | A,D ✓ |

---

### Key points at a missing option: 0

All letters in every `correct` field resolve to non-empty option text. Questions #24, #72, #89, and #98 use `optionE` as a valid keyed answer; all four have non-empty `optionE` values confirmed.

---

### Duplicate option text: 0

No question contains two options with identical normalised text.

---

### Duplicate stems: 1

```
   #43 / #78
```

Both questions carry the stem:

> "Universal Containers (UC) has a Customer Community that uses Facebook for authentication. UC would like to ensure that changes in the Facebook profile are reflected on the appropriate Customer Community user. How can this requirement be met? (Variant)"

They are option-shuffled versions of the same question (Q37 is the original). The correct answer letter differs (B vs A) but both point to "updateUser() on the Registration Handler class." While the shuffling is intentional, the normalised stem collision means the deduplication logic treats them as one question — worth deciding whether both should remain in the deck or if one should be removed/retitled.

**Original (Q37, #37)** — stem ends in "...How can this requirement be met?" — distinct, not a duplicate.

---

### Empty explanation: 0

All 122 questions have non-empty explanations.

---

## Summary

```
Explanation argues against its own key:  0
Answer count does not match "choose N":  0
Key points at a missing option:          0
Duplicate option text:                   0
Duplicate stems:                         1  (#43 / #78)
Empty explanation:                       0
─────────────────────────────────────────
1 structural finding.
```

1 structural finding. This is a leads, not a verdict — and a clean run on the other five checks does not mean the answers are correct, only that none contradict themselves.

---

## Follow-up (2026-08-09)

The audit above was applied by hand. Re-running `scripts/audit-deck.mjs` against
the deck reproduces it exactly, including the duplicate stem — so the checks
themselves held up.

Three things were settled afterwards:

- **#17** — the near-miss was a real wrong answer. Key moved A → B; see above.
- **#43 / #78** — benign. Same question with shuffled options, both labelled
  "(Variant)", and both correctly key `updateUser()` on the Registration
  Handler. No action needed unless you want to retire one of the variants.
- **Citations** — the deck reached 122/122 coverage, but **15 of its 41 URLs
  were dead**: `help.salesforce.com` returns HTTP 200 with an identical shell
  for any article id, so nothing short of rendering each one catches it. All 41
  have since been opened in a browser and the dead ones replaced. The dead ids
  and their replacements are recorded under "Known dead" in
  `.claude/skills/factcheck-deck/references/verified-docs.md`.

**Still outstanding:** answer correctness for the other 121 questions has not
been verified against documentation. The structural audit is clean, but as its
own footer says, that is not the same claim.

**Recommended action:** Review question #17's wording ("authentication provider" vs "Delegated Authentication") as a potential terminology ambiguity. For the duplicate stem, decide whether to keep both #43 and #78 or retire one.

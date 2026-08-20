# Slack Consultant deck — pre-pass analysis (no citations; doc access blocked)

37 questions. Read in full 2026-08-18. **No URL in this file has been rendered — do
not cite anything here until it is.** This is a work plan, not findings.

## 1. Only ~13 of 37 questions have a checkable vendor fact

The other 24 are consulting/training judgment items whose three distractors are
strawmen ("Replace their computer's sound card", "read the user manual during the
session", "restrict Slack to headquarters"). No Slack documentation settles them;
the answer is recoverable by elimination alone. A `confirmed` + citation on those
is close to decorative — the citation would be topical, not decisive.

**Checkable group, with the doc question each needs (group by page, 5 lookups):**

| Q | id | Doc question |
|---|---|---|
| 15, 24, 32, 34 | 1d57f94c, 60708c05, cb206cbe, ff8a88a6 | Grid role hierarchy. Does Workspace Admin lack billing access? Is Org Owner the top role, or is Primary Owner? Do Org Admins differ from Org Owners as #15 claims? **One page settles all four.** |
| 1 | 296ced65 | Is "Compliance Exports" current Slack terminology, or legacy? Current surface appears to be Standard/Corporate export + Discovery API. Possible stale-fact (pattern 9). Also: Grid has a native *Legal Holds* feature that the option set never offers. |
| 10 | 10bdf793 | IP allowlisting — real, but which plan tier? Business+ or Grid only? |
| 2, 28 | 535baa2b, 6b1ec162 | What the Slack analytics dashboard actually exposes. Both key a channel-activity metric; confirm those are real dashboard fields and not invented. |
| 7, 8, 26, 36 | d1ec6012, d1458b4b, 6bfcfbed, 79e98f8f | SCIM/AD provisioning; DLP on Slack Connect; app-approval controls; HIPAA plan requirements. |
| 37 | c2a30421 | Grid: are per-workspace setting overrides under a global org policy actually supported? |

## 2. Suspected real defect — #25 (`47e8ec41`), the strongest audit lead

Keys **C: "new channels can be created freely, but require a justification for each."**
Slack has no such setting. Channel-creation *permissions* exist; a mandatory
justification field does not. Meanwhile **D — automatic archiving of inactive
channels — describes something Slack does support.** The stem asks "what *setting*
adjustment", and the key names a thing that is not a setting.

Candidate `corrected` C→D, or `reasoning`/defective. **Needs the channel-management
permissions page to settle.** This is failure pattern 2 (invented capability) wearing
process-advice clothing.

## 3. Deck-level coherence defect: three contradictory answers to one question

Three items ask how to govern channel creation and key three incompatible policies:

- #20 (`989f370e`) → B: a few essential channels, department heads create more
- #12 (`2169924a`) → C: employees propose, admin approves
- #25 (`47e8ec41`) → C: free creation, justification required

A learner meeting all three is taught that each is "the" best practice. At least two
should be `reasoning`-flagged even if each key survives, because the explanations
each assert their option is uniquely correct.

## 4. Duplicate detection missed five pairs — inverted blind spot

`find-duplicates.mjs` reports **zero** pairs here. But these key *identical answer
text* under reworded stems, scoring far below the 0.72 Jaccard gate:

| Pair | Jaccard | Both key |
|---|---:|---|
| #15 / #34 | 0.21 | Org Owner |
| #24 / #32 | 0.32 | Workspace Admin |
| #5 / #17 | 0.13 | channel naming conventions |
| #9 / #16 | 0.23 | hands-on workshop |
| #2 / #28 | 0.21 | active-channel statistics |

This is the **mirror** of the blind spot CLAUDE.md records. The documented one:
near-identical stems, one decisive word apart → labelled SAME, actually DIFFERS
(`681f22f4`/`7d2c8e5f`). This one: reworded stems, identical keyed answer → not
surfaced at all. **Stem-token Jaccard cannot see it; comparing keyed option text
would.** Worth a detector change, not just a deck note.

## 5. Generator signature

Key distribution **B×19 (51%), C×9, A×8, D×1**. Seven of eight Training & Enablement
items are the same "experiential learning" question reskinned, all keying the
hands-on option. Treat a `confirmed` verdict on that cluster as low-information.

## Recommendation

This deck is a poor first target despite being the smallest. Two thirds of it is
unfalsifiable advice, and the honest outcome for those questions is a citation to a
generic Slack best-practices page that does not actually decide the answer — the
shape of citation this repo already got burned by. The checkable third is worth
doing and is only ~5 doc lookups.

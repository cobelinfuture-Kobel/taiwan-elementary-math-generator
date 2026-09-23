# GLM-S07 — Answer Key and Maximum Boundary Stress

## Purpose

Validate the independent answer-key layout and the three maximum approved question-page boundaries after GLM-S06 accepted all 270 question-only HTML/PDF scenarios.

This gate covers every public completed unit with answer pages disabled and enabled. It verifies that adding the answer key does not alter the requested question layout, corrupt numbering, lose answers, introduce blank pages, or exceed HTML/PDF boundaries.

## Entering authority

- GLM-S05 PR #233: merged global exact-layout FullFix.
- GLM-S06 PR #234: merged post-fix HTML/PDF acceptance.
- GLM-S06 workflow run: `29484706478`, success.
- GLM-S06 aggregate artifact: `8369945963`.
- GLM-S06 result: 270 generated, 270 rendered, 270 render PASS, 270 acceptance PASS, 0 failures.
- GLM-S06 PDF evidence: 1,305 nonblank pages, zero render findings.

## Matrix

```text
15 public units
× 3 maximum boundary layouts
× 2 answer states
= 90 scenarios
```

Boundary question layouts:

- `3×5`
- `2×6`
- `1×7`

Answer states:

- `answer-off`: answer items and answer pages must not appear.
- `answer-on`: exactly 18 answer items must appear after the question pages.

Every scenario generates exactly 18 questions through the current public `sourceUnit` runtime.

## Document acceptance

All scenarios must satisfy:

1. Generation succeeds through `buildWorksheetDocumentFromState`.
2. The requested question layout resolves exactly.
3. `layoutMode = exact_approved_matrix`.
4. `layoutExact = true`.
5. `capped = false`.
6. Exactly 18 question models and a continuous 1–18 question-number sequence are present.
7. With answers off:
   - zero answer items;
   - zero answer pages;
   - `printOptions.showAnswerKey = false`.
8. With answers on:
   - exactly 18 answer items;
   - at least one answer page;
   - continuous 1–18 answer-number sequence;
   - question and answer IDs match whenever both complete ID sets are available;
   - resolved answer columns and rows are positive;
   - answer layout readback agrees across `layoutResolution`, `printOptions`, and `configSnapshot`;
   - `printOptions.showAnswerKey = true`.

Question layout and answer layout remain separate authorities. S07 does not require them to use the same columns or rows.

## Render and PDF acceptance

For each current-runtime HTML/PDF pair:

- exactly 18 visible question cards and prompts;
- answer-off: zero visible answer pages, cards, and answer texts;
- answer-on: exactly 18 visible answer cards and answer texts;
- no card, text, or page overflow;
- no inter-card overlap;
- no missing question prompt or answer text;
- no browser console or page error;
- PDF page count equals visible question pages plus visible answer pages;
- every PDF page is nonblank;
- zero PDF text bounding-box overflow.

G5A-U02 must use the current dynamic public runtime. Static S93 worksheet substitution is forbidden.

## Execution

The 90 scenarios are divided into five deterministic shards. Each shard covers three units and 18 scenarios. PDFs remain transient; permanent evidence consists of shard manifests, aggregate JSON, hashes, inspection metrics, and failure screenshots.

## Terminal authority

The gate passes only with:

```text
PASS_ACCEPTED
ALL_90_ANSWER_KEY_BOUNDARY_HTML_PDF_PASS
90 generated
90 rendered
90 render PASS
90 acceptance PASS
0 failures
15 units × 6/6 PASS
3 layouts × 30/30 PASS
2 answer states × 45/45 PASS
1,620 question items
810 answer items
0 render findings
```

## Boundary

S07 is an acceptance task. It does not alter curriculum authority, formulas, answer models, wording, generators, validators, or renderer profiles. Any discovered product defect routes to `GLM-S07_AnswerKeyBoundaryDefectFullFix`; the gate itself must not weaken its checks.

## Next task

```text
GLM-S08_DeployedClassicUIAndD0Closeout
```

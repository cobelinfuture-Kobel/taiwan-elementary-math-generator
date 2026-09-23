# G4B_U04_R3C_QuestionOnlyApprovedLayouts

## Status

`PASS_ACCEPTED_AND_CLOSED`

## Production evidence

- implementation PR: `#223`;
- implementation merge: `ed93b780edb4601e4af40d83373db2b6161d10c6`;
- production runtime is deployed through GitHub Pages;
- final main CI after the R3D audit merge: 1,511 tests / 1,511 pass / 0 fail / clean tree;
- deployed authority: `docs/ci/latest-g4b-u04-r3d-deployed-approved-layouts.json`;
- deployed authority status: `PASS`.

## User-approved contract

Question pages render only:

- question number;
- question text.

Question pages do not render calculation areas, answer lines, `答：`, `所有可能值：`, or any `responsePrompt` output element.

Approved inverse-long question layouts:

| Layout | Capacity | Use |
|---|---:|---|
| 3 columns × 5 rows | 15 questions/page | default safe layout and fallback for denser requests |
| 2 columns × 6 rows | 12 questions/page | explicitly approved wider long-text layout |

Answer pages remain independent and profile-controlled at 1 column × 5 rows.

## Resolver policy

- `auto_safe` inverse-long output resolves to 3×5.
- exact custom request 2×6 is preserved.
- exact custom request 3×5 is preserved.
- untested denser combinations such as 3×6 or 4×10 resolve to 3×5.
- lower-density custom requests preserve the existing capped-layout behavior.

## Production HTML/PDF acceptance

Two actual production 200-question worksheets were generated with answers disabled:

1. requested 4×10 → resolved 3×5 → 14 pages;
2. requested 2×6 → resolved 2×6 → 17 pages.

Both passed:

- 200 unique validated prompts;
- zero response-prompt elements;
- zero answer sections;
- zero DOM overflow;
- zero inter-card overlap;
- exact PDF page count;
- every PDF page nonblank;
- zero PDF text bounding-box overflow.

## Deployed acceptance

The final deployed audit verifies the actual Classic UI, query replay, preview and iframe print path for both approved layouts. It confirms question-only output, zero response prompts, zero answer cards/pages, zero DOM overflow, zero inter-card overlap, zero browser errors, and truthful layout readback.

## Scope boundary

No KnowledgePoint, PatternGroup, PatternSpec, formula, answer model, generator semantics, validator semantics, context mode, or curriculum authority was changed.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U04_R3_APPROVED_TEST_ONLY_LAYOUTS
GOAL_DISTANCE_AFTER  = D0_G4B_U04_R3_QUESTION_ONLY_APPROVED_LAYOUTS_CLOSED
```

# GLM-S08 — Deployed Classic UI and D0 Closeout

## Purpose

Close the global completed-unit layout programme only after the merged runtime is deployed to GitHub Pages and the public Classic interface proves that every completed unit can replay, generate, preview and print the approved layouts without silent capping, fallback or browser defects.

GLM-S06 and GLM-S07 already established local HTML/PDF authority. GLM-S08 verifies the deployed public surface, query state, controls, iframe preview and print target.

## Entering authority

- GLM-S05 PR #233: merged global exact-layout FullFix.
- GLM-S06 PR #234: 270/270 post-fix HTML/PDF acceptance.
- GLM-S07 PR #237: 90/90 answer-key boundary acceptance.
- GLM-S07 merge SHA: `d55c5ae51eea664ab90bf6625b3b4fb53652caa5`.
- GLM-S07 evidence:
  - 1,620 question items;
  - 810 answer items;
  - 332 PDF pages;
  - zero render findings;
  - G4A-U08 validator-domain FullFix validated across 128 seeds and 5,120 questions.

## Deployed matrix

The public Pages harness executes:

```text
270 = 15 public units × 18 approved layouts × answer-off
 45 = 15 public units × 3 boundary layouts × answer-on
315 = total deployed query-replay and generation scenarios
```

Boundary layouts are `3×5`, `2×6` and `1×7`.

Additional deployed checks:

- 90 iframe print invocations: all three boundary layouts with answers off and on for every unit;
- 15 full-page reload hydration checks: `1×7 + answer-on` for every unit;
- 15 source-switch checks;
- dependent row limits: 3 columns → 5 rows, 2 columns → 6 rows, 1 column → 7 rows;
- exact remote/local SHA-256 identity for seven critical deployed assets.

## Asset identity

The deployment is not accepted merely because the URL returns HTTP 200. The workflow checks out the Pages deployment SHA and requires byte-for-byte equality between local and deployed copies of:

1. `index.html`
2. `assets/browser/main.js`
3. `assets/browser/state/query-state.js`
4. `assets/browser/global-public-layout-controls.js`
5. `modules/curriculum/batch-a/global-public-layout-contract.js`
6. `modules/curriculum/batch-a/global-public-layout-overlay.js`
7. `modules/curriculum/batch-a/g4a-u08-generator-validator-domain-fullfix.js`

## Classic UI acceptance

Every scenario must prove:

1. Direct query replay hydrates the expected source, source-unit mode, question count, answer state, columns and rows.
2. The source dropdown contains exactly the 15 contracted public units in the contracted order and with the contracted labels.
3. The row maximum is truthful for the selected column count.
4. Generation succeeds with exactly 18 questions.
5. Preview metadata reports `exact_approved_matrix` and `capped=false`.
6. Preview readback reports requested columns/rows equal resolved columns/rows.
7. Exactly 18 visible question cards and prompts exist.
8. Answer-off scenarios contain zero answer pages/cards/texts.
9. Answer-on scenarios contain exactly 18 answer cards/texts and at least one answer page.
10. Answer layout columns and rows are positive and independent from the question layout.
11. No card, text or page overflow occurs.
12. No inter-card overlap occurs.
13. No prompt or answer text is missing.
14. No console or page error occurs.
15. The Classic print button invokes the current preview iframe, not a stale or external target.
16. Reload-required scenarios preserve query hydration after a full page reload.

## Execution lifecycle

S08 is deliberately two-stage:

1. This PR introduces and locally validates the deployed harness and pending authority.
2. After merge, `Deploy GitHub Pages` publishes the merged main SHA.
3. `GLM-S08 Deployed Classic UI D0 Closeout` runs automatically from the successful Pages workflow.
4. On terminal success, the workflow writes the deployed authority, removes the pending marker and commits both the S08 PASS marker and the global D0 closeout marker to `main`.
5. Bot-authored authority commits do not recursively trigger another deployed audit.

## Terminal authority

The global programme is closed only with:

```text
PASS_ACCEPTED
D0_GLOBAL_COMPLETED_UNITS_18_LAYOUT_MATRIX_CLOSED
315 / 315 query replay PASS
315 / 315 generation PASS
315 / 315 preview PASS
90 / 90 print PASS
15 / 15 reload PASS
15 / 15 source switch PASS
7 / 7 deployed asset identity PASS
0 console errors
0 page errors
0 render findings
```

No generic fallback or free-form AI is permitted.

## Final distance

```text
D0_GLOBAL_COMPLETED_UNITS_18_LAYOUT_MATRIX_CLOSED
```

No further layout task remains after the deployed workflow commits the PASS authorities.

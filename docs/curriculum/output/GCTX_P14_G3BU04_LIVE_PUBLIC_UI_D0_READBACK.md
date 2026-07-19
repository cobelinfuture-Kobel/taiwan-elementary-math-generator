# GCTX-P14 G3B-U04 Live Public UI Production Regression and D0 Closeout

## Current status

```text
LIVE_PUBLIC_UI_PRODUCTION_REGRESSION_PENDING
```

P13 has production-admitted the five Human Review-approved contexts and verified repository-level public HTML/PDF output. P14 closes the remaining distance by testing the deployed GitHub Pages application through the actual Classic UI.

## Live acceptance path

```text
exact deployed runtime assets
→ public query state
→ visible KnowledgePoint / PatternGroup selector
→ Classic UI regenerate button
→ canonical runtime and blocking validator
→ live preview iframe
→ 25 questions + 25 answer entries
→ five approved global contexts
→ D0 closeout
```

## Required live evidence

- deployed P13 pipeline, production registry, Quality V2 and admission modules must byte-match repository files;
- the public query must select G3B-U04, the approved KnowledgePoint and PatternGroup without a hidden mode;
- the validation panel must pass and the print button must be enabled;
- the live preview must contain 25 questions and 25 answer entries over four question pages and four answer pages;
- exactly five target questions and five target answers must cover all five approved contexts;
- console errors, page errors, request failures, internal-ID leakage and legacy target prompt leakage must all be zero;
- page and preview screenshots plus the live iframe HTML must be hash-locked.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_GCTX_G3BU04_PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_VERIFIED
GOAL_DISTANCE_AFTER  = D1_GCTX_G3BU04_LIVE_PUBLIC_UI_REGRESSION_PENDING
DISTANCE_REDUCED     = P14 defines a fail-closed live deployed UI gate; D0 remains unclaimed until that gate passes.
REMAINING_BLOCKERS   = [Pages deployment, live browser regression, E6 promotion, full CI, merge]
NEXT_SHORTEST_STEP   = GCTX-P14_LivePagesBrowserRegressionAndE6Promotion
```

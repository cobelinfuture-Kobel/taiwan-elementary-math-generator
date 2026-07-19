# GCTX-P12S G3B-U04 Pages Human Review Artifact Publication

## Current status

```text
PAGES_PUBLIC_ROUTE_VERIFICATION_GATE_PENDING
```

The Pages staging gate has passed and PR #279 has been merged. This continuation adds a live HTTP gate against the deployed GitHub Pages review route before publication is declared complete.

## Public verification target

```text
Review page = https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/review/g3b-u04/
AFTER PDF   = https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/review/g3b-u04/GCTX_P12R_G3BU04_AFTER.pdf
PDF SHA-256 = 777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0
PDF pages   = 2
Questions   = 5
```

## Live gate

The `GCTX-P12S Public Route Verification` workflow must fetch the production Pages URLs and verify:

- review index HTTP success;
- `noindex,nofollow` and the review-only warning;
- `productionAdmitted=false` and `publicGeneratorChanged=false`;
- exact live PDF SHA-256;
- two PDF pages;
- all five required context phrases;
- at least five answer-key entries;
- zero legacy prompt leakage;
- live diff, artifact manifest and publication manifest consistency.

No deployment-complete claim is allowed before this workflow passes.

## Safety boundary

```text
reviewOnly                = true
publicGeneratorChanged    = false
publicSelectorChanged     = false
productionSelectable      = false
productionAdmitted        = false
mainSiteNavigationChanged = false
robotsIndexingAllowed     = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_GCTX_G3BU04_PAGES_STAGING_VERIFIED
GOAL_DISTANCE_AFTER  = D1_GCTX_G3BU04_PAGES_PUBLIC_ROUTE_VERIFICATION_PENDING
DISTANCE_REDUCED     = the live HTTP and artifact-identity gate is now defined; the accessibility blocker remains until it passes.
REMAINING_BLOCKERS   = [live Pages route verification, final CI and merge, Human Review, production admission]
NEXT_SHORTEST_STEP   = GCTX-P12S_LivePagesRouteVerificationAndCloseout
```

# GCTX-P12S G3B-U04 Pages Human Review Artifact Publication

## Current status

```text
PAGES_REVIEW_PUBLICATION_CONFIGURED_PENDING_CI_AND_DEPLOY
```

This milestone publishes the exact hash-locked P12R AFTER PDF through the existing GitHub Pages `site/` deployment artifact. The PDF is copied into the Pages staging directory during deployment; no second binary authority is committed.

## Publication path

```text
Pages staging directory = site/review/g3b-u04
Public route             = /review/g3b-u04/
Authoritative PDF        = GCTX_P12R_G3BU04_AFTER.pdf
PDF SHA-256              = 777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0
PDF pages                = 2
Question count           = 5
```

## Deployment model

```text
main hash-locked P12R evidence
→ publish-gctx-p12s-pages-review-artifacts.mjs
→ site/review/g3b-u04 staging
→ upload-pages-artifact(path=site)
→ GitHub Pages
```

The review index embeds the exact PDF and generates its five question summaries from the committed before/after evidence.

## Safety boundary

```text
reviewOnly              = true
publicGeneratorChanged  = false
publicSelectorChanged   = false
productionSelectable    = false
productionAdmitted      = false
mainSiteNavigationChanged = false
robotsIndexingAllowed   = false
```

Publishing the review evidence does not admit the five contexts into normal worksheet generation.

## Acceptance gates

- P12R source Claim must remain E4 and Human Review ready.
- Source PDF, diff and artifact manifest SHA-256 values must match the P12R Claim.
- Pages staging copies must match the source bytes.
- Staged PDF must contain two pages, five required contexts and at least five answers.
- Staged PDF must contain no legacy prompt phrases.
- Pages review route and direct PDF route must be verified after deployment.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_GCTX_G3BU04_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED_LOCAL_REPO_REVIEW_ONLY
GOAL_DISTANCE_AFTER  = D1_GCTX_G3BU04_PAGES_REVIEW_PUBLICATION_PENDING_CI_AND_DEPLOY
DISTANCE_REDUCED     = Human Review accessibility blocker is removed after Pages deployment; production distance remains D1.
REMAINING_BLOCKERS   = [focused CI, full CI, merge, Pages deployment, public route verification, Human Review, production admission]
NEXT_SHORTEST_STEP   = GCTX-P12S_PagesDeploymentAndPublicRouteVerification
```

# GOV-S01 Milestone Claim Integrity and Human Review Readiness Gate

## Status

```text
PASS_ACCEPTED_PENDING_MERGE
ACTUAL_EVIDENCE_LEVEL=E3_SHADOW_RUNTIME_INTEGRATED
```

## Result

The repository now requires a machine-readable Claim Manifest for every pull request. A dedicated workflow validates all committed manifests and compares the PR body with the changed manifest.

The gate distinguishes:

```text
E0 planning
E1 data structure
E2 authored content
E3 shadow runtime
E4 production-equivalent HTML/PDF output
E5 production admission
E6 D0
```

Claims above the actual level are blocking.

## Blocking coverage

The validator blocks:

- missing Claim Manifest;
- PR body and manifest mismatch;
- runtime/output claims without runtime integration;
- PDF claims without the production renderer;
- visible-output claims without before/after HTML/PDF evidence;
- production-equivalent review before E4;
- review without exact artifacts and hashes;
- standalone preview used as production evidence;
- next-step prerequisite jumps;
- unsupported goal-distance reductions;
- D0 without the full pipeline.

## P12 permanent regression

The fixture:

```text
tests/fixtures/governance/p12-false-human-review-ready.claim.json
```

reproduces the invalid combination:

```text
actual evidence = E2
runtime integrated = false
renderer/PDF verified = false
visible output changed = false
human review ready = true
```

The governance suite proves this state fails.

## P12 correction

```text
STATUS=CANDIDATE_CONTENT_MERGED_RUNTIME_OUTPUT_NOT_INTEGRATED
ACTUAL_EVIDENCE_LEVEL=E2_CONTENT_AUTHORED
RUNTIME_INTEGRATED=false
PRODUCTION_RENDERER_USED=false
HTML_OUTPUT_VERIFIED=false
PDF_OUTPUT_VERIFIED=false
VISIBLE_OUTPUT_CHANGED=false
HUMAN_REVIEW_READY=false
NEXT_SHORTEST_STEP=GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix
```

The prior Human Review requirement is removed.

## Accepted CI

```text
accepted head SHA              = 9448cd3882901ff7897295b298f7130b6a1012a7
Milestone Claim Integrity run  = 29670191882 — success
Node Test run                  = 29670191868 — success
Math CI Readback run           = 29670191856 — success
```

## Scope boundary

```text
curriculum runtime changed = false
worksheet renderer changed = false
public site changed        = false
public PDF changed         = false
```

GOV-S01 prevents false claims. It does not itself implement the missing GCTX runtime/output integration.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_SYSTEM_PIPELINE_EXISTS_BUT_MILESTONE_CLAIMS_NOT_TRUSTWORTHY
GOAL_DISTANCE_AFTER  = D2_MACHINE_ENFORCED_CLAIM_INTEGRITY_ACCEPTED_PENDING_MERGE
DISTANCE_REDUCED     = false milestone claims and premature Human Review requests are now CI-blocking before merge; product pipeline distance remains D2
REMAINING_BLOCKERS   = [merge, GCTX-P12R runtime-renderer-PDF integration]
NEXT_SHORTEST_STEP   = GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix
```

## Closeout

1. **Distance segment shortened:** governance trustworthiness improved; product evidence distance remains D2.
2. **System node advanced:** repository-wide CI governance.
3. **Blocker removed:** false completion and premature Human Review can no longer pass silently.
4. **New blocker:** none.
5. **Next shortest step:** implement the actual P12 runtime, renderer, HTML, and PDF path.

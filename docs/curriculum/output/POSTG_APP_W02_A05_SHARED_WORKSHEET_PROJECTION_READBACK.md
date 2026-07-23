# POSTG-APP-W02-A05 Readback

## Scope

`POSTG-APP-W02-A05_SharedWorksheetProjectionContractAndW02ShadowProjection`

This milestone establishes shared registry-driven worksheet data contracts and makes W02 the first dynamic shadow consumer. It does not generate HTML, connect the production renderer, expose public UI, or grant production admission.

## Verified materialization

```text
source nodes                         = 13
application capability entries       = 61
application question records         = 61
answer-key records                    = 61
PBL task-set records                  = 31
PBL3_LINEAR records                   = 19
PBL5_BOUNDED_DECISION records         = 12
worksheet projections                 = 13
future-wave fail-closed fixtures      = 1
duplicate projection groups           = 1
production admitted                  = 0
public selectable                    = 0
shadow HTML generated                = 0
```

Classification split:

```text
APPLICATION_REQUIRED   = 31
APPLICATION_COMPATIBLE = 30
```

## Shared authority

```text
data/curriculum/application/registry/application-capability-registry.json
data/curriculum/application/registry/wave-application-admission-registry.json
data/curriculum/application/schema/shared/application-capability-entry.schema.json
data/curriculum/application/schema/shared/application-question-record.schema.json
data/curriculum/application/schema/shared/answer-key-record.schema.json
data/curriculum/application/schema/shared/pbl-task-set-record.schema.json
data/curriculum/application/schema/shared/print-metadata.schema.json
data/curriculum/application/schema/shared/worksheet-projection.schema.json
src/curriculum/application/shared/application-capability-resolver.mjs
src/curriculum/application/shared/worksheet-projection-runtime.mjs
```

## Verified lineage

```text
A02 candidate
→ A03 proof / required-only PBL
→ A04 positive validator fixture
→ Shared capability entry
→ Application question record
→ Answer-key record
→ Source-level worksheet projection
```

All 61 question records pair one-to-one with 61 answer-key records and reference a passing `POSITIVE_SINGLE_APPLICATION` fixture. The duplicate PDF group for `g4a_u06_4a06` and `g4b_u03_4b03` preserves normalized projection parity.

## Architecture boundary

- W01 remains the existing admitted provider.
- W02 is a dynamic shared-shadow provider.
- W03 through W06 are reserved blocked slots.
- W03 is registry-readable but shadow projection is rejected.
- Numeric and application question modes remain separate.
- `APPLICATION_COMPATIBLE` does not receive automatic PBL.
- PBL3 remains a complete single-page candidate.
- PBL5 remains a complete approved two-page candidate.
- No `shadowHtml` field is produced.
- No W02-specific renderer or second worksheet pipeline is created.

## CI evidence

```text
shared schema validation      = PASS
focused runtime tests         = PASS
A05 deterministic validator   = PASS
A04 regression                = PASS
A03 regression                = PASS
M00 controller regression     = PASS
W01 E5 regression             = PASS
governance claims             = PASS
full regression               = PASS
```

## Production boundary

```text
production generator connected = false
production renderer connected  = false
HTML output verified           = false
PDF output verified            = false
public UI changed              = false
production admitted            = false
W01 E5 state changed           = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_MAIN_VERIFIED
GOAL_DISTANCE_AFTER  = D1_SHARED_WORKSHEET_PROJECTION_VERIFIED
DISTANCE_REDUCED     = Validator evidence → shared registry-driven worksheet data projection
REMAINING_BLOCKERS   = [PRODUCTION_GENERATOR_RENDERER_PENDING, HTML_PDF_PENDING, HUMAN_REVIEW_PENDING, PRODUCTION_ADMISSION_PENDING, PUBLIC_UI_PENDING]
NEXT_SHORTEST_STEP   = POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration
```

# POSTG-APP Wave 01 — E4 Production Review and Human Decision V1

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-W01-A05_UnitFlowExactGeneratorRendererAndHumanReviewRemediation
CONTRACT_ID = POSTG_APP_W01_E4_PRODUCTION_REVIEW_AND_HUMAN_DECISION_V1
TARGET_EVIDENCE = E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED
PRODUCTION_ADMISSION_CHANGE = false
```

## Purpose

A05 converts the A04 structural review into a production-equivalent Human Review dossier.

```text
A01 context-bound candidates
+ A02 N+1 / PBL blueprints
+ existing exact production PatternSpec routes
+ existing shared production renderer
→ hidden review cohort
→ HTML/PDF evidence
→ hash-locked Human Review package
```

## Review cohort

The A01 design set and the A05 E4 cohort are distinct:

```text
A01 assessed application-design source set
→ exact production route discovery
→ exact-route-eligible source set
→ E4 Human Review cohort
```

The deterministic E4 cohort must cover:

```text
all Wave 01 sources that currently expose at least one exact production PatternSpec route
all 16 M01 Macro Context Domains
an exact production PatternSpec route for every selected review item
```

Sources that have A01 application candidates but no consumable production PatternSpec remain explicit `EXACT_PRODUCTION_GENERATOR_ROUTE_NOT_AVAILABLE` remediation blockers. They are not dropped silently, are not counted as E4-reviewed, and keep production admission disabled.

The cohort may contain more than one item per exact-route-eligible source when needed for Macro Context coverage.

## Exact generator requirement

Every review item must be generated through the existing Batch A production browser generator and validator path:

```text
KnowledgePoint
→ visible PatternGroup
→ exact PatternSpec generator
→ production validator
→ exact mathematical witness
```

A05 may alter only the visible context wording and application metadata. Final answer, expression, quantities and operation witness must remain unchanged.

A05 must not implement missing unit PatternSpecs, introduce a generic fallback, or relabel a blocked source as exact-route-eligible. Missing production consumers remain follow-up remediation work.

## Unit-flow remediation

For every review item, A05 records:

```text
original A01 unit candidate
exact generator answer unit
semantic inference unit
resolved review unit
resolution status
```

Unresolved units remain `HUMAN_REVIEW_REQUIRED`. They are not silently defaulted and cannot be production admitted.

## Production renderer requirement

The review worksheet must use the existing shared production HTML renderer. Chromium produces the review PDF. `pdftotext` and `pdfinfo` verify the artifact.

## Human Review dossier

The review package includes:

```text
before / application-review prompt pairs
exact PatternGroup and PatternSpec lineage
answer and unit
math-preservation result
unit-flow matrix
PBL driving problem, dependency graph and projection plan
exact-route-blocked source and candidate appendix
review checkboxes
```

The required operator decisions are:

```text
semantic naturalness
quantity-role correctness
unit correctness
N / N+1 depth correctness
PBL authenticity and dependency integrity
APPROVE or REJECT
```

## Evidence boundary

```text
productionEquivalentGeneratorUsed = true
productionRendererUsed = true
htmlOutputVerified = true
pdfOutputVerified = true
visibleOutputChanged = true
humanReviewReady = true
productionAdmitted = false
```

These E4 claims apply only to the exact-route-eligible cohort. They do not claim that exact production generation exists for every A01 design candidate or source.

The review artifact is hidden and non-selectable. Public routes remain unchanged.

## Fail-closed invariants

```text
A02 and A03 must validate
A01 assessed source set must be recorded
exact-route-eligible source coverage must be exact
exact-route-blocked sources must be explicit
Macro Context coverage must equal 16
all selected review items must use exact production generator routes
all mathematical witnesses must be preserved
all visible prompts must change
all surface slots must resolve
forbidden labels must not appear
question and answer-key counts must match
PBL review coverage must be complete for cohort sources
HTML/PDF hashes must be recorded
Human Review must remain pending
production admission must remain zero
```

## Stop rule

After E4 artifacts are generated, verified, committed and merged:

```text
STOP_REASON = HUMAN_REVIEW_REQUIRED
```

No automated task may infer approval.

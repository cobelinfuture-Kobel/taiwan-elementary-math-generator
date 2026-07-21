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
+ existing shared production worksheet plan consumer
+ existing shared production renderer
→ hidden review cohort
→ HTML/PDF evidence
→ hash-locked Human Review package
```

## Review cohort

The cohort is deterministic and must cover:

```text
all application-eligible Wave 01 source units
all 16 M01 Macro Context Domains
at least one exact production PatternSpec route per selected candidate
```

The cohort may contain more than one item per source when needed for Macro Context coverage.

## Exact generator requirement

Every review item must be generated through the existing Batch A production browser plan, generator and validator path:

```text
KnowledgePoint
→ visible PatternGroup
→ shared production worksheet plan consumer
→ exact PatternSpec generator
→ production validator
→ exact mathematical witness
```

A05 may alter only the visible context wording and application metadata. Final answer, expression, quantities and operation witness must remain unchanged.

A05 must not add a generic fallback, substitute a shadow-only generator, or silently remove a source from the eligible set. Any source without an exact production route fails the E4 gate.

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

The review artifact is hidden and non-selectable. Public routes remain unchanged.

## Fail-closed invariants

```text
A02 and A03 must validate
eligible source coverage must be exact
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

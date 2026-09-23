# POSTG-APP Wave 01 — Worksheet Shadow Projection and Production Admission Review V1

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-W01-A04_Golden15WorksheetShadowProjectionAndProductionAdmissionReview
CONTRACT_ID = POSTG_APP_W01_WORKSHEET_SHADOW_PROJECTION_AND_PRODUCTION_ADMISSION_REVIEW_V1
STATUS = SHADOW_PROJECTION_AND_REVIEW_PENDING_CI
PRODUCTION_ADMISSION_CHANGE = false
```

## 1. Purpose

A04 consumes the A03 shared-validator evidence and projects every application-eligible Wave 01 candidate into a structural worksheet shadow.

```text
A03 validated candidate fixtures
→ source-unit worksheet shadow
→ question / answer-key pairing
→ N+1 interpretation projection
→ PBL complete-projection planning
→ production-admission review
```

The review is fail closed. Completing the review does not imply admission.

## 2. Assessment and projection scope

```text
Golden assessment scope = all 15 Wave 01 units
Worksheet projection scope = exact A01 application-eligible source set
Excluded scope = units with no suitable application KnowledgePoint
```

Excluded units receive an explicit `APPLICATION_NOT_APPLICABLE_NO_PROJECTION` readback and no forced story worksheet.

## 3. Shadow worksheet projection

Every eligible source unit receives one structural projection containing all A01 candidates for that unit:

```text
worksheetProjectionId
sourceId
sourceNodeRefs
questionItems
answerKeyItems
nPlusOneEvidenceRefs
pblSections
pagePlan
shadowHtml
projectionStatus = SHADOW_STRUCTURAL_PROJECTION
productionSelectable = false
```

Every projected candidate must have exactly one matching answer-key record.

## 4. Question and answer presentation

Question items use the A01 surface blueprint and the A03 deterministic positive witness. They do not claim production PatternSpec generation.

The shadow presentation must not add layout-heavy labels:

```text
forbidden visible labels = 算式, 答：, _____
```

Answer-key rows contain:

```text
questionId
answerPayload
answerRole
answerUnitCandidate
interpretationStatementCandidate
```

## 5. PBL projection integrity

PBL sections consume A02 task and milestone blueprints.

```text
PBL3_LINEAR
→ APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE

PBL5_BOUNDED_DECISION
→ APPROVED_COMPLETE_TWO_PAGE_CANDIDATE
```

No arbitrary renderer split is allowed. A PBL section must retain the complete driving problem, all tasks, milestones and final synthesis relation.

## 6. Production-admission review

The review matrix checks:

```text
A03 shared runtime PASS
eligible source projection complete
candidate-to-answer-key pairing complete
PBL projection integrity complete
unit-flow resolution complete
exact production PatternSpec generator evidence
production renderer evidence
HTML/PDF evidence
public selection evidence
human visual review evidence
```

A04 is expected to return:

```text
reviewDecision = DEFERRED_PENDING_PRODUCTION_EVIDENCE
productionAdmissionGranted = false
```

because shadow operation-family adapters and structural HTML are not production-equivalent generator or renderer evidence.

## 7. Controller meaning

A04 completes `PRODUCTION_ADMISSION_REVIEWED` as a process gate, with a deferred decision.

```text
admissionGateComplete = true
productionAdmissionGranted = false
state = PRODUCTION_REVIEW_REQUIRED
```

This records that all Wave 01 gate stages have been evaluated while preserving fail-closed production state.

## 8. Fail-closed invariants

```text
A03 must validate
all 15 Golden units remain represented in review scope
runtime-eligible source set equals projected source set
excluded source set receives zero projections
all A01 candidates appear exactly once
all projected questions have exactly one answer key
all A02 PBL candidates appear exactly once
PBL3 uses complete single-page candidate
PBL5 uses approved complete two-page candidate
forbidden visible labels do not appear
production-equivalent generator evidence remains false
production renderer evidence remains false
production admission remains zero
review decision remains deferred while blockers exist
```

## 9. Scope boundary

Allowed:

```text
structural worksheet shadow model
non-public shadow HTML serialization
answer-key pairing
PBL complete-projection planning
production-admission review matrix
controller review-gate advancement
CI tests and readback
```

Forbidden:

```text
public UI selection
production PatternSpec generator replacement
production renderer modification
public HTML/PDF deployment
human approval fabrication
production admission
```

## 10. Acceptance

```text
15-unit review scope complete
eligible projection coverage exact
excluded units remain projection-free
candidate and answer-key coverage exact
PBL projection integrity PASS
shadow HTML structural checks PASS
review matrix complete
reviewDecision = DEFERRED_PENDING_PRODUCTION_EVIDENCE
PRODUCTION_ADMISSION_REVIEWED process gate complete
production admission remains zero
```

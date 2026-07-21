# POSTG-APP Wave 01 — Golden 15 Application Capability Assessment V1

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-W01-A00_Golden15ApplicationCapabilityAssessmentAndAdmissionBaseline
CONTRACT_ID = POSTG_APP_W01_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT_V1
STATUS = DETERMINISTIC_BASELINE_PENDING_CI
PRODUCTION_ADMISSION_CHANGE = false
```

## 1. Purpose

Wave 01 assesses every KnowledgePoint in the 15 golden-conformant units before new application PatternSpecs are authored.

The task answers four separate questions:

```text
1. Is a life/application interpretation required, compatible, or unsuitable?
2. Does an application question already exist?
3. Which application modes may enter the design backlog?
4. Which M01 Atomic Task Episodes are structurally eligible candidates?
```

The assessment is a design-backlog admission. It is not production admission.

## 2. Input authority

```text
M00 Wave 01 = 15 golden units / 16 source nodes
15 KnowledgeOperation registries = 156 KnowledgePoints
M01 context authority = 96 Atomic Task Episodes / 48 facets
Existing Application SOP pilot = non-production G3B-U01 evidence only
```

No KnowledgeOperation file is rewritten by this task.

## 3. Classification

Every KnowledgePoint receives exactly one baseline classification:

```text
APPLICATION_REQUIRED
APPLICATION_COMPATIBLE
APPLICATION_NOT_APPLICABLE
```

Decision order:

```text
A. Existing KnowledgeOperation applicationCapability = REQUIRED
   → APPLICATION_REQUIRED

B. Existing application question binding or existingApplicationQuestionCount > 0
   → APPLICATION_REQUIRED

C. Existing KnowledgeOperation applicationCapability = NOT_APPLICABLE
   → APPLICATION_NOT_APPLICABLE

D. Purely symbolic, enumeration, missing-digit, code, factor-list,
   statement-classification, or structure-only evidence
   → APPLICATION_NOT_APPLICABLE

E. A quantitative operation with explicit quantity roles, a unique answer,
   and at least one compatible M01 operation family
   → APPLICATION_COMPATIBLE
```

The baseline does not force stories onto unsuitable KnowledgePoints.

## 4. Application modes

Allowed backlog modes:

```text
SINGLE_DIRECT
SINGLE_N_PLUS_1
SINGLE_DIAGNOSTIC
PBL_TASK_SET
```

Rules:

```text
APPLICATION_NOT_APPLICABLE
→ no application mode

APPLICATION_REQUIRED / APPLICATION_COMPATIBLE
→ at least SINGLE_DIRECT

semantic decision, remainder meaning, comparison, transfer,
two-step relation, budget, estimation, or answer-meaning evidence
→ SINGLE_N_PLUS_1 candidate

multi-constraint planning, allocation, transport, budget,
distribution, scheduling, or resource decision evidence
→ PBL_TASK_SET candidate
```

A candidate mode does not guarantee that a valid context binding exists. A01 must still bind roles, units, constraints, witness, and Atomic Task Episode.

## 5. Admission baseline

```text
APPLICATION_REQUIRED or APPLICATION_COMPATIBLE
→ ADMITTED_TO_W01_DESIGN_BACKLOG

APPLICATION_NOT_APPLICABLE
→ EXCLUDED_FROM_APPLICATION_AUTHORING
```

All records retain:

```text
sourceId
knowledgePointId
canonicalOperationModelIds
classification
classificationReason
existingApplicationQuestionCount
existingApplicationPresent
applicationModes
applicationDepth
operationFamilyCandidates
eligibleAtomicEpisodeIds
productionAdmissionAllowed = false
```

## 6. Context candidate rule

The assessment may query M01 by broad operation-family compatibility. It may not select a final context.

```text
KnowledgePoint operation evidence
→ operationFamilyCandidates
→ M01 compatible Atomic Task Episodes
→ candidate episode IDs only
```

A01 performs the final semantic binding and must verify:

```text
role binding
unit flow
context affordances
answer witness
misconception compatibility
counterfactual compatibility
N+1 semantic delta
```

## 7. Fail-closed invariants

```text
M00 controller must validate
M01 context authority must validate
15 golden units must be present
156 KnowledgePoints must be assessed exactly once
156 operation-model owners must remain traceable
zero unclassified KnowledgePoints
zero duplicate KnowledgePoint identities
not-applicable records must expose zero application modes
required/compatible records must expose at least one mode
required/compatible records must expose at least one eligible Atomic Task Episode
existing application questions must never be downgraded to not-applicable
production admission count must remain zero
```

## 8. Scope boundary

Allowed:

```text
read-only assessment of 15 KnowledgeOperation registries
deterministic classification policy
application mode candidate assignment
M01 Atomic Task Episode candidate query
Wave 01 design-backlog admission records
controller state advancement
validation CLI and tests
```

Forbidden:

```text
KnowledgeOperation mutation
new application question authoring
final context binding
new PatternSpec authoring
N+1 proof authoring
PBL graph authoring
runtime generation
renderer changes
public UI changes
production admission
```

## 9. Acceptance

```text
15/15 units assessed
156/156 KnowledgePoints classified
zero unclassified
zero production admissions
all existing application questions preserved as APPLICATION_REQUIRED
all suitable records have candidate modes and context episodes
M00 current blocker advances from assessment-not-started
to atomic-context-binding-not-complete
```

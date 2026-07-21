# POSTG-APP Wave 01 — Atomic Context Binding and Single-Application Candidate Pack V1

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-W01-A01_Golden15AtomicContextBindingAndSingleApplicationCandidatePack
CONTRACT_ID = POSTG_APP_W01_ATOMIC_CONTEXT_BINDING_AND_SINGLE_APPLICATION_CANDIDATE_PACK_V1
STATUS = SHADOW_CANDIDATE_PACK_PENDING_CI
PRODUCTION_ADMISSION_CHANGE = false
```

## 1. Purpose

A01 connects the Wave 01 application-fit baseline to the M01 global-context ontology.

For every `APPLICATION_REQUIRED` or `APPLICATION_COMPATIBLE` KnowledgePoint, A01 materializes exactly one deterministic, non-production single-application candidate:

```text
KnowledgePoint
→ Canonical Operation Model
→ Application mode
→ M01 Macro / Meso / Micro / Atomic Episode
→ Surface blueprint
→ mathematical-role / context-role candidate mapping
→ unit-flow candidate
→ answer-meaning candidate
→ validator candidate
```

`APPLICATION_NOT_APPLICABLE` KnowledgePoints receive no binding and no story candidate.

## 2. Large-context diversity requirement

The purpose is not merely to attach a generic school story. Candidate selection is diversity-aware:

```text
eligible Atomic Task Episodes
→ preserve existing admitted pilot lineage when available
→ minimize repeated Macro Context Domain inside the same unit
→ minimize repeated Macro Context Domain across Wave 01
→ maximize semantic keyword affinity
→ deterministic lexical tie-break
```

Acceptance requires:

```text
all 16 M01 Macro Context Domains represented across Wave 01
for each unit with at least 3 suitable KnowledgePoints:
  at least 3 distinct Macro Context Domains represented
```

This creates a broad context supply while preserving mathematical authority.

## 3. Selection policy

### 3.1 Existing pilot lineage

When a suitable KnowledgePoint already has an Application SOP context binding, A01 first maps its legacy `contextFamilyId` through the M01 explicit legacy mapping registry.

```text
existing Application SOP binding
→ legacy context family
→ M01 explicit mapping
→ eligible Atomic Task Episode
```

No automatic hierarchy inference is allowed.

### 3.2 New candidate selection

For KnowledgePoints without an existing pilot binding:

```text
A00 operationFamilyCandidates
∩ M01 compatibleOperationFamilies
∩ application-mode episode profile
→ balanced deterministic selection
```

`SINGLE_DIRECT` prefers `DIRECT_QUANTITY` episodes.
`SINGLE_N_PLUS_1` prefers `CONSTRAINT_DECISION` episodes.
Fallback to another eligible profile is allowed only when the preferred profile has no candidate and must be reported in the candidate record.

## 4. Candidate record

Each suitable KnowledgePoint materializes:

```text
bindingCandidateId
itemCandidateId
sourceId
sourceNodeRefs
knowledgePointId
canonicalOperationModelId
applicationMode
applicationCapabilityLevel
classification
contextSelection:
  macroContextId
  mesoSituationId
  microScenarioId
  atomicEpisodeId
  surfaceTemplateId
  facetRefs
  selectionReason
  preferredProfileSatisfied
roleBindingCandidates
targetRoleCandidate
unitFlowCandidate
promptBlueprint
answerModelCandidate
validationCandidate
admissionStatus = CONTEXT_BOUND_CANDIDATE
productionAdmissionAllowed = false
```

## 5. Mathematical ownership

The global context does not own the equation, number restrictions, answer role, or unit flow.

```text
KnowledgeOperation owns:
  operand roles
  unknown roles
  canonical expressions
  number constraints
  validation invariants

M01 context owns:
  event goal
  actor relationship
  resources
  constraints
  context affordances
  surface blueprint
  facets
```

A01 only creates candidate role alignment. A later validator milestone must finalize units, semantic witnesses, misconceptions, and numeric fixtures.

## 6. Unit-flow candidate

A01 infers obvious units from existing semantic labels. Any unresolved unit is explicitly represented as:

```text
UNBOUND_UNIT_CANDIDATE
```

A candidate may remain shadow-valid with unresolved units, but it cannot progress to production admission until every input and answer unit is resolved and validated.

## 7. Single-application boundary

A01 creates only one primary target and no PBL dependency graph.

```text
primaryTargetCount = 1
PBL milestones = forbidden
PBL dependency graph = forbidden
final product = forbidden
```

KnowledgePoints marked `PBL_TASK_SET` by A00 retain that signal for later PBL authoring, but the A01 candidate itself is `SINGLE_DIRECT` or `SINGLE_N_PLUS_1`.

## 8. Fail-closed invariants

```text
A00 assessment must validate
M00 controller must validate
M01 context authority must validate
all suitable KnowledgePoints receive exactly one candidate
all unsuitable KnowledgePoints receive zero candidates
selected Atomic Episode must belong to A00 eligibleAtomicEpisodeIds
selected surface must belong to selected Atomic Episode
macro / meso / micro / episode parent chain must close
canonical operation model must belong to the KnowledgePoint
all mathematical operand roles must appear in role or target candidates
one and only one target role must exist
all 16 macro domains must be represented globally
minimum three macro domains per eligible unit must be represented
existing pilot legacy lineage must resolve explicitly
production admission count must remain zero
```

## 9. Scope boundary

Allowed:

```text
one deterministic candidate per suitable Wave 01 KnowledgePoint
M01 hierarchy and facet resolution
existing pilot lineage migration to M01 candidates
large-context balancing
role and unit-flow candidate materialization
single-application prompt and answer blueprints
controller gate advancement
validation CLI and tests
```

Forbidden:

```text
KnowledgeOperation mutation
final production context admission
fully instantiated numeric questions
N+1 proof completion
misconception model authoring
PBL dependency graph authoring
shared production generator change
renderer change
public UI change
```

## 10. Acceptance

```text
candidateCount = A00 designBacklogCount
excluded KnowledgePoints produce no candidates
candidate identity is unique
global Macro Context coverage = 16
per-unit diversity gate passes
existing G3B-U01 pilot bindings resolve through M01 mappings
all candidates are CONTEXT_BOUND_CANDIDATE
all candidates are productionAdmissionAllowed = false
controller completes SINGLE_APPLICATION_ADMISSION_COMPLETE
controller completes GLOBAL_CONTEXT_ATOMIC_EPISODE_BINDING_COMPLETE
```

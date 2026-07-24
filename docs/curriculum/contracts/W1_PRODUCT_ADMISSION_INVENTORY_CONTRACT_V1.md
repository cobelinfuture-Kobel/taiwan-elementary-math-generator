# W1 Product Admission Inventory Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01A_W1ProductAdmissionInventoryAndGapMatrix
SOURCE_WAVE = R05-W1
CURRENT_W1_KNOWLEDGE_POINTS = 21
```

## Purpose

P01A identifies the exact product work required to turn the current W1 KnowledgePoints into public worksheet capabilities.

R05-W1 means:

```text
all effective required runtime capabilities are production-admitted
+
KnowledgePoint is outside the protected 15-unit W0 baseline
```

It does not mean the KnowledgePoint already has a public PatternSpec, source adapter, UI option, worksheet acceptance, HTML, PDF, or print evidence.

P01A1 corrected one semantic collision:

```text
kp_g4a_u07_quantity_multiplicative_pattern
```

is a pattern-relation capability, not factor/multiple reasoning. It is therefore in W6 and is excluded from this W1 inventory.

## Required inventory row

Every W1 KnowledgePoint must expose:

```text
knowledgePointId
canonicalNameZh
capabilityStatement
reasoningInvariant
sourceNodeIds
sourceRefs
deliveryWaveId
intraWavePrerequisiteRank
primaryRuntimeProfileId
effectiveRequiredRuntimeCapabilityIds
runtimeEvidencePaths
current public KP / PatternGroup / PatternSpec coverage
productGapState
nextAdmissionActions
productionAdmissionState
```

## Gap-state contract

```text
ADMISSION_READY_EXISTING_PUBLIC_PATTERN
PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED
PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED
```

A row may use `ADMISSION_READY_EXISTING_PUBLIC_PATTERN` only when the existing public registry already contains the KnowledgePoint plus at least one PatternGroup and PatternSpec.

A row uses `PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED` when some public pattern authority exists but the complete binding is missing.

A row uses `PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED` when no current public KnowledgePoint / PatternGroup / PatternSpec path exists. This state still reuses existing shared runtime capabilities; it does not authorize a parallel generator or validator.

## Hard boundaries

```text
direct production admission in P01A = forbidden
new shared capability implementation = forbidden
W2–W8 implementation = forbidden
existing 15-unit modification = forbidden
recursive-improvement admin = forbidden before P10
```

P01A closes only when all 21 current W1 rows are accounted for, all required capability closures are production-admitted, every row has source traceability and a next action, and no row is silently promoted to production.

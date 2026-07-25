# W1 Product Admission Inventory Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01A_W1ProductAdmissionInventoryAndGapMatrix
SOURCE_WAVE = R05-W1
CURRENT_W1_KNOWLEDGE_POINTS = 21
CURRENT_PATTERN_READY_ROWS = 4
CURRENT_VERTICAL_SLICE_GAPS = 17
```

## Purpose

P01A identifies the exact product work required to turn the current W1 KnowledgePoints into public worksheet capabilities and continuously reads the current public selector state.

R05-W1 means:

```text
all effective required runtime capabilities are production-admitted
+
KnowledgePoint is outside the protected 15-unit W0 baseline
```

It does not by itself mean the KnowledgePoint has a public PatternSpec, source adapter, UI option, worksheet acceptance, HTML, PDF, or print evidence. Separate product-admission milestones own that evidence.

P01A1 corrected one semantic collision:

```text
kp_g4a_u07_quantity_multiplicative_pattern
```

is a pattern-relation capability, not factor/multiple reasoning. It is therefore in W6 and is excluded from this W1 inventory.

P01D1 admits four G5B-U05 rows:

```text
kp_g5b_u05a_large_number_place_value_extension
kp_g5b_u05a_large_number_read_write
kp_g5b_u05a_power_of_ten_scaling
kp_g5b_u05a_large_number_decompose_compare
```

Their production evidence belongs to `P01D1_G5BU05LargeNumberVerticalSlice`; P01A only reports their visible product state.

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

A row uses `ADMISSION_READY_EXISTING_PUBLIC_PATTERN` only when the public registry contains the KnowledgePoint plus at least one PatternGroup and PatternSpec. This inventory state does not independently assert E5; the owning admission milestone must provide generator, validator, worksheet, HTML and PDF evidence.

A row uses `PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED` when some public pattern authority exists but the complete binding is missing.

A row uses `PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED` when no current public KnowledgePoint / PatternGroup / PatternSpec path exists. This state still reuses existing shared runtime capabilities; it does not authorize a parallel generator or validator.

## Current accounting

```text
W1 total                             = 21
ADMISSION_READY_EXISTING_PUBLIC_PATTERN = 4
PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED  = 0
PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED  = 17
public selectable W1 sources            = 1
```

## Hard boundaries

```text
direct production admission in P01A = forbidden
new shared capability implementation = forbidden
W2–W8 implementation = forbidden
existing 15-unit modification = forbidden
recursive-improvement admin = forbidden before P10
```

P01A remains valid only when all 21 rows are accounted for, all required capability closures are production-admitted, every row has source traceability and a next action, and production admission is never inferred solely from the inventory classification.

# W1 Product Admission Inventory Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01A_W1ProductAdmissionInventoryAndGapMatrix
SOURCE_WAVE = R05-W1
CURRENT_W1_KNOWLEDGE_POINTS = 21
CURRENT_PATTERN_READY_ROWS = 9
CURRENT_VERTICAL_SLICE_GAPS = 12
```

## Purpose

P01A identifies the exact product work required to turn W1 KnowledgePoints into worksheet capabilities and continuously reads the current full-product selector state.

R05-W1 means all effective required runtime capabilities are production-admitted and the KnowledgePoint is outside protected W0. It does not by itself prove PatternSpec, worksheet, HTML, PDF, or public UI readiness; separate product-admission milestones own those claims.

P01A1 removed `kp_g4a_u07_quantity_multiplicative_pattern` from W1 because it is a pattern-relation capability assigned to W6.

## Admitted product rows

P01D1 owns production evidence for four G5B-U05 rows:

```text
kp_g5b_u05a_large_number_place_value_extension
kp_g5b_u05a_large_number_read_write
kp_g5b_u05a_power_of_ten_scaling
kp_g5b_u05a_large_number_decompose_compare
```

P01D2 owns production evidence for five G6A-U01 rows:

```text
kp_g6a_u01_prime_composite_classification
kp_g6a_u01_prime_factorization
kp_g6a_u01_short_division_common_factors
kp_g6a_u01_greatest_common_factor
kp_g6a_u01_least_common_multiple
```

P01A only reports their current full-product binding state. Public Classic dropdown cutover remains deferred to P01E.

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
current KP / PatternGroup / PatternSpec coverage
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

`ADMISSION_READY_EXISTING_PUBLIC_PATTERN` requires a full-product KnowledgePoint plus PatternGroup and PatternSpec binding. It does not independently assert E5; the owning P01D milestone must provide generator, validator, worksheet, HTML and PDF evidence.

`PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED` means partial pattern authority exists.

`PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED` means no complete KnowledgePoint/PatternGroup/PatternSpec path exists. It does not authorize a parallel generator or validator.

## Current accounting

```text
W1 total                                = 21
ADMISSION_READY_EXISTING_PUBLIC_PATTERN = 9
PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED  = 0
PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED  = 12
full-product W1 source authorities      = 2
protected public source fleet           = 15
```

## Hard boundaries

```text
direct production admission in P01A = forbidden
new shared capability implementation = forbidden
W2–W8 implementation = forbidden
protected 15-unit modification = forbidden
public dropdown cutover = forbidden before P01E
recursive-improvement admin = forbidden before P10
```

P01A remains valid only when all 21 rows are accounted for, all required capability closures are production-admitted, every row has source traceability and a next action, and production admission is never inferred solely from inventory classification.

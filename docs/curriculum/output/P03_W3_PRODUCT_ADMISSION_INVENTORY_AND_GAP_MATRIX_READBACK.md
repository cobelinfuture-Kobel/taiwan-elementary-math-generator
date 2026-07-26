# P03 W3 Product Admission Inventory and Gap Matrix Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03_W3ProductAdmissionInventoryAndGapMatrix
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## Wave authority

```text
wave = R05-W3
name = DECIMAL_FRACTION_NUMBER_DOMAIN
```

The authoritative capability set is:

```text
cap_decimal_number_system
cap_decimal_arithmetic
cap_fraction_number_system
cap_fraction_arithmetic
cap_mixed_number_domain_normalization
cap_decimal_domain_validator
cap_fraction_domain_validator
```

## Inventory model

```text
direct W3 cohort
→ final deliveryWaveId = R05-W3

all W3 dependents
→ effective capability closure intersects the seven W3 capabilities

later-wave dependents
→ require W3 but are assigned after W3 because of prerequisite or additional domain gaps
```

## Inherited W2 state

P03 consumes the P02G successor matrix. Any row that previously depended on W2 must retain:

```text
W2_FOUNDATION_DEPENDENCY_UNBLOCKED
```

P03 does not modify P02 or P02G.

## Product boundary

Every dependent row remains fail closed until its W3 contract capabilities are implemented, validated and admitted. Current Pattern coverage is inventoried separately as:

```text
existing public Pattern after W3 capability
partial Pattern binding after W3 capability
public product vertical slice after W3 capability
```

No row is directly product-admitted by P03.

## Acceptance pending exact-head CI

- seven W3 capabilities match R05 exactly;
- all remain contract-only;
- direct cohort is non-empty and is a subset of all W3 dependents;
- base-wave and prerequisite-escalation states remain visible;
- later-wave dependents remain attached to their actual delivery waves;
- inherited W2 dependencies are unblocked through P02G;
- every row has one explicit product-gap state;
- no W3 capability, PatternSpec, generator, UI or worksheet implementation is started;
- full Node regression passes;
- Chromium skips.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W2_CAPABILITY_PROGRAM_CLOSED_51_DEPENDENTS_UNBLOCKED
GOAL_DISTANCE_AFTER  = D2_W3_PRODUCT_COHORT_AND_CAPABILITY_GAPS_INVENTORIED
DISTANCE_REDUCED     = W3 membership, contract-capability dependencies, inherited W2 state and downstream product gaps are now executable instead of implicit.
REMAINING_BLOCKERS   = [seven W3 contract capabilities unimplemented, exact direct/dependent cohort counts pending CI]
NEXT_SHORTEST_STEP   = P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```

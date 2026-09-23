# W3 Product Admission Inventory and Gap Matrix Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03_W3ProductAdmissionInventoryAndGapMatrix
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## 1. Purpose

P03 inventories the R05-W3 decimal, fraction and mixed-number domain without implementing or promoting its contract-only capabilities. It distinguishes direct W3 delivery, base-W3 rows escalated into later waves, later-wave W3 dependents and protected existing D0 rows.

## 2. Authoritative lineage

```text
R03 prerequisite graph
→ R04 runtime capability matrix
→ R05 delivery-wave assignments and protected D0 state
→ P02G current W2 successor unblock state
→ current public KnowledgePoint / Pattern registry
→ P03 exact W3 inventory and product-gap matrix
```

Legacy batch labels, POSTG application labels and manual file grouping may not determine membership.

## 3. W3 capability scope

```text
cap_decimal_number_system
cap_decimal_arithmetic
cap_fraction_number_system
cap_fraction_arithmetic
cap_mixed_number_domain_normalization
cap_decimal_domain_validator
cap_fraction_domain_validator
```

All seven capabilities remain `contract_only` and unimplemented in P03.

## 4. Exact membership classes

```text
direct W3 cohort
= final deliveryWaveId equals R05-W3
= 82 KnowledgePoints / 17 source nodes

base W3 cohort
= baseDeliveryWaveId equals R05-W3
= 94 KnowledgePoints

base-W3 escalated beyond W3
= base wave W3 and final wave after W3
= 12 KnowledgePoints

all W3 capability dependents
= effective capability closure intersects W3 capabilities
= 119 KnowledgePoints / 28 source nodes / 6 final waves

later-wave dependents
= W3 dependent with final wave after W3
= 33 KnowledgePoints
```

Every direct W3 row is included in the dependent cohort. Base wave and final wave are separate authorities.

## 5. Protected existing D0 rule

Four W0 rows are explicitly protected by R05:

```text
kp_g3a_u01_digit_arrangement_max_min
kp_g4a_u01_boundary_number_difference
kp_g4a_u01_missing_digit_comparison_extreme_digit
kp_g4b_u01_trailing_zero_division_remainder_restore
```

They retain existing production admission. P03 may require W3 compatibility revalidation, but must not de-admit, rebuild or count them as new P03 admissions.

```text
capabilityGateState
= PROTECTED_EXISTING_D0_W3_COMPATIBILITY_REVALIDATION_REQUIRED

productGapState
= PROTECTED_EXISTING_D0_COMPATIBILITY_REVALIDATION_REQUIRED
```

## 6. New-product capability gate

The other 115 rows remain fail closed:

```text
capabilityGateState = W3_CONTRACT_CAPABILITY_BLOCKED
new product admission = false
```

Five rows inherit a W2 dependency; all five must retain the P02G successor state `W2_FOUNDATION_DEPENDENCY_UNBLOCKED`.

## 7. Product-gap partition

```text
protected D0 compatibility revalidation = 4
existing public Pattern after W3        = 0
partial Pattern binding required        = 0
public product vertical slice required  = 115
newly product-admitted by P03            = 0
```

Capability implementation and product admission remain separate.

## 8. Explicit exclusions

```text
W3 capability implementation = excluded
capability promotion          = excluded
protected D0 rebuild          = excluded
FormalMapping / PatternSpec   = excluded
generator / validator runtime = excluded
source adapter / public UI    = excluded
worksheet / renderer          = excluded
P04-P08                       = not started
```

## 9. Next boundary

```text
NEXT_SHORTEST_STEP = P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation
SEPARATE_APPROVAL_REQUIRED = true
```

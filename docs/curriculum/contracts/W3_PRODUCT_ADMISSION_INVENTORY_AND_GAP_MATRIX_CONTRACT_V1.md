# W3 Product Admission Inventory and Gap Matrix Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03_W3ProductAdmissionInventoryAndGapMatrix
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## 1. Purpose

P03 inventories the R05-W3 decimal, fraction and mixed-number domain without implementing or promoting its contract-only capabilities. It distinguishes the direct W3 delivery cohort from every later-wave KnowledgePoint whose effective capability closure still depends on W3.

## 2. Authoritative lineage

```text
R03 prerequisite graph
→ R04 runtime capability matrix
→ R05 delivery-wave assignments and W3 capability plan
→ P02G current W2 successor unblock state
→ current public KnowledgePoint / Pattern registry
→ P03 direct cohort and cross-wave dependency matrix
```

Legacy batch labels, POSTG application labels and manual file grouping may not determine W3 membership.

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

All seven capabilities remain `contract_only` and `not admitted` in P03.

## 4. Membership

```text
direct W3 cohort
= final deliveryWaveId equals R05-W3

W3 capability dependent cohort
= effectiveRequiredRuntimeCapabilityIds intersects the seven W3 capabilities

later-wave dependent
= W3 capability dependent whose final wave is after R05-W3
```

Every direct W3 row must also appear in the dependent cohort. Base wave and prerequisite escalation remain independently visible.

## 5. Capability gate

Every dependent row records:

```text
w3CapabilityIds
missingW3CapabilityIds
capabilityGateState
inheritedW2GateState
```

P03 must fail closed while any required W3 capability remains contract-only. A completed P02G W2 dependency cannot be reintroduced as a blocker.

## 6. Product gap states

```text
EXISTING_PUBLIC_PATTERN_AFTER_W3_CAPABILITY
PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_W3_CAPABILITY
PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_W3_CAPABILITY
```

Capability implementation and product admission are separate. P03 does not directly admit any product row.

## 7. Explicit exclusions

```text
W3 capability implementation = excluded
capability promotion          = excluded
FormalMapping / PatternSpec   = excluded
generator / validator runtime = excluded
source adapter / public UI    = excluded
worksheet / renderer          = excluded
P04-P08                       = not started
```

## 8. Next boundary

```text
NEXT_SHORTEST_STEP = P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation
SEPARATE_APPROVAL_REQUIRED = true
```

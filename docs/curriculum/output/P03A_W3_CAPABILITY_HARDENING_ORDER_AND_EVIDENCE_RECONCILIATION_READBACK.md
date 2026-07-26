# P03A W3 Capability Hardening Order and Evidence Reconciliation Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## Hardening queue

```text
1  cap_fraction_number_system
2  cap_decimal_number_system
3  cap_fraction_domain_validator
4  cap_decimal_domain_validator
5  cap_fraction_arithmetic
6  cap_decimal_arithmetic
7  cap_mixed_number_domain_normalization
```

Implementation tasks:

```text
P03B1_W3FractionNumberSystemConsumerAdmission
P03B2_W3DecimalNumberSystemConsumerAdmission
P03B3_W3FractionDomainValidatorAdmission
P03B4_W3DecimalDomainValidatorAdmission
P03B5_W3FractionArithmeticConsumerAdmission
P03B6_W3DecimalArithmeticConsumerAdmission
P03B7_W3MixedNumberDomainNormalizationAdmission
```

## Evidence reconciliation

```text
capabilities                              = 7
hardening stages                          = 4
canonical dependency edges               = 6
fail-closed hardening-gate edges          = 12
authoritative contract evidence           = 7 / 7
source-dependent cohort evidence          = 7 / 7
complete existing runtime evidence        = 0 / 7
capabilities with partial candidates      = 3
partial candidate relationships           = 9
unique partial candidate paths            = 3
capabilities with product witnesses       = 5
blocking evidence relationships           = 35
production-ready capabilities             = 0
```

## Partial candidate boundary

P02F exact-rational quantity-times-integer artifacts are partial candidates for the fraction number system, fraction arithmetic and mixed-number normalization. They remain insufficient for general W3 capability admission.

## Protected D0 boundary

Protected D0 rows are compatibility witnesses only. They retain existing product admission but cannot satisfy global capability runtime, validator, test or promotion evidence.

## Current capability state

```text
cap_decimal_number_system              = contract_only
cap_decimal_arithmetic                 = contract_only
cap_fraction_number_system             = contract_only
cap_fraction_arithmetic                = contract_only
cap_mixed_number_domain_normalization  = contract_only
cap_decimal_domain_validator           = contract_only
cap_fraction_domain_validator          = contract_only
```

## Product boundary

```text
W3 capability implementation = false
capability promotion          = false
new product admission         = false
protected D0 admission change = false
FormalMapping / PatternSpec   = false
generator / public UI         = false
worksheet / renderer          = false
P04-P08                       = not started
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W3_EXACT_PRODUCT_COHORT_AND_CAPABILITY_GAPS_INVENTORIED
GOAL_DISTANCE_AFTER  = D2_W3_DEPENDENCY_SAFE_HARDENING_QUEUE_AND_EVIDENCE_GAPS_RECONCILED
DISTANCE_REDUCED     = Seven unordered contract-only capabilities are now a single fail-closed implementation queue with explicit evidence reuse and blocking-evidence classifications.
REMAINING_BLOCKERS   = [seven runtime consumers or validators remain unimplemented; thirty-five production-admission evidence relationships remain missing; 115 new-product rows remain blocked]
NEXT_SHORTEST_STEP   = P03B1_W3FractionNumberSystemConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```

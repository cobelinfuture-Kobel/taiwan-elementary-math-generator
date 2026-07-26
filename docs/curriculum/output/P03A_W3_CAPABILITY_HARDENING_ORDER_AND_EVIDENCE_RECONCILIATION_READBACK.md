# P03A W3 Capability Hardening Order and Evidence Reconciliation Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
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

Only the first queue entry is an active implementation entry point. Every later entry remains gated by earlier number-domain, validator or arithmetic admissions.

## Dependency model

R04 canonical dependencies remain unchanged:

```text
cap_fraction_arithmetic
→ cap_fraction_number_system

cap_decimal_arithmetic
→ cap_decimal_number_system

cap_fraction_domain_validator
→ cap_fraction_number_system

cap_decimal_domain_validator
→ cap_decimal_number_system

cap_mixed_number_domain_normalization
→ cap_fraction_number_system
→ cap_decimal_number_system
```

P03A adds stricter fail-closed task sequencing without rewriting R04:

```text
number systems
→ corresponding domain validators
→ corresponding arithmetic consumers
→ mixed-number cross-domain normalization
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

Each capability currently has:

```text
AUTHORITATIVE_CONTRACT    = present
SOURCE_DEPENDENT_COHORT   = present
RUNTIME_CONSUMER          = missing
DETERMINISTIC_VALIDATOR   = missing
FOCUSED_TESTS             = missing
INTEGRATION_TESTS         = missing
PROMOTION_CLAIM           = missing
```

Therefore each capability has five blocking admission-evidence relationships, for a total of thirty-five.

## Partial candidate boundary

P02F exact-rational quantity-times-integer artifacts are partial candidates for:

```text
cap_fraction_number_system
cap_fraction_arithmetic
cap_mixed_number_domain_normalization
```

Candidate paths:

```text
src/curriculum/full-product/p02f-same-unit-quantity-arithmetic-consumer.mjs
tools/curriculum/validate-p02f-same-unit-quantity-arithmetic-consumer.mjs
tests/curriculum/p02f-same-unit-quantity-arithmetic-consumer.test.js
```

They prove a bounded quantity-times-integer component. They do not implement the complete general fraction number system, fraction arithmetic surface or cross-domain mixed-number normalization capability. All nine capability/path relationships remain `PARTIAL_COMPONENT_CANDIDATE` with `productionSufficient=false`.

## Protected D0 boundary

Protected D0 rows are compatibility witnesses only. They retain existing product admission but cannot satisfy global capability runtime, validator, test or promotion evidence.

```text
PRODUCT_COMPATIBILITY_WITNESS_ONLY
≠ GLOBAL_CAPABILITY_PRODUCTION_EVIDENCE
```

Five W3 capabilities have at least one protected-product witness. None becomes production-ready from that evidence.

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

No capability status or promotion registry was changed.

## Exact-head acceptance

```text
full Node regression                    = 2391 / 2391 PASS
milestone claim integrity               = PASS
capability identity                     = 7 / 7 PASS
hardening queue identity                = 7 / 7 PASS
hardening stages                        = 4 / 4 PASS
canonical dependency order             = PASS
hardening gate order                    = PASS
evidence classification                = PASS
P02F partial candidate path sweep       = 9 / 9 PASS
partial candidate production fail close = PASS
protected D0 witness fail close         = PASS
capability status preservation          = 7 / 7 contract_only
blocking evidence relationships         = 35 / 35 PASS
production-ready capabilities           = 0
single implementation entry point       = PASS
Chromium required                       = false
```

## Product boundary

```text
W3 capability implementation = false
capability promotion          = false
new product admission         = false
protected D0 admission change = false
R04 dependency mutation       = false
FormalMapping / PatternSpec   = false
generator / public UI         = false
worksheet / renderer          = false
P04-P08                       = not started
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W3_EXACT_PRODUCT_COHORT_AND_CAPABILITY_GAPS_INVENTORIED
GOAL_DISTANCE_AFTER  = D2_W3_DEPENDENCY_SAFE_HARDENING_QUEUE_AND_EVIDENCE_GAPS_RECONCILED
DISTANCE_REDUCED     = Seven unordered contract-only capabilities are now a single fail-closed implementation queue with explicit evidence reuse, evidence insufficiency classifications and thirty-five machine-validated blocking evidence relationships.
REMAINING_BLOCKERS   = [seven W3 runtime consumers or validators remain unimplemented; thirty-five production-admission evidence relationships remain missing; 115 new-product rows remain blocked; four protected D0 rows require post-admission compatibility revalidation]
NEXT_SHORTEST_STEP   = P03B1_W3FractionNumberSystemConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```

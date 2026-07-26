# W3 Capability Hardening Order and Evidence Reconciliation Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## Purpose

P03A converts the seven W3 `contract_only` capabilities into one dependency-safe implementation queue and an explicit evidence-gap matrix. It does not implement, promote or product-admit any capability.

## Authority lineage

```text
R04 canonical capability definitions and dependencies
→ R05 W3 delivery authority
→ P03 exact 82-direct / 119-dependent product inventory
→ P03A hardening queue and evidence reconciliation
```

R04 dependencies remain immutable. P03A may add stricter task-order gates for fail-closed implementation, but those gates do not rewrite the canonical capability graph.

## Hardening queue

```text
1  cap_fraction_number_system
   → P03B1_W3FractionNumberSystemConsumerAdmission

2  cap_decimal_number_system
   → P03B2_W3DecimalNumberSystemConsumerAdmission

3  cap_fraction_domain_validator
   → P03B3_W3FractionDomainValidatorAdmission

4  cap_decimal_domain_validator
   → P03B4_W3DecimalDomainValidatorAdmission

5  cap_fraction_arithmetic
   → P03B5_W3FractionArithmeticConsumerAdmission

6  cap_decimal_arithmetic
   → P03B6_W3DecimalArithmeticConsumerAdmission

7  cap_mixed_number_domain_normalization
   → P03B7_W3MixedNumberDomainNormalizationAdmission
```

Number systems precede validators. Validators precede arithmetic. Cross-domain normalization is last because it must consume both number domains and their fail-closed validation paths.

## Evidence classes

```text
AUTHORITATIVE_CONTRACT
SOURCE_DEPENDENT_COHORT
PARTIAL_COMPONENT_CANDIDATE
PRODUCT_COMPATIBILITY_WITNESS_ONLY
MISSING_BLOCKING_EVIDENCE
```

Every capability requires this production-admission bundle:

```text
AUTHORITATIVE_CONTRACT
SOURCE_DEPENDENT_COHORT
RUNTIME_CONSUMER
DETERMINISTIC_VALIDATOR
FOCUSED_TESTS
INTEGRATION_TESTS
PROMOTION_CLAIM
```

P03A confirms the first two items for all seven capabilities. The remaining five items are blocking for each capability.

## Partial P02F evidence

The P02F exact-rational quantity-times-integer implementation is reusable only as a partial component candidate for:

```text
cap_fraction_number_system
cap_fraction_arithmetic
cap_mixed_number_domain_normalization
```

It does not provide the complete general fraction number system, general fraction arithmetic surface or cross-domain normalization contract. It cannot satisfy production admission by itself.

## Protected D0 evidence

Four protected D0 rows remain product-admitted compatibility witnesses. Their presence proves existing product behavior only; it does not prove that a global W3 capability is implemented or production-ready.

## Fail-closed rules

```text
partial component candidate → never production sufficient
protected product witness   → never global capability evidence
missing runtime evidence    → capability remains contract_only
missing validator/tests     → capability cannot be promoted
one queue entry             → one separately approved implementation admission
```

## Scope exclusions

```text
R04 dependency mutation       = false
W3 implementation             = false
capability promotion          = false
new product admission         = false
FormalMapping / PatternSpec   = false
generator / public UI         = false
worksheet / renderer          = false
P04-P08                       = not started
```

## Next implementation boundary

```text
NEXT_TASK = P03B1_W3FractionNumberSystemConsumerAdmission
SEPARATE_APPROVAL_REQUIRED = true
```

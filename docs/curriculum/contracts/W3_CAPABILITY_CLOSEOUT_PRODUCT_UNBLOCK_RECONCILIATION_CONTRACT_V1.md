# W3 Capability Closeout and Product-Unblock Reconciliation Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03C_W3CapabilityCloseoutAndProductUnblockReconciliation
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## 1. Purpose

P03C closes the seven W3 successor capability admissions and recomputes the immutable P03 dependency inventory against the final P03B7 promotion registry.

This contract distinguishes two states that must never be conflated:

```text
CAPABILITY_UNBLOCKED
PRODUCT_PRODUCTION_ADMITTED
```

A KnowledgePoint may be capability-unblocked while its product vertical slice remains absent.

## 2. Authoritative inputs

```text
P03  = historical W3 product-admission inventory
P03A = canonical W3 hardening queue
P03B1–P03B7 = E5 capability claims
P03B7 promotion registry = latest successor capability authority
```

P03 and P03A remain immutable historical authorities.

## 3. Required W3 capability set

```text
cap_fraction_number_system
cap_decimal_number_system
cap_fraction_domain_validator
cap_decimal_domain_validator
cap_fraction_arithmetic
cap_decimal_arithmetic
cap_mixed_number_domain_normalization
```

Every capability must have:

```text
E5_PRODUCTION_ADMITTED claim
runtimeIntegrated = true
productionAdmitted = true
effectiveDeliveryStatus = production_admitted
hardening gates satisfied
```

## 4. Downstream reconciliation

For every P03 dependent KnowledgePoint:

```text
required W3 capabilities ⊆ final effective promotions
→ capabilityUnblocked = true
```

Capability unblock removes stale capability-admission actions. It does not create FormalMapping, PatternSpec, generator bindings, UI selection, worksheet output, or product admission.

## 5. Product-state partition

```text
4 protected existing D0 rows
→ preserve current product admission
→ compatibility revalidation pending

115 new-product rows
→ capability dependency unblocked
→ public product vertical slice required
→ productProductionAdmitted = false
```

No new product may be admitted by P03C.

## 6. Protected D0 invariants

The following product admissions must remain preserved:

```text
kp_g3a_u01_digit_arrangement_max_min
kp_g4a_u01_boundary_number_difference
kp_g4a_u01_missing_digit_comparison_extreme_digit
kp_g4b_u01_trailing_zero_division_remainder_restore
```

Their next state is compatibility revalidation, not reimplementation and not de-admission.

## 7. Scope exclusions

P03C must not:

```text
mutate P03 or P03A
change the P03B7 promotion registry
implement FormalMapping or PatternSpec
implement generators or validators for product patterns
change public UI, worksheet, HTML, PDF, or print output
admit any new product
start P04–P08 work
```

## 8. Acceptance

```text
7 / 7 W3 capabilities closed
7 / 7 E5 claims accepted
119 / 119 dependent KnowledgePoints capability-unblocked
0 capability-blocked rows
4 protected D0 admissions preserved
115 new-product rows remain fail closed
28 dependent source nodes reconciled
6 dependent delivery waves reconciled
full Node regression PASS
Chromium not required
```

## 9. Next boundary

```text
NEXT_TASK = P03D_W3ProtectedD0CompatibilityRevalidation
SEPARATE_APPROVAL_REQUIRED = true
```

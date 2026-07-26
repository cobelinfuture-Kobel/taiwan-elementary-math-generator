# W2 Five-Foundation Closeout and Downstream Unblock Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02G_W2FiveFoundationProductionAdmissionCloseoutAndDownstreamUnblockMatrix
EVIDENCE   = E4_RUNTIME_VERIFIED
```

## 1. Purpose

P02G closes the W2 shared-foundation program after P02B-P02F production admission and recomputes the immutable P02 dependency inventory into a current downstream unblock matrix.

P02G does not rewrite P02 historical rows. P02 remains the record of the state before capability admission; P02G is the successor authority for the current capability-gate state.

## 2. Authoritative lineage

```text
P02 historical 51-row dependency inventory
→ P02B Global KnowledgePoint authority
→ P02C quantity dimension / unit identity
→ P02D prerequisite readiness
→ P02E quantity semantic-role binding
→ P02F same-unit quantity arithmetic
→ final five-capability promotion registry
→ P02G downstream capability-unblock matrix
```

Every P02B-P02F milestone claim must be `E5_PRODUCTION_ADMITTED`, runtime integrated and production admitted.

## 3. Five foundations

```text
cap_kp_authority_lookup
cap_prerequisite_readiness
cap_quantity_dimension_unit_identity
cap_quantity_semantic_role_binding
cap_same_unit_quantity_arithmetic
```

Authority lookup and prerequisite readiness remain mandatory systemic foundations even though the historical matrix assigns zero direct KnowledgePoint rows to them.

## 4. Row unblock rule

A dependent KnowledgePoint row is capability-unblocked only when every W2 foundation capability listed by its P02 effective dependency set appears in the final validated promotion registry.

```text
missingW2CapabilityIds = []
capabilityGateState     = W2_FOUNDATION_DEPENDENCY_UNBLOCKED
```

The historical P02 field remains unchanged:

```text
historicalCapabilityBlocked = true
```

This before/after pairing is required evidence, not a contradiction.

## 5. Product boundary

Capability unblock is not product admission.

```text
3 rows  → existing public Pattern binding; product acceptance still required
0 rows  → partial PatternGroup / PatternSpec binding
48 rows → delivery-wave public product vertical slice still required
0 rows  → directly product-admitted by P02G
```

P02G may remove stale capability-hardening actions from successor next actions. It may not create FormalMapping, PatternSpec, generator, source adapter, UI selection, worksheet, answer key, HTML or PDF artifacts.

## 6. Downstream states

```text
ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY
→ CAPABILITY_UNBLOCKED_EXISTING_PUBLIC_PATTERN_ACCEPTANCE_PENDING

PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY
→ CAPABILITY_UNBLOCKED_PATTERN_BINDING_REQUIRED

PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_CAPABILITY
→ CAPABILITY_UNBLOCKED_PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED
```

## 7. Required closeout counts

```text
foundations production admitted = 5 / 5
remaining shadow foundations    = 0
E5 foundation claims            = 5 / 5
dependent KnowledgePoints       = 51
capability-unblocked rows        = 51
capability-blocked rows          = 0
dependent source nodes           = 20
dependent delivery waves        = 5
direct W2 product cohort         = 0
direct product admissions       = 0
```

Wave distribution remains:

```text
R05-W0 = 3
R05-W4 = 41
R05-W5 = 1
R05-W7 = 5
R05-W8 = 1
```

## 8. Explicit exclusions

```text
P02 historical mutation        = excluded
new capability promotion       = excluded
PatternSpec implementation     = excluded
generator implementation       = excluded
public source adapter          = excluded
public UI implementation       = excluded
worksheet / renderer change    = excluded
P03-P08 implementation         = excluded
existing 19-source modification = excluded
```

## 9. Next boundary

P02G closes W2 capability work only. Entering the next product-wave task requires separate approval.

```text
NEXT_TASK = P03_W3ProductAdmissionInventoryAndGapMatrix
```

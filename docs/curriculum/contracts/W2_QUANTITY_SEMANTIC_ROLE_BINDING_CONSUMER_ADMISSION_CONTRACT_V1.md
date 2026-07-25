# W2 Quantity Semantic Role Binding Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02E_W2QuantitySemanticRoleBindingConsumerAdmission
CAPABILITY = cap_quantity_semantic_role_binding
```

## 1. Authority lineage

```text
P02 26-KP effective dependency cohort
→ P02B Global KnowledgePoint authority
→ P02C quantity dimension / unit identity
→ P02E role-family classification
→ read-only semantic-role binding
→ fail-closed validator
→ successor capability promotion registry
```

P02E does not copy KnowledgePoint content and does not create a parallel relation-model authority. P02B remains the KnowledgePoint identity authority; P02C remains the quantity-dimension and unit-family authority.

## 2. Binding contract

Every effective dependent KnowledgePoint must materialize exactly one binding containing:

- one `relationFamilyId`;
- one or more known quantity roles;
- one target role or a source-declared target marker;
- one linked P02C quantity identity;
- its canonical source-node bindings;
- explicit prohibition of story generation, numerical computation and quantity arithmetic.

Supported closed families include equal groups, partitive and quotative division, multiplicative comparison, fraction of quantity, additive change, quantity comparison, time interval, average speed and speed-distance-time. Cross-context KnowledgePoints may use a source-declared family only when the contract retains a closed target-role allow-list.

## 3. Fail-closed behavior

The consumer blocks:

- missing or unknown KnowledgePoint identity;
- a Global KnowledgePoint outside the 26-KP semantic-role cohort;
- missing P02C quantity identity;
- invalid primary runtime profile;
- unclassified or ambiguous role binding;
- source / KnowledgePoint mismatch;
- relation-family mismatch;
- target-role mismatch;
- dimension or unit assertions rejected by P02C.

## 4. Scope exclusions

```text
story template generation   = forbidden
numeric computation         = forbidden
same-unit arithmetic        = forbidden
unit conversion             = forbidden
PatternSpec implementation  = forbidden
generator implementation    = forbidden
worksheet implementation    = forbidden
renderer / public UI change = forbidden
P03-P08 implementation      = forbidden
```

## 5. Promotion rule

`cap_quantity_semantic_role_binding` may become `production_admitted` only after all 26 effective dependent KnowledgePoints are classified exactly once, all source/KP bindings round-trip, P02C assertions remain fail closed, predecessor promotions remain effective and the full Node regression passes.

## 6. Next boundary

```text
NEXT_TASK = P02F_W2SameUnitQuantityArithmeticConsumerAdmission
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```

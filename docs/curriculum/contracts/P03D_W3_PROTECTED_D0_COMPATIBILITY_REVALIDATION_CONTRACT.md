# P03D W3 Protected D0 Compatibility Revalidation Contract

## 1. Identity

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03D_W3ProtectedD0CompatibilityRevalidation
EVIDENCE   = E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED
```

## 2. Purpose

P03C removed all W3 capability blockers but deliberately left four existing D0 product rows in a compatibility-revalidation state. P03D proves that those four rows still work through the current public product path after the W3 successor capabilities became authoritative.

This is a compatibility task. It does not create new products, new PatternSpecs, new generators, new UI controls or new worksheet renderer behavior.

## 3. Protected cohort

```text
kp_g3a_u01_digit_arrangement_max_min
kp_g4a_u01_boundary_number_difference
kp_g4a_u01_missing_digit_comparison_extreme_digit
kp_g4b_u01_trailing_zero_division_remainder_restore
```

Expected source units:

```text
g3a_u01_3a01
g4a_u01_4a01
g4b_u01_4b01
```

## 4. Authoritative lineage

```text
P03 Historical Product Inventory
+ P03A Hardening Queue
+ P03B1–P03B7 Successor Capability Admissions
→ P03C Capability Closeout and Product-Unblock Matrix
→ Public Selector
→ R07 Global Primary Consumer Cutover
→ Shared Generator and Validator
→ Worksheet Document
→ Production HTML Renderer
→ Chromium A4 PDF and Live UI Print Smoke
→ P03D Compatibility Revalidation
```

P03, P03A, P03B1–P03B7 and P03C remain read-only authorities.

## 5. Required per-pattern compatibility witness

Every visible PatternGroup attached to each protected KnowledgePoint must produce one independent witness containing:

```text
public source selectable
public KnowledgePoint visible
public PatternGroup and PatternSpec identity present
R07 authorityMode = GLOBAL_PRIMARY
legacyAuthorityRole = COMPATIBILITY_ALIAS_READ_ONLY
requested KnowledgePoint identity preserved
requested PatternGroup identity preserved
shared worksheet generation succeeds
validator returns no errors
generated question count > 0
answer key count > 0
production HTML contains worksheet markup
A4 print-layout data present
Chromium PDF starts with %PDF-
Chromium PDF size > 5000 bytes
page overflow finding count = 0
```

## 6. Product-admission semantics

The four products were already admitted before P03D. Therefore:

```text
historical productProductionAdmitted = true
P03D productProductionAdmitted       = true
newlyProductAdmittedByP03D           = false
```

Successful revalidation changes only the successor compatibility state:

```text
PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING
→ PROTECTED_D0_COMPATIBILITY_REVALIDATED_ADMISSION_PRESERVED
```

It does not recreate or duplicate product admission.

## 7. New-product fail-close boundary

The other 115 P03C rows remain outside this task:

```text
PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED
productProductionAdmitted = false
```

P03D must report:

```text
new product admissions = 0
unaffected new-product rows = 115
```

## 8. Chromium acceptance

The implementation PR branch must trigger a dedicated Playwright run:

```text
tools/curriculum/render-p03d-protected-d0-compatibility.mjs
```

The run generates one HTML and one PDF for every compatibility witness, checks A4 page overflow, and performs live UI preview/print smoke for all three protected source units. Generated files are retained as GitHub Actions artifacts and are not committed to the repository.

## 9. Forbidden changes

```text
historical P03 inventory mutation
P03C reconciliation mutation
W3 capability promotion mutation
protected product content change
new product admission
FormalMapping implementation
PatternSpec implementation
generator behavior change
public UI feature change
worksheet renderer behavior change
visible output change
P04–P08 implementation
```

## 10. Acceptance

```text
4 / 4 protected KnowledgePoints revalidated
3 / 3 protected source units selectable
all visible PatternGroups witnessed
all visible PatternSpecs retained
all generator and validator witnesses pass
all answer-key witnesses pass
all HTML witnesses pass
all R07 Global Primary witnesses pass
all Chromium PDF witnesses pass
zero page-overflow findings
4 existing admissions preserved
0 new product admissions
115 new-product rows unchanged
full Node regression PASS
milestone claim integrity PASS
```

## 11. Next boundary

After P03D, the shortest remaining W3 path is to freeze the direct-W3 product vertical-slice queue. That implementation requires separate approval:

```text
P03E_W3DirectProductVerticalSliceQueueFreeze
```

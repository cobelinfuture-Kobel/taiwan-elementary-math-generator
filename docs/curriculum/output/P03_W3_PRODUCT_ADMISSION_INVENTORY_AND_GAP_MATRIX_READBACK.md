# P03 W3 Product Admission Inventory and Gap Matrix Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03_W3ProductAdmissionInventoryAndGapMatrix
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## Wave authority

```text
wave = R05-W3
name = DECIMAL_FRACTION_NUMBER_DOMAIN
```

Authoritative capabilities:

```text
cap_decimal_number_system
cap_decimal_arithmetic
cap_fraction_number_system
cap_fraction_arithmetic
cap_mixed_number_domain_normalization
cap_decimal_domain_validator
cap_fraction_domain_validator
```

All seven remain `contract_only`; P03 implements none of them.

## Exact inventory

```text
contract capabilities                 = 7
capabilities with dependents          = 7
capabilities without dependents       = 0

direct W3 KnowledgePoints             = 82
direct W3 source nodes                = 17
base-W3 KnowledgePoints               = 94
base-W3 escalated beyond W3           = 12

all W3-capability dependents          = 119
protected existing D0 dependents      = 4
new-product dependents                = 115
later-wave dependents                 = 33
dependent source nodes                = 28
dependent final waves                 = 6
```

## Direct W3 source distribution

```text
g3a_u08_3a08   = 4
g3b_u07_3b07   = 8
g3b_u09_3b09   = 6
g4a_u06_4a06   = 5
g4a_u09_4a09   = 7
g4b_u03_4b03   = 5
g4b_u06_4b06   = 6
g4b_u08_4b08   = 7
g5a_u01_5a01   = 8
g5a_u04_5a04   = 6
g5a_u06_5a06   = 5
g5b_u04_5b04   = 5
g5b_u05_5b05a  = 1
g5b_u06_5b06   = 5
g6a_u02_6a02   = 1
g6a_u04_6a04   = 5
g6b_u01_6b01   = 3
```

## Capability dependency matrix

| Capability | All dependents | Direct W3 | Protected D0 |
|---|---:|---:|---:|
| `cap_fraction_number_system` | 73 | 40 | 1 |
| `cap_fraction_domain_validator` | 52 | 40 | 1 |
| `cap_decimal_domain_validator` | 51 | 45 | 3 |
| `cap_decimal_number_system` | 51 | 45 | 3 |
| `cap_fraction_arithmetic` | 28 | 18 | 1 |
| `cap_decimal_arithmetic` | 25 | 24 | 0 |
| `cap_mixed_number_domain_normalization` | 5 | 3 | 0 |

A KnowledgePoint may depend on more than one capability, so capability counts do not sum to the 119-row cohort.

## Protected existing D0 rows

R05 protects four rows already present in the public product:

```text
kp_g3a_u01_digit_arrangement_max_min
kp_g4a_u01_boundary_number_difference
kp_g4a_u01_missing_digit_comparison_extreme_digit
kp_g4b_u01_trailing_zero_division_remainder_restore
```

They remain product-admitted. P03 only records:

```text
PROTECTED_EXISTING_D0_W3_COMPATIBILITY_REVALIDATION_REQUIRED
```

They are not counted among the 115 new-product blockers and are not newly admitted by P03.

## W2 successor inheritance

```text
rows with inherited W2 dependencies = 5
W2 dependencies unblocked           = 5 / 5
```

P03 consumes P02G and does not reopen W2 foundation work.

## Product-gap partition

```text
protected D0 compatibility revalidation = 4
existing public Pattern after W3        = 0
partial Pattern binding required        = 0
public product vertical slices required = 115
newly admitted by P03                    = 0
```

## Final-wave matrix

| Final wave | Dependents | Sources | Direct W3 | Protected D0 | Base-W3 escalated | Vertical slices |
|---|---:|---:|---:|---:|---:|---:|
| R05-W0 | 4 | 3 | 0 | 4 | 0 | 0 |
| R05-W3 | 82 | 17 | 82 | 0 | 0 | 82 |
| R05-W4 | 11 | 3 | 0 | 0 | 11 | 11 |
| R05-W6 | 1 | 1 | 0 | 0 | 1 | 1 |
| R05-W7 | 18 | 6 | 0 | 0 | 0 | 18 |
| R05-W8 | 3 | 3 | 0 | 0 | 0 | 3 |

The twelve base-W3 escalations are eleven W4 rows and one W6 row. W7 and W8 dependencies have later base capability gaps rather than being direct W3 product rows.

## Exact-head acceptance

```text
full Node regression                     = 2385 / 2385 PASS
milestone claim integrity                = PASS
W3 capability identity                   = 7 / 7 PASS
capabilities with dependent rows         = 7 / 7 PASS
direct W3 cohort                         = 82 / 82 PASS
direct W3 source nodes                   = 17 / 17 PASS
base-W3 cohort                           = 94 / 94 PASS
base-W3 escalation sweep                 = 12 / 12 PASS
all W3 capability dependents             = 119 / 119 PASS
protected existing D0 preservation       = 4 / 4 PASS
new-product fail-closed sweep            = 115 / 115 PASS
later-wave dependent classification      = 33 / 33 PASS
inherited P02G W2 unblock sweep          = 5 / 5 PASS
dependent source summaries               = 28 / 28 PASS
dependent wave summaries                 = 6 / 6 PASS
new product admissions                   = 0
Chromium required                        = false
```

The first pass exposed the protected-D0 distinction and the difference between non-direct dependents and true later-wave dependents. The corrected semantic matrix passed exact-head CI; final metadata is included in the clean-head candidate.

## Product boundary

```text
W3 capability implementation = false
capability promotion          = false
protected D0 rebuild          = false
new product admission         = false
FormalMapping / PatternSpec   = false
generator / public UI         = false
worksheet / renderer          = false
existing 19-source product    = preserved
P04-P08                       = not started
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W2_CAPABILITY_PROGRAM_CLOSED_51_DEPENDENTS_UNBLOCKED
GOAL_DISTANCE_AFTER  = D2_W3_EXACT_PRODUCT_COHORT_AND_CAPABILITY_GAPS_INVENTORIED
DISTANCE_REDUCED     = Seven W3 contract capabilities, 82 direct W3 rows, 119 total dependents, four protected D0 compatibility rows and 115 new-product blockers are now explicit and machine-validated.
REMAINING_BLOCKERS   = [seven W3 contract capabilities remain unimplemented; 115 new-product rows remain blocked; four protected D0 rows require post-admission compatibility revalidation]
NEXT_SHORTEST_STEP   = P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```

# S76M — G4A-U08 Numeric Canonical Gap Closure Design Scan

```text
TASK = S76M_G4A_U08_NumericCanonicalGapClosureDesignScan
MODE = planning-only
STATUS = PASS_DESIGN_FROZEN_PENDING_IMPLEMENTATION_APPROVAL
SOURCE_ID = g4a_u08_4a08
```

## 1. Purpose

S76L proved that the stable G4A-U08 runtime can generate correct worksheets, but it also proved that full-source D0 remains blocked. The unresolved denominator is not a test-count problem. It is an ontology closure problem:

```text
11 numeric KnowledgePoints lack canonical PatternSpec and validator closure
12 canonical PatternGroups lack PatternSpec / validator / mutation closure
24 canonical PatternGroups are not publicly worksheet-reachable
```

S76M converts that quantified gap into an exact implementation design. No runtime, generator, validator, selector, worksheet, renderer, public route, historical marker, or D0 lifecycle is changed.

## 2. Evidence inspected

The design is constrained by:

- S76A source-authority freeze;
- S76B validator ontology standard and D0 thresholds;
- S76C KEEP / ADAPT / ADD boundaries;
- S76D 15-KP / 28-PatternGroup registry;
- S76E existing application reclassification;
- S76L full-source D0 blocked readback;
- the ten current numeric PatternSpecs;
- all 39 shape variants emitted by the current numeric generator.

The grade boundary remains integer-only Grade 4. No distributive-law objective, average, inverse average, unknown-operator inference, decimal answer, or fraction answer is introduced.

## 3. Why “10 legacy specs → 11 numeric KPs” is not solved by adding one arbitrary spec

S76L recorded a cardinality floor of one new or split numeric PatternSpec. That floor is necessary but not sufficient.

The ten existing PatternSpecs combine several distinct reasoning roles:

- one add/sub family contains left association, signed-term movement, useful regrouping, and repeated-subtraction evidence;
- one mul/div family contains left association, safe factor/reciprocal reordering, and repeated-division evidence;
- parentheses families contain both general parentheses-first behavior and special equivalence forms;
- no existing family contains two parenthetical groups with the full `+ - × ÷` operator set.

A fidelity-safe closure therefore requires:

```text
10 primary preserve-ID reclassifications
+ 5 supplemental reuse/split PatternSpecs
+ 1 new bounded compound-parentheses PatternSpec
= 16 numeric canonical PatternSpecs
```

Only the final compound-parentheses spec requires a new expression family. The other five supplemental specs reuse existing generator shapes with deterministic filters or derived equivalence evidence.

## 4. Primary preserve-ID reclassification

Each existing numeric PatternSpec remains executable and keeps its public ID. It receives one primary canonical destination.

| Existing PatternSpec | Primary canonical PatternGroup | Decision |
|---|---|---|
| `ps_g4a_u08_parentheses_add_sub` | `pg_g4a_u08_num_parentheses_first` | preserve ID; validate first operation inside the add/sub group |
| `ps_g4a_u08_parentheses_mul_div` | `pg_g4a_u08_num_parentheses_first` | preserve ID; validate first operation inside the mul/div group |
| `ps_g4a_u08_mul_before_add_sub` | `pg_g4a_u08_num_mul_div_before_add_sub` | preserve ID |
| `ps_g4a_u08_div_before_add_sub` | `pg_g4a_u08_num_mul_div_before_add_sub` | preserve ID |
| `ps_g4a_u08_add_sub_left_to_right` | `pg_g4a_u08_num_add_sub_left_assoc` | preserve ID |
| `ps_g4a_u08_mul_div_left_to_right` | `pg_g4a_u08_num_mul_div_left_assoc` | preserve ID |
| `ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses` | `pg_g4a_u08_num_mul_div_before_add_sub` | preserve ID |
| `ps_g4a_u08_mixed_with_parentheses` | `pg_g4a_u08_num_parentheses_change_precedence` | preserve ID; nonredundant AST change required |
| `ps_g4a_u08_large_add_sub_overlay_no_parentheses` | `pg_g4a_u08_num_mul_div_before_add_sub` | preserve ID; large values remain PatternSpec constraints, not a KP |
| `ps_g4a_u08_large_add_sub_overlay_with_parentheses` | `pg_g4a_u08_num_parentheses_change_precedence` | preserve ID; large values remain PatternSpec constraints |

These ten rows cover five of the eleven numeric PatternGroups.

## 5. Six supplemental numeric PatternSpecs

### 5.1 Useful grouping and rounding

```text
PatternSpec = ps_g4a_u08_num_add_group_round
PatternGroup = pg_g4a_u08_num_add_group_round
strategy = constrained reuse
```

Reuse the first two `add_sub_left_to_right` shape variants. Operand resampling must guarantee that at least one same-sign pair forms a multiple of 10 or 100. The adapter derives:

- signed-term vector;
- useful grouping term indexes;
- equivalent reordered expression;
- equivalence rule ID.

No new visible expression grammar is required.

### 5.2 Signed-term movement

```text
PatternSpec = ps_g4a_u08_num_signed_term_move
PatternGroup = pg_g4a_u08_num_signed_term_move
strategy = shape split + derived equivalence
```

Reuse all three add/sub left-to-right variants. The moved expression must retain every operand-sign pair. A movement that changes `-b` into `+b` is blocking.

### 5.3 Repeated subtraction grouping

```text
PatternSpec = ps_g4a_u08_num_repeated_subtract_group
PatternGroup = pg_g4a_u08_num_repeated_subtract_group
strategy = cross-family equivalence pair
```

Bind:

```text
a - b - c
↔
a - (b + c)
```

The source variants are:

- `add_sub_ltr_two_subtractions`;
- `parentheses_add_sub_middle_subtract_sum`.

`a-(b-c)` is an explicit blocking counterexample.

### 5.4 Safe mul/div reordering

```text
PatternSpec = ps_g4a_u08_num_mul_div_safe_reorder
PatternGroup = pg_g4a_u08_num_mul_div_safe_reorder
strategy = shape split + rational equivalence
```

Reuse:

- `mul_div_ltr_divide_then_multiply`;
- `mul_div_ltr_multiply_then_divide`.

The canonical item carries a factor/reciprocal vector and a safe permutation. Divisors must retain reciprocal meaning.

### 5.5 Repeated division grouping

```text
PatternSpec = ps_g4a_u08_num_repeated_divide_group
PatternGroup = pg_g4a_u08_num_repeated_divide_group
strategy = cross-family equivalence pair
```

Bind:

```text
a ÷ b ÷ c
↔
a ÷ (b × c)
```

The source variants are:

- `mul_div_ltr_two_divisions`;
- `parentheses_mul_div_divide_by_product`.

`a÷(b÷c)` and zero divisors are blocking.

### 5.6 Compound parentheses

```text
PatternSpec = ps_g4a_u08_num_compound_parentheses
PatternGroup = pg_g4a_u08_num_compound_parentheses
strategy = one new bounded family
shape = (a+b)×c-d÷(e-f)
```

Required constraints:

- at least two parenthetical groups;
- all four operators represented;
- AST depth no greater than 4;
- exact integer division;
- every intermediate value in `0..9999`;
- no decimal or fraction result.

This is the only new numeric expression family approved by the design.

## 6. Numeric validator design

Each of the eleven numeric PatternGroups receives one fidelity contract with deterministic semantic mutations.

| PatternGroup | Required evidence | Minimum blocking mutations |
|---|---|---|
| add-group-round | signed terms, useful pair, equivalent reorder | sign loss; non-useful grouping; non-equivalence |
| signed-term-move | signed terms, permutation, equivalent reorder | sign binding change; term dropped; term duplicated |
| add/sub left association | left AST, trace | right regrouping; precedence-changing parentheses |
| parentheses first | parenthesis groups, first grouped trace node | outside operation first; group removed |
| repeated subtraction | grouped and ungrouped pair | subtract difference; sign flip |
| safe mul/div reorder | factor/reciprocal vector, safe permutation | divisor as multiplier; zero divisor; non-equivalence |
| mul/div left association | left AST, trace | divide-by-product reinterpretation; right regrouping |
| repeated division | divisor product, equivalence rule | divide by quotient; zero divisor; divisor omitted |
| mul/div before add/sub | AST, trace, high-precedence nodes | global left-to-right; additive node first |
| parentheses change precedence | parenthesized and unparenthesized AST fingerprints | redundant parentheses falsely accepted; equal AST |
| compound parentheses | AST, groups, trace, intermediates | fewer than two groups; incomplete operator set; depth overflow; non-integer division |

A changed final answer alone is not accepted as semantic mutation coverage.

## 7. Missing `app_cost_overlay` closure

S76M also defines the remaining nonnumeric PatternGroup required by S76L:

```text
KnowledgePoint = kp_g4a_u08_app_mul_div_before_add_sub
PatternGroup = pg_g4a_u08_app_cost_overlay
PatternSpec = ps_g4a_u08_app_cost_overlay
Template = tpl_app_cost_component_plus_minus_overlay
```

Allowed equation shapes:

```text
unitCost × quantity + overlayAmount
unitCost × quantity - overlayAmount
```

This is not a payment-balance problem. The unknown is adjusted cost, not change from a payment. Existing money scenarios and unit infrastructure may be reused, but a new bounded template branch is required.

## 8. Expected closure counts

After the bounded implementation sequence completes:

```text
KnowledgePoints                     = 15
PatternGroups                       = 28
existing canonical PatternSpecs     = 16
numeric canonical PatternSpecs      = 16
app-cost-overlay PatternSpecs       = 1
total canonical PatternSpecs        = 33
validator-covered PatternGroups     = 28
mutation-covered PatternGroups      = 28
publicly reachable PatternGroups    = 28 after routing milestone
```

The existing 26 legacy executable PatternSpecs remain valid compatibility/runtime assets. They are not used as a substitute for canonical coverage metrics.

## 9. Bounded implementation sequence

```text
S76N NumericCanonicalPatternSpecAndSamplerBindingImplementation
→ S76O NumericCanonicalAdapterValidatorAndMutationClosure
→ S76P AppCostOverlayClosure
→ S76Q AllCanonicalGroupsPublicRoutingAndWorksheetReachability
→ S76R FullSourceStressHTMLPDFAndD0Reevaluation
```

### S76N

Implement only:

- ten preserve-ID primary mappings;
- five hidden supplemental reuse/split specs;
- one hidden compound-parentheses family.

No selector, resolver, worksheet, renderer, or production activation.

### S76O

Implement numeric canonical GeneratedItem metadata plus validators and mutations for all eleven numeric PatternGroups. Keep all new routes hidden.

### S76P

Implement the single `app_cost_overlay` PatternSpec, generator branch, adapter, validator, and mutation suite. Keep it hidden.

### S76Q

Promote the 24 currently unreachable canonical PatternGroups while preserving:

- the four existing Phase2B public routes;
- all coarse legacy application aliases;
- existing URLs and worksheet behavior;
- current renderer behavior.

### S76R

Recompute all S76B metrics and run full semantic, mutation, selector, worksheet, HTML/PDF, and regression stress. D0 may be declared only if every threshold passes.

## 10. Prohibited scope

S76M authorizes no implementation. It does not permit:

- runtime changes;
- generator or validator writes;
- public selector or resolver changes;
- worksheet or renderer changes;
- historical marker rewrites;
- D0 declaration;
- other Batch A unit migration;
- Grade 5 objective import;
- decimal or fraction capability;
- broad generator rewrite.

## 11. Acceptance result

```text
legacy numeric PatternSpecs accounted for = 10/10
legacy shape variants accounted for        = 39/39
numeric KnowledgePoints covered by plan    = 11/11
numeric PatternGroups covered by plan      = 11/11
primary mappings                            = 10
supplemental numeric PatternSpecs           = 6
new numeric expression families             = 1
app_cost_overlay closure defined            = true
runtime changed                              = false
D0 declared                                 = false
```

## 12. Closeout

```text
GOAL_DISTANCE_BEFORE = D1_G4A_U08_D0_GATE_QUANTIFIED_NUMERIC_CANONICAL_GAP
GOAL_DISTANCE_AFTER  = D2_G4A_U08_NUMERIC_AND_COST_OVERLAY_CLOSURE_DESIGN_FROZEN
DISTANCE_REDUCED     = Replaced the cardinality-only minimum with an exact 10-primary-plus-6-supplemental numeric mapping, one bounded new expression family, one app_cost_overlay closure contract, and a five-milestone path to full canonical reachability.
REMAINING_BLOCKERS   = [S76N-S76R implementation approval, 11 numeric canonical closures, app_cost_overlay closure, 24 public canonical routes]
NEXT_SHORTEST_STEP   = S76N_G4A_U08_NumericCanonicalPatternSpecAndSamplerBindingImplementation

STOP_REASON          = IMPLEMENTATION_APPROVAL_GATE
BLOCKER_TYPE         = POLICY_GATE
LAST_COMPLETED_STATUS = PASS_DESIGN_FROZEN_PENDING_IMPLEMENTATION_APPROVAL
REQUIRED_OPERATOR_ACTION = Approve the bounded S76N-S76R implementation sequence, beginning with hidden numeric PatternSpec and sampler binding only.
NEXT_RESUME_TASK     = S76N_G4A_U08_NumericCanonicalPatternSpecAndSamplerBindingImplementation
```

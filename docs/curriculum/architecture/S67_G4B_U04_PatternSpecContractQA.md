# S67 — G4B-U04 PatternSpec Contract QA

```text
TASK = S67_G4B_U04_PatternSpecContractQA
STATUS = PASS_WITH_CORRECTIONS_PENDING_CI
SOURCE_ID = g4b_u04_4b04
```

## 1. Scope

S67 reviews the S66 design contract before any FormalMapping, PatternGroup or PatternSpec materialization.

```text
S66 PatternSpec contract
→ schema and identity QA
→ answer-model closure QA
→ controlled-template semantic-role QA
→ inverse-mask grammar QA
→ validator-code coverage QA
→ mutation rejection
```

S67 does not materialize data, implement generator or validator runtime, expose a selector, enable canonical routing, or authorize production use.

## 2. QA result

```text
PatternSpec contracts reviewed = 17
accepted after overlay          = 17
rejected                        = 0
PatternGroups reviewed          = 12
answer-model schemas reviewed   = 9
controlled templates reviewed   = 9
validator stages reviewed       = 8
blocking codes reviewed         = 44
blocking corrections            = 5
mutation requirements           = 28
```

The final identity counts remain unchanged. S67 adds a higher-precedence effective overlay rather than rewriting the large S66 design artifact.

```text
base contract = data/curriculum/contracts/S66_G4B_U04_PatternSpecContractDesign.json
effective QA overlay = data/curriculum/contracts/S67_G4B_U04_PatternSpecContractQA.json
```

S68 and later consumers must load S66 first and apply the S67 overlay.

## 3. Blocking findings and corrections

### 3.1 Closed answer schemas

S66 defined nine answer-model shapes, but did not explicitly close them against undeclared fields. The `methodComparisonAnswer.outputs` object also lacked an explicit property schema.

S67 locks:

```text
all 9 schemas: additionalProperties = false
```

The method-comparison output object must contain exactly:

```text
unconditionalDown: integer 0..999,999,999
unconditionalUp:   integer 0..999,999,999
roundHalfUp:       integer 0..999,999,999
```

For `numericAnswer`, `unitLabel` is a nonempty required field whenever the PatternSpec has:

```text
promptContract.answerUnitRequired = true
```

### 3.2 Exact semantic role bindings

S66 required placeholder parity but did not identify whether each placeholder came from a PatternSpec input, a derived label, or controlled context metadata.

S67 adds an exact `roleBindings` map to all nine templates. Examples:

```text
total      → input.total
groupSize  → input.groupSize
capacity   → input.capacityOrIncrement
increment  → input.capacityOrIncrement
target     → input.total
price      → input.price
denomination → input.denomination
```

Every template now requires:

```text
placeholder set = requiredRoles set = roleBindings key set
```

Unmapped placeholders and unused bindings are forbidden.

### 3.3 Round-then-operate inputs must be visible

The original S66 controlled prompts for addition, subtraction, multiplication and division displayed only pre-rounded values. That would test arithmetic on already rounded numbers, not the mapped KnowledgePoint of taking an approximate value and then operating.

The effective prompts must expose:

```text
original value or operands
rounding method label
rounding target-place label
operation factor/divisor when applicable
```

The following derived-only placeholder roles are forbidden in these prompts:

```text
roundedA
roundedB
largerRounded
smallerRounded
roundedValue
```

Corrected multiplication example:

```text
每期費用是 {value} 元，用{methodLabel}取概數到{targetPlaceLabel}後，
估算 {factor} 期的總費用約是多少元？
```

Corrected division example:

```text
總費用是 {value} 元，用{methodLabel}取概數到{targetPlaceLabel}後，
由 {divisor} 人平均分攤，每人約付多少元？
```

### 3.4 Source-backed inverse-mask grammar

The two inverse PatternSpecs now use explicit source-backed internal-mask grammar.

One unknown digit:

```text
pattern = ^[1-9][0-9]*□[0-9]+$
length = 3..8
placeholderCount = 1
placeholder must be internal
```

Two unknown digits:

```text
pattern = ^[1-9][0-9]*□□[0-9]+$
length = 4..8
placeholderCount = 2
placeholders must be contiguous and internal
```

Both contracts forbid:

```text
leading zero
group separators
placeholder at either edge
wrong placeholder count
```

Accepted examples:

```text
2□318
47□61
4□□99
12□□34
```

Rejected examples include:

```text
□2318
23□
02□18
2,□318
2□□18
□□499
4□9□9
4□□
04□□99
4,□□99
```

### 3.5 Exact validator-code coverage

All 44 S66 blocking codes are assigned exactly once across the eight stages:

| Stage | Name | Code count |
|---:|---|---:|
| 1 | identity_and_schema | 8 |
| 2 | lifecycle_and_scope | 3 |
| 3 | integer_domain_and_boundary | 7 |
| 4 | formula_and_operation | 14 |
| 5 | answer_model | 2 |
| 6 | semantic_template_and_units | 3 |
| 7 | ambiguity_and_inverse | 5 |
| 8 | final_surface_contract | 2 |
|  | **Total** | **44** |

The coverage gate rejects omitted, duplicated, unknown or stage-drifted blocking codes.

## 4. Mutation contract

S67 freezes 28 required mutation classes. They cover:

```text
required field deletion
PatternSpec identity duplication or mapping drift
public/production lifecycle activation
free-form AI or generic fallback activation
open answer schemas
incomplete method-comparison answer shape
missing conditional unit label
placeholder/role/binding drift
hidden round-then-operate inputs
invalid inverse masks
blocking-code omission, duplication or stage drift
```

The executable test applies representative mutations across every category and requires a nonempty QA error set.

## 5. Effective acceptance gate

```text
17 / 17 PatternSpec contracts accepted after overlay
9 / 9 answer schemas closed
9 / 9 templates role-bound
4 / 4 operation-estimation prompts expose original rounding inputs
2 / 2 inverse-mask grammars locked
44 / 44 blocking codes covered exactly once
8 / 8 validator stages covered
28 unique mutation requirements frozen
```

## 6. Scope boundary

```text
base S66 contract rewritten = false
FormalMapping materialized  = false
PatternGroups materialized  = false
PatternSpecs materialized   = false
generator implemented       = false
validator implemented       = false
public selector enabled     = false
canonical routing enabled   = false
production use              = forbidden
```

## 7. Distance and handoff

```text
GOAL_DISTANCE_BEFORE = D2_G4B_U04_PATTERNSPEC_AND_ANSWER_CONTRACTS_DESIGNED
GOAL_DISTANCE_AFTER  = D2_G4B_U04_PATTERNSPEC_CONTRACT_QA_LOCKED
DISTANCE_REDUCED     = Reviewed all 17 contracts and locked answer-schema closure, semantic role bindings, visible round-then-operate prompts, inverse-mask grammar and exact validator-code coverage for hidden materialization.
REMAINING_BLOCKERS   = [
  "FormalMapping, PatternGroups and PatternSpecs not materialized",
  "generator and blocking validator not implemented",
  "public selector and worksheet path not connected"
]
NEXT_SHORTEST_STEP   = S68_G4B_U04_FormalMappingAndHiddenPatternSpecMaterialization
STOP_REASON          = NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```

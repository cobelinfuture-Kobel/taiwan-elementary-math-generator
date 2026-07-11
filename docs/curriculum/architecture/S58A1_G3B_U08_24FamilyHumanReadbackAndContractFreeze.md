# S58A1 G3B-U08 24-Family Human Readback and Contract Freeze

## Scope lock

```text
CURRENT_MAJOR_TASK = S58A1_G3B_U08_24FamilyHumanReadbackAndContractFreeze
CURRENT_SUBTASK = review all 24 S58A semantic families and freeze the accepted design boundary
TASK_STATUS = QA_AND_CONTRACT_FREEZE
OUTPUT = one authoritative human-readback freeze contract
```

This milestone remains planning-only. It does not create PatternSpecs, generators, validators, selector rows, worksheets, renderers, UI controls, HTML, PDF, or production promotion.

## Readback basis

Reviewed together:

- the uploaded two-page `題型總覽-3b08-乘法與除法.pdf`;
- the six approved public application KnowledgePoints;
- the 24-family S58A registry at Git blob `ef5bed4d1eb7ae7c8e118a678c9288993b5a3818`;
- prior Batch A multiplication and division boundaries;
- the G3B-U04 overlap guard.

The page-1 inverse-operation, exchange-law and checking material remains hidden support reasoning. Public families remain page-2 application structures only.

## Family-level decision

All 24 candidate families are accepted. No family is removed or merged.

| KP | Accepted families | Readback decision |
|---|---:|---|
| 求總量 | 4 | distinct accumulation, score, material-use and package unit flows |
| 求組數 | 4 | distinct quotative-division event and unit flows |
| 求每組量 | 4 | distinct partitive-division time, recipient, capacity and length flows |
| 倍數反求基準量 | 4 | distinct price, count, length and capacity dimensions |
| 購物估算 | 4 | distinct estimate-total, sufficiency, over-benchmark and under-benchmark decisions |
| 同價方案比較 | 4 | distinct weight, capacity, count and length comparison dimensions |

Totals:

```text
accepted families = 24
rejected families = 0
merged families = 0
direct-source families = 13
controlled structural extensions = 11
minimum future context variants = 72
```

The dimension-based families remain distinct because quantity-role binding and unit flow change. Name, noun, number or surface wording substitution alone still does not create a family.

## Human-readback FullFix directives

Four quality directives are frozen before PatternSpec materialization:

1. `tpl_g3b_u08_group_count_equal_segments`
   - reject the unnatural phrase `每段剪成…`;
   - canonical wording is `每段長…`.
2. `tpl_g3b_u08_total_score_per_success`
   - event variants must use natural actions such as `投進一球`, `答對一題`, or `完成一關`;
   - reject generic phrases such as `成功一球`.
3. `tpl_g3b_u08_group_count_score_events`
   - event action and answer classifier must match: `投進幾球`, `答對幾題`, `完成幾關`.
4. Same-price comparison families
   - the prompt must explicitly state equal total price;
   - both options must use the same measure dimension;
   - total amounts must differ;
   - exactly one better option must exist.

These are contract-level FullFix directives. They must be implemented by S58B/S58C and enforced by later runtime validation.

## Boundary acceptance

```text
representation = horizontal_only
public pure-numeric mode = forbidden
vertical multiplication = forbidden
vertical division = forbidden
long division = forbidden
vertical missing digit = forbidden
2-digit multiplier computation = forbidden
2-digit divisor computation = forbidden
public remainder application = forbidden
general G3B-U04-style mixed two-step expansion = forbidden
free-form AI generation = forbidden
```

## Acceptance result

```text
HUMAN_FAMILY_READBACK = PASS_24_OF_24
CONTRACT_FREEZE = ACCEPTED
PATTERNSPEC_IMPLEMENTATION = NOT_STARTED
PUBLIC_UI_CHANGE = NONE
PRODUCTION_PROMOTION = NONE
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D3_G3B_U08_6_KP_APPROVED_24_FAMILY_CONTRACT_READY_FOR_HUMAN_READBACK
GOAL_DISTANCE_AFTER  = D3_G3B_U08_24_FAMILY_HUMAN_READBACK_FROZEN_READY_FOR_PATTERNSPEC_DESIGN
DISTANCE_REDUCED     = reviewed and froze all 24 semantic families, removed wording and comparison-policy ambiguity, and established authoritative FullFix directives for the next design gate
REMAINING_BLOCKERS   = [
  "FormalMapping, PatternSpec and answer-model contracts are not designed",
  "semantic validator error codes and stage contract are not designed",
  "no runtime implementation or public path exists yet"
]
NEXT_SHORTEST_STEP   = S58B_G3B_U08_FormalMappingPatternSpecAndSemanticValidatorDesignScan
```

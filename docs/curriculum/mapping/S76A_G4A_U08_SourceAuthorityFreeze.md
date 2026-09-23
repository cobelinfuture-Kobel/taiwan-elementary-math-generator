# S76A G4A-U08 Source Authority Freeze

## Status

- task: `S76A_G4A_U08_SourceAuthorityFreeze`
- sourceId: `g4a_u08_4a08`
- unit: `4A-U08 整數四則、兩步驟問題與併式`
- mode: planning-only / source-authority freeze
- status: `PASS_SOURCE_AUTHORITY_FROZEN`
- implementation changes: none

## Scope lock

This authority is derived from the approved four-page source PDF. It defines the grade-4 source boundary only. It must not import grade-5 distributive-law, average, inverse-average, or unknown-operator objectives.

## Authority model

The source is normalized as 15 core KnowledgePoints plus 4 extension PatternGroups. Surface exercise variants are not promoted automatically to independent KnowledgePoints.

### Numeric core KnowledgePoints

| ID | Canonical objective | Required evidence / invariant |
|---|---|---|
| `kp_g4a_u08_num_add_group_round` | 加法交換、結合與湊整 | same signed terms; equivalent reordered expression; at least one useful grouping |
| `kp_g4a_u08_num_signed_term_move` | 加減混合時連同符號移項 | operand-sign binding preserved; equivalent expression |
| `kp_g4a_u08_num_add_sub_left_assoc` | 同級加減由左至右 | no precedence-changing parentheses; left-associated trace |
| `kp_g4a_u08_num_parentheses_first` | 括號優先 | parentheses affect the calculation trace or semantic grouping |
| `kp_g4a_u08_num_repeated_subtract_group` | 連續減法合併 | `a-b-c = a-(b+c)`; reject `a-(b-c)` |
| `kp_g4a_u08_num_mul_div_safe_reorder` | 乘除混合安全重排與湊整 | rational equivalence; division terms preserve reciprocal meaning |
| `kp_g4a_u08_num_mul_div_left_assoc` | 同級乘除由左至右 | reject reinterpretation as `a/(b*c)` unless explicitly grouped |
| `kp_g4a_u08_num_repeated_divide_group` | 連續除法合併 | `a÷b÷c = a÷(b×c)`; non-zero divisors |
| `kp_g4a_u08_num_mul_div_before_add_sub` | 先乘除後加減 | AST precedence and answer correctness |
| `kp_g4a_u08_num_parentheses_change_precedence` | 括號改變原本優先順序 | non-redundant parentheses; AST differs from unparenthesized form |
| `kp_g4a_u08_num_compound_parentheses` | 多組括號與完整四則 | bounded AST depth; valid intermediate values |

### Application core KnowledgePoints

| ID | Canonical objective | Pattern-role boundary |
|---|---|---|
| `kp_g4a_u08_app_add_sub_sequence` | 加減狀態變化序列 | add-add, add-subtract, subtract-add, subtract-subtract remain separate PatternSpecs |
| `kp_g4a_u08_app_parentheses_grouping` | 括號群組、折扣與付款 | grouped adjusted cost or grouped quantity before outer operation |
| `kp_g4a_u08_app_mul_div_sequence` | 乘除兩步驟的單位量與總量轉換 | PatternGroups must distinguish share, unit-rate scale, and repeated division |
| `kp_g4a_u08_app_mul_div_before_add_sub` | 乘除優先後再加減 | multiplication/division sub-result plus additive overlay or payment balance |

### Extension PatternGroups required for full-source parity

These are source-authoritative but were outside the earlier Phase2A closeout. They are extensions under the closest core KP or may be promoted only if the rebase standard requires a separate KnowledgePoint.

| PatternGroup ID | Source objective | Mandatory semantic relation |
|---|---|---|
| `pg_g4a_u08_comparison_chain` | 多／少比較關係鏈 | direction, known-role, unknown-role, and two-link relation preserved |
| `pg_g4a_u08_equal_value_unit_price` | 等值總價與單價換算 | `leftQty*leftUnitPrice = rightQty*rightUnitPrice` |
| `pg_g4a_u08_relative_difference` | 同方向相對距離差 | same direction implies rate/distance difference, not sum |
| `pg_g4a_u08_two_cost_component_payment` | 兩種成本與付款找零 | both cost components included before payment balance |

## Grade boundary

### In scope

- integer arithmetic only;
- two-step and bounded compound expressions;
- grade-4 parentheses and operation-order reasoning;
- source-supported comparison, equal-value, and relative-difference applications;
- exact integer answers unless an existing approved policy states otherwise.

### Out of scope

- decimal or fraction answers;
- grade-5 distributive-law strategy as an explicit objective;
- averages and inverse averages;
- unknown-operator inference;
- chained unit conversion beyond the source evidence;
- broader UI/style redesign.

## Validator authority requirements

Every canonical PatternGroup must declare:

- `knownQuantityRoles`;
- `unknownQuantityRole`;
- `requiredOperationSequence`;
- `requiredIntermediateQuantities`;
- `unitFlow`;
- `semanticRelations`;
- `equivalenceRule` when applicable;
- `blockingMutations`.

A correct final answer alone is not sufficient for KnowledgePoint fidelity.

## Existing-scope interpretation

The earlier `D0_G4A_U08_PHASE2A_AND_HYBRID_MIXED_CLOSED` remains valid for its approved subset. It must not be interpreted as full-source ontology closure.

## Acceptance checks

- [x] Every authority node is supported by the source PDF.
- [x] Grade-5 objectives are excluded.
- [x] Surface variants are normalized into KP / PatternGroup / PatternSpec layers.
- [x] Existing Phase1 and Phase2A scope remains reusable.
- [x] Missing Phase2B source groups are explicit.
- [x] No runtime, registry, generator, validator, UI, or renderer file is modified.

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_REBASE_SEQUENCE_LOCKED
GOAL_DISTANCE_AFTER  = D2_G4A_U08_SOURCE_AUTHORITY_FROZEN
DISTANCE_REDUCED     = The full grade-4 source boundary, canonical KP set, extension groups, and validation invariants are now fixed.
REMAINING_BLOCKERS   = [BatchA rebase standard not frozen, existing asset reuse scope not frozen, implementation approval gate]
NEXT_SHORTEST_STEP   = S76B_BatchA_ValidatorOntologyRebaseStandard
STOP_REASON          = NONE
```

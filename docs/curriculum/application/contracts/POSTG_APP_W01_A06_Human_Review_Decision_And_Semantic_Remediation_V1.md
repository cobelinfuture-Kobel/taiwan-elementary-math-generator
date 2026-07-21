# POSTG-APP-W01-A06 Human Review Decision and Semantic Remediation Contract V1

## 1. Decision

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-W01-A06_HumanReviewDecisionAndProductionAdmissionRemediation
PARENT_TASK = POSTG-APP-W01-A05_UnitFlowExactGeneratorRendererAndHumanReviewRemediation
HUMAN_REVIEW_DECISION = REMEDIATION_REQUIRED
PRODUCTION_ADMISSION = false
```

A05 successfully proved exact generator and renderer lineage, but its 16-question review cohort is not semantically acceptable for production. The operator decision rejects the visible application-language layer while preserving the exact mathematical witnesses and the shared production pipeline.

## 2. Rejected behavior

The following construction is forbidden:

```text
visible Macro Context label
+ generic actors and goal
+ original numeric prompt or equation pasted verbatim
+ generic ending such as 求出總量 / 求出需求 / 判斷結論
```

This pattern changes surface text without constructing an authentic application situation. It creates sentences that are grammatically forced, fails to bind numbers to quantities, and often assigns a total-language target to a non-total mathematical relation.

## 3. Visible heading policy

Macro Context is classification metadata, not a required visible title.

```text
macroContextId = retained in metadata
macroContext heading per question = forbidden
fixed prefix such as 在健康、運動與競賽 = forbidden
natural context embedded in event = required when application is suitable
```

A worksheet may optionally use one unobtrusive section label outside individual question cards, but the title must not be repeated or emphasized as part of every item.

## 4. Suitability is decided below source-unit level

Application suitability must be classified at:

```text
KnowledgePoint + PatternSpec
```

Allowed classifications:

| Classification | Meaning |
|---|---|
| `APPLICATION_REQUIRED` | The mathematical relation naturally supports both numeric and application forms. |
| `APPLICATION_OPTIONAL` | A meaningful context is possible, but numeric form remains primary or equally valid. |
| `NUMERIC_ONLY` | A story adds no authentic meaning or causes semantic distortion; do not force one. |

Source-unit eligibility alone is insufficient. A unit may contain both application-suitable and numeric-only PatternSpecs.

## 5. Math semantic class precedes wording

Every application candidate must be assigned one semantic class before context binding:

```text
COMPARE_TWO_GROUPS_SAME_MEASURE
RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE
JOIN_RESULT_TOTAL
SEPARATE_REMAINDER_OR_DIFFERENCE
EQUAL_GROUPS_TOTAL
EQUAL_SHARE_PER_GROUP
COMPLETE_GROUP_COUNT_FLOOR
REQUIRED_GROUP_COUNT_CEILING
PLACE_VALUE_COMPOSITION
PLACE_VALUE_EXCHANGE
MULTI_STEP_STRUCTURED
NUMERIC_ONLY
```

The semantic class controls the event roles, permitted question targets, quantity compatibility and answer unit.

## 6. Quantity binding contract

Every operand used as an application fact must carry:

```text
quantityRole
entityType
measureType
unitText
valueSource
```

Example:

```json
{
  "value": 1594,
  "quantityRole": "initialAmount",
  "entityType": "plasticBottle",
  "measureType": "count",
  "unitText": "個",
  "valueSource": "exactGeneratorOperand0"
}
```

A second operand in the same addition event must bind to the same entity and measure unless the PatternSpec explicitly defines a conversion.

Forbidden:

```text
1594 + 6 = □，求出清理總量
```

Required form:

```text
清理小組上午收集了1594個寶特瓶，下午又收集6個。
這一天一共收集多少個寶特瓶？
```

Both numbers now have an event role, entity and unit. The question target matches `JOIN_RESULT_TOTAL`.

## 7. Relation-specific wording

### 7.1 Comparison

A `>` / `<` / `=` PatternSpec must compare two groups or two quantities of the same measure.

Forbidden:

```text
比較5979和2172，判斷補給總量。
```

Required form:

```text
甲組整理了5979個瓶蓋，乙組整理了2172個瓶蓋。
比較兩組的數量，在○中填入 >、< 或 =：5979 ○ 2172
```

Rules:

```text
two group identities = required
same entity or same measure = required
relation-symbol answer = no count unit
總量 target = forbidden
```

### 7.2 Range membership

A range PatternSpec must expose lower bound, upper bound, candidate and common measure.

Forbidden:

```text
哪個數大於2478且小於3437，求出貨物總量。
```

Required form:

```text
倉庫規定每批貨物必須超過2478箱，而且少於3437箱。
A批有2395箱，B批有3276箱。哪一批符合規定？
```

Rules:

```text
lowerBound + upperBound + candidate = required
same measure and unit = required
selection answer may be A/B or group identity
總量 target = forbidden
```

### 7.3 Equal groups and multiplication

```text
每盤有27株幼苗，共有7盤。一共有多少株幼苗？
```

The repeated-group count and per-group quantity must be explicit.

### 7.4 Equal share and division

```text
77公升的水平均裝入7個水桶，每桶裝多少公升？
```

The total, group count and per-group target must be explicit. `77 ÷ 7` cannot be described as finding an energy total.

### 7.5 Floor and ceiling group selection

Complete-group and required-group problems must distinguish:

```text
最多可以裝滿幾組 = floor
至少需要幾組才能全部裝完 = ceiling
```

The wording must state what happens to the remainder.

## 8. Numeric-only boundary

A PatternSpec must remain numeric-only when context cannot add an authentic decision, event or quantity relation.

Potential examples requiring reclassification review:

```text
place-value composition
place-value exchange
pure digit arrangement max/min
symbolic relation drills without a meaningful group comparison
```

This does not permanently forbid application versions. It requires evidence that the context preserves the intended mathematical act rather than merely decorating the numbers.

## 9. Fail-closed validator contract

The following error codes are blocking:

```text
APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN
APPSEM_EXPRESSION_WRAPPER_PROSE_FORBIDDEN
APPSEM_OPERAND_QUANTITY_BINDING_MISSING
APPSEM_OPERAND_UNIT_INCONSISTENT
APPSEM_RELATION_TARGET_MISMATCH
APPSEM_COMPARE_GROUP_SCHEMA_REQUIRED
APPSEM_RANGE_BOUND_SCHEMA_REQUIRED
APPSEM_GENERIC_TOTAL_TARGET_FORBIDDEN
APPSEM_FORCED_APPLICATION_FOR_NUMERIC_ONLY
APPSEM_ANSWER_UNIT_MISMATCH
APPSEM_HUMAN_NATURALNESS_REVIEW_REQUIRED
```

Automated checks may verify structure and obvious wording defects. Naturalness remains a Human Review gate and must not be inferred from validator success alone.

## 10. Acceptance gates for regenerated review cohort

A06 cannot unlock production until all are true:

```text
1. All 16 A05 review items are reclassified by KnowledgePoint + PatternSpec.
2. Every application item has complete quantity bindings for every operand.
3. Macro Context headings are absent from individual question titles and fixed prefixes.
4. Compare items use two same-measure groups.
5. Range items use bounds and candidates with the same measure.
6. Non-total relations reject generic total wording.
7. Numeric-only PatternSpecs receive no forced story.
8. Answer units match answer shape and mathematical target.
9. Mathematical witnesses and exact generator lineage remain unchanged.
10. New HTML and PDF review artifacts are generated and reviewed by the operator.
11. Production admission remains false until explicit APPROVE.
```

## 11. Bounded implementation sequence

```text
A06A = Human Review decision and semantic remediation contract
A06B = Semantic class, quantity schema and fail-closed validator runtime
A06C = Relation-specific surface templates and title suppression
A06D = Regenerated 16-item HTML/PDF review package
A06E = Operator APPROVE / REJECT / REMEDIATION_REQUIRED decision
```

This prevents a wording task from expanding into a parallel generator or a complete rewrite of all unit content.

## 12. Distance

```text
GOAL_DISTANCE_BEFORE = D1_E4_REVIEW_READY_BUT_OPERATOR_DECISION_PENDING
GOAL_DISTANCE_AFTER = D1_HUMAN_REVIEW_REJECTED_WITH_ACTIONABLE_SEMANTIC_CONTRACT
DISTANCE_REDUCED = the generic-language defect is no longer an undefined human concern; it is expressed as machine-checkable semantic, quantity and visibility gates
REMAINING_BLOCKERS = semantic runtime, validators, relation templates, regenerated HTML/PDF and second operator review
NEXT_SHORTEST_STEP = POSTG-APP-W01-A06B_SemanticClassQuantitySchemaAndValidatorRuntime
```

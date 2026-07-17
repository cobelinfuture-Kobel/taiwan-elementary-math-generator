# GCTX-P01 — Approved Semantic Chain Schema Contract

```text
TASK = GCTX-P01_ApprovedSemanticChainSchema
STATUS = SCHEMA_LOCKED_PENDING_CI
RULESET_VERSION = 0.1.0
SEED_CONTENT = NONE
RUNTIME_CHANGE = NONE
UNIT_MIGRATION = NONE
RENDERER_CHANGE = NONE
NEXT_TASK = GCTX-P02_ScenarioChainBoundedPBLAndCompleteProjectionContract
```

## 1. 本輪目的

P00 已鎖定：runtime 只能選擇已核准語意綁定，不能臨時建立新語意。

P01 將此規則落成 machine-readable schema：

```text
ContextFamily
＋ exact SemanticVariant
＋ explicit semantic slot bindings
＋ ordered EventFlow
＋ QuantityRoles
＋ UnitFlow
＋ QuestionRole
＋ approved LanguageVariants
＋ approved NumericProfiles
＋ compatibility rules
＋ review evidence
＋ blocking validation
```

本輪只處理**單一核准語意綁定**。多小題 ScenarioChain、受控制 PBL、題數 projection 與跨頁 projection 留給 P02。

## 2. 為何舊 `contextFamilyIds[]` 不足

歷史 S02 draft 使用：

```text
UnitContextBinding.contextFamilyIds[]
```

若 runtime 再從 actors、places、objects、activities 與 family 陣列自由抽取，會產生隱含 Cartesian combination：

```text
actor × place × object × activity × operation
```

這可能產生語法正確但語意荒謬的題目。

P01 改為：

```text
contextFamilyId       = exactly one approved family
semanticVariantId     = exactly one approved semantic variant
semanticSlotBindings  = explicit binding list
```

因此：

```text
RANDOMNESS_MAY_SELECT_AN_APPROVED_BINDING
RANDOMNESS_MUST_NOT_CREATE_A_NEW_SEMANTIC_BINDING
```

## 3. Registry

Schema：

```text
data/curriculum/context/schemas/GCTX_ApprovedSemanticChain.schema.json
```

未來 registry：

```text
data/curriculum/context/registry/approved-semantic-bindings.json
```

本輪不建立空 registry，避免把 schema existence 誤報為 production content。

Registry kind：

```text
approved_semantic_binding_registry
```

Entry：

```text
approvedSemanticBindingEntry
```

## 4. Exact identity

每一筆 binding 必須有：

```text
bindingId
rulesetVersion
sourceId
unitCode
knowledgePointId
patternSpecId
contextFamilyId
semanticVariantId
```

`contextFamilyId` 是單數。

禁止：

```text
contextFamilyIds[]
```

若同一 PatternSpec 可以使用三種真正不同的語意鏈，必須建立三筆 approved bindings，而不是一筆 binding 內放三個 families 等 runtime 拼接。

## 5. Semantic slot binding

`semanticSlotBindings[]` 明確綁定：

```text
slotId
slotKind
assetId
semanticRole
required
```

可用 slotKind：

```text
actor
place
object
activity
classifier
unit
```

例如：

```text
slot_student_group → actor → recipient_group
slot_recycling_center → place → destination
slot_bottles → object → counted_resource
slot_pack → activity → grouping_action
```

Runtime 不得替換其中任一 binding。

## 6. EventFlow

`eventFlow[]` 是有序事件序列。每個 event step 包含：

```text
eventStepId
order
eventType
actorSlotId
placeSlotId
objectSlotIds
actionId
inputQuantityRoleIds
outputQuantityRoleIds
stateTransition
mustPreserveOrder = true
```

允許 eventType：

```text
state_observation
quantity_introduction
quantity_change
quantity_grouping
quantity_comparison
unit_conversion
question_terminal
```

Runtime 禁止：

- 重排 event steps；
- 刪除中間事件；
- 加入未核准事件；
- 將 question terminal 改成另一種問法所代表的數學任務。

## 7. QuantityRoles

每個數量必須有穩定 role ID：

```text
quantityRoleId
roleKind
semanticRole
entitySlotId
valueOrigin
unitDimension
allowedUnitIds
numericProfileRoleKey
isQuestionTarget
```

roleKind：

```text
given
sampled_base
derived_intermediate
answer_target
```

valueOrigin：

```text
stimulus
numeric_profile
formula
canonical_answer
```

只有 `numeric_profile` 可由 approved NumericProfile 提供數字。

Derived quantity 與 canonical answer 不得再隨機指定。

## 8. UnitFlow

`unitFlow[]` 明確記錄 quantity roles 之間的單位關係：

```text
fromQuantityRoleId
toQuantityRoleId
relationType
conversionRuleId
mustBeExact
```

relationType：

```text
same_unit
conversion
rate_composition
dimensionless
derived_unit
```

所有 role reference 必須指向本 binding 已宣告的 quantity role。

## 9. QuestionRole

每條 binding 只有一個 terminal `questionRole`：

```text
questionRoleId
intent
targetQuantityRoleIds
answerShape
mustUseEventStepIds
terminalForBinding = true
```

intent：

```text
calculate
compare
identify
estimate
select_from_approved_options
```

P01 的 `select_from_approved_options` 只代表單題核准選項判定，不代表 PBL decision model。PBL 的 project goal 與 decision criteria 留給 P02。

## 10. Approved variation axes

每條 binding 必須列出：

```text
languageVariantIds[]
numericProfileIds[]
```

Runtime 允許變化只有：

```text
language_variant
numeric_profile
```

兩者都必須從本 binding 的 approved ID list 選取。

禁止 runtime：

```text
new wording generated freely
new numeric profile invented
context family replaced
slot binding mutated
event flow changed
question role changed
```

## 11. Compatibility rules

每條 binding 必須宣告：

```text
requiredSlotIds
forbiddenCombinationIds
allowedEraTags
allowedGradeBands
requiredCommonKnowledgeIds
forbiddenCommonKnowledgeIds
semanticGuardIds
```

這一層只記錄 compatibility references。來源如何准入、何時過期，留給 P03。

## 12. Review evidence

每條 binding 必須保留：

```text
approvalState
rulesetVersion
semanticReviewIds
mathematicalReviewIds
sourceEvidenceIds
semanticCompletenessConfirmed
mathematicalMeaningPreserved
approvedAt
```

Production use 必須同時滿足：

```text
lifecycleStatus = approved
reviewEvidence.approvalState = approved
semanticCompletenessConfirmed = true
mathematicalMeaningPreserved = true
```

P01 只定義 evidence references shape；source authority admission 與 expiry 規則由 P03 完成。

## 13. Randomness policy

固定：

```text
mode = select_approved_components_only
selectableAxes = [language_variant, numeric_profile]
mayCreateNewSemanticBinding = false
mayReplaceContextFamily = false
mayMutateSemanticSlotBindings = false
mayMutateEventFlow = false
mayChangeQuestionRole = false
fallbackPolicy = block
```

若 binding 無可用語言版本或數值 profile，resolver 必須 BLOCK，不得 fallback 到 generic context。

## 14. Validation contract

每條 binding 必須宣告：

```text
semanticValidatorHooks
mathValidatorHooks
canonicalAnswerRecomputationRequired = true
blocking = true
mustValidateSlotBindings = true
mustValidateEventFlow = true
mustValidateQuantityRoles = true
mustValidateUnitFlow = true
mustValidateQuestionRole = true
```

P01 不實作 validator code；P06 會定義 blocking codes，P09 會整合 semantic/math/layout validator。

## 15. P01 與 P02 的邊界

P01 不含：

```text
scenarioChainId
projectGoal
requiredMilestones
dependencyGraph
quantityLedgerAcrossQuestions
decisionCriteria
terminalDeliverable
approvedQuestionCountProfiles
completeProjection
approvedTwoPageProjection
```

以上全部由 P02 擁有。

因此 P01 schema 不能把單題 EventFlow 誤當成多小題 PBL closure。

## 16. Historical S02 draft

PR #243 的內容只可作設計輸入，不是 production authority。

可沿用的部分：

- ContextDomain；
- CommonKnowledge；
- ContextFamily；
- lifecycle；
- source reference shape；
- global/unit ownership分離。

已被 P01 修正的部分：

```text
contextFamilyIds[]
→ contextFamilyId + semanticVariantId + explicit semanticSlotBindings
```

## 17. Acceptance

本任務完成條件：

- schema 使用單一 exact ContextFamily；
- explicit SemanticVariant 與 slot bindings 必填；
- EventFlow、QuantityRoles、UnitFlow、QuestionRole 必填；
- language/numeric variation axes 關閉；
- runtime composition 與 generic fallback 禁止；
- P01 / P02 ownership 明確；
- 不建立 seed；
- 不修改 runtime、unit、renderer。

## 18. Distance

```text
GOAL_DISTANCE_BEFORE = D3_GCTX_GLOBAL_OWNERSHIP_AND_RULE_VERSIONING_LOCKED
GOAL_DISTANCE_AFTER  = D3_GCTX_APPROVED_SEMANTIC_BINDING_SCHEMA_LOCKED
DISTANCE_REDUCED     = loose context-family selection → exact approved semantic binding
REMAINING_BLOCKERS   = [
  ScenarioChain / BoundedPBL closure,
  source governance,
  semantic breadth and deduplication,
  layout contracts,
  runtime implementation
]
NEXT_SHORTEST_STEP   = GCTX-P02_ScenarioChainBoundedPBLAndCompleteProjectionContract
```

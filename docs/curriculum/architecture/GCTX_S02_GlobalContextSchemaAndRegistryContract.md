# GCTX-S02 — Global Context Schema and Registry Contract

```text
TASK = GCTX-S02_GlobalContextSchemaAndRegistryContract
STATUS = SCHEMA_LOCKED_PENDING_CI
SCHEMA_DEFINITIONS = 7 registry entry types + shared value definitions
SEED_CONTENT = NONE
MIGRATION = NONE
RUNTIME_CHANGE = NONE
NEXT_TASK = GCTX-S03_WebVerificationAndCommonKnowledgeAdmissionGovernance
```

## 1. 本輪成果

S01 已確認現有 context authority 分散於五個單元。S02 將資料拆成兩個權威層：

```text
Global shared context authority
├─ ContextDomain
├─ SDGGoal
├─ SourceAuthority
├─ CommonKnowledge
├─ ContextFamily
└─ ContextLifecycle

Unit mathematical context authority
└─ UnitContextBinding
```

Machine-readable schema：

```text
data/curriculum/context/schemas/GCTX_GlobalContextRegistry.schema.json
```

Registry manifest 與 ownership contract：

```text
data/curriculum/contracts/GCTX_S02_GlobalContextSchemaAndRegistryContract.json
```

本輪只建立 schema，不填 seed、不搬移舊資料、不修改 runtime。

## 2. 七種 registry

| Registry | Entry | Owner | Materialization |
|---|---|---|---|
| `context-domains.json` | `contextDomainEntry` | global | S04 |
| `sdg-goals.json` | `sdgGoalEntry` | global | S04 |
| `source-authorities.json` | `sourceAuthorityEntry` | global governance | S04 |
| `common-knowledge.json` | `commonKnowledgeEntry` | global | S04 |
| `context-families.json` | `contextFamilyEntry` | global | S04 |
| `unit-context-bindings.json` | `unitContextBindingEntry` | unit binding authority | S08 |
| `context-lifecycle.json` | `contextLifecycleEntry` | global governance | S04 |

空 registry 不在 S02 提前建立，避免把「schema 已有」誤報成「內容已准入」。

## 3. ID namespace

```text
ContextDomain       gctx_dom_*
SDGGoal             SDG_1 ... SDG_17
SourceAuthority     gctx_src_*
CommonKnowledge     gctx_ck_*
ContextFamily       gctx_cf_*
UnitContextBinding  gctx_bind_*
```

遷移舊 ID 時可以：

```text
舊 ID 保持 canonical
或
舊 ID 寫入 legacyAliases → 唯一 canonical ID
```

一個 legacy alias 不得指向多個 canonical ID。此規則用來保護 deterministic replay、query state 與既有 audit evidence。

## 4. CommonKnowledge

`commonKnowledgeEntry` 只保存小學可理解的背景常識與查證資料，例如：

```text
古代市場是人們交換或買賣商品的場所。
蜜蜂會採集花蜜。
圖書館提供閱讀與借閱服務。
```

必要欄位：

```text
commonKnowledgeId
statementZh
primaryDomain
crossDomainTags
topicTags
eraTags
regionScope
gradeBands
verificationTier
verificationRefs
allowedUses
forbiddenClaims
exerciseNumbersPolicy
lifecycleStatus
```

查證 shape 已預留：

```text
general_common_knowledge
→ verificationRefs >= 1

specific_species_region_era_or_institution
→ verificationRefs >= 2

exact_fact_or_statistic
→ exactClaim required
→ source_bound_exact_values_only
→ value mutation forbidden
```

來源准入強度與過期規則由 S03 完成，本輪不先填任何來源。

## 5. ContextFamily

`contextFamilyEntry` 保存可跨單元重用的情境內容：

```text
共同常識 reference
領域與年代
人物
場所
物件
活動
量詞
可用單位
背景句片段
名詞片段
動作片段
禁止組合
學生題幹限制
```

它必須宣告：

```text
sharedContentOnly = true
```

它不得包含：

```text
sourceId
unitCode
knowledgePointId
patternSpecId
operationSignature
roleBindings
unitFlow
plausibleRanges
answerModel
validatorHooks
rendererHook
```

因此 global context family 不能自己決定算式，也不能直接輸出完整數學題幹。

## 6. UnitContextBinding

所有數學專屬資訊集中在 `unitContextBindingEntry`：

```text
sourceId
unitCode
knowledgePointId
patternSpecId
contextFamilyIds
operationSignature
roleBindings
unitFlow
plausibleRanges
requiredFacts
forbiddenFacts
validatorHooks
answerUnitPolicy
rendererHook
legacyAliases
lifecycleStatus
```

這一層回答：

```text
哪個 PatternSpec 可以用哪個 ContextFamily？
數值角色如何對應情境角色？
單位怎麼流動？
哪些數量範圍合理？
哪個 validator 必須執行？
```

ContextFamily 與 UnitContextBinding 分離後，同一個「回收物分裝」常識可供多個單元使用，但每個單元仍保有不同的 division、ceiling、two-step 或 estimation contract。

## 7. Domain 與 era

共享領域維持 S00 的五類：

```text
daily_life
sdg
natural_science
social_studies
history
```

Entry 使用：

```text
eraTags = [modern]
eraTags = [ancient]
eraTags = [modern, ancient]
```

公開控制維持：

```text
modern
ancient
mixed_eras
```

`mixed_eras` 是 worksheet allocation mode，不是讓同一題任意混合古今。SDG 是現代框架；古代 context 可在後台帶有關聯 theme，但學生題幹不得宣稱古代人物正在執行 SDG。

## 8. Lifecycle

固定狀態：

```text
candidate
web_verified
approved
deprecated
expired
blocked
rejected
```

只有：

```text
status = approved
```

才允許 production use。`expired`、`blocked`、`rejected` 一律不得進入 resolver。

## 9. Reference graph

```text
CommonKnowledge.verificationRefs[].sourceAuthorityId
→ SourceAuthority.sourceAuthorityId

ContextFamily.commonKnowledgeIds[]
→ CommonKnowledge.commonKnowledgeId

ContextFamily.sdgGoalIds[]
→ SDGGoal.sdgGoalId

UnitContextBinding.contextFamilyIds[]
→ ContextFamily.contextFamilyId

ContextLifecycle.assetId
→ 任一 global asset 或 unit binding
```

S04 與 S08 materialization 時，所有 reference 必須 closed-world resolve，不能保留 unresolved ID。

## 10. Compatibility boundary

```text
existing IDs preserved as canonical or alias
existing deterministic replay preserved
existing query values preserved through adapter
existing blocking validators remain blocking
legacy authority cannot be deleted before adapter PASS
free-form AI = forbidden
generic fallback = forbidden
runtime web search = forbidden
```

## 11. S02 Acceptance

```text
PASS requires:
- schema file parses as JSON;
- exactly seven registry kinds are declared;
- all seven entry definitions exist;
- five context domains and lifecycle statuses match S00;
- global definitions exclude all unit-math fields;
- UnitContextBinding requires all unit-math fields;
- specific claims require two refs;
- exact claims require source-bound immutable value shape;
- manifest paths and materialization tasks are unique;
- no seed or existing authority migration occurs;
- next task is GCTX-S03_WebVerificationAndCommonKnowledgeAdmissionGovernance.
```

## 12. Distance

```text
GOAL_DISTANCE_BEFORE = D1_EXISTING_CONTEXT_AUTHORITIES_MAPPED_WITHOUT_CANONICAL_GLOBAL_SCHEMA
GOAL_DISTANCE_AFTER  = D1_GLOBAL_CONTEXT_SCHEMA_AND_REGISTRY_OWNERSHIP_LOCKED_PENDING_CI
DISTANCE_REDUCED     = Canonical IDs, seven registries, shared/unit ownership boundary, reference graph, verification shape and lifecycle contract materialized
REMAINING_BLOCKERS   = S03 through S14 not completed
NEXT_SHORT_STEP      = GCTX-S03_WebVerificationAndCommonKnowledgeAdmissionGovernance
STOP_REASON          = NONE
```

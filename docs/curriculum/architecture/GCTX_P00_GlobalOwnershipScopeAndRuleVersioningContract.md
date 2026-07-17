# GCTX-P00 — Global Ownership Scope and Rule Versioning Contract

```text
TASK = GCTX-P00_GlobalOwnershipScopeAndRuleVersioningContract
STATUS = PLANNING_CONTRACT_PENDING_CI
RUNTIME_CHANGE = NONE
REGISTRY_SEED_CHANGE = NONE
UNIT_MIGRATION = NONE
RENDERER_IMPLEMENTATION = NONE
NEXT_TASK = GCTX-P01_ApprovedSemanticChainSchema
```

## 1. 目的

本合約把已核准的 GCTX、受控制 PBL、應用題版面及逐單元回補討論，收斂成單一版本化規則權威。

本輪不實作 resolver、validator、renderer，也不修改任何單元。它只回答：

```text
誰擁有什麼資料？
誰不得改變什麼？
規則如何版本化？
舊單元如何逐一稽核？
何時可以修改全域條例？
```

既有 G3–G6 curriculum authority、KnowledgePoint、FormalMapping、PatternSpec、generator、validator 與 renderer 均保持不變。

## 2. 範圍邊界

### 2.1 本輪包含

- global source/evidence ownership；
- shared context ownership；
- unit semantic binding ownership；
- ScenarioChain / BoundedPBL ownership；
- layout authority ownership；
- deterministic runtime selection boundary；
- ruleset versioning；
- existing-unit compliance lifecycle；
- 後續固定任務順序。

### 2.2 本輪不包含

- schema implementation；
- registry seed；
- web source admission；
- runtime resolver；
- validator code；
- renderer code；
- unit migration；
- public UI；
- worksheet regeneration。

### 2.3 年級邊界

```text
APPLICATION / PBL LAYOUT EVIDENCE = G4–G6
G1–G3 LAYOUT EVIDENCE PROFILE = NOT REQUIRED
G7 EXAMS = STRUCTURE REFERENCE ONLY
```

這只限制目前考卷格式與應用題/PBL 版面研究。它不刪除既有 G3 curriculum artifacts，也不更改整體教材路線。

國中資料只能協助研究：

- 共用題幹；
- 多小題分組；
- 長刺激材料；
- 表格與文字配置；
- 推理空間。

國中資料不得成為國小內容難度、閱讀負荷、年級標準或數學 authority。

## 3. 六層 authority

### 3.1 Source and Evidence Authority

Owner：`global_governance`

負責：

- source admission；
- verification evidence；
- review / expiry；
- exact source-bound claim。

不得負責：

- unit mathematics；
- operation selection；
- numeric answer generation。

### 3.2 Shared Context Authority

Owner：`global_context_registry`

負責：

- ContextDomain；
- CommonKnowledge；
- ContextFamily；
- actors / places / objects / activities；
- shared language assets；
- context safety restrictions。

不得負責：

- 完整數學題幹；
- operation signature；
- quantity dependency；
- answer model。

### 3.3 Unit Semantic Binding Authority

Owner：`unit_and_patternspec_binding`

負責：

- ApprovedSemanticBinding；
- EventFlow；
- QuantityRoles；
- UnitFlow；
- QuestionRole；
- MathematicalComposition；
- NumericProfile；
- approved LanguageVariant IDs；
- validator hooks。

這一層回答「哪個 PatternSpec 可以使用哪條精確語意鏈」。

### 3.4 ScenarioChain and BoundedPBL Authority

Owner：`approved_unit_scenario_chain`

負責：

- projectGoal；
- requiredMilestones；
- dependencyGraph；
- quantityLedger；
- decisionCriteria；
- terminalDeliverable；
- approved complete question-count projections；
- semantic fingerprint。

不得允許：

- runtime 臨時創造語意綁定；
- 4 題鏈隨機裁成 2 題；
- 缺少 terminal deliverable 的題組被標成 PBL。

### 3.5 Layout Authority

Owner：`renderer_contract`

負責：

- numeric layout profiles；
- application block packing；
- writing-space class；
- question-sheet projection；
- answer-key projection；
- approved page-break projection。

Renderer 不得：

- 刪除 semantic milestone；
- 改變 question count；
- 重算答案；
- 改變數學意義。

### 3.6 Runtime Selection Authority

Owner：`deterministic_resolver`

允許：

```text
select approved binding
select approved chain
select approved complete projection
preserve deterministic seed replay
```

禁止：

```text
compose a new semantic binding
runtime web search
generic fallback
partial PBL extraction
```

## 4. 不可協商 invariant

```text
RANDOMNESS_MAY_SELECT_AN_APPROVED_BINDING
RANDOMNESS_MUST_NOT_CREATE_A_NEW_SEMANTIC_BINDING

QUESTION_COUNT_SELECTS_AN_APPROVED_COMPLETE_PROJECTION
QUESTION_COUNT_MUST_NOT_TRUNCATE_A_PBL_CHAIN

COMMON_SCENARIO != BOUNDED_PBL
NUMERIC_VARIATION != NEW_PBL_CHAIN
SURFACE_LANGUAGE_VARIATION != NEW_PBL_CHAIN
```

此外：

- canonical answer 必須獨立重算；
- semantic validator 必須 blocking；
- free-form AI 禁止；
- generic fallback 禁止；
- runtime web search 禁止。

## 5. 題組結構分類

```text
independent_application
common_scenario_independent
scenario_chain_dependent
bounded_pbl_closed
```

### `independent_application`

每題可獨立解答。

### `common_scenario_independent`

小題共用故事或資料，但彼此不依賴。

### `scenario_chain_dependent`

後題需要前題建立的結果或狀態。

### `bounded_pbl_closed`

必須同時具有：

- project goal；
- required milestones；
- dependency graph；
- decision criteria；
- terminal deliverable；
- complete approved projection。

題目自己標示「素養題」不構成 PBL authority。

## 6. Layout boundary

### 6.1 數字題

既有矩陣保持：

```text
3 columns × 1–5 rows
2 columns × 1–6 rows
1 column  × 1–7 rows
```

### 6.2 應用題

應用題不使用數字題 grid。

```text
APPLICATION_PAGE_MIN_SCORING_ITEMS = 5
scenarioBlockCount != scoringItemCount
FINAL_PAGE_REBALANCE_REQUIRED = true
UNAPPROVED_APPLICATION_BLOCK_SPLIT = forbidden
```

一個五小題 PBL：

```text
scenarioBlockCount = 1
scoringItemCount = 5
```

符合每頁最低五題。

### 6.3 PBL 跨頁

```text
UNAPPROVED_PBL_PAGE_SPLIT = forbidden
APPROVED_COMPLETE_TWO_PAGE_PBL_PROJECTION = allowed
```

跨頁只能是預先核准的完整兩頁 projection，不能由 renderer 任意切開。

### 6.4 題目卷

只允許：

```text
question number
question content
required visuals
unlabeled writing space
```

禁止 renderer 自動加入：

```text
答
答案
商
餘
餘數
算式
```

作答空間分為：

```text
compact
standard
extended
```

### 6.5 答案卷

答案卷：

- 顯示題號與完整題目；
- 顯示答案；
- 答案使用 accent color 與 bold；
- 不保留 writing space；
- 不要求「答：」標籤。

```text
STUDENT_RESPONSE_SHEET != TEACHER_ANSWER_KEY
```

## 7. Evidence policy

現有 G4–G6 試卷與 G7 結構參考，足以支持一般版面、書寫空間、長刺激材料與多小題分組規則。

缺少以下外部樣本：

- 真正 3–5 小題 dependent bounded PBL；
- 教師答案卷。

這些缺口不再 blocking。處理方式固定為：

```text
DESIGN_INFERENCE
→ positive fixture
→ negative fixture
→ HTML acceptance
→ PDF overflow acceptance
→ answer-boundary acceptance
→ existing-unit pilot
```

不能因為沒有外部樣本，就把推導規則宣稱成業界或官方標準。

## 8. Ruleset versioning

格式：

```text
GCTX_RULESET_V<major>.<minor>.<patch>
```

目前規劃版本：

```text
0.1.0
```

狀態：

```text
draft
candidate
baseline
deprecated
```

### Patch

- 文字澄清；
- 非行為文件修正；
- test message 說明。

### Minor

- backward-compatible 欄位；
- 不改 ownership 的新 blocking code；
- 既有語意下的新 approved profile。

### Major

- authority ownership 改變；
- required field 移除或改義；
- runtime resolver 語意改變；
- PBL closure 定義改變；
- question sheet / answer boundary 改變。

每次規則變更必須：

```text
impact analysis
→ affected-unit matrix
→ migration note
→ impacted-unit regression
```

禁止 silent mutation。

Blocking correctness 不得 grandfather，包括：

- 數學錯誤；
- canonical answer mismatch；
- PBL incomplete；
- answer leakage；
- overflow；
- unapproved runtime composition。

## 9. Unit compliance

每個單元必須宣告：

```text
rulesetVersion
semanticChainStatus
pblClosureStatus
applicationLayoutStatus
questionSheetStatus
answerKeyStatus
validatorStatus
```

狀態：

```text
compliant_current
compliant_with_approved_exception
backfill_required
blocked_by_source_or_schema
not_applicable_numeric_only
```

Audit finding 必須先分類：

```text
global_rule_defect
missing_global_rule
unit_implementation_defect
unit_specific_approved_exception
source_or_evidence_blocker
```

只有前兩類可以修改全域條例。

`unit_implementation_defect` 不得用降低全域條例解決。

`approved_exception` 不得削弱 blocking correctness。

## 10. Ruleset maturity

完成以下兩個 pilot 後：

```text
一個一般應用題單元
一個 ScenarioChain / BoundedPBL 單元
```

發布：

```text
GCTX_RULESET_V0.5.0 candidate
```

完成三個不同類型 pilot 後：

```text
GCTX_RULESET_V1.0.0 baseline
```

## 11. 後續固定任務順序

```text
GCTX-P00 Global ownership and rule versioning
→ GCTX-P01 ApprovedSemanticChain schema
→ GCTX-P02 ScenarioChain / BoundedPBL / complete projection
→ GCTX-P03 source, common knowledge and evidence governance
→ GCTX-P04 PBL semantic breadth, fingerprint and near-duplicate
→ GLM-APP-P00 numeric/application layout authority split
→ GLM-APP-P01 application packing, question sheet and answer key
→ GCTX-P05 representative positive/negative fixtures
→ GCTX-P06 validator and blocking codes
→ GCTX-P07 existing-unit compliance audit sequence
→ GCTX-P08 deterministic approved binding resolver
→ GCTX-P09 end-to-end semantic/math/layout validator
→ GCTX-P10 production population, stress and D0 closeout
```

## 12. Existing-unit audit order

```text
G4A-U08
→ G4B-U04
→ G5A-U08
→ G5A-U02 after S104
→ G3B-U04 semantic only unless a layout profile is approved
→ G3A-U01 context eligibility only
→ remaining public units
```

每個單元固定拆成：

```text
UA compliance audit
UB bounded FullFix
UC renderer / HTML / PDF acceptance
UD closeout and rule-impact readback
```

## 13. 舊 GCTX-S02 Draft 的位置

PR #243 的 schema 是歷史草案，不是 production authority。

它可在 P00 合併後作為 P01 輸入，但必須先修正：

- exact approved semantic-chain identity；
- runtime randomness boundary；
- ScenarioChain / BoundedPBL ownership；
- complete projection；
- semantic breadth and fingerprint；
- layout authority separation。

不得直接將舊 draft merge 成 production schema。

## 14. Acceptance

本任務完成條件：

- 六層 authority 全部有 owner；
- 每層 forbidden responsibilities 明確；
- semantic authority 與 layout authority 分離；
- ruleset versioning 關閉；
- unit compliance lifecycle 關閉；
- evidence gap 改由 executable fixture 驗證；
- 無 runtime、unit、renderer 或 registry seed 變更。

## 15. Distance

```text
GOAL_DISTANCE_BEFORE = D4_GCTX_REQUIREMENTS_AND_CORPUS_DISCUSSION
GOAL_DISTANCE_AFTER  = D3_GCTX_GLOBAL_OWNERSHIP_AND_RULE_VERSIONING_LOCKED
DISTANCE_REDUCED     = 將討論轉成單一版本化 governance authority 與固定任務順序
REMAINING_BLOCKERS   = [
  approved semantic-chain schema,
  PBL closure schema,
  layout authority implementation,
  existing-unit audit
]
NEXT_SHORTEST_STEP   = GCTX-P01_ApprovedSemanticChainSchema
```

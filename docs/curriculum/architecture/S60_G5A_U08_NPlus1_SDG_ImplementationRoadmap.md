# S60 — G5A-U08 整數四則：N+1、SDG 與公開列印實作路線圖

```text
CURRENT_MAJOR_TASK = S60_G5A_U08_IntegerFourOperations_PublicWorksheet
ROADMAP_STATUS = PLANNING_APPROVED
SOURCE_ID = g5a_u08_5a08
UNIT_CODE = 5A-U08
UNIT_TITLE = 整數四則
```

## 1. 固定範圍

```text
SOURCE_PANEL_COUNT = 29
NUMERIC_SOURCE_PANEL_COUNT = 16
APPLICATION_SOURCE_PANEL_COUNT = 13
NORMALIZED_CORE_KP_COUNT = 11
SOURCE_BACKED_APPLICATION_TEMPLATE_FAMILY_COUNT = 10
DEFAULT_APPLICATION_DEPTH = N_PLUS_1
MAX_SEMANTIC_DELTA_PER_ITEM = 1
APPLICATION_CONTEXT_POLICY = hybrid_daily_life_and_sdg
FORMAL_X_EQUATION = optional_challenge_representation
FORMAL_EQUATION_SOLVING = not_required
N_PLUS_2 = nonblocking_extension
```

本單元的核心不是提前教授國中一元一次方程式，而是完整整數四則之上的代數思維：未知量、等量、逆運算、整體與部分、平均數逆推及算式等值。

SDG 僅作為 `SemanticContext` 分類，不建立新的 KnowledgePoint，也不改變數學難度。

## 2. 建議 11 個核心 KnowledgePoint

1. 無括號四則混合運算順序
2. 加減連算的等值重組與湊整
3. 乘除連算的等值重組、約分與整數化
4. 分配律展開 `(a±b)×c`
5. 分配律提取公因數 `a×c±b×c`
6. 接近整數的連加補償
7. 接近整數的連減補償
8. 接近整數的乘法補償與簡算
9. 反向推算運算符號
10. 算式等值判斷與錯誤分配律辨識
11. 平均數、平均分攤、逆推平均與平均更新

## 3. 現有 S43E13 overlay 處理政策

既有 `S43E13_G5A_U08_KPExpansion.json` 不直接升級為 production authority。

必須先完成逐項差異稽核：

- retain：可保留的 ID 或概念
- rename：名稱過粗或不精確
- merge：多個粗粒度 row 合併為正式數學 KP
- split：`simplification_strategy` 等粗類別拆為補償、分配律與重組
- reclassify：`word_problem_four_ops`、`multi_step_context` 改為 PatternGroup／TemplateFamily，不再作 KP
- retire：不再作權威來源但保留歷史紀錄

不得直接刪除歷史 overlay；正式資料以新 authority／promotion overlay 覆蓋。

---

# 4. 核心任務順序

## S60A — Existing Overlay vs PDF Source Reconciliation

```text
TASK = S60A_G5A_U08_ExistingOverlayVsPDF29PanelDiffAudit
DISTANCE = D4 → D3
```

### 工作

- 建立 29 個 SourceEvidence row。
- 對照現有 11-row S43E13 overlay 與新的 11 核心 KP。
- 產生 retain／rename／merge／split／reclassify／retire 矩陣。
- 確認 16 數字題、13 應用題的 panel ownership。
- 記錄來源明確要求「只用一個計算式」的題型。

### 驗收

```text
29/29 source panels accounted for
11/11 proposed KPs have source evidence
0 application-only generic rows remain as mathematical KPs
0 silent deletion of historical overlay rows
```

---

## S60B — KnowledgePoint, PatternGroup and Tag Contract

```text
TASK = S60B_G5A_U08_KPPatternGroupTagContract
DISTANCE = D3 → D3
```

### 工作

- 正式核定 11 KP。
- 每個 KP 建立可用的 PatternGroup：`numeric`、`application`、`reasoning`。
- 建立運算順序、分配律、補償、逆向推理、平均數與未知量標籤。
- 明確區分：
  - KnowledgePoint = 數學概念
  - PatternGroup = 數字題／應用題／推理題
  - PatternSpec = 可生成結構
  - TemplateFamily = 語意情境

### 驗收

```text
11/11 KPs uniquely defined
no generic word-problem KP
numeric/application ownership explicit
all tags have canonical names and no duplicate semantics
```

---

## S60C — N Baseline and N+1 Semantic Delta Matrix

```text
TASK = S60C_G5A_U08_NBaselineAndNPlus1SemanticDeltaMatrix
DISTANCE = D3 → D2
```

### 工作

逐 KP 定義：

- `N`：該 KP 的完整小學算術計算結構。
- `N_PLUS_1`：只允許一個額外語意轉換。
- `N_PLUS_2`：挑戰延伸，非核心 D0 blocker。

首批允許的 semantic delta：

```text
combine_groups
adjust_unit_amount
reverse_from_total
reverse_from_average
update_population
nested_grouping
discount_or_compensation
compare_equivalent_models
```

### 驗收

```text
11/11 KPs have explicit N baseline
all application-capable KPs have allowlisted N+1 deltas
maxSemanticDeltaPerItem = 1
no accidental N+2 generation in core mode
```

---

## S60D — Application SemanticTemplate and SDG Context Contract

```text
TASK = S60D_G5A_U08_ApplicationTemplateAndSDGContextContract
DISTANCE = D2 → D2
```

### 工作

- 正式建立 10 個來源支持的 SemanticTemplateFamily。
- 每個 family 定義：
  - RoleBinding
  - UnitFlow
  - OperationSignature
  - RequiredFacts
  - ForbiddenFacts
  - Natural-language constraints
  - Answer unit
- 建立一般生活 ContextVariant 與 SDG ContextVariant。
- 首批 SDG allowlist：2、4、6、7、11、12、13、15。
- SDG 數字預設標示 `fictionalized_for_practice`。
- 禁止只加入「環保」字眼但不改變數量關係的貼標籤題。

### 驗收

```text
10/10 source-backed families have RoleBinding and UnitFlow
all SDG variants declare sdgGoalId and dataStatus
0 fake real-world statistics without sourceRef
0 negative quantities or impossible allocations
0 context-only wording swaps without semantic relevance
```

---

## S60E — FormalMapping, Answer Models and Validator Contract

```text
TASK = S60E_G5A_U08_FormalMappingAnswerModelValidatorContract
DISTANCE = D2 → D2
```

### 工作

定義至少以下 answer model：

```text
numericAnswer
expressionAnswer
operatorSequenceAnswer
missingValueAnswer
blankEquationAnswer
equalityJudgementAnswer
averageInverseAnswer
allocationTransferAnswer
```

特殊契約：

- 一式解題同時驗證算式與數值。
- 連除保留方向：`a÷b÷c = a÷(b×c)`。
- 除法與減法不得誤用交換律／結合律。
- 分配律展開與提取公因數使用不同 PatternSpec。
- 平均數滿足 `total = average × count`。
- 等值判斷記錄錯誤類型，例如 `duplicated_common_factor`。
- 同一題可接受多個等值算式，不作字串單解比對。

### 驗收

```text
all PatternSpec candidates have deterministic answer shape
expression equivalence contract defined
unknown value is unique in every missing-value item
units and operation signatures validated
invalid but numerically coincidental expressions rejected
```

---

## S60F — Hidden PatternSpec Materialization

```text
TASK = S60F_G5A_U08_HiddenPatternSpecMaterialization
DISTANCE = D2 → D2
```

### 工作

- 先建立 numeric PatternSpecs，再建立 application PatternSpecs。
- PatternSpec 數量由 S60A–S60E 的差異稽核決定，不在 roadmap 階段硬編數量。
- 建立 authoritative registry、browser-neutral projection 與 drift validator。
- 初始 lifecycle：hidden、canonical routing disabled、production forbidden。

### 驗收

```text
all 29 source panels map to at least one PatternSpec or explicit evidence-only row
all IDs unique
no generic fallback PatternSpec
browser projection exactly matches authority
public selector visibility remains zero
```

---

## S60G — Numeric Generator and Blocking Validator

```text
TASK = S60G_G5A_U08_NumericGeneratorAndBlockingValidator
DISTANCE = D2 → D1
```

### 工作

實作數字題：

- 四則順序
- 加減與乘除重組
- 連除／連減
- 分配律展開／提取
- 連加／連減／乘法補償
- 缺運算符號
- 等值判斷與錯誤辨識

支援 deterministic seed、exact count、balanced allocation、grouped／shuffle ordering、zero fallback。

### 驗收

```text
all numeric PatternSpecs positive-pass
all mutation fixtures rejected
no noninteger intermediate result unless contract allows legal factor regrouping
no illegal commutative/associative transformation
exact-count and deterministic replay pass
```

---

## S60H — N+1 Application Generator and Semantic Validator

```text
TASK = S60H_G5A_U08_NPlus1ApplicationGeneratorAndSemanticValidator
DISTANCE = D1 → D1
```

### 工作

- 生成 Level N 與 N+1 應用題。
- production 預設比例：N 30%、N+1 70%。
- N+2 暫不進入核心公開路徑。
- 生活／SDG 情境預設比例：50%／50%，可由 production QA 後調整。
- 驗證語意可行性、單位流、角色一致性、數量非負、整除與付款充足。
- 對「只用一個計算式」題型輸出 expressionAnswer。

### 驗收

```text
all source-backed template families generate grammatical Traditional Chinese
all N+1 items contain exactly one allowlisted semantic delta
no quantity-role swap
no unit-flow break
no impossible remainder, allocation, discount or payment condition
no duplicate surface template family masquerading as semantic diversity
```

---

## S60I — Promotion, Resolver and Public Selector Integration

```text
TASK = S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration
DISTANCE = D1 → D1
```

### 工作

公開：

- Grade 5
- Semester A
- Unit 08
- 11 KnowledgePoints
- numeric／application 模式
- N／N+1 難度選項
- 一般生活／SDG／混合情境

不公開：

- 內部 PatternSpec ID
- source panel ID
- N+2 challenge
- 正式方程式求解模式
- hidden／candidate rows

### 驗收

```text
exactly 11 visible KPs
stale/cross-unit IDs rejected
single-KP, multi-KP and all-KP selection pass
numeric/application/N+1/SDG controls resolve canonically
no arbitrary PatternSpec injection
```

---

## S60J — Worksheet, Answer Key and Renderer Integration

```text
TASK = S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration
DISTANCE = D1 → D1
```

### 工作

- 數字題、應用題可混合排版。
- 一式解題保留足夠橫向空間。
- 應用題文字不得跨卡或被截斷。
- 答案頁顯示算式、答案與單位；不洩漏內部 ID。
- Missing value／operator／equality judgement 使用專屬 renderer。
- 重用 S59J-R1 的 PDF containment gate。

### 驗收

```text
question and answer counts exact
all answer shapes rendered correctly
no text, equation or answer overflow
answer suppression works
Traditional Chinese fonts render
unrelated Batch A units delegate unchanged
```

---

## S60K — Public UI, Print and Query-State QA

```text
TASK = S60K_G5A_U08_PublicUIPrintAndQueryStateQA
DISTANCE = D1 → D1
```

### 工作

驗證 Classic、404 fallback、Pixel：

```text
選年級 → 學期 → 單元 → KP → 題型 → 深度 → 情境 → 題數 → 答案 → 預覽 → 列印
```

檢查：

- query-state 保存與還原
- stale preview invalidation
- public error Traditional Chinese mapping
- warning 去重
- 非阻塞 warning 不影響產出
- print controls 真正控制題目頁

### 驗收

```text
Classic/404/Pixel pass
all public controls map to canonical state
no internal English warning leak
no stale selection survives source change
preview and print use the same canonical worksheet
```

---

## S60L — Production Stress, HTML/PDF Smoke and Unit D0 Closeout

```text
TASK = S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout
DISTANCE = D1 → D0
```

### 工作

- 公開題數矩陣：1、11、29、72、120、200。
- 累計 stress：至少 1,000 題。
- 覆蓋 11 KP、所有 promoted PatternSpecs、10 application families、8 semantic deltas、一般／SDG 情境。
- 固定產生 120 題含答案 HTML／PDF smoke。
- DOM containment、PDF bbox、非空白頁、最後一列答案及長應用題卡驗證。
- PR CI、merge、main CI、Pages deploy、final PASS marker。

### 驗收

```text
all public paths pass
all promoted PatternSpecs reached
all application families reached
all N+1 semantic deltas reached
0 blocking validation leak
0 HTML/PDF overflow
main CI clean
```

---

## S60M — Batch A Final Completion Closeout

```text
TASK = S60M_BatchA_AllUnitsProductionCloseout
DISTANCE = D1_BATCH_A → D0_BATCH_A
DEPENDS_ON = S60L PASS
```

### 工作

- 確認 13/13 Batch A source units 已 production promoted。
- 執行跨單元 selector、generator、validator、renderer、query-state、print regression。
- 產生 Batch A coverage manifest。
- 宣告 Batch A 第一階段完成，而不是只宣告 G5A-U08 完成。

### 驗收

```text
13/13 units publicly selectable
13/13 units generate and validate
13/13 units preview and print
0 cross-unit routing drift
0 hidden candidate leakage
Batch A final marker present on main
```

---

# 5. 非阻塞延伸軌

## S60X1 — Algebraic Representation Challenge

```text
BLOCKS_CORE_D0 = false
```

- `□` 等量式
- 可選 `x` 表示
- 不使用正式移項術語
- 不包含負數／分數係數
- 每題必須存在小學算術解法

## S60X2 — N+2 Gifted Challenge Extension

```text
BLOCKS_CORE_D0 = false
```

- 兩個 semantic delta
- 不變量與多解法比較
- 平均更新＋逆推等高深度題
- 獨立 selector、validator 與 QA

不得在核心 S60H 中偷偷加入 N+2。

---

# 6. 依賴順序

```text
S60A Source/Overlay Diff
  ↓
S60B KP/PatternGroup/Tag Contract
  ↓
S60C N and N+1 Matrix
  ↓
S60D Template/SDG Contract
  ↓
S60E FormalMapping/Answer/Validator Contract
  ↓
S60F Hidden PatternSpecs
  ↓
S60G Numeric Generator/Validator
  ↓
S60H N+1 Application Generator/Semantic Validator
  ↓
S60I Promotion/Resolver/UI Selector
  ↓
S60J Worksheet/Renderer
  ↓
S60K Public UI/Print QA
  ↓
S60L G5A-U08 D0 Closeout
  ↓
S60M Batch A Final Closeout
```

`S60X1`、`S60X2` 可在 S60L 後獨立進行，不得阻塞核心 D0。

---

# 7. Roadmap closeout

```text
GOAL_DISTANCE_BEFORE = D3_G5A_U08_KP_NPLUS1_SDG_POLICY_APPROVED_TASK_CHAIN_UNDEFINED
GOAL_DISTANCE_AFTER  = D3_G5A_U08_FINITE_IMPLEMENTATION_AND_ACCEPTANCE_CHAIN_DEFINED
DISTANCE_REDUCED     = 建立從既有 overlay 與 29 個 PDF panel 到 N+1、SDG、UI print、單元 D0 及 Batch A final closeout 的有限任務鏈
REMAINING_BLOCKERS   = [
  "S43E13 既有 11-row overlay 尚未與新 11 KP 逐項比對",
  "29 個 SourceEvidence 尚未建立正式 authority",
  "每個 KP 的 PatternSpec 數量尚未由 FormalMapping 決定"
]
NEXT_SHORTEST_STEP   = S60A_G5A_U08_ExistingOverlayVsPDF29PanelDiffAudit
STOP_REASON          = PLANNING_TO_IMPLEMENTATION_APPROVAL_GATE
BLOCKER_TYPE         = POLICY_APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S60_ROADMAP_DEFINED
REQUIRED_OPERATOR_ACTION = APPROVE_S60A_START
NEXT_RESUME_TASK     = S60A_G5A_U08_ExistingOverlayVsPDF29PanelDiffAudit
```

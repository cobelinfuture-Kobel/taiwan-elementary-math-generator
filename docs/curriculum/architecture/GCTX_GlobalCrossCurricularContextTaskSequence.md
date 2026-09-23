# GCTX — 全域跨領域應用題情境系統任務序列

```text
PROGRAM = GCTX_GlobalCrossCurricularContextSystem
STATUS = TASK_SEQUENCE_LOCKED_PENDING_CI
PRIMARY_GOAL = 所有具應用題能力的單元均可使用經核准的 SDG、自然、社會、歷史與日常生活情境
KNOWLEDGE_LEVEL = 小學常識
RUNTIME_WEB_SEARCH = FORBIDDEN
ADMISSION_WEB_VERIFICATION = REQUIRED
FREE_FORM_AI = FORBIDDEN
GENERIC_FALLBACK = FORBIDDEN
```

## 1. 終點

本序列的終點不是建立自然科、社會科或歷史科專業資料庫，而是建立可供數學應用題穩定使用的全域情境基礎設施：

```text
教材來源
→ KnowledgePoint
→ PatternSpec
→ 數學 generator／validator
→ Global Context Registry
→ Unit Context Binding
→ 情境 resolver
→ 常識／語意 validator
→ worksheet HTML／PDF
```

所有情境只能在既有數學權威之後加入；情境系統不得新增、改寫或弱化 KnowledgePoint、PatternSpec、運算結構、答案模型與數學 validator。

## 2. 全域情境領域

第一版固定支援：

```text
daily_life
sdg
natural_science
social_studies
history
```

歷史領域允許現代與古代背景。古代背景可在後台連結現代 SDG 主題，但學生題幹不得宣稱古代人物正在實踐 SDG，也不得出現明顯時代錯置。

## 3. 常識查證邊界

本系統只收錄小學生能理解的普通常識：

- 一般常識：准入時以至少一個可信公開來源確認；
- 涉及特定物種、地區、朝代或制度：至少兩個可靠來源交叉確認；
- 精確日期、長度、人口、壽命、歷史統計等數值：必須有精確來源，且不得為了算式而改寫史實；
- 題目運算數字預設為虛構練習數據，與背景常識分離；
- 正式生成時只讀已核准 registry，不即時上網搜尋。

## 4. 固定任務順序

| 順序 | 任務 | 明確成果 | 不在本任務範圍 |
|---:|---|---|---|
| S00 | `GCTX-S00_GlobalContextScopeArchitectureAndTaskSequenceLock` | 終點、領域、治理、遷移邊界與 S00–S14 序列 | 不改 runtime |
| S01 | `GCTX-S01_ExistingContextAuthorityInventoryAndMigrationMap` | 盤點 G4B-U04、G5A-U08 與全專案現有情境權威；建立唯一擁有者與遷移圖 | 不搬移資料、不改 generator |
| S02 | `GCTX-S02_GlobalContextSchemaAndRegistryContract` | 鎖定 Domain、CommonKnowledge、ContextFamily、Source、UnitBinding、Lifecycle schemas | 不填大量內容 |
| S03 | `GCTX-S03_WebVerificationAndCommonKnowledgeAdmissionGovernance` | 可信來源層級、查證強度、日期與過期政策、虛構數字規則 | 不做專業學科知識庫 |
| S04 | `GCTX-S04_GlobalSeedRegistryMaterialization` | 建立 SDG、自然、社會、歷史、日常生活的第一批已查證 seed registries | 不追求百科全書式完整度 |
| S05 | `GCTX-S05_G4BU04ContextAuthorityMigrationAdapter` | 將 G4B-U04 單元專屬 context bank／source registry 上移至全域 registry，保留相容 adapter | 不改 G4B-U04 數學行為 |
| S06 | `GCTX-S06_G5AU08ContextAuthorityMigrationAdapter` | 將 G5A-U08 SDG variants 接入全域 registry，保留既有 template／validator authority | 不改 G5A-U08 數學行為 |
| S07 | `GCTX-S07_PublicUnitApplicationPatternCoverageAudit` | 對目前全部公開單元盤點應用題 PatternSpec、現行情境、缺口與可綁定領域 | 不新增 PatternSpec |
| S08 | `GCTX-S08_UnitContextBindingCoverageContract` | 產生完整 PatternSpec × ContextFamily allowlist、role binding、unit flow、plausible range 與狀態矩陣 | 不允許未驗證綁定進 production |
| S09 | `GCTX-S09_GlobalContextResolverImplementation` | 共用 deterministic resolver、contextMode、eraMode、seed replay 與來源 metadata | 不使用自由 AI 或即時網搜 |
| S10 | `GCTX-S10_CommonKnowledgeAndSemanticValidatorCore` | 常識、單位、角色、時代錯置、禁用聲明與來源生命週期 blocking validator | 不弱化既有數學 validator |
| S11 | `GCTX-S11_AllApprovedApplicationBindingsProductionPopulation` | 對 S08 核准的所有公開應用題 PatternSpec 完成受控 binding；無應用題者明確標記 N/A | 不建立新數學能力 |
| S12 | `GCTX-S12_CrossUnitDeterministicGenerationAndReplayStress` | 全單元、全情境領域、現代／古代、固定 seed 的生成、重播、數學與語意壓力測試 | 不接受抽樣式人工宣稱 |
| S13 | `GCTX-S13_PublicContextControlsWorksheetHTMLPDFQA` | 公開 contextMode／eraMode、query state、preview readback、worksheet metadata、HTML／PDF 驗收 | 不改版面權威以外的課程內容 |
| S14 | `GCTX-S14_DeployedGlobalContextD0Closeout` | 部署後 UI、生成、列印、來源與 replay 驗收；建立 D0 authority | 不以單一單元 PASS 取代全域 PASS |

## 5. 自動續跑規則

每一個任務完成後必須：

```text
1. 執行 focused tests 與全 repository CI。
2. PR merge 後更新前一個 pending marker 為 PASS authority。
3. 建立下一個任務 pending marker。
4. 更新 GOAL_DISTANCE。
5. STOP_REASON = NONE 時立即進入 NEXT_SHORT_STEP。
```

只有以下情況允許停止：

```text
CI_FAILURE
GITHUB_OR_TOOL_SAFETY_BLOCKER
PR_MERGE_BLOCKED
NEXT_STEP_OUTSIDE_APPROVED_GCTX_SCOPE
FORBIDDEN_FILE_BOUNDARY
HUMAN_SOURCE_OR_EVIDENCE_SELECTION_REQUIRED
```

PR 已合併、closeout 完成、readback 完成與產生下一個任務都不是停止點。

## 6. 不可膨脹規則

每個任務必須直接縮短下列其中一段距離：

```text
單元專屬情境權威
→ 全域 registry
→ 單元 binding
→ resolver／validator
→ 全公開單元 production coverage
→ worksheet／deployed D0
```

下列內容不屬於本序列：

- 自然科、社會科或歷史科完整課程；
- 學術研究型知識圖譜；
- 即時新聞摘要服務；
- 每次生成時上網查資料；
- 讓 AI 自由補充背景；
- 為增加情境而改變數學 PatternSpec；
- 未經來源確認的精確史實或自然數據。

## 7. D0 完成條件

```text
GLOBAL_CONTEXT_REGISTRY = production
WEB_VERIFICATION_GOVERNANCE = enforced
G4B_U04_LOCAL_AUTHORITY = migrated_with_adapter
G5A_U08_LOCAL_AUTHORITY = migrated_with_adapter
PUBLIC_APPLICATION_PATTERN_COVERAGE = complete
APPROVED_BINDINGS = production
GLOBAL_RESOLVER = deterministic
COMMON_KNOWLEDGE_VALIDATOR = blocking
MATH_VALIDATORS = unchanged_and_pass
PUBLIC_CONTEXT_CONTROLS = deployed
HTML_PDF_ACCEPTANCE = pass
FREE_FORM_AI = 0
RUNTIME_WEB_SEARCH = 0
GENERIC_FALLBACK = 0
```

## 8. 目前入口

```text
GOAL_DISTANCE_BEFORE = D1_UNIT_LOCAL_CONTEXT_AUTHORITIES_WITHOUT_GLOBAL_OWNERSHIP
GOAL_DISTANCE_AFTER  = D1_GLOBAL_CONTEXT_PROGRAM_SEQUENCE_LOCKED_PENDING_CI
DISTANCE_REDUCED     = 全域終點、S00–S14 路徑、查證邊界與自動續跑規則已 materialize
REMAINING_BLOCKERS   = S01 through S14 not completed
NEXT_SHORT_STEP      = GCTX-S01_ExistingContextAuthorityInventoryAndMigrationMap
STOP_REASON          = NONE
```

# GCTX-S00 — Global Context Scope, Architecture and Task Sequence Lock

```text
TASK = GCTX-S00_GlobalContextScopeArchitectureAndTaskSequenceLock
STATUS = PASS_ACCEPTED_CI_SYNCED_AND_MERGED
SCOPE = CONTRACT_DOCUMENT_TEST_AND_MARKER_ONLY
RUNTIME_CHANGE = NONE
CURRICULUM_MATH_CHANGE = NONE
NEXT_TASK = GCTX-S01_ExistingContextAuthorityInventoryAndMigrationMap
```

## 1. 問題定義

目前 G4B-U04 擁有單元專屬 SDG 情境庫與時事來源登錄，G5A-U08 也在單元 contract 內保存 SDG context variants。這些內容可作為 seed，但不能繼續由單一單元擁有，因為專案內每個具應用題能力的單元都必須可重用同一套受控情境基礎設施。

現有 G4B-U04 文件已明確定義：

```text
KnowledgePoint
→ PatternSpec
→ 受控語意模板
→ 場所／人物／物件／目的／限制
→ SDG 或一般生活標籤
→ 可驗證題目
```

GCTX 將這個方向提升為全專案權威，但保留每個單元對 PatternSpec、角色、單位流與合理數值範圍的 binding 責任。

## 2. 固定架構

```text
Existing math authority
├─ KnowledgePoint
├─ PatternSpec
├─ generator
└─ math validator
        ↓
Global context authority
├─ context domain registry
├─ SDG goal registry
├─ common knowledge registry
├─ context family registry
├─ source authority registry
└─ lifecycle registry
        ↓
Unit context authority
├─ PatternSpec allowlist
├─ role bindings
├─ unit flow
├─ plausible ranges
├─ forbidden claims
└─ validator hooks
        ↓
Runtime
├─ deterministic resolver
├─ semantic/common-knowledge validator
├─ replay metadata
└─ worksheet renderer
```

全域 registry 管理共享常識與情境家族；單元只管理 binding 與 migration adapter。任何單元不得複製一份新的全域情境權威。

## 3. 領域與年代

第一版固定領域：

```text
daily_life
sdg
natural_science
social_studies
history
```

年代模式：

```text
modern
ancient
mixed_eras
```

`mixed_eras` 是題組分配模式，不表示同一題可以任意混合古今。古代題幹不得出現手機、新臺幣、捷運或「正在實踐 SDG」等錯置；後台可以用現代 theme tag 做索引，但不得把該標籤改寫成歷史事實。

## 4. 常識層級

本專案只需要小學普通常識，不建立專業學科知識庫。

```text
一般常識
→ 准入時至少 1 個可信公開來源

特定物種／地區／朝代／制度
→ 至少 2 個可靠來源交叉確認

精確史實／自然數字／日期／統計
→ 必須有精確 sourceRef
```

正式出題時不得即時上網。網路查證只發生在資料准入與 maintenance 階段，通過後寫入 registry，讓 CI、seed replay 與離線生成可重現。

## 5. 背景常識與練習數字分離

範例：

```text
背景常識：古代商隊會使用車輛或馱獸運送商品。
練習數字：6 輛車、每輛 24 袋。
```

背景常識需要查證；6 與 24 可是為數學設計的虛構練習數字。只有當題目宣稱真實年份、距離、人口或數量時，該數值才必須直接綁定來源。

## 6. 不可破壞的權威

GCTX 任務不得：

- 新增或改寫 KnowledgePoint；
- 為配合情境改變 PatternSpec；
- 改變 operation signature 或 answer model；
- 弱化數學 validator；
- 讓自由 AI 取代 registry；
- 對未綁定 PatternSpec 啟用 generic fallback；
- 在每次生成時即時搜尋網路；
- 把單一單元 PASS 宣稱為全域 PASS。

## 7. 遷移來源

S01 必須逐項盤點並建立遷移圖：

```text
docs/curriculum/context/G4B_U04_SDG_LifeAndCurrentAffairsContextBank.md
docs/curriculum/context/G4B_U04_SDG_CurrentAffairsSourceRegistry.md
data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json
```

S05、S06 遷移時必須保留相容 adapter，先確保現有 production 行為完全相同，再移除單元專屬全域 authority。不得直接刪除舊文件或一次重寫 runtime。

## 8. 任務序列權威

完整 S00–S14 順序由下列文件鎖定：

```text
docs/curriculum/architecture/GCTX_GlobalCrossCurricularContextTaskSequence.md
```

此序列固定由架構、盤點、schema、查證治理、seed、兩個既有單元遷移、全公開單元 coverage、binding、resolver、validator、production population、stress、UI／HTML／PDF，最後到 deployed D0。

## 9. S00 驗收

```text
PASS requires:
- 五個 context domains 鎖定；
- modern／ancient／mixed_eras 鎖定；
- 網路查證只在 admission 發生；
- 小學常識而非專業知識庫；
- 練習數字預設 fictionalized；
- G4B-U04 與 G5A-U08 遷移輸入存在；
- unit binding 與 global registry 的 ownership 分離；
- free-form AI、runtime web search、generic fallback 全部禁止；
- S00–S14 任務順序完整且 nextTask 為 S01。
```

## 10. Completion evidence

```text
PR = #241
MERGE_COMMIT = 3dbf1b51fe37c1c58fa939369627c196e99489b2
TRIGGERED_WORKFLOWS = 19
NODE_TEST = PASS
S42_BRANCH_TEST = PASS
MATH_CI_READBACK = PASS
ALL_TRIGGERED_WORKFLOWS = PASS
```

## 11. Distance

```text
GOAL_DISTANCE_BEFORE = D1_UNIT_LOCAL_CONTEXT_AUTHORITIES_WITHOUT_GLOBAL_OWNERSHIP
GOAL_DISTANCE_AFTER  = D1_GLOBAL_CONTEXT_ARCHITECTURE_AND_TASK_CHAIN_LOCKED
DISTANCE_REDUCED     = 全域 ownership、查證邊界、遷移來源、領域與 S00–S14 路徑已通過 CI 並合併
REMAINING_BLOCKERS   = S01 through S14 not completed
NEXT_SHORT_STEP      = GCTX-S01_ExistingContextAuthorityInventoryAndMigrationMap
STOP_REASON          = NONE
```

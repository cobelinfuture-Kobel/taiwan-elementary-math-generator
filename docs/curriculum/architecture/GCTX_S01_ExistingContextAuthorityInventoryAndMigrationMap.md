# GCTX-S01 — Existing Context Authority Inventory and Migration Map

```text
TASK = GCTX-S01_ExistingContextAuthorityInventoryAndMigrationMap
STATUS = INVENTORY_LOCKED_PENDING_CI
SCOPE = AUDIT_CONTRACT_DOCUMENT_TEST_AND_MARKERS_ONLY
PUBLIC_UNITS = 15
STRUCTURED_OR_PARTIAL_AUTHORITY_UNITS = 5
RUNTIME_CHANGE = NONE
FILE_MIGRATION = NONE
NEXT_TASK = GCTX-S02_GlobalContextSchemaAndRegistryContract
```

## 1. 本輪目的

S00 已鎖定全域情境系統，但最初只明列 G4B-U04 與 G5A-U08。S01 進一步稽核現有 production authority，確認專案至少已有五個單元具有結構化情境、語意模板、taxonomy 或 validator-backed binding：

```text
G3B-U04  32 semantic families / 117 family-context variants
G3B-U08  24 semantic families / 72 context variants
G4B-U04  Class D controlled semantics + SDG context layer + source governance
G5A-U02  22-PatternSpec context taxonomy + 8 Class D semantic runtimes
G5A-U08  10 application template families + daily-life/SDG variants
```

其餘十個公開單元不宣稱「沒有應用題」，只標記為 `requires_s07_application_prompt_audit`。S07 必須檢查其 PatternSpec、內嵌題幹與 generator，才能決定是否需要抽取既有情境或新增 binding。

## 2. 公開單元分類

| 類別 | 單元 | S01 判定 |
|---|---|---|
| Production structured context authority | G3B-U04、G3B-U08、G4B-U04、G5A-U08 | 已有可重播、validator-backed 的結構化情境資產 |
| Production taxonomy and partial semantic authority | G5A-U02 | 已有 22 PatternSpec taxonomy、4 daily-life、2 geometry allowlist 與 8 Class D semantic runtimes |
| Requires S07 application prompt audit | 其餘十個公開單元 | 不對其應用題能力作負面推論；待逐 PatternSpec 稽核 |

## 3. Authority inventory

### 3.1 G3B-U04

目前 authority 被拆在：

```text
g3b-u04-semantic-domain-rows.js
g3b-u04-semantic-role-rows.js
g3b-u04-semantic-scenario-rows.js
g3b-u04-semantic-scenarios.js
g3b-u04-semantic-generator.js
g3b-u04-semantic-validator.js
```

其資料已包含 context domain、角色、scenario、quantity binding、ownership、unit flow、realism profile 與 blocking validator。遷移時：

```text
共享場景／物件／活動／一般常識
→ global registry

PatternSpec allowlist／角色綁定／單位流／validator hooks
→ g3b_u04 unit adapter
```

既有 32-family／117-variant membership、公開 numeric／semantic／hybrid 路徑與 deterministic replay 不得改變。

### 3.2 G3B-U08

核心 authority：

```text
g3b-u08-semantic-context-registry.js
g3b-u08-semantic-realism-policy.js
g3b-u08-semantic-generator.js
g3b-u08-semantic-validator.js
```

registry 已把 `contextDomain`、`sceneLabelZh`、bindings、answerUnit、realismProfile 與 lifecycle 存成明確欄位。遷移時保留全部 24 families、72 variants、horizontal-only 邊界及 44-code blocking behavior。

### 3.3 G4B-U04

G4B-U04 目前同時有三種 ownership：

1. **Class D 數學語意 binding／validator authority**
   - 8 PatternSpecs
   - 9 template families
   - 44 blocking codes
2. **SDG／daily-life shared context content**
   - `G4B_U04_SDG_LifeAndCurrentAffairsContextBank.md`
   - `g4b-u04-controlled-context-variants.js`
3. **本應全域化的 source governance**
   - `G4B_U04_SDG_CurrentAffairsSourceRegistry.md`

第 2、3 類是 P0 ownership blocker。Class D 數學 binding 留在單元 adapter；共享情境與 source governance 上移至 global registries。

### 3.4 G5A-U02

`g5a-u02-context-taxonomy.js` 將 22 PatternSpecs 分成：

```text
abstract_math
daily_life
geometry_context
```

其中 4 個 daily-life、2 個 geometry，其餘為 abstract math。現況明確禁止 SDG、context rewriting、generic fallback 與 free-form AI。

此外 `src/curriculum/g5a-u02/class-d-semantic-generator-validator.js` 已承載 8 個 Class D deterministic semantic runtimes。兩者都應成為 unit binding／validator adapter，不應被誤當成全域常識 owner。

### 3.5 G5A-U08

`S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json` 已把 10 個 application template families 的下列欄位結構化：

```text
operationSignature
roleBindings
unitFlow
requiredFacts
forbiddenFacts
naturalLanguageConstraints
answerUnit
contextVariants
```

其 daily-life／SDG context content 可抽入 global registry；operation、roles、unit flow 與 validator 規則仍由 G5A-U08 adapter 擁有。既有 8 個 SDG goal coverage、50/50 default mix 與 deterministic allocation 必須保持相容。

## 4. Shared consumer，不是 content owner

`site/modules/curriculum/registry/public-control-profiles.js` 已共用部分 UI profile，但它只管理：

```text
supported options
default values
partial support
invalid-value normalization
```

它不能成為全域 context content authority。S09、S13 才會把它改接 global context control adapter；在此之前必須保留 G5A-U02、G5A-U08 現有 query-state 行為。

## 5. 固定遷移順序

### P0 — ownership blocker

```text
G4B-U04 SDG context bank
G4B-U04 current-affairs source registry
```

原因：共享 SDG／常識與來源治理目前仍掛在單元路徑下。

### P1 — production structured banks

```text
G3B-U04 semantic context authority
G3B-U08 semantic context authority
G4B-U04 Class D binding/validator authority
G5A-U08 application/SDG context authority
```

原因：這些資產已在 production 使用，必須先設計 zero-drift adapter。

### P2 — partial taxonomy and consumers

```text
G5A-U02 context taxonomy
G5A-U02 Class D semantic authority
shared public context control profiles
```

原因：它們依賴 global schema，但不應擁有共享常識內容。

### P3 — remaining public units

```text
S07 對其餘十個公開單元進行逐 PatternSpec／generator／prompt audit
```

不得在 S01 根據檔名或 UI 缺少 context selector，就推論該單元沒有應用題。

## 6. 遷移不變條件

```text
existing IDs remain replay-compatible
existing seed results remain deterministic
existing context modes remain query-compatible
existing PatternSpec allowlists remain unit-owned
existing unit flow remains unit-owned
existing validator failures remain blocking
math authority remains unchanged
free-form AI remains forbidden
generic fallback remains forbidden
runtime web search remains forbidden
```

S01 不刪除、不搬移、不重寫任何既有 authority。S02 先定義 global schema；S05、S06 再對 G4B-U04、G5A-U08 實作 migration adapters。G3B-U04、G3B-U08 與 G5A-U02 的正式接入由 S08–S11 根據 coverage contract 執行。

## 7. 已識別風險

- 不同單元的 context ID namespace 可能碰撞；
- 部分 generator 直接 render prompt，content 與 binding 尚未分離；
- validator payload shape 各單元不同；
- UI context values 尚未統一；
- source governance 位於 G4B-U04 路徑；
- taxonomy 可能只有分類，沒有可重用 context family；
- 其餘十個單元的內嵌應用題尚未盤點；
- 遷移不得破壞 deterministic seed、query replay 與 public selector。

## 8. S01 Acceptance

```text
PASS requires:
- 15 public units exactly match public source registry;
- exactly 5 units are classified as existing structured/partial authorities;
- remaining 10 units are deferred to S07 without negative inference;
- every inventoried authority and consumer path exists;
- authority IDs and primary ownership paths are unique;
- P0 through P3 migration order is closed;
- no runtime or existing authority file is modified;
- next task is GCTX-S02_GlobalContextSchemaAndRegistryContract.
```

## 9. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_CONTEXT_ARCHITECTURE_LOCKED_WITH_INCOMPLETE_EXISTING_ASSET_MAP
GOAL_DISTANCE_AFTER  = D1_EXISTING_CONTEXT_AUTHORITIES_AND_MIGRATION_ORDER_LOCKED_PENDING_CI
DISTANCE_REDUCED     = 5-unit structured authority inventory, 10-unit S07 audit boundary, ownership classes, consumers, risks and P0-P3 migration order materialized
REMAINING_BLOCKERS   = S02 through S14 not completed
NEXT_SHORT_STEP      = GCTX-S02_GlobalContextSchemaAndRegistryContract
STOP_REASON          = NONE
```

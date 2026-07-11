# S58A G3B-U08 Approved KP and Semantic Template Contract

## Milestone

```text
TASK = S58A_G3B_U08_ApprovedKnowledgePointAndSemanticTemplateContract
SOURCE_ID = g3b_u08_3b08
UNIT = 3B-U08 乘法與除法
MODE = planning_contract_only
IMPLEMENTATION = forbidden_in_this_milestone
```

本里程碑依使用者核准，將 G3B-U08 收斂為 **6 個公開應用題 KnowledgePoints**，並固定 **horizontal-only** 邊界。此階段只建立 mapping、semantic-family contract 與一致性測試；不修改 generator、validator、selector、worksheet、renderer 或公開 UI。

## Source readback

來源為 `題型總覽-3b08-乘法與除法.pdf`，共 2 頁：

- 第 1 頁：乘除互逆、乘法交換律、未知數、整除與有餘數驗算。只作 hidden support reasoning，不升格為公開 KP，也不產生直式題。
- 第 2 頁：總量、包含除、等分除、倍數反推、購物估算與同價方案比較。這一頁是公開應用題 KP 的主要來源。
- PDF 頁首顯示 `https://meow911.com/3b07/`，但檔名與專案 sourceId 為 `3b08`；只記錄 discrepancy，不自行改寫 source identity。

## Prior Batch A boundary

### Multiplication

可計算：

```text
1d × 1d
2d × 1d
3d × 1d
```

不可當成待算題：

```text
2d × 2d
3d × 2d
multi-digit × multi-digit
```

PDF 的 `57 × 59 = 3363` 只能作已知關係，再做橫式互逆推理。

### Division

可計算：

```text
2d ÷ 1d，整除
3d ÷ 1d，整除
```

有餘數只作 hidden horizontal verification support，不新增公開餘數應用。

禁止：

```text
2-digit divisor
decimal quotient
fraction quotient
4-digit long division
```

### G3B-U04 overlap guard

G3B-U04 已完成一般兩步驟混合應用題。G3B-U08 不重做「先乘再除、先加再除、先減再除」等家族，只聚焦：

```text
辨認未知量角色
→ 選擇乘法或除法
→ 一步乘除應用
→ 簡單估算
→ 相同價格方案比較
```

## Approved public KnowledgePoints

| # | KnowledgePoint | 核心關係 |
|---|---|---|
| 1 | 已知每組量與組數，求總量 | `a × b` |
| 2 | 已知總量與每組量，求組數 | `a ÷ b` |
| 3 | 已知總量與組數，求每組量 | `a ÷ b` |
| 4 | 已知比較量與倍數，反求基準量 | `a ÷ b` |
| 5 | 購物估算：判斷夠不夠、多或少 | 整百估算／基準修正 |
| 6 | 相同價格下比較哪個方案較划算 | `a × b` 與 `c × d` 比較 |

公開純數字練習 KP：`0`。

## Horizontal-only contract

```text
representation = horizontal_only
vertical_multiplication = forbidden
vertical_division = forbidden
long_division = forbidden
vertical_missing_digit = forbidden
column_algorithm_grid = forbidden
```

允許：

```text
a × b = □
□ × b = c
a ÷ b = □
□ ÷ b = c
a ÷ □ = c
a = b × q
a = b × q + r
```

答案呈現：

```text
算式：135 ÷ 9 = 15
答案：15條
```

## Hidden support reasoning

以下不是公開 KP：

1. 依未知量角色選擇乘法或除法。
2. 乘除互逆，只用橫式；二位數乘二位數只可作已知算式。
3. 整除／有餘數驗算，只用 `被除數＝除數×商` 或 `被除數＝除數×商＋餘數`。
4. 乘法交換律只用於未知因數理解；禁止暗示除法可交換。

## Semantic family allocation

共 **24 個 candidate families**，每個 KP 4 個；後續 materialization 最低規劃每 family 3 個 context variants，共至少 72 variants。

### KP1 求總量

1. 每日等量存款累積
2. 每次成功固定得分累積
3. 每件作品固定耗材總量
4. 每包固定數量乘包數

### KP2 求組數

1. 總分反推成功次數
2. 總材料反推作品數
3. 總長度反推段數
4. 總物品數反推包數

### KP3 求每組量

1. 總存款平均到每天
2. 總物品平均分給人
3. 總容量平均裝入容器
4. 總長度平均分成若干段

### KP4 反求基準量

1. 價格倍數反推基準價格
2. 數量倍數反推基準數量
3. 長度倍數反推基準長度
4. 容量倍數反推基準容量

### KP5 購物估算

1. 單價取整百估總價
2. 向上估算判斷預算是否足夠
3. 以整百基準補回差額，求多多少
4. 以整百基準扣回差額，求少多少

### KP6 同價方案比較

1. 同價比較總重量
2. 同價比較總容量
3. 同價比較總數量
4. 同價比較總長度

其中：

```text
direct-source families = 13
controlled structural extensions = 11
vertical families = 0
general two-step families = 0
```

## Family distinction rule

不同 family 必須至少在以下一項不同：

- event causality 或 unknown role
- quantity-role binding 或 unit flow
- 學生需要做的 semantic decision

只換姓名、物品、數字或表面字詞，不算新 family。

## Validator directions for later milestones

後續 PatternSpec／validator 必須 blocking：

- 除數超過一位數
- 二位數乘二位數被當成待算題
- 非整除結果進入公開除法應用題
- vertical / long-division representation
- participant scope 不清
- 每組量、組數與總量角色混淆
- 倍數比較中的基準量／比較量混淆
- 估算方向不能支持「夠不夠」判斷
- 同價比較沒有明確寫出總價相同
- 同價比較出現相同總量而沒有唯一答案
- 單位、量詞或 measure dimension 不一致
- 估算題引入百分率、小數或正式上下界術語
- 一般兩步驟 mixed-operation family 洩漏

## Supersession policy

歷史檔案：

```text
data/curriculum/registry/unit_expansions/S43E7_G3B_U08_KPExpansion.json
```

保留不修改。其 11 個 candidate rows 不再是後續設計 authority。S58 mapping 是目前核准的 planning authority：

```text
6 public application KPs
4 hidden support rules
24 candidate semantic families
horizontal-only
```

## Acceptance boundary

本里程碑通過只代表：

- 來源與先修能力邊界已對齊。
- 6 KP 已核准。
- 24 families 已展開成可審查 contract。
- horizontal-only 與 no-overreach guard 已固定。

不代表 PatternSpec、generator、validator、selector、worksheet、HTML 或 PDF 已實作或 promotion。

## Distance

```text
GOAL_DISTANCE_BEFORE = D3_G3B_U08_PRIOR_BATCH_A_BOUNDARY_ALIGNED_6_APPLICATION_KP_CANDIDATES_READY
GOAL_DISTANCE_AFTER  = D3_G3B_U08_6_KP_APPROVED_24_FAMILY_CONTRACT_READY_FOR_PATTERNSPEC_DESIGN
DISTANCE_REDUCED     = fixed the public KP boundary, horizontal-only representation, prior Batch A operand limits, and a 24-family semantic contract without entering implementation
REMAINING_BLOCKERS   = [
  "24 family contract requires operator readback/acceptance before PatternSpec materialization",
  "PatternSpec and answer-model contracts are not yet designed",
  "semantic validator codes are not yet materialized",
  "generator, selector, worksheet, and renderer remain unchanged",
  "3b08 filename versus 3b07 page-header URL remains a recorded source metadata discrepancy"
]
NEXT_SHORTEST_STEP   = S58B_G3B_U08_PatternSpecAndSemanticValidatorDesignScan
```

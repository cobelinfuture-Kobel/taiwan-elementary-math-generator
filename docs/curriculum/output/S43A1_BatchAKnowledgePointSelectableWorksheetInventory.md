# S43A1 Batch A KnowledgePoint Selectable Worksheet Inventory

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43A1_BatchAKnowledgePointSelectableWorksheetInventory
TASK_STATUS = INVENTORY
WRITE_TYPE = docs_only
```

S43 target is to move Batch A from source-unit selectable worksheet output to KnowledgePoint-selectable worksheet output.

S43A1 does not implement UI, generator, validator, or renderer changes. It inventories the current state and the missing layers required for later implementation.

## Scope Lock

```text
IN_SCOPE = [
  "Batch A 13 source units",
  "current sourceId to PatternSpec coverage",
  "expected KnowledgePoint coverage estimate",
  "missing PatternGroup status",
  "missing PatternSpec status",
  "missing HTML selectable status",
  "prototype unit decision"
]

OUT_OF_SCOPE = [
  "Batch B/C/D/E",
  "decimal/fraction/geometry/chart production",
  "AI literacy fusion",
  "wrong-answer notebook",
  "student accounts",
  "cloud records",
  "UI implementation",
  "generator implementation",
  "validator implementation"
]
```

## Source Readback

Batch A has 13 source units in the stable main browser registry.

Current browser path is source-unit selectable, not KnowledgePoint selectable.

Current sourceId to PatternSpec coverage is minimal/coarse:

```text
currentPatternSpecTotal = 14
sourceUnits = 13
sourceUnitWithTwoPatterns = g3a_u02_3a02
sourceUnitsWithOnePattern = 12
```

Repository search found no existing stable registry files for:

```text
batch_a_knowledge_points
batch_a_pattern_groups
batch_a_knowledge_point_pattern_map
```

Therefore KnowledgePoint selectable worksheet status is not implemented yet.

## Inventory Matrix

| sourceId | unit | domain | current PatternSpec count | current HTML selectable level | expected KP estimate | missing PatternGroup | missing fine PatternSpec | missing KP HTML selectable | priority |
|---|---|---|---:|---|---:|---|---|---|---|
| g3a_u01_3a01 | 3A-U01 10000以內的數 | number_sense | 1 | source_unit_only | 17 | yes | yes | yes | P1 |
| g3a_u02_3a02 | 3A-U02 四位數的加減 | integer_expression | 2 | source_unit_only | 9 | yes | yes | yes | P0 prototype |
| g3a_u03_3a03 | 3A-U03 乘法 | integer_expression | 1 | source_unit_only | 9 | yes | yes | yes | P1 |
| g3a_u06_3a06 | 3A-U06 二位數除以一位數 | integer_expression | 1 | source_unit_only | 14 | yes | yes | yes | P1 |
| g3b_u01_3b01 | 3B-U01 除法 | integer_expression | 1 | source_unit_only | 20 | yes | yes | yes | P1 |
| g3b_u04_3b04 | 3B-U04 兩步驟計算 | integer_expression | 1 | source_unit_only | 12 | yes | yes | yes | P1 |
| g3b_u08_3b08 | 3B-U08 乘法與除法 | integer_expression | 1 | source_unit_only | 17 | yes | yes | yes | P1 |
| g4a_u01_4a01 | 4A-U01 1億以內的數 | number_sense | 1 | source_unit_only | 17 | yes | yes | yes | P1 |
| g4a_u02_4a02 | 4A-U02 整數的乘法 | integer_expression | 1 | source_unit_only | 9 | yes | yes | yes | P1 |
| g4a_u04_4a04 | 4A-U04 整數的除法 | integer_expression | 1 | source_unit_only | 9 | yes | yes | yes | P1 |
| g4a_u08_4a08 | 4A-U08 整數四則 | integer_mixed_operations | 1 | source_unit_only | 14 | yes | yes | yes | P1 |
| g4b_u01_4b01 | 4B-U01 多位數的乘與除 | integer_expression | 1 | source_unit_only | 11 | yes | yes | yes | P1 |
| g5a_u08_5a08 | 5A-U08 整數四則 | integer_mixed_operations | 1 | source_unit_only | 14 | yes | yes | yes | P1 |

## Expected KnowledgePoint Coverage Notes

### g3a_u01_3a01

Expected KP examples:

```text
10進位表
數字寫成中文
中文寫成數字
錢幣表示
位值填空
未知位數推理
四位數最大最小
數線畫法
數線加法
數線減法
四位數位值分解
四位數位值組合
四位數讀寫
兩數間規律
四位數錢幣換算
四位數比大小
整數數線
```

### g3a_u02_3a02

Expected KP examples:

```text
四位數加法多次進位
四位數減法多次退位
四位數減法連續退位
整千估算
加減應用題估算
直式加法缺位填空
直式減法缺位填空
四位數減法中間缺位
連續退位中間有 0 的處理
```

### g3a_u03_3a03

Expected KP examples:

```text
10 的倍數乘一位數
10 進位乘法原理
二位數乘一位數直接進位
三位數乘一位數
三位數乘一位數有缺位
兩步驟連續乘法
二位數整十估算再乘
三位數整百估算再乘
乘法直式缺位推理
```

### g3a_u06_3a06

Expected KP examples:

```text
用乘法估商
直式除法計算方法
哪些數字可以整除
有餘數除法
除法直式缺位填空
0 與 1 的除法
奇偶數判斷
數線範圍推理偶數
除法語言轉換
包含除與等分除
除法可以寫成分數
答案單位變化
除法應用題
餘數情境判斷
```

### g3b_u01_3b01

Expected KP examples:

```text
估商方式
商寫在個位 / 商寫在十位
餘數必須小於除數
等分除
包含除
2 位數除以 1 位數最高位不夠除退位
2 位數個位不夠除
最高位沒有餘數 / 個位小於除數 / 個位等於除數
3 位數除以 1 位數最高位不夠除退位
3 位數十位不夠除
3 位數個位不夠除
十位個位都不夠除
商要補 0
被除數中間有 0 / 缺位
等分、包含、餘數單位轉換
除法估算
先除再加
先加再除
先除再減
先減再除
```

### g3b_u04_3b04

Expected KP examples:

```text
先加再除
先減再除
先除再加
先除再減
連續乘法
倍數問題
線段圖輔助兩步驟應用題
平均分後再加減
分裝後再加減
乘法情境
倍數關係鏈
多層倍數推理
```

### g3b_u08_3b08

Expected KP examples:

```text
加減互逆 / 移項法則
加法交換律
用互逆解未知數
乘除互逆 / 乘除法移項
乘法交換律
用乘除互逆解直式未知數
乘除互逆免計算題型
除法驗算無餘數
除法驗算有餘數
單價、單位量、每單位問題
平均分 / 每份量
等分與包含應用
被除數未知
除法列式
估算購物問題
比較划算問題
```

### g4a_u01_4a01

Expected KP examples:

```text
10萬以內的10進位表
10萬以內數的分解
10萬以內數的合成
10萬以內數的讀法
1億以內10進位表
3位分節法
4位分節法
1億以內數的讀寫
1億以內數比大小
用指定數字組合五位數
未知數位下的最大最小
大數直式計算
中間有0的讀寫
兩數間規律
大數加減
八位數分解組合
八位數比大小
```

### g4a_u02_4a02

Expected KP examples:

```text
三位數 × 一位數複習
乘法的 10 進位原理
10 的倍數乘法
四位數 × 一位數有缺位
一位數 × 二位數
一位數 × 三位數
10 的倍數 × 10 的倍數
二位數 × 二位數
乘法直式位值排列
```

### g4a_u04_4a04

Expected KP examples:

```text
除法學習歷程整理
四位數 ÷ 一位數：千位夠除
四位數 ÷ 一位數：千位不夠除
四位數 ÷ 一位數：千位整除
二位數 ÷ 二位數
除數是 10 的倍數
餘數不能大於除數
除法估商
三位數 ÷ 二位數
```

### g4a_u08_4a08

Expected KP examples:

```text
加減符號與數字位置
移動數字使容易計算
減號可移到最前面
加減混合由左到右
有括號先算
連續減法可用括號合併
乘除混合的交換與結合
加減法碰到乘法 / 除法的優先順序
括號與四則運算順序
兩步驟應用題
先乘再除
先除再乘
先乘除後加減
```

### g4b_u01_4b01

Expected KP examples:

```text
幾位數相乘，乘積有幾排
三位數 × 三位數
四位數 × 三位數
乘數中間有 0
乘數尾巴有 0
被乘數尾巴有 0
被乘數與乘數尾巴都有 0
三位數 ÷ 三位數
四位數 ÷ 三位數不退位
四位數 ÷ 三位數退位
乘除直式位值對齊
```

### g5a_u08_5a08

Expected KP examples:

```text
整數四則混合計算
加減法混合結合律
加減乘除混合
兩組乘法相同乘數再相加
兩組乘法相同乘數再相減
分配律反向還原
連續除法
連續減法
交換律 + 結合律
兩組乘法相加 / 相減的分配律應用題
分配律簡化計算
大數加減用分配律或拆解策略簡化
購物折價與找錢四則應用題
平均分裝後再加減應用題
```

## Gap Classification

```text
sourceUnitCoverage = 13 / 13
manualVisualSourceCoverage = 13 / 13
currentPatternSpecCoverage = 14 coarse patterns
knowledgePointRegistry = missing
patternGroupRegistry = missing
knowledgePointPatternMap = missing
htmlKnowledgePointSelector = missing
perKnowledgePointPrintableQA = missing
```

All 13 source units have source-level worksheet availability from S42, but none has KnowledgePoint-level selectable worksheet support yet.

## Prototype Decision

```text
FIRST_PROTOTYPE_UNIT = g3a_u02_3a02
REASON = has two existing coarse PatternSpecs but clear missing fine-grained KnowledgePoint structure; best validates source unit -> KP -> PatternGroup -> PatternSpec -> printable HTML path
```

## S43A1 Gate

```text
S43A1_GATE = PASS_WITH_GAPS_IDENTIFIED

PASS:
- 13 / 13 source units inventoried
- current PatternSpec count known
- expected KnowledgePoint coverage estimate drafted
- printable gap status classified
- first prototype unit selected

GAPS:
- no KnowledgePointNode registry yet
- no PatternGroup registry yet
- no KnowledgePoint to PatternSpec map yet
- no HTML KnowledgePoint selector yet
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43A2_CurrentSourceToPatternSpecCoverageReadback
```

S43A2 should formalize the current sourceId to PatternSpec coverage matrix and confirm which current PatternSpecs can be reused as existing PatternGroups versus which require new fine-grained PatternSpecs.

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_TASK_GROUPED_AND_SEQUENCE_CONTROLLED
GOAL_DISTANCE_AFTER  = D3_INVENTORY_DONE_WITH_KP_PRINTABLE_GAPS_IDENTIFIED
DISTANCE_REDUCED     = S43 now has a 13-unit inventory baseline and explicit KP-selectable worksheet gaps

SourceUnitCoverage        100% -> 100%
CurrentPatternReadback      0% -> 100%
ExpectedKPDraft             0% -> 60%
PatternGroupRegistry        0% ->   0%
KPHTMLSelectablePath        0% ->   0%
S43Overall                 5% ->  12%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "KnowledgePointNode schema 尚未鎖定",
  "PatternGroup schema 尚未鎖定",
  "KnowledgePointPatternMap schema 尚未鎖定",
  "13 單元 KnowledgePoint registry 尚未 materialize",
  "現有 PatternSpec 是否可 reuse 為 PatternGroup 尚未逐一判定",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

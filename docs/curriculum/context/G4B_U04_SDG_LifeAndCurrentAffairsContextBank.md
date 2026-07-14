# G4B-U04 SDG 生活與時事情境庫

```text
TASK = G4B_U04_SDG_LifeAndCurrentAffairsContextBank
STATUS = CONTEXT_BANK_LOCKED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
UNIT = 4B-U04 概數
SCOPE = DOCUMENT_AND_CONTEXT_DESIGN_ONLY
PARENT_DESIGN = G4B_U04_R2_SemanticDedupLayoutAndSDGDesignLock
TARGET_STAGE = G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode
```

## 1. 目的

本文件把 G4B-U04 的 SDG 情境從少量「回收、節水、植樹」例句，擴充成可長期維護的生活與時事情境庫。

目標不是把題目改成宣導文案，而是讓作題者在練習概數、估算、無條件捨去、無條件進入與四捨五入時，可以看到更多真實生活場所、公共服務、家庭活動、校園活動、交通移動與環境行動。

```text
數學 KnowledgePoint
→ PatternSpec
→ 受控語意模板
→ 場所／人物／物件／目的／限制
→ SDG 或一般生活標籤
→ 可驗證題目
```

SDG 仍是情境維度，不是 KnowledgePoint，也不增加平行的數學能力階層。

## 2. 情境細膩度原則

每一題至少要具備下列三層，不得只替換名詞。

### 2.1 場景層：在哪裡

```text
學校雨水回收槽
社區活動中心
捷運轉乘站
傳統市場
公園自行車站
河川巡守站
圖書館交換書區
農產品集貨場
```

### 2.2 活動層：正在做什麼

```text
整理回收物
分配省水設備
統計搭車人數
準備活動物資
收集二手書
分裝農產品
安排接駁車次
估計一週節電量
```

### 2.3 決策層：為什麼要算

```text
最多可以裝滿幾箱
最少需要幾個桶子
大約共有多少
大約相差多少
多週累積約多少
平均分給每班約多少
至少應準備多少金額
至少需要幾張鈔票
```

合格情境必須讓學生看得出「誰在什麼地方，為了什麼決定而估算」。

## 3. 情境資料欄位

後續 materialization 時，每個情境必須有完整 metadata。

```text
contextFamilyId
contextVersion
sdgGoal
sdgTargetHint
contextMode                = daily_life | sdg
placeDomain
placeId
placeLabel
actorRole
activityGoal
objectNoun
classifier
quantityUnit
answerUnit
plausibleRange
patternGroupAllowlist
patternSpecAllowlist
timeAnchorType              = evergreen | seasonal | observance | current_affairs
currentAffairsAnchorId
sourceAuthorityTier
sourceRef
sourceReviewedAt
validFrom
validUntil
fictionalExerciseData       = true
studentFacingSdgLabel       = hidden | optional
politicalContent            = forbidden
freeFormAI                  = forbidden
genericFallback             = forbidden
```

`sourceRef` 用來確認主題存在，不表示題目數字是真實統計。除非另有資料題專案，學生題面的所有數量均為虛構練習數據。

## 4. SDG 啟用範圍

### 4.1 R2E 可直接 materialize

```text
SDG 6  淨水、供水、節約用水、雨水利用
SDG 7  節約能源、再生能源、校園與社區用電
SDG 11 大眾運輸、步行、自行車、社區設施、韌性場所
SDG 12 回收、重複使用、維修、包裝減量、惜食
SDG 13 節能減碳活動、氣候調適、校園降溫與防災準備
SDG 15 森林、濕地、棲地、植樹與陸域生態復育
```

### 4.2 後續候選，不在本輪 runtime scope

```text
SDG 2  在地農產、校園午餐、惜食
SDG 3  步行、運動與社區健康活動；不得出現醫療效果宣稱
SDG 4  圖書、學習用品與教育資源共享
SDG 14 海岸、海洋廢棄物、漁港與潮間帶；須另建海洋單位與語意 validator
SDG 17 跨校、社區與公私協力活動；不得出現商業宣傳
```

候選目標可以先存在情境庫，但在 PatternSpec、單位流與 validator 未核准前，不得進入 production generator。

## 5. 場所分類庫

本庫定義 16 個場所領域、至少 96 個場所變體。後續生成器不得只在「學校、商店、公園」三種場所重複換皮。

### 5.1 家庭與住宅

```text
廚房
浴室
陽台
屋頂曬衣區
公寓資源回收室
社區雨水收集槽
家庭儲藏室
住宅公共照明區
```

可用活動：節水、分類回收、重複使用容器、家庭用電、整理舊衣與二手物品。

### 5.2 校園教學空間

```text
教室
自然教室
圖書館
視聽教室
電腦教室
美術教室
校史室
閱讀角
```

可用活動：書籍整理、紙張回收、設備節電、學習用品分配、班級共同任務。

### 5.3 校園公共設施

```text
禮堂
操場
體育館
午餐廚房
合作社
健康中心外部物資區
校園回收站
屋頂太陽能區
雨水回收花園
校門接送區
```

不得把數萬個座位寫成教室情境；大量座位只能使用禮堂、體育館、展演場館或大型場站。

### 5.4 社區生活

```text
里民活動中心
社區花園
公共洗衣區
社區共享櫃
社區修繕站
社區回收站
公寓管理室
社區防災物資站
```

可用活動：物資分裝、共享用品、植栽照顧、活動人數、回收與修繕。

### 5.5 圖書與文化場所

```text
公共圖書館
行動圖書車
文化中心
地方故事館
博物館教育區
二手書交換站
展覽館
社區閱讀站
```

可用活動：書籍上架、借閱估計、交換書箱、參觀人數與活動材料。

### 5.6 運動與休閒

```text
公園
運動中心
游泳池
河濱球場
登山步道入口
露營區
自行車休息站
兒童遊戲場
```

可用活動：飲水補給、接駁、活動人數、器材分組、照明節能。

### 5.7 市場與零售

```text
傳統市場
超級市場
便利商店
麵包店
農夫市集
無包裝商店
飲料杯歸還站
二手商店
```

可用活動：包裝箱、惜食、重複使用杯盒、貨品分裝與付款估算。

不得出現品牌名稱、價格促銷宣傳或暗示特定商品優劣。

### 5.8 餐飲與食品服務

```text
學校午餐廚房
社區共餐站
餐廳備料區
市場熟食區
食品銀行整理區
冷藏倉庫
中央廚房
活動餐點領取區
```

可用活動：食材箱、餐盒、剩食減量、平均分配與運送批次。

### 5.9 郵務、物流與包裝

```text
郵局
包裹收取站
物流轉運站
網購包裝區
生鮮配送站
校園收發室
回收包材整理區
貨運集散場
```

可用活動：紙箱、循環箱、包裹批次、車次、裝載與包材減量。

### 5.10 大眾運輸與移動

```text
公車站
公車轉運站
捷運站
火車站
輕軌站
公共自行車站
渡輪碼頭
步行上學集合點
接駁車停靠區
停車轉乘場
```

可用活動：乘客估計、班次、車次、車架、轉乘人數與步行隊伍。

### 5.11 水資源設施

```text
水庫參訪區
淨水場教育區
雨水回收槽
滯洪池
河川巡守站
灌溉渠道
社區飲水站
校園省水設備區
再生水展示區
水資源教育館
```

可用活動：儲水桶、節水量、巡查區段、分配與重複使用水量。

不得以未核實的水庫即時蓄水率或缺水數字作為題目事實。

### 5.12 能源與建築

```text
校園屋頂太陽能區
社區太陽能棚架
節能教室
綠建築展示館
風力發電參訪區
公共充電站
運動中心照明區
圖書館空調分區
能源教育館
社區公共照明區
```

可用活動：每日發電練習量、節電量、燈具數、使用時段與設備分區。

題目不得宣稱特定設備實際發電量或節能效果，除非有 sourceRef 且採資料題模式。

### 5.13 資源循環與維修

```text
資源回收場
家電回收站
舊衣回收站
修理咖啡館
家具修繕中心
循環杯清洗站
二手玩具交換站
堆肥站
回收分類教育區
再生材料展示區
```

可用活動：分類箱、回收袋、修復件數、可重複使用容器與運送批次。

### 5.14 農業、林業與地方生產

```text
稻田
果園
溫室
苗圃
農產品集貨場
茶園
竹林
社區菜園
種苗中心
農產包裝站
```

可用活動：苗木、果箱、灌溉桶、採收籃、配送批次與種植區分配。

### 5.15 河川、濕地、森林與棲地

```text
河川公園
濕地教育區
森林步道
生態池
野生動物救傷站外部物資區
棲地復育區
護岸植栽區
國家公園遊客中心
賞鳥平台
林間苗木站
```

可用活動：苗木、告示牌、棲地箱、巡查區段、清理袋與參訪人數。

不得描述動物受傷細節，不得使用恐懼式氣候或災害語言。

### 5.16 活動、展演與公共事件

```text
校慶
運動會
科學展覽
閱讀節
環境教育週
地方文化節
社區清潔日
自行車活動
植樹活動
防災演練
```

可用活動：參與人數、補給品、接駁車、活動手冊、回收容器與分組材料。

## 6. 時事錨點制度

「時事相關」不等於直接複製新聞數字。情境庫使用主題錨點，把近期公共議題轉成兒童可理解、可驗證、無政治立場的數學場景。

### 6.1 `evergreen`

長期有效，不依特定日期。

```text
家庭節水
校園回收
公共運輸
圖書共享
二手修繕
社區植栽
```

### 6.2 `seasonal`

跟台灣季節與學校生活相關，但不聲稱每年狀況相同。

```text
春季植樹與苗木整理
梅雨季前排水與滯洪池巡查
夏季節電與公共飲水補給
颱風季前防災物資整理
秋季步道與社區環境整理
冬季舊衣與二手用品交換
```

### 6.3 `observance`

以國際或國內公共教育日為靈感。學生題面不必印出節日名稱。

```text
世界水日型：節水、飲水站、雨水利用
地球日型：校園回收、社區清潔、步行與節能
世界環境日型：循環杯、修繕、資源分類
森林與植樹主題：苗木、棲地、森林步道
自行車主題：公共自行車、車架、騎乘活動與接駁
```

### 6.4 `current_affairs`

來源可以是政府機關、地方政府、公用事業、公共運輸單位或學校公告。

可使用的主題型態：

```text
新的回收分類或循環使用倡議
新的公車、捷運、自行車公共服務
校園太陽能、節能或雨水回收設施
地方河川、濕地、步道或公園整理活動
地方防災、滯洪與韌性設施教育
大型活動的接駁、回收與物資安排
```

禁止直接使用：

```text
政黨或候選人
選舉議題
戰爭、傷亡或重大災難細節
爭議性政策評價
未證實社群貼文
即時水情、電價或災情數字
品牌促銷與企業置入
```

## 7. 時事來源治理

### 7.1 Source Tier A

```text
聯合國 SDG 官方網站
中央政府部會與所屬機關
國家統計與公開資料平台
```

### 7.2 Source Tier B

```text
縣市政府
公用事業
公共運輸營運單位
國家公園、博物館與公共圖書館
```

### 7.3 Source Tier C

```text
學校公告
公共教育活動公告
具明確主辦單位的社區活動
```

### 7.4 Source Tier D

新聞媒體只能用來發現主題，不得單獨作為數值或政策事實 authority。找到主題後，必須回到 Tier A～C 來源確認。

### 7.5 有效期間

```text
observance       = 每年重新確認主題，但場所模板可持續使用
seasonal         = 每學期檢查一次
current_affairs  = 必須設定 validFrom / validUntil
policy_service   = 每 90 天或實作前重新確認
```

過期時事情境可以降級為 `evergreen_fictionalized`，但必須移除年份、政策名稱與特定事件名稱。

## 8. 數學題型對應：48 個情境家族候選

以下是情境家族，不是單純名詞替換。每個家族都必須有不同的角色關係、決策目的或單位流。

### 8.1 最多完整組數：無條件捨去

```text
1. 回收站把寶特瓶每 100 個綁成一組，最多完成幾組
2. 圖書館把交換書每 50 本裝成一箱，最多裝滿幾箱
3. 苗圃把樹苗每 20 株排成一區，最多完成幾區
4. 循環杯站每 40 個杯子裝一籃，最多裝滿幾籃
5. 農產集貨場每 100 顆水果裝一箱，最多裝滿幾箱
6. 防災物資站每 10 組用品裝一袋，最多完成幾袋
```

### 8.2 全部裝完最少容器／車次：無條件進入

```text
7. 校園回收紙每箱可裝固定重量，最少需要幾箱
8. 雨水教育活動每桶可裝固定容量，最少需要幾桶
9. 植樹活動每車可載固定株數，最少需要幾車
10. 社區活動每輛接駁車可坐固定人數，最少需要幾車
11. 包裹站每個循環箱可裝固定件數，最少需要幾箱
12. 公共自行車站每排可停固定輛數，最少需要幾排
```

### 8.3 付款金額：面額無條件進入

```text
13. 購買班級重複使用餐盒，只有 100 元鈔票，至少付多少
14. 購買雨水桶配件，只有 1,000 元鈔票，至少付多少
15. 購買圖書修補材料，只有 100 元鈔票，至少付多少
16. 準備植樹活動手套，只有 1,000 元鈔票，至少付多少
17. 購買公共自行車活動補給品，只有 100 元鈔票，至少付多少
18. 購買社區回收分類標示，只有 1,000 元鈔票，至少付多少
```

### 8.4 付款張數：面額無條件進入

```text
19. 校園節能燈具費用至少需要幾張鈔票
20. 社區修繕材料費至少需要幾張鈔票
21. 圖書交換活動紙箱費至少需要幾張鈔票
22. 河川巡守用品費至少需要幾張鈔票
23. 植栽維護用品費至少需要幾張鈔票
24. 循環杯清洗用品費至少需要幾張鈔票
```

### 8.5 分別取概數後相加

```text
25. 兩所學校回收的紙張約共有多少
26. 兩個公共自行車站的借還次數約共有多少
27. 兩個社區飲水站的補充水量約共有多少
28. 兩個圖書館的借閱人次約共有多少
29. 兩個植樹區的苗木約共有多少
30. 兩個市場減少使用的包裝袋約共有多少
```

### 8.6 分別取概數後相減

```text
31. 兩個社區回收量約相差多少
32. 兩條公車路線搭乘人次約相差多少
33. 兩所學校節電量約相差多少
34. 兩個雨水槽收集量約相差多少
35. 兩個步道參訪人次約相差多少
36. 兩個農產集貨場出貨量約相差多少
```

### 8.7 先取概數再乘

```text
37. 一週節電量取概數後，估計數週共節電多少
38. 每日回收杯數取概數後，估計數日共回收多少
39. 每月種植苗木數取概數後，估計數月共種植多少
40. 每場活動搭車人數取概數後，估計多場共搭乘多少
41. 每班節省紙張數取概數後，估計多班共節省多少
42. 每車運送循環箱數取概數後，估計多車共運送多少
```

### 8.8 先取概數再除

```text
43. 回收物總量取概數後，平均分給數班約多少
44. 雨水收集量取概數後，平均分配給數個花圃約多少
45. 苗木總數取概數後，平均分給數個社區約多少
46. 活動手冊取概數後，平均分給數個服務台約多少
47. 循環杯總數取概數後，平均分給數個會場約多少
48. 書籍總數取概數後，平均分給數個閱讀站約多少
```

## 9. 題面語言規則

### 9.1 長度

```text
簡潔題面：35～55 個中文字
標準題面：55～85 個中文字
情境較完整：85～110 個中文字
```

G4B-U04 預設使用簡潔或標準題面。超過 110 字須進入長文字 renderer profile，不得壓縮字體硬塞。

### 9.2 語氣

使用中性、具體、可觀察的敘述。

合格：

```text
社區活動中心整理回收紙，每 100 張綁成一束。共有 4,683 張，最多可以綁成幾束完整的回收紙？
```

不合格：

```text
為了拯救地球，大家一定要努力回收。共有 4,683 張紙，可以綁成幾束？
```

不做道德評分，不暗示答錯代表不環保。

### 9.3 時事語句

合格：

```text
配合社區本月的循環杯活動，服務站準備整理回收杯。
```

不合格：

```text
根據今天新聞，全臺回收杯已達 83,726 個。
```

未核實數字不得包裝成新聞事實。

## 10. 合理數量級

以下是 generator 的虛構練習範圍，不是真實統計。

```text
班級人數                     20～40
校園學生或活動人數           100～3,000
圖書館、文化館單日人次       100～20,000
公車單車乘客                 10～60
場站或路線期間人次           100～100,000
禮堂／體育館座位             100～20,000
回收杯、瓶、紙張             100～500,000
苗木、種子、植栽             50～100,000
雨水桶或教學儲水量           100～500,000 公升
校園、社區節電練習量         100～1,000,000 度
包裹、循環箱、食品箱         100～500,000 件
```

每一個 PatternSpec 必須再縮小到適合其場所與單位的範圍。不得用同一個全域範圍套用所有場所。

## 11. 多樣性與去重

同一份 worksheet 應避免：

```text
連續三題使用相同 placeDomain
同一 actorRole 連續出現超過兩次
同一 objectNoun 在同一 PatternSpec 重複
只換人物、地點或數字但保留完全相同語意關係
```

建議 mixed context 配置：

```text
daily_life 約 2/3
sdg        約 1/3
```

在 SDG 題目中，至少涵蓋 3 個不同 placeDomain，且不得全部集中在回收。

## 12. Validator 要求

R2E materialization 前，至少新增下列 blocking checks：

```text
G4BU04_CONTEXT_PLACE_NOT_ALLOWLISTED
G4BU04_CONTEXT_OBJECT_NOT_ALLOWLISTED
G4BU04_CONTEXT_SCALE_IMPLAUSIBLE
G4BU04_CONTEXT_UNIT_FLOW_INVALID
G4BU04_CONTEXT_TIME_ANCHOR_EXPIRED
G4BU04_CONTEXT_SOURCE_REF_REQUIRED
G4BU04_CONTEXT_REAL_STATISTIC_CLAIM_FORBIDDEN
G4BU04_CONTEXT_POLITICAL_CONTENT_FORBIDDEN
G4BU04_CONTEXT_BRAND_PLACEMENT_FORBIDDEN
G4BU04_CONTEXT_SDG_PATTERN_NOT_ALLOWLISTED
G4BU04_CONTEXT_NOUN_ONLY_VARIATION
G4BU04_CONTEXT_DOMAIN_DIVERSITY_INSUFFICIENT
```

新聞或時事來源失效時，generator 必須阻擋該時事模板或降級到已審核的 evergreen 版本；不得自由生成替代內容。

## 13. 建議 materialization 批次

```text
R2E1 水資源與家庭／校園場所
R2E2 能源與公共建築場所
R2E3 交通與社區場所
R2E4 資源循環與零售／物流場所
R2E5 森林、濕地與農業場所
R2E6 時事錨點、來源治理與過期降級
R2E7 contextMode UI、query state 與 deployed QA
```

每批只 materialize 已有數學 PatternSpec 可承接的情境，不因情境庫豐富而擴張數學 scope。

## 14. 文件驗收

```text
placeDomain count                 = 16
place variant count               >= 96
SDG active goals                  = 6
future candidate goals            = 5
controlled scenario families      = 48
current-affairs anchor types       = 4
source authority tiers             = 4
free-form AI                       = forbidden
real-statistic claim by default    = forbidden
political content                  = forbidden
brand placement                    = forbidden
```

## 15. 距離追蹤

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2_SDG_CONTEXT_SCOPE_BROAD_BUT_UNMATERIALIZED

GOAL_DISTANCE_AFTER =
D1_G4B_U04_SDG_LIFE_AND_CURRENT_AFFAIRS_CONTEXT_BANK_LOCKED

DISTANCE_REDUCED =
把 SDG 從少量抽象主題，展開為具體場所、人物活動、決策目的、合理數量級、
48 個題型情境家族及可更新的時事來源治理規則，讓後續 generator 能產生更廣泛的生活題。

REMAINING_BLOCKERS = [
  "R2B worksheet prompt deduplication 尚未完成",
  "R2C source-backed discount PatternSpecs 尚未完成",
  "R2D resolved layout readback 尚未完成",
  "本情境庫尚未 materialize 成受控 template registry",
  "contextMode UI 與 query state 尚未實作",
  "current-affairs source expiry validator 尚未實作",
  "R2F production recloseout 尚未完成"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2B_WorksheetPromptDeduplication

FUTURE_CONTEXT_STEP =
G4B_U04_R2E1_WaterHomeSchoolControlledContextMaterialization

STOP_REASON = NONE
```

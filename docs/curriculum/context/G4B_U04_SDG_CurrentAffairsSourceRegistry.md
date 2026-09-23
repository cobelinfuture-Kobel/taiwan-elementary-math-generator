# G4B-U04 SDG 時事來源登錄

```text
TASK = G4B_U04_SDG_CurrentAffairsSourceRegistry
STATUS = SOURCE_REGISTRY_LOCKED_PENDING_CI
REVIEWED_AT = 2026-07-14
CONTEXT_BANK = docs/curriculum/context/G4B_U04_SDG_LifeAndCurrentAffairsContextBank.md
```

## 1. 使用目的

本登錄只負責確認「公共議題與場所是否存在、目前是否仍適合使用」。

```text
官方來源確認主題
→ 轉成兒童可理解的活動
→ 使用虛構練習數據
→ 通過數量級、單位流與語意 validator
```

除非另開資料解讀 PatternSpec，來源頁面的即時數字不得直接進入題目。

## 2. Tier A：國際與中央政府來源

### A01 聯合國 Sustainable Development Goals

```text
sourceRef = https://sdgs.un.org/goals
allowedTopics = SDG 6, 7, 11, 12, 13, 15 的官方目標名稱與主題邊界
forbiddenUse = 不直接複製全球統計數字到一般生成題
reviewCadence = yearly
```

### A02 經濟部水利署

```text
sourceRef = https://www.wra.gov.tw/
allowedTopics = 供水節水、水利工程淨零、水情教育、水庫與河川、流域永續、水環境建設
studentContexts = 飲水站、雨水槽、滯洪池、河川巡守、水資源教育館
forbiddenUse = 未核實即時蓄水率、災情、缺水數字
reviewCadence = 90 days before materialization
```

### A03 環境部資源循環署

```text
sourceRef = https://www.reca.gov.tw/
allowedTopics = 源頭減量、資源回收、循環利用、重複使用、包裝減量
studentContexts = 循環杯站、二手交換、回收分類、修繕、循環箱
forbiddenUse = 品牌、企業宣傳、未核實回收成果數字
reviewCadence = 90 days before materialization
```

### A04 經濟部能源署

```text
sourceRef = https://www.moeaea.gov.tw/
allowedTopics = 節約能源、能源效率、再生能源、能源教育
studentContexts = 校園太陽能、公共照明、節能教室、綠建築展示
forbiddenUse = 未核實發電量、節電成效、電價或設備性能宣稱
reviewCadence = 90 days before materialization
```

### A05 交通部

```text
sourceRef = https://www.motc.gov.tw/
allowedTopics = 公共運輸、人本交通、綠色交通、交通統計入口、運輸資料流通服務
studentContexts = 公車、捷運、火車、公共自行車、轉乘站、接駁活動
forbiddenUse = 即時事故、災害傷亡、未核實載客量、特定政策評價
reviewCadence = 90 days before materialization
```

### A06 農業部林業及自然保育署

```text
sourceRef = https://www.forest.gov.tw/
allowedTopics = 森林、棲地、自然保育、步道、環境教育、植樹與復育
studentContexts = 苗圃、森林步道、濕地教育區、棲地復育區、賞鳥平台
forbiddenUse = 動物受傷細節、瀕危恐懼敘事、未核實族群數字
reviewCadence = 90 days before materialization
```

## 3. Tier B：地方與公共服務來源

可接受：

```text
縣市政府環保局、水利局、交通局、教育局
捷運、公車、鐵路與公共自行車營運單位
公共圖書館、文化中心、博物館
國家公園、風景區與環境教育場所
公用事業與公開教育網站
```

使用限制：

```text
必須有穩定官方網址
必須記錄發布日期或最後更新日期
不得只根據社群貼文
不得轉錄個人資料
活動結束後必須設定 validUntil 或降級為 evergreen_fictionalized
```

## 4. Tier C：學校與公共教育活動

可接受：

```text
學校正式公告
圖書館或文化館活動公告
具明確主辦單位的社區活動
環境教育活動頁面
```

適合轉換的內容：

```text
校園回收週
閱讀節與交換書
自行車或步行活動
植樹與校園花園
節水與節電活動
防災演練物資整理
```

禁止使用學生姓名、班級個資、照片辨識資訊或未公開內部資料。

## 5. Tier D：新聞與社群

```text
role = topic_discovery_only
```

新聞可用來發現近期主題，但必須找到 Tier A～C authority 才能登錄成 `current_affairs`。

社群貼文不得作為單一 authority。

## 6. 時事登錄格式

```yaml
anchorId: ca_g4b_u04_example
status: candidate | active | expired | evergreen_fictionalized
headlineTopic: 公共議題摘要
sdgGoal: 6
placeDomain: water_facility
allowedPatternGroups:
  - floor_complete_groups
  - ceiling_minimum_required
  - round_then_add_subtract
sourceAuthorityTier: A
sourceRef: https://example.gov.tw/
sourcePublishedAt: YYYY-MM-DD
sourceReviewedAt: YYYY-MM-DD
validFrom: YYYY-MM-DD
validUntil: YYYY-MM-DD
fictionalExerciseData: true
studentFacingEventName: false
notes: 不使用來源頁面的即時統計數字
```

## 7. 時事轉換範例

### 範例 A：水情與節水主題

```text
來源主題：水利署供水節水與水情教育
禁止轉錄：即時水庫百分比
可轉成：校園雨水槽、社區飲水站、花圃分配水量
```

### 範例 B：公共運輸主題

```text
來源主題：交通部公共運輸與綠色交通
禁止轉錄：未確認的即時載客量
可轉成：公車接駁人數、公共自行車車架、轉乘站活動人次
```

### 範例 C：資源循環主題

```text
來源主題：資源循環、重複使用與包裝減量
禁止轉錄：企業宣傳數字
可轉成：循環杯籃、重複使用餐盒、包材回收箱、修繕件數
```

### 範例 D：森林與棲地主題

```text
來源主題：植樹、步道與棲地復育
禁止轉錄：未核實物種數量
可轉成：苗木分區、告示牌、巡查區段、環境教育參訪人數
```

## 8. 過期處理

```text
active current_affairs
→ 到 validUntil
→ 重新檢查 sourceRef
→ 仍有效：延長 validUntil
→ 主題仍合理但事件已結束：evergreen_fictionalized
→ 政策或服務已停止：expired，禁止生成
```

`evergreen_fictionalized` 必須移除：

```text
年份
活動名稱
特定政策名稱
真實機關成果數字
即時情勢描述
```

## 9. Acceptance

```text
Tier A official sources registered = 6
news-only authority allowed         = false
social-only authority allowed       = false
real-time statistics copied         = false
fictional exercise data default      = true
validity window required             = true for current_affairs
expired fallback                     = allowlisted evergreen only
```

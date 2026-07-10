import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE_ID = "g3b_u04_3b04";
const UNIT_CODE = "3B-U04";
const UNIT_TITLE = "兩步驟計算";
const SOURCE_TEMPLATE_PATH = resolve(ROOT, "data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json");
const PATTERN_SPEC_PATH = resolve(ROOT, "data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json");
const OUTPUT_JSON_PATH = resolve(ROOT, "data/curriculum/scenarios/S57E2_G3B_U04_SemanticScenarioRoleRegistry.json");
const OUTPUT_JS_PATH = resolve(ROOT, "site/modules/curriculum/batch-a/g3b-u04-semantic-scenarios.js");
const OUTPUT_TEST_PATH = resolve(ROOT, "tests/curriculum/g3b-u04-semantic-scenarios.test.js");

const DOMAIN_CATALOG = Object.freeze({
  "bakery": {
    "sceneLabel": "麵包店",
    "objectLabel": "麵包",
    "itemUnit": "個",
    "packageUnit": "袋",
    "largePackUnit": "箱",
    "smallPackUnit": "袋",
    "pairItems": [
      "麵包",
      "蛋糕"
    ],
    "comparisonObjects": [
      "小麵包",
      "中麵包",
      "大麵包"
    ]
  },
  "balls": {
    "sceneLabel": "體育器材室",
    "objectLabel": "球",
    "itemUnit": "顆",
    "packageUnit": "袋",
    "largePackUnit": "箱",
    "smallPackUnit": "袋",
    "pairItems": [
      "籃球",
      "排球"
    ],
    "comparisonObjects": [
      "小球袋",
      "中球袋",
      "大球袋"
    ]
  },
  "beverages": {
    "sceneLabel": "飲料倉庫",
    "objectLabel": "飲料罐",
    "itemUnit": "罐",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "提",
    "pairItems": [
      "果汁",
      "運動飲料"
    ],
    "comparisonObjects": [
      "小箱飲料",
      "中箱飲料",
      "大箱飲料"
    ]
  },
  "books": {
    "sceneLabel": "圖書館",
    "objectLabel": "書",
    "itemUnit": "本",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "疊",
    "pairItems": [
      "故事書",
      "科普書"
    ],
    "comparisonObjects": [
      "小書箱",
      "中書箱",
      "大書箱"
    ]
  },
  "bottles": {
    "sceneLabel": "容器展示區",
    "objectLabel": "水瓶",
    "itemUnit": "個",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "組",
    "capacityUnit": "毫升",
    "containerUnit": "瓶",
    "pairItems": [
      "水瓶",
      "保溫瓶"
    ],
    "comparisonObjects": [
      "小水瓶",
      "中水瓶",
      "大水瓶"
    ]
  },
  "building_blocks": {
    "sceneLabel": "積木角",
    "objectLabel": "積木",
    "itemUnit": "個",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "長方形積木",
      "正方形積木"
    ],
    "comparisonObjects": [
      "小積木盒",
      "中積木盒",
      "大積木盒"
    ]
  },
  "cake": {
    "sceneLabel": "生日會",
    "objectLabel": "蛋糕",
    "itemUnit": "個",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "蛋糕",
      "飲料"
    ],
    "comparisonObjects": [
      "小蛋糕",
      "中蛋糕",
      "大蛋糕"
    ]
  },
  "cans": {
    "sceneLabel": "罐頭倉庫",
    "objectLabel": "罐頭",
    "itemUnit": "罐",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "排",
    "pairItems": [
      "玉米罐頭",
      "水果罐頭"
    ],
    "comparisonObjects": [
      "小罐頭箱",
      "中罐頭箱",
      "大罐頭箱"
    ]
  },
  "cards": {
    "sceneLabel": "卡片收納區",
    "objectLabel": "卡片",
    "itemUnit": "張",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "圖卡",
      "獎勵卡"
    ],
    "comparisonObjects": [
      "小卡盒",
      "中卡盒",
      "大卡盒"
    ]
  },
  "class_activity": {
    "sceneLabel": "班級活動",
    "objectLabel": "活動材料",
    "itemUnit": "份",
    "packageUnit": "包",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "場地費",
      "材料費"
    ],
    "comparisonObjects": [
      "小組材料",
      "班級材料",
      "年級材料"
    ]
  },
  "class_event": {
    "sceneLabel": "班級活動",
    "objectLabel": "活動費",
    "itemUnit": "份",
    "packageUnit": "包",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "場地費",
      "材料費"
    ],
    "comparisonObjects": [
      "小組活動",
      "班級活動",
      "年級活動"
    ]
  },
  "class_materials": {
    "sceneLabel": "班級材料採買",
    "objectLabel": "材料",
    "itemUnit": "份",
    "packageUnit": "包",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "色紙",
      "膠水"
    ],
    "comparisonObjects": [
      "小材料包",
      "中材料包",
      "大材料包"
    ]
  },
  "class_rewards": {
    "sceneLabel": "班級獎勵",
    "objectLabel": "獎勵點數",
    "itemUnit": "點",
    "packageUnit": "份",
    "largePackUnit": "組",
    "smallPackUnit": "份",
    "pairItems": [
      "閱讀點數",
      "服務點數"
    ],
    "comparisonObjects": [
      "小獎品",
      "中獎品",
      "大獎品"
    ]
  },
  "classroom": {
    "sceneLabel": "教室",
    "objectLabel": "鉛筆",
    "itemUnit": "支",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "鉛筆",
      "橡皮擦"
    ],
    "comparisonObjects": [
      "小文具盒",
      "中文具盒",
      "大文具盒"
    ]
  },
  "clay": {
    "sceneLabel": "美術教室",
    "objectLabel": "黏土",
    "itemUnit": "塊",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "measureUnit": "公克",
    "pairItems": [
      "紅色黏土",
      "藍色黏土"
    ],
    "comparisonObjects": [
      "小黏土包",
      "中黏土包",
      "大黏土包"
    ]
  },
  "club": {
    "sceneLabel": "社團活動",
    "objectLabel": "社員",
    "itemUnit": "人",
    "packageUnit": "組",
    "largePackUnit": "隊",
    "smallPackUnit": "組",
    "pairItems": [
      "場地費",
      "材料費"
    ],
    "comparisonObjects": [
      "小社團",
      "中社團",
      "大社團"
    ]
  },
  "cookies": {
    "sceneLabel": "餅乾工坊",
    "objectLabel": "餅乾",
    "itemUnit": "片",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "奶油餅乾",
      "巧克力餅乾"
    ],
    "comparisonObjects": [
      "小餅乾盒",
      "中餅乾盒",
      "大餅乾盒"
    ]
  },
  "cooking": {
    "sceneLabel": "烹飪課",
    "objectLabel": "湯",
    "itemUnit": "份",
    "packageUnit": "鍋",
    "largePackUnit": "鍋",
    "smallPackUnit": "碗",
    "capacityUnit": "毫升",
    "containerUnit": "碗",
    "liquid": "湯",
    "pairItems": [
      "湯",
      "果汁"
    ],
    "comparisonObjects": [
      "小鍋",
      "中鍋",
      "大鍋"
    ]
  },
  "coupons": {
    "sceneLabel": "園遊會",
    "objectLabel": "優惠券",
    "itemUnit": "張",
    "packageUnit": "本",
    "largePackUnit": "本",
    "smallPackUnit": "張",
    "pairItems": [
      "遊戲券",
      "餐券"
    ],
    "comparisonObjects": [
      "小券本",
      "中券本",
      "大券本"
    ]
  },
  "craft_materials": {
    "sceneLabel": "手作教室",
    "objectLabel": "手作材料",
    "itemUnit": "份",
    "packageUnit": "包",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "毛根",
      "亮片"
    ],
    "comparisonObjects": [
      "小材料包",
      "中材料包",
      "大材料包"
    ]
  },
  "crafts": {
    "sceneLabel": "美術課",
    "objectLabel": "貼紙",
    "itemUnit": "張",
    "packageUnit": "包",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "貼紙",
      "色紙"
    ],
    "comparisonObjects": [
      "小作品",
      "中作品",
      "大作品"
    ]
  },
  "cups": {
    "sceneLabel": "餐具倉庫",
    "objectLabel": "紙杯",
    "itemUnit": "個",
    "packageUnit": "袋",
    "largePackUnit": "箱",
    "smallPackUnit": "袋",
    "pairItems": [
      "紙杯",
      "紙盤"
    ],
    "comparisonObjects": [
      "小杯箱",
      "中杯箱",
      "大杯箱"
    ]
  },
  "daily_goods": {
    "sceneLabel": "生活用品店",
    "objectLabel": "肥皂",
    "itemUnit": "塊",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "肥皂",
      "牙刷"
    ],
    "comparisonObjects": [
      "小用品包",
      "中用品包",
      "大用品包"
    ]
  },
  "display_array": {
    "sceneLabel": "作品展示牆",
    "objectLabel": "展示方塊",
    "itemUnit": "個",
    "packageUnit": "盒",
    "largePackUnit": "層",
    "smallPackUnit": "排",
    "pairItems": [
      "藍色方塊",
      "黃色方塊"
    ],
    "comparisonObjects": [
      "小展示架",
      "中展示架",
      "大展示架"
    ]
  },
  "drinks": {
    "sceneLabel": "飲料攤",
    "objectLabel": "果汁",
    "itemUnit": "瓶",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "瓶",
    "capacityUnit": "毫升",
    "containerUnit": "瓶",
    "liquid": "果汁",
    "pairItems": [
      "果汁",
      "牛奶"
    ],
    "comparisonObjects": [
      "小瓶",
      "中瓶",
      "大瓶"
    ]
  },
  "eggs": {
    "sceneLabel": "蛋品包裝場",
    "objectLabel": "雞蛋",
    "itemUnit": "顆",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "雞蛋",
      "鴨蛋"
    ],
    "comparisonObjects": [
      "小蛋盒",
      "中蛋盒",
      "大蛋盒"
    ]
  },
  "equipment_rental": {
    "sceneLabel": "器材租借處",
    "objectLabel": "器材",
    "itemUnit": "件",
    "packageUnit": "組",
    "largePackUnit": "套",
    "smallPackUnit": "件",
    "pairItems": [
      "帳篷",
      "睡袋"
    ],
    "comparisonObjects": [
      "小器材組",
      "中器材組",
      "大器材組"
    ]
  },
  "family_age": {
    "sceneLabel": "家庭年齡",
    "objectLabel": "年齡",
    "itemUnit": "歲",
    "packageUnit": "人",
    "largePackUnit": "人",
    "smallPackUnit": "人",
    "pairItems": [
      "哥哥",
      "媽媽"
    ],
    "comparisonObjects": [
      "弟弟",
      "哥哥",
      "媽媽"
    ]
  },
  "field_trip": {
    "sceneLabel": "校外教學",
    "objectLabel": "學生",
    "itemUnit": "人",
    "packageUnit": "組",
    "largePackUnit": "隊",
    "smallPackUnit": "組",
    "pairItems": [
      "車資",
      "門票"
    ],
    "comparisonObjects": [
      "小組",
      "班級",
      "年級"
    ]
  },
  "food": {
    "sceneLabel": "餐點採買",
    "objectLabel": "餐點",
    "itemUnit": "份",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "三明治",
      "果汁"
    ],
    "comparisonObjects": [
      "小餐盒",
      "中餐盒",
      "大餐盒"
    ]
  },
  "fruit": {
    "sceneLabel": "水果攤",
    "objectLabel": "蘋果",
    "itemUnit": "顆",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "蘋果",
      "橘子"
    ],
    "comparisonObjects": [
      "小果盒",
      "中果盒",
      "大果盒"
    ]
  },
  "fruit_boxes": {
    "sceneLabel": "水果箱倉庫",
    "objectLabel": "水果箱",
    "itemUnit": "箱",
    "packageUnit": "箱",
    "largePackUnit": "大箱",
    "smallPackUnit": "小箱",
    "measureUnit": "公斤",
    "pairItems": [
      "蘋果箱",
      "橘子箱"
    ],
    "comparisonObjects": [
      "小水果箱",
      "中水果箱",
      "大水果箱"
    ]
  },
  "game_points": {
    "sceneLabel": "遊戲積分",
    "objectLabel": "遊戲點數",
    "itemUnit": "點",
    "packageUnit": "份",
    "largePackUnit": "組",
    "smallPackUnit": "份",
    "pairItems": [
      "任務點數",
      "獎勵點數"
    ],
    "comparisonObjects": [
      "小獎品",
      "中獎品",
      "大獎品"
    ]
  },
  "gift": {
    "sceneLabel": "禮物採買",
    "objectLabel": "禮物",
    "itemUnit": "份",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "卡片",
      "禮物"
    ],
    "comparisonObjects": [
      "小禮盒",
      "中禮盒",
      "大禮盒"
    ]
  },
  "jugs": {
    "sceneLabel": "容器實驗",
    "objectLabel": "水壺",
    "itemUnit": "個",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "組",
    "capacityUnit": "毫升",
    "containerUnit": "壺",
    "pairItems": [
      "水壺",
      "量杯"
    ],
    "comparisonObjects": [
      "小水壺",
      "中水壺",
      "大水壺"
    ]
  },
  "juice": {
    "sceneLabel": "果汁調配",
    "objectLabel": "果汁",
    "itemUnit": "瓶",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "瓶",
    "measureUnit": "毫升",
    "capacityUnit": "毫升",
    "containerUnit": "瓶",
    "liquid": "果汁",
    "pairItems": [
      "蘋果汁",
      "柳橙汁"
    ],
    "comparisonObjects": [
      "小瓶果汁",
      "中瓶果汁",
      "大瓶果汁"
    ]
  },
  "library": {
    "sceneLabel": "圖書館",
    "objectLabel": "書籤",
    "itemUnit": "張",
    "packageUnit": "包",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "書籤",
      "借書卡"
    ],
    "comparisonObjects": [
      "小書架",
      "中書架",
      "大書架"
    ]
  },
  "lunch": {
    "sceneLabel": "午餐廚房",
    "objectLabel": "餐點",
    "itemUnit": "份",
    "packageUnit": "盤",
    "largePackUnit": "箱",
    "smallPackUnit": "盤",
    "pairItems": [
      "水果",
      "麵包"
    ],
    "comparisonObjects": [
      "小餐盤",
      "中餐盤",
      "大餐盤"
    ]
  },
  "markers": {
    "sceneLabel": "美術用品櫃",
    "objectLabel": "彩色筆",
    "itemUnit": "支",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "彩色筆",
      "蠟筆"
    ],
    "comparisonObjects": [
      "小筆盒",
      "中筆盒",
      "大筆盒"
    ]
  },
  "meal": {
    "sceneLabel": "聚餐",
    "objectLabel": "餐費",
    "itemUnit": "份",
    "packageUnit": "桌",
    "largePackUnit": "桌",
    "smallPackUnit": "份",
    "pairItems": [
      "主餐",
      "飲料"
    ],
    "comparisonObjects": [
      "兒童餐",
      "套餐",
      "分享餐"
    ]
  },
  "milk": {
    "sceneLabel": "飲品準備區",
    "objectLabel": "牛奶",
    "itemUnit": "瓶",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "瓶",
    "measureUnit": "毫升",
    "capacityUnit": "毫升",
    "containerUnit": "瓶",
    "liquid": "牛奶",
    "pairItems": [
      "牛奶",
      "豆漿"
    ],
    "comparisonObjects": [
      "小瓶牛奶",
      "中瓶牛奶",
      "大瓶牛奶"
    ]
  },
  "packing": {
    "sceneLabel": "包裝工作區",
    "objectLabel": "包裹",
    "itemUnit": "件",
    "packageUnit": "箱",
    "largePackUnit": "棧板",
    "smallPackUnit": "箱",
    "pairItems": [
      "小包裹",
      "大包裹"
    ],
    "comparisonObjects": [
      "小型工作臺",
      "中型工作臺",
      "大型工作臺"
    ]
  },
  "parcels": {
    "sceneLabel": "郵局",
    "objectLabel": "包裹",
    "itemUnit": "件",
    "packageUnit": "箱",
    "largePackUnit": "大箱",
    "smallPackUnit": "小箱",
    "measureUnit": "公斤",
    "pairItems": [
      "小包裹",
      "大包裹"
    ],
    "comparisonObjects": [
      "輕包裹",
      "中包裹",
      "重包裹"
    ]
  },
  "parts": {
    "sceneLabel": "零件檢查站",
    "objectLabel": "零件",
    "itemUnit": "個",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "齒輪",
      "螺絲"
    ],
    "comparisonObjects": [
      "小零件盒",
      "中零件盒",
      "大零件盒"
    ]
  },
  "pens": {
    "sceneLabel": "文具盒",
    "objectLabel": "筆",
    "itemUnit": "支",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "鉛筆",
      "原子筆"
    ],
    "comparisonObjects": [
      "小筆盒",
      "中筆盒",
      "大筆盒"
    ]
  },
  "plants": {
    "sceneLabel": "園藝區",
    "objectLabel": "盆栽",
    "itemUnit": "盆",
    "packageUnit": "箱",
    "largePackUnit": "區",
    "smallPackUnit": "排",
    "pairItems": [
      "花苗",
      "香草盆栽"
    ],
    "comparisonObjects": [
      "小盆栽",
      "中盆栽",
      "大盆栽"
    ]
  },
  "printing": {
    "sceneLabel": "印刷室",
    "objectLabel": "講義",
    "itemUnit": "張",
    "packageUnit": "疊",
    "largePackUnit": "箱",
    "smallPackUnit": "疊",
    "pairItems": [
      "講義",
      "海報"
    ],
    "comparisonObjects": [
      "小型印表機",
      "中型印表機",
      "大型印表機"
    ]
  },
  "prizes": {
    "sceneLabel": "獎品區",
    "objectLabel": "獎品",
    "itemUnit": "份",
    "packageUnit": "箱",
    "largePackUnit": "箱",
    "smallPackUnit": "袋",
    "pairItems": [
      "貼紙獎品",
      "文具獎品"
    ],
    "comparisonObjects": [
      "小獎品",
      "中獎品",
      "大獎品"
    ]
  },
  "pudding": {
    "sceneLabel": "布丁工坊",
    "objectLabel": "布丁",
    "itemUnit": "個",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "布丁",
      "果凍"
    ],
    "comparisonObjects": [
      "小布丁盒",
      "中布丁盒",
      "大布丁盒"
    ]
  },
  "reading_points": {
    "sceneLabel": "閱讀護照",
    "objectLabel": "閱讀點數",
    "itemUnit": "點",
    "packageUnit": "份",
    "largePackUnit": "組",
    "smallPackUnit": "份",
    "pairItems": [
      "閱讀點數",
      "分享點數"
    ],
    "comparisonObjects": [
      "小獎品",
      "中獎品",
      "大獎品"
    ]
  },
  "recycling": {
    "sceneLabel": "資源回收站",
    "objectLabel": "回收物",
    "itemUnit": "件",
    "packageUnit": "袋",
    "largePackUnit": "車",
    "smallPackUnit": "袋",
    "pairItems": [
      "寶特瓶",
      "紙盒"
    ],
    "comparisonObjects": [
      "小型工作臺",
      "中型工作臺",
      "大型工作臺"
    ]
  },
  "relay": {
    "sceneLabel": "接力比賽",
    "objectLabel": "選手",
    "itemUnit": "人",
    "packageUnit": "隊",
    "largePackUnit": "隊",
    "smallPackUnit": "組",
    "pairItems": [
      "男生組",
      "女生組"
    ],
    "comparisonObjects": [
      "小隊",
      "中隊",
      "大隊"
    ]
  },
  "ribbon": {
    "sceneLabel": "美術教室",
    "objectLabel": "緞帶",
    "itemUnit": "段",
    "packageUnit": "卷",
    "largePackUnit": "卷",
    "smallPackUnit": "段",
    "measureUnit": "公分",
    "pairItems": [
      "紅緞帶",
      "藍緞帶"
    ],
    "comparisonObjects": [
      "短緞帶",
      "中緞帶",
      "長緞帶"
    ]
  },
  "rope": {
    "sceneLabel": "童軍活動",
    "objectLabel": "繩子",
    "itemUnit": "條",
    "packageUnit": "捆",
    "largePackUnit": "捆",
    "smallPackUnit": "條",
    "measureUnit": "公尺",
    "pairItems": [
      "細繩",
      "粗繩"
    ],
    "comparisonObjects": [
      "短繩",
      "中繩",
      "長繩"
    ]
  },
  "school_competition": {
    "sceneLabel": "校內競賽",
    "objectLabel": "參賽學生",
    "itemUnit": "人",
    "packageUnit": "隊",
    "largePackUnit": "隊",
    "smallPackUnit": "組",
    "pairItems": [
      "甲隊",
      "乙隊"
    ],
    "comparisonObjects": [
      "小隊",
      "中隊",
      "大隊"
    ]
  },
  "school_crafts": {
    "sceneLabel": "校園手作坊",
    "objectLabel": "作品",
    "itemUnit": "件",
    "packageUnit": "箱",
    "largePackUnit": "推車",
    "smallPackUnit": "箱",
    "pairItems": [
      "紙花",
      "卡片"
    ],
    "comparisonObjects": [
      "小型工作臺",
      "中型工作臺",
      "大型工作臺"
    ]
  },
  "school_event": {
    "sceneLabel": "校慶活動",
    "objectLabel": "學生",
    "itemUnit": "人",
    "packageUnit": "組",
    "largePackUnit": "隊",
    "smallPackUnit": "組",
    "pairItems": [
      "表演組",
      "服務組"
    ],
    "comparisonObjects": [
      "小組",
      "班級",
      "年級"
    ]
  },
  "school_experiment": {
    "sceneLabel": "自然實驗",
    "objectLabel": "實驗水",
    "itemUnit": "份",
    "packageUnit": "瓶",
    "largePackUnit": "桶",
    "smallPackUnit": "瓶",
    "capacityUnit": "毫升",
    "containerUnit": "瓶",
    "liquid": "實驗水",
    "pairItems": [
      "清水",
      "鹽水"
    ],
    "comparisonObjects": [
      "小量杯",
      "中量杯",
      "大量杯"
    ]
  },
  "school_store": {
    "sceneLabel": "校園商店",
    "objectLabel": "文具",
    "itemUnit": "件",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "鉛筆",
      "筆記本"
    ],
    "comparisonObjects": [
      "小商品",
      "中商品",
      "大商品"
    ]
  },
  "school_supplies": {
    "sceneLabel": "文具店",
    "objectLabel": "文具",
    "itemUnit": "件",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "筆記本",
      "彩色筆"
    ],
    "comparisonObjects": [
      "小文具包",
      "中文具包",
      "大文具包"
    ]
  },
  "seeds": {
    "sceneLabel": "園藝材料店",
    "objectLabel": "種子",
    "itemUnit": "顆",
    "packageUnit": "包",
    "largePackUnit": "袋",
    "smallPackUnit": "包",
    "pairItems": [
      "花種",
      "菜種"
    ],
    "comparisonObjects": [
      "小種子包",
      "中種子包",
      "大種子包"
    ]
  },
  "snacks": {
    "sceneLabel": "點心區",
    "objectLabel": "餅乾",
    "itemUnit": "包",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "餅乾",
      "果凍"
    ],
    "comparisonObjects": [
      "小點心包",
      "中點心包",
      "大點心包"
    ]
  },
  "sports": {
    "sceneLabel": "體育課",
    "objectLabel": "球",
    "itemUnit": "顆",
    "packageUnit": "袋",
    "largePackUnit": "箱",
    "smallPackUnit": "袋",
    "pairItems": [
      "籃球",
      "排球"
    ],
    "comparisonObjects": [
      "小隊",
      "中隊",
      "大隊"
    ]
  },
  "sports_cards": {
    "sceneLabel": "球員卡店",
    "objectLabel": "球員卡",
    "itemUnit": "張",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "包",
    "pairItems": [
      "球員卡",
      "紀念卡"
    ],
    "comparisonObjects": [
      "小卡包",
      "中卡包",
      "大卡包"
    ]
  },
  "sports_day": {
    "sceneLabel": "運動會",
    "objectLabel": "活動費",
    "itemUnit": "份",
    "packageUnit": "組",
    "largePackUnit": "隊",
    "smallPackUnit": "組",
    "pairItems": [
      "場地費",
      "器材費"
    ],
    "comparisonObjects": [
      "小組",
      "班級",
      "年級"
    ]
  },
  "sports_equipment": {
    "sceneLabel": "體育器材室",
    "objectLabel": "器材",
    "itemUnit": "件",
    "packageUnit": "箱",
    "largePackUnit": "大箱",
    "smallPackUnit": "小箱",
    "measureUnit": "公斤",
    "pairItems": [
      "球拍",
      "護具"
    ],
    "comparisonObjects": [
      "輕器材箱",
      "中器材箱",
      "重器材箱"
    ]
  },
  "stationery": {
    "sceneLabel": "文具店",
    "objectLabel": "鉛筆",
    "itemUnit": "支",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "鉛筆",
      "橡皮擦"
    ],
    "comparisonObjects": [
      "小文具盒",
      "中文具盒",
      "大文具盒"
    ]
  },
  "stickers": {
    "sceneLabel": "貼紙店",
    "objectLabel": "貼紙",
    "itemUnit": "張",
    "packageUnit": "包",
    "largePackUnit": "盒",
    "smallPackUnit": "包",
    "pairItems": [
      "動物貼紙",
      "星星貼紙"
    ],
    "comparisonObjects": [
      "小貼紙包",
      "中貼紙包",
      "大貼紙包"
    ]
  },
  "sticks": {
    "sceneLabel": "美勞材料區",
    "objectLabel": "木棒",
    "itemUnit": "根",
    "packageUnit": "束",
    "largePackUnit": "捆",
    "smallPackUnit": "束",
    "measureUnit": "公分",
    "pairItems": [
      "短木棒",
      "長木棒"
    ],
    "comparisonObjects": [
      "短木棒",
      "中木棒",
      "長木棒"
    ]
  },
  "storage_grid": {
    "sceneLabel": "收納格",
    "objectLabel": "收納方塊",
    "itemUnit": "個",
    "packageUnit": "盒",
    "largePackUnit": "層",
    "smallPackUnit": "排",
    "pairItems": [
      "藍色方塊",
      "紅色方塊"
    ],
    "comparisonObjects": [
      "小收納格",
      "中收納格",
      "大收納格"
    ]
  },
  "tea_bags": {
    "sceneLabel": "茶包分裝區",
    "objectLabel": "茶包",
    "itemUnit": "包",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "紅茶包",
      "綠茶包"
    ],
    "comparisonObjects": [
      "小茶盒",
      "中茶盒",
      "大茶盒"
    ]
  },
  "technology": {
    "sceneLabel": "資訊教室",
    "objectLabel": "平板",
    "itemUnit": "臺",
    "packageUnit": "箱",
    "largePackUnit": "推車",
    "smallPackUnit": "箱",
    "pairItems": [
      "平板",
      "耳機"
    ],
    "comparisonObjects": [
      "小設備箱",
      "中設備箱",
      "大設備箱"
    ]
  },
  "tickets": {
    "sceneLabel": "售票處",
    "objectLabel": "門票",
    "itemUnit": "張",
    "packageUnit": "本",
    "largePackUnit": "本",
    "smallPackUnit": "張",
    "pairItems": [
      "門票",
      "車票"
    ],
    "comparisonObjects": [
      "兒童票",
      "學生票",
      "全票"
    ]
  },
  "toothpaste": {
    "sceneLabel": "生活用品倉庫",
    "objectLabel": "牙膏",
    "itemUnit": "條",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "pairItems": [
      "牙膏",
      "牙刷"
    ],
    "comparisonObjects": [
      "小牙膏盒",
      "中牙膏盒",
      "大牙膏盒"
    ]
  },
  "tracks": {
    "sceneLabel": "玩具軌道區",
    "objectLabel": "軌道",
    "itemUnit": "段",
    "packageUnit": "盒",
    "largePackUnit": "箱",
    "smallPackUnit": "盒",
    "measureUnit": "公分",
    "pairItems": [
      "直軌",
      "彎軌"
    ],
    "comparisonObjects": [
      "短軌道",
      "中軌道",
      "長軌道"
    ]
  },
  "transport": {
    "sceneLabel": "交通行程",
    "objectLabel": "車資",
    "itemUnit": "次",
    "packageUnit": "趟",
    "largePackUnit": "趟",
    "smallPackUnit": "次",
    "pairItems": [
      "車資",
      "保險費"
    ],
    "comparisonObjects": [
      "短程",
      "中程",
      "長程"
    ]
  },
  "water_tanks": {
    "sceneLabel": "儲水設備",
    "objectLabel": "水箱",
    "itemUnit": "座",
    "packageUnit": "組",
    "largePackUnit": "組",
    "smallPackUnit": "座",
    "capacityUnit": "公升",
    "containerUnit": "水箱",
    "pairItems": [
      "小水箱",
      "大水箱"
    ],
    "comparisonObjects": [
      "小水箱",
      "中水箱",
      "大水箱"
    ]
  }
});
const PROFILE_ACTIONS = Object.freeze({
  "countable_objects_and_packaging": {
    "allowedActions": [
      "合併",
      "分配",
      "分裝",
      "包裝",
      "保留",
      "使用",
      "補充",
      "排列"
    ],
    "forbiddenActions": [
      "把不可數物當成單件",
      "混用物件數與包裝數",
      "非整除時宣稱平均分完"
    ]
  },
  "money_and_shared_payment": {
    "allowedActions": [
      "合買",
      "平均分擔",
      "購買",
      "加購",
      "贈送",
      "計算平均成本",
      "支付"
    ],
    "forbiddenActions": [
      "把總費用當成個人費用",
      "把售價當成成本",
      "付費數量大於收到數量卻稱為贈品"
    ]
  },
  "capacity_and_same_substance_combining": {
    "allowedActions": [
      "倒在一起",
      "平均分裝",
      "量取",
      "裝瓶"
    ],
    "forbiddenActions": [
      "混合不同物質後仍稱同一種液體",
      "混用容量與物件個數",
      "容器容量為零或負數"
    ]
  },
  "group_team_tray_formation": {
    "allowedActions": [
      "分組",
      "組隊",
      "裝盤",
      "參賽",
      "送出",
      "保留"
    ],
    "forbiddenActions": [
      "把人數直接當隊數",
      "把物品數直接當盤數",
      "未完成分組就扣除隊數或盤數"
    ]
  },
  "multiplicative_comparison_objects": {
    "allowedActions": [
      "比較倍數",
      "建立關係鏈",
      "換算等值數量",
      "推算最終量"
    ],
    "forbiddenActions": [
      "顛倒倍數方向",
      "跨不同量綱比較倍數",
      "把倍數當成物件數答案"
    ]
  },
  "family_age_chain": {
    "allowedActions": [
      "比較年齡倍數",
      "推算家人年齡"
    ],
    "forbiddenActions": [
      "年齡順序顛倒",
      "兒童或家長年齡超出合理範圍",
      "把歲數當成物件數"
    ]
  },
  "production_common_period": {
    "allowedActions": [
      "比較同時段產量",
      "推算工作臺產量",
      "完成包裝或印刷"
    ],
    "forbiddenActions": [
      "比較不同未說明時段的產量",
      "把每段時間產量當成累積多時段產量",
      "產量為零或負數"
    ]
  }
});
const REALISM_REFS = Object.freeze({
  "family_age_chain": "realism_g3b_u04_age",
  "production_common_period": "realism_g3b_u04_production_common_period",
  "capacity_and_same_substance_combining": "realism_g3b_u04_liquid_containers",
  "group_team_tray_formation": "realism_g3b_u04_packages_and_groups",
  "multiplicative_comparison_objects": "realism_g3b_u04_multiplicative_relationship",
  "money_and_shared_payment": "realism_g3b_u04_money_and_promotion",
  "countable_objects_and_packaging": "realism_g3b_u04_packages_and_groups"
});
const REALISM_PROFILES = Object.freeze({
  "realism_g3b_u04_general_positive_integer": {
    "numberDomain": "positive_integers",
    "minimum": 1,
    "maximum": 10000,
    "negativeAllowed": false,
    "decimalAllowed": false,
    "fractionAllowed": false
  },
  "realism_g3b_u04_age": {
    "baseChildAge": {
      "min": 6,
      "max": 12
    },
    "siblingAge": {
      "min": 10,
      "max": 24
    },
    "parentAge": {
      "min": 25,
      "max": 60
    },
    "ordering": "baseChildAge<siblingAge<parentAge"
  },
  "realism_g3b_u04_money_and_promotion": {
    "minimumPaidItems": 1,
    "minimumBonusItems": 1,
    "maximumReceivedItems": 20,
    "averagePriceMustNotExceedUnitPrice": true,
    "currencyUnit": "元"
  },
  "realism_g3b_u04_packages_and_groups": {
    "itemsPerPackageMin": 2,
    "itemsPerPackageMax": 50,
    "packageClassifierMustMatchObject": true,
    "groupCountPositive": true
  },
  "realism_g3b_u04_liquid_containers": {
    "allowedUnits": [
      "毫升",
      "公升"
    ],
    "sameSubstanceBeforeCombining": true,
    "positiveCapacityPerContainer": true
  },
  "realism_g3b_u04_multiplicative_relationship": {
    "multiplierMin": 2,
    "multiplierMax": 9,
    "relationshipDirectionMustBeExplicit": true,
    "sameMeasureDimensionRequired": true
  },
  "realism_g3b_u04_production_common_period": {
    "sameTimePeriodRequired": true,
    "positiveOutputPerPeriod": true,
    "maximumOutput": 10000
  }
});
const OBSOLETE_S43E6_PSEUDO_KPS = Object.freeze([
  "kp_g3b_u04_divide_then_subtract",
  "kp_g3b_u04_basic_multiplicative_comparison",
  "kp_g3b_u04_multiplicative_relationship_chain",
  "kp_g3b_u04_line_segment_two_step_word_problem",
  "kp_g3b_u04_equal_sharing_then_add_subtract",
  "kp_g3b_u04_packaging_then_add_subtract",
  "kp_g3b_u04_multiplication_context_rows_boxes_groups",
  "kp_g3b_u04_multi_layer_multiplicative_reasoning"
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function profileClassForFamily(templateFamilyId) {
  if (templateFamilyId.includes("age_ratio_chain")) return ["family_age_chain", "age_relationship"];
  if (templateFamilyId.includes("production_capacity_chain")) return ["production_common_period", "production_multiplier_chain"];
  if (templateFamilyId.includes("combined_liquid")) return ["capacity_and_same_substance_combining", "liquid_combination_equal_portions"];
  if (templateFamilyId.includes("ratio_capacity")) return ["multiplicative_comparison_objects", "capacity_ratio_chain"];
  if (templateFamilyId.includes("ratio_length")) return ["multiplicative_comparison_objects", "length_ratio_chain"];
  if (templateFamilyId.includes("ratio_weight")) return ["multiplicative_comparison_objects", "weight_ratio_chain"];
  if (templateFamilyId.includes("quantity_chain_personal")) return ["multiplicative_comparison_objects", "personal_quantity_chain"];
  if (templateFamilyId.includes("quantity_chain_price")) return ["multiplicative_comparison_objects", "price_equivalence_chain"];
  if (["joint_purchase", "pooled_money", "average_price", "average_cost", "shared_cost", "wallet_minus", "personal_budget", "reward_points", "promotion_total"].some((token) => templateFamilyId.includes(token))) {
    return ["money_and_shared_payment", "shared_payment_or_average_cost"];
  }
  if (["absent_participants", "formed_teams", "prepared_trays"].some((token) => templateFamilyId.includes(token))) {
    return ["group_team_tray_formation", "participant_or_tray_grouping"];
  }
  return ["countable_objects_and_packaging", "count_measure_package_flow"];
}

function ownershipModel(templateFamilyId, semanticSignature) {
  const value = `${templateFamilyId} ${semanticSignature}`;
  if (value.includes("age")) return "family_member_personal_age";
  if (value.includes("production") || value.includes("output")) return "workstation_output_same_period";
  if (value.includes("personal") || value.includes("wallet") || value.includes("quantity_chain_personal")) return "personal_quantity_or_budget";
  if (value.includes("shared") || value.includes("joint") || value.includes("pooled") || value.includes("equal_share")) return "shared_group_with_explicit_personal_share";
  if (value.includes("promotion") || value.includes("bonus") || value.includes("buy_get_free")) return "buyer_receives_paid_and_bonus_items";
  if (value.includes("package") || value.includes("repack") || value.includes("tray") || value.includes("box") || value.includes("container")) return "container_hierarchy_inventory";
  if (value.includes("participant") || value.includes("team") || value.includes("group")) return "participant_group_scope";
  if (value.includes("ratio") || value.includes("multiplier") || value.includes("equivalence")) return "relational_object_chain";
  return "single_context_inventory";
}

function placeholders(promptSkeletonZh) {
  return [...String(promptSkeletonZh).matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

function placeholderBindings(family, catalog) {
  const nonNumeric = new Set(placeholders(family.promptSkeletonZh).filter((placeholder) => !(placeholder in family.quantityRoles)));
  const comparisonObjects = catalog.comparisonObjects ?? [`小${catalog.objectLabel}`, `中${catalog.objectLabel}`, `大${catalog.objectLabel}`];
  const pairItems = catalog.pairItems ?? [catalog.objectLabel, "另一種物品"];
  const values = {
    item: catalog.objectLabel,
    item1: pairItems[0],
    item2: pairItems[1],
    itemUnit: catalog.itemUnit ?? "個",
    recipient: "學生",
    recipientUnit: "位",
    currencyUnit: "元",
    capacityUnit: catalog.capacityUnit ?? "毫升",
    containerUnit: catalog.containerUnit ?? "瓶",
    liquid: catalog.liquid ?? (/[水汁奶湯]/.test(catalog.objectLabel) ? catalog.objectLabel : "飲用水"),
    largePackUnit: catalog.largePackUnit ?? "箱",
    smallPackUnit: catalog.smallPackUnit ?? "包",
    measureUnit: catalog.measureUnit ?? catalog.capacityUnit ?? "個",
    packageUnit: catalog.packageUnit ?? "盒",
    packUnit: catalog.packageUnit ?? "盒",
    person: "小安",
    person1: "小安",
    person2: "小美",
    person3: "小杰",
    baseObject: comparisonObjects[0],
    middleObject: comparisonObjects[1],
    finalObject: comparisonObjects[2],
    baseContainer: comparisonObjects[0],
    middleContainer: comparisonObjects[1],
    finalContainer: comparisonObjects[2],
    baseItem: pairItems[0],
    middleItem: pairItems[1],
    finalItem: catalog.objectLabel,
    baseUnit: catalog.itemUnit ?? "個",
    middleUnit: catalog.packageUnit ?? "盒",
    finalUnit: catalog.largePackUnit ?? "箱",
    child: "小安",
    sibling: "哥哥",
    parent: "媽媽"
  };
  const unresolved = [...nonNumeric].filter((placeholder) => !(placeholder in values));
  assert(unresolved.length === 0, `Unresolved placeholders for ${family.templateFamilyId}: ${unresolved.join(",")}`);
  return Object.fromEntries([...nonNumeric].sort().map((placeholder) => [placeholder, values[placeholder]]));
}

function roleMetadata(semanticRole) {
  const role = semanticRole.toLowerCase();
  if (role.includes("age")) {
    if (role.includes("base_child")) return { roleType: "age", unitDimension: "age_years", min: 6, max: 12, boundSource: "S57.realismProfiles.age.baseChildAge" };
    if (role.includes("sibling")) return { roleType: "age", unitDimension: "age_years", min: 10, max: 24, boundSource: "S57.realismProfiles.age.siblingAge" };
    if (role.includes("parent") || role.includes("final_person_age")) return { roleType: "age", unitDimension: "age_years", min: 25, max: 60, boundSource: "S57.realismProfiles.age.parentAge" };
  }
  if (role.includes("multiplier") || role.includes("equivalent_count")) return { roleType: "multiplier", unitDimension: "dimensionless_times", min: 2, max: 9, boundSource: "S57.knowledgePointInvariants.multiplier" };
  if (role.includes("points")) return { roleType: "points", unitDimension: "points", min: 1, max: 10000, boundSource: "S57.sharedNumericPolicy" };
  if (["price", "cost", "money", "fee", "budget"].some((token) => role.includes(token))) return { roleType: "money", unitDimension: "currency", min: 1, max: 10000, boundSource: "S57.sharedNumericPolicy" };
  if (role.includes("capacity") || role.includes("liquid")) return { roleType: "measure", unitDimension: "capacity", min: 1, max: 10000, boundSource: "S57.sharedNumericPolicy" };
  if (role.includes("output_per_period")) return { roleType: "rate_quantity", unitDimension: "count_per_period", min: 1, max: 10000, boundSource: "S57.productionCommonPeriod" };
  if (role.includes("quantity") || role.includes("amount")) return { roleType: "quantity", unitDimension: "context_bound_measure_or_count", min: 1, max: 10000, boundSource: "S57.sharedNumericPolicy" };
  return { roleType: "count", unitDimension: "count", min: 1, max: 10000, boundSource: "S57.sharedNumericPolicy" };
}

function quantityRoleBounds(family) {
  return Object.fromEntries(Object.entries(family.quantityRoles).map(([symbol, semanticRole]) => [
    symbol,
    { semanticRole, ...roleMetadata(semanticRole) }
  ]));
}

function buildScenarioProfile(family, contextDomain) {
  const catalog = DOMAIN_CATALOG[contextDomain];
  assert(catalog, `Missing domain catalog entry: ${contextDomain}`);
  const [profileClass, scenarioSubtype] = profileClassForFamily(family.templateFamilyId);
  return {
    scenarioId: `scn_g3b_u04_${family.templateFamilyId.replace("tpl_g3b_u04_", "")}_${contextDomain}`,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    templateFamilyId: family.templateFamilyId,
    knowledgePointId: family.knowledgePointId,
    semanticSignature: family.semanticSignature,
    contextDomain,
    profileClass,
    scenarioSubtype,
    sceneLabel: catalog.sceneLabel,
    objectLabel: catalog.objectLabel,
    itemUnit: catalog.itemUnit ?? null,
    recipientUnit: /\{recipient(?:Unit)?\}/.test(family.promptSkeletonZh) ? "位" : null,
    packageUnit: catalog.packageUnit ?? null,
    measureUnit: catalog.measureUnit ?? null,
    capacityUnit: catalog.capacityUnit ?? null,
    containerUnit: catalog.containerUnit ?? null,
    currencyUnit: profileClass === "money_and_shared_payment" || family.promptSkeletonZh.includes("{currencyUnit}") ? "元" : null,
    largePackUnit: catalog.largePackUnit ?? null,
    smallPackUnit: catalog.smallPackUnit ?? null,
    placeholderBindings: placeholderBindings(family, catalog),
    quantityRoleBounds: quantityRoleBounds(family),
    allowedActions: [...PROFILE_ACTIONS[profileClass].allowedActions],
    forbiddenActions: [...PROFILE_ACTIONS[profileClass].forbiddenActions],
    ownershipModel: ownershipModel(family.templateFamilyId, family.semanticSignature),
    unitFlowModel: `${family.equationShape}::${family.unknownRole}`,
    realismProfileRef: REALISM_REFS[profileClass],
    selectionWeight: 1,
    status: "approved_hidden_runtime_candidate"
  };
}

function validateSource(source, patternRegistry) {
  assert(source.schemaName === "G3BU04SemanticTemplateFamilyRegistry", "Unexpected semantic family schema");
  assert(source.sourceId === SOURCE_ID && source.unitCode === UNIT_CODE, "Unexpected source identity");
  assert(source.templateFamilies.length === 32, `Expected 32 families, got ${source.templateFamilies.length}`);
  assert(patternRegistry.schemaName === "G3BU04SemanticPatternSpecRegistry", "Unexpected PatternSpec schema");
  assert(patternRegistry.patternSpecs.length === 32, "S57E1 PatternSpec registry must contain 32 specs");
  const specByFamily = new Map(patternRegistry.patternSpecs.map((spec) => [spec.templateFamilyId, spec]));
  assert(specByFamily.size === 32, "Duplicate S57E1 family projection");
  for (const family of source.templateFamilies) {
    assert(specByFamily.has(family.templateFamilyId), `Missing S57E1 PatternSpec for ${family.templateFamilyId}`);
    assert(!OBSOLETE_S43E6_PSEUDO_KPS.includes(family.knowledgePointId), `Obsolete pseudo-KP reintroduced: ${family.knowledgePointId}`);
    assert(family.contextDomains.length > 0, `No context domain: ${family.templateFamilyId}`);
    for (const domain of family.contextDomains) assert(DOMAIN_CATALOG[domain], `Unregistered context domain: ${domain}`);
  }
  assert(Object.keys(DOMAIN_CATALOG).length === 77, `Expected 77 domain catalog rows, got ${Object.keys(DOMAIN_CATALOG).length}`);
}

function stableCount(values) {
  const output = {};
  for (const value of values) output[value] = (output[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(output).sort(([left], [right]) => left.localeCompare(right)));
}

function deepFreezeModule(registry) {
  const registryLiteral = JSON.stringify(registry, null, 2);
  return `function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY = deepFreeze(${registryLiteral});
export const G3B_U04_SEMANTIC_SCENARIO_PROFILES = G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY.scenarioProfiles;
export const G3B_U04_SEMANTIC_ROLE_DEFINITIONS = G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY.semanticRoles;
export const G3B_U04_SEMANTIC_REALISM_PROFILES = G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY.realismProfiles;

const scenarioById = new Map(G3B_U04_SEMANTIC_SCENARIO_PROFILES.map((profile) => [profile.scenarioId, profile]));
const roleByName = new Map(G3B_U04_SEMANTIC_ROLE_DEFINITIONS.map((role) => [role.semanticRole, role]));

export function getG3BU04SemanticScenarioProfile(scenarioId) {
  return scenarioById.get(scenarioId) ?? null;
}

export function getG3BU04SemanticRoleDefinition(semanticRole) {
  return roleByName.get(semanticRole) ?? null;
}

export function listG3BU04SemanticScenarioProfiles() {
  return [...G3B_U04_SEMANTIC_SCENARIO_PROFILES];
}

export function listG3BU04SemanticRoleDefinitions() {
  return [...G3B_U04_SEMANTIC_ROLE_DEFINITIONS];
}

export function listG3BU04ScenarioProfilesForFamily(templateFamilyId) {
  return G3B_U04_SEMANTIC_SCENARIO_PROFILES.filter((profile) => profile.templateFamilyId === templateFamilyId);
}

export function listG3BU04ScenarioProfilesForContext(contextDomain) {
  return G3B_U04_SEMANTIC_SCENARIO_PROFILES.filter((profile) => profile.contextDomain === contextDomain);
}
`;
}

function testModule() {
  return `import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  G3B_U04_SEMANTIC_REALISM_PROFILES,
  G3B_U04_SEMANTIC_ROLE_DEFINITIONS,
  G3B_U04_SEMANTIC_SCENARIO_PROFILES,
  G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY,
  getG3BU04SemanticRoleDefinition,
  getG3BU04SemanticScenarioProfile,
  listG3BU04ScenarioProfilesForContext,
  listG3BU04ScenarioProfilesForFamily
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-scenarios.js";

const source = JSON.parse(readFileSync(new URL("../../data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json", import.meta.url), "utf8"));
const patternRegistry = JSON.parse(readFileSync(new URL("../../data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json", import.meta.url), "utf8"));
const registry = JSON.parse(readFileSync(new URL("../../data/curriculum/scenarios/S57E2_G3B_U04_SemanticScenarioRoleRegistry.json", import.meta.url), "utf8"));

function placeholders(prompt) {
  return [...String(prompt).matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

test("S57E2 materializes the complete hidden scenario and semantic-role registry", () => {
  assert.equal(registry.schemaName, "G3BU04SemanticScenarioRoleRegistry");
  assert.equal(registry.task, "S57E2_G3B_U04_SemanticScenarioAndRoleRegistry");
  assert.equal(registry.scenarioProfiles.length, 117);
  assert.equal(registry.semanticRoles.length, 77);
  assert.equal(registry.summary.templateFamilyCount, 32);
  assert.equal(registry.summary.knowledgePointCount, 9);
  assert.equal(registry.summary.contextDomainCount, 77);
  assert.equal(registry.summary.profileClassCount, 7);
  assert.equal(registry.summary.uncoveredFamilyCount, 0);
  assert.equal(registry.summary.uncoveredContextDomainCount, 0);
  assert.equal(registry.summary.unresolvedPlaceholderCount, 0);
  assert.equal(registry.summary.unregisteredRoleCount, 0);
  assert.equal(registry.summary.selectorVisibleCount, 0);
  assert.equal(registry.summary.productionReadyCount, 0);
  assert.equal(registry.summary.runtimeProjectionRouted, false);
  assert.equal(new Set(registry.scenarioProfiles.map((profile) => profile.scenarioId)).size, 117);
});

test("S57E2 covers every approved family-context pair exactly once", () => {
  const expectedPairs = source.templateFamilies.flatMap((family) => family.contextDomains.map((contextDomain) => `${family.templateFamilyId}::${contextDomain}`)).sort();
  const actualPairs = registry.scenarioProfiles.map((profile) => `${profile.templateFamilyId}::${profile.contextDomain}`).sort();
  assert.deepEqual(actualPairs, expectedPairs);
  assert.equal(new Set(actualPairs).size, actualPairs.length);
  for (const family of source.templateFamilies) {
    const profiles = listG3BU04ScenarioProfilesForFamily(family.templateFamilyId);
    assert.equal(profiles.length, family.contextDomains.length);
    assert.deepEqual(profiles.map((profile) => profile.contextDomain).sort(), [...family.contextDomains].sort());
  }
  const allDomains = new Set(source.templateFamilies.flatMap((family) => family.contextDomains));
  for (const domain of allDomains) assert.ok(listG3BU04ScenarioProfilesForContext(domain).length > 0);
});

test("S57E2 resolves every nonnumeric prompt placeholder and registers every semantic quantity role", () => {
  const familyById = new Map(source.templateFamilies.map((family) => [family.templateFamilyId, family]));
  const registeredRoles = new Set(registry.semanticRoles.map((role) => role.semanticRole));
  for (const profile of registry.scenarioProfiles) {
    const family = familyById.get(profile.templateFamilyId);
    assert.ok(family);
    const numericSymbols = new Set(Object.keys(family.quantityRoles));
    const nonNumeric = placeholders(family.promptSkeletonZh).filter((placeholder) => !numericSymbols.has(placeholder));
    for (const placeholder of nonNumeric) {
      assert.equal(typeof profile.placeholderBindings[placeholder], "string");
      assert.ok(profile.placeholderBindings[placeholder].length > 0);
    }
    assert.deepEqual(Object.keys(profile.placeholderBindings).sort(), [...new Set(nonNumeric)].sort());
    for (const [symbol, semanticRole] of Object.entries(family.quantityRoles)) {
      assert.equal(registeredRoles.has(semanticRole), true);
      assert.equal(profile.quantityRoleBounds[symbol].semanticRole, semanticRole);
      assert.equal(profile.quantityRoleBounds[symbol].min > 0, true);
      assert.equal(profile.quantityRoleBounds[symbol].max <= 10000, true);
      assert.deepEqual(getG3BU04SemanticRoleDefinition(semanticRole), registry.semanticRoles.find((role) => role.semanticRole === semanticRole));
    }
  }
});

test("S57E2 scenario rows bind units, actions, ownership, bounds, and realism instead of acting as a noun bank", () => {
  const requiredClasses = new Set(registry.requiredProfileClasses);
  assert.deepEqual(new Set(registry.scenarioProfiles.map((profile) => profile.profileClass)), requiredClasses);
  for (const profile of registry.scenarioProfiles) {
    assert.equal(typeof profile.sceneLabel, "string");
    assert.equal(typeof profile.objectLabel, "string");
    assert.ok(profile.itemUnit || profile.measureUnit || profile.capacityUnit || profile.currencyUnit);
    assert.ok(Array.isArray(profile.allowedActions) && profile.allowedActions.length > 0);
    assert.ok(Array.isArray(profile.forbiddenActions) && profile.forbiddenActions.length > 0);
    assert.equal(typeof profile.ownershipModel, "string");
    assert.equal(typeof profile.unitFlowModel, "string");
    assert.ok(registry.realismProfiles[profile.realismProfileRef]);
    assert.equal(profile.status, "approved_hidden_runtime_candidate");
    assert.deepEqual(getG3BU04SemanticScenarioProfile(profile.scenarioId), profile);
  }
});

test("S57E2 preserves the contract realism bounds for age, promotions, packages, liquids, relations, and production", () => {
  assert.deepEqual(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_age, {
    baseChildAge: { min: 6, max: 12 },
    siblingAge: { min: 10, max: 24 },
    parentAge: { min: 25, max: 60 },
    ordering: "baseChildAge<siblingAge<parentAge"
  });
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_money_and_promotion.maximumReceivedItems, 20);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_money_and_promotion.averagePriceMustNotExceedUnitPrice, true);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_packages_and_groups.itemsPerPackageMin, 2);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_packages_and_groups.itemsPerPackageMax, 50);
  assert.deepEqual(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_liquid_containers.allowedUnits, ["毫升", "公升"]);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_liquid_containers.sameSubstanceBeforeCombining, true);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_multiplicative_relationship.multiplierMin, 2);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_multiplicative_relationship.multiplierMax, 9);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_production_common_period.sameTimePeriodRequired, true);
});

test("S57E2 browser projection matches the authoritative JSON exactly and S57E1 family links remain complete", () => {
  assert.deepEqual(G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY, registry);
  assert.deepEqual(G3B_U04_SEMANTIC_SCENARIO_PROFILES, registry.scenarioProfiles);
  assert.deepEqual(G3B_U04_SEMANTIC_ROLE_DEFINITIONS, registry.semanticRoles);
  const specFamilyIds = new Set(patternRegistry.patternSpecs.map((spec) => spec.templateFamilyId));
  for (const profile of registry.scenarioProfiles) assert.equal(specFamilyIds.has(profile.templateFamilyId), true);
});

test("S57E2 keeps selector, router, and production promotion outside the milestone", () => {
  const selectorPath = new URL("../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js", import.meta.url);
  assert.equal(existsSync(selectorPath), false);
  assert.equal(registry.policy.selectorVisibility, "hidden");
  assert.equal(registry.policy.generatorRouting, "not_implemented_in_s57e2");
  assert.equal(registry.policy.productionUse, "forbidden");
});
`;
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE_TEMPLATE_PATH, "utf8"));
  const patternRegistry = JSON.parse(await readFile(PATTERN_SPEC_PATH, "utf8"));
  validateSource(source, patternRegistry);

  const scenarioProfiles = source.templateFamilies.flatMap((family) => family.contextDomains.map((domain) => buildScenarioProfile(family, domain)));
  const roleNames = [...new Set(source.templateFamilies.flatMap((family) => Object.values(family.quantityRoles)))].sort();
  const semanticRoles = roleNames.map((semanticRole) => ({
    semanticRole,
    ...roleMetadata(semanticRole),
    integerOnly: true,
    positiveRequired: true,
    status: "registered_hidden_runtime_candidate"
  }));
  const contextDomains = [...new Set(source.templateFamilies.flatMap((family) => family.contextDomains))].sort();
  const requiredProfileClasses = Object.keys(PROFILE_ACTIONS);
  const profileClassCounts = stableCount(scenarioProfiles.map((profile) => profile.profileClass));
  const byTemplateFamilyId = stableCount(scenarioProfiles.map((profile) => profile.templateFamilyId));
  const byContextDomain = stableCount(scenarioProfiles.map((profile) => profile.contextDomain));

  assert(scenarioProfiles.length === 117, `Expected 117 family-context profiles, got ${scenarioProfiles.length}`);
  assert(new Set(scenarioProfiles.map((profile) => profile.scenarioId)).size === 117, "Duplicate scenario id");
  assert(semanticRoles.length === 77, `Expected 77 semantic roles, got ${semanticRoles.length}`);
  assert(contextDomains.length === 77, `Expected 77 context domains, got ${contextDomains.length}`);
  assert(new Set(scenarioProfiles.map((profile) => profile.profileClass)).size === 7, "Required profile class coverage incomplete");

  const registry = {
    schemaName: "G3BU04SemanticScenarioRoleRegistry",
    schemaVersion: 1,
    task: "S57E2_G3B_U04_SemanticScenarioAndRoleRegistry",
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    registryStatus: "authoritative_materialized_hidden_not_routed",
    sourceTemplateRegistryRef: "data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json",
    patternSpecRegistryRef: "data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json",
    semanticValidationContractRef: "data/curriculum/contracts/S57_G3B_U04_SemanticValidationContract.json",
    policy: {
      scenarioGranularity: "one_profile_per_template_family_and_context_domain",
      nounBankOnlyForbidden: true,
      allPromptPlaceholdersMustResolve: true,
      allQuantityRolesMustBeRegistered: true,
      unitClassifierActionCompatibilityRequired: true,
      selectorVisibility: "hidden",
      generatorRouting: "not_implemented_in_s57e2",
      productionUse: "forbidden"
    },
    requiredProfileClasses,
    profileClassDefinitions: Object.fromEntries(requiredProfileClasses.map((profileClass) => [profileClass, {
      allowedActions: [...PROFILE_ACTIONS[profileClass].allowedActions],
      forbiddenActions: [...PROFILE_ACTIONS[profileClass].forbiddenActions],
      realismProfileRef: REALISM_REFS[profileClass]
    }])),
    realismProfiles: REALISM_PROFILES,
    semanticRoles,
    scenarioProfiles,
    coverage: {
      byTemplateFamilyId,
      byContextDomain,
      profileClassCounts
    },
    summary: {
      scenarioProfileCount: scenarioProfiles.length,
      semanticRoleCount: semanticRoles.length,
      templateFamilyCount: source.templateFamilies.length,
      knowledgePointCount: new Set(source.templateFamilies.map((family) => family.knowledgePointId)).size,
      contextDomainCount: contextDomains.length,
      profileClassCount: requiredProfileClasses.length,
      uncoveredFamilyCount: source.templateFamilies.filter((family) => !byTemplateFamilyId[family.templateFamilyId]).length,
      uncoveredContextDomainCount: contextDomains.filter((domain) => !byContextDomain[domain]).length,
      unresolvedPlaceholderCount: 0,
      unregisteredRoleCount: 0,
      selectorVisibleCount: 0,
      productionReadyCount: 0,
      runtimeProjectionMaterialized: true,
      runtimeProjectionRouted: false
    }
  };

  await Promise.all([OUTPUT_JSON_PATH, OUTPUT_JS_PATH, OUTPUT_TEST_PATH].map((path) => mkdir(dirname(path), { recursive: true })));
  await writeFile(OUTPUT_JSON_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  await writeFile(OUTPUT_JS_PATH, deepFreezeModule(registry), "utf8");
  await writeFile(OUTPUT_TEST_PATH, testModule(), "utf8");
  console.log(JSON.stringify({
    scenarioProfileCount: scenarioProfiles.length,
    semanticRoleCount: semanticRoles.length,
    contextDomainCount: contextDomains.length,
    profileClassCount: requiredProfileClasses.length,
    outputs: [OUTPUT_JSON_PATH, OUTPUT_JS_PATH, OUTPUT_TEST_PATH]
  }, null, 2));
}

await main();

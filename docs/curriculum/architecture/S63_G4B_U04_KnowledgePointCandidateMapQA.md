# S63 — G4B-U04 KnowledgePoint Candidate Map QA

```text
TASK = S63_G4B_U04_KnowledgePointCandidateMapQA
STATUS = PASS_PENDING_CI
SOURCE_ID = g4b_u04_4b04
CANDIDATES_REVIEWED = 12
CANDIDATES_ACCEPTED = 12
MERGED = 0
SPLIT = 0
REJECTED = 0
```

## 1. Purpose

S63 reviews the 12 S62 KnowledgePoint candidates for:

- duplicate or overlapping boundaries;
- over-fragmentation;
- canonical-skill consistency;
- source-evidence sufficiency;
- premature mapping or production promotion.

## 2. Canonical parent normalization

All 12 candidates belong under the existing broad canonical skill:

```text
rounding_approximation
```

The more granular S62 labels are retained as **skill variants**, not promoted as 12 new canonical skills.

This prevents tag-registry inflation while preserving distinct generator and validator requirements.

## 3. Boundary decisions

### Concept and representation

```text
概數語意關鍵詞與精確數辨識
≠
約等號、近似符號與讀法
```

Reason: semantic classification and notation literacy use different prompts and answers.

### Method comparison and direct execution

```text
三種取概數方法比較
≠
無條件捨去 / 無條件進入 / 四捨五入執行
```

Reason: the comparison node is a strategy-selection boundary; the other nodes execute deterministic place-value transformations.

### General floor/ceiling context and payment context

```text
最多完整數量 / 最少需求數量
≠
依鈔票面額付款
```

Reason: payment additionally requires denomination-to-place mapping and a payment-sufficiency constraint.

### Operation estimation

```text
先取概數再加減
≠
先取概數再乘除
```

Reason: the operation families require different generation constraints and validator hooks.

### Inverse rounding

```text
推回未知數字集合
≠
推回可能原數集合 / 範圍
```

Reason: the first returns a digit set; the second intersects a rounding interval with partial visible digits.

## 4. QA outcome

```text
accepted as distinct = 12
merge required = 0
split required = 0
reject required = 0
```

Implementation feasibility remains:

```text
Class C deterministic candidates = 8
Class D controlled semantic-template candidates = 4
```

These classes remain candidates only.

## 5. Source anomaly disposition

The page header URL `/4b03/` mismatch remains recorded but non-blocking.

```text
sourceId = g4b_u04_4b04
reason = uploaded filename + unit title + curriculum assignment agree on 4B-U04
```

## 6. Data artifact

```text
data/curriculum/registry/g4b_u04_knowledge_point_candidate_qa.json
```

The overlay preserves S62 as the source extraction artifact and records S63 boundary decisions separately.

## 7. Gate

```text
12 / 12 S62 IDs covered exactly once
12 / 12 canonical parent = rounding_approximation
12 / 12 distinct skill variants
5 duplicate-risk pairs reviewed
source anomaly retained
KnowledgePoint promotion = false
FormalMapping = not created
PatternSpec = not created
generator = not implemented
validator = not implemented
productionUse = forbidden
```

## 8. Distance and scope stop

```text
GOAL_DISTANCE_BEFORE = D3_G4B_U04_12_KNOWLEDGE_POINT_CANDIDATES_EXTRACTED
GOAL_DISTANCE_AFTER  = D3_G4B_U04_12_KNOWLEDGE_POINT_BOUNDARIES_QA_LOCKED
DISTANCE_REDUCED     = Removed duplicate-boundary, over-fragmentation and canonical-parent ambiguity from the extracted G4B-U04 KnowledgePoint map.
REMAINING_BLOCKERS   = [
  "FormalMapping candidate design not authorized by the current extraction request",
  "PatternSpec and runtime contracts not created"
]
NEXT_SHORTEST_STEP   = S64_G4B_U04_FormalMappingCandidateDesign
STOP_REASON          = NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```

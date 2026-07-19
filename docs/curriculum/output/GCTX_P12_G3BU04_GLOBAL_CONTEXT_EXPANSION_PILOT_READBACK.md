# GCTX-P12 G3B-U04 Global Context Expansion Pilot — Readback

## Status

```text
PASS_ACCEPTED_PENDING_MERGE
```

P12 is the first GCTX milestone in this sequence that creates actual new learner-visible context text. P09–P11 remain classified as legacy migration and review infrastructure.

## Fixed mathematical authority

```text
KnowledgePoint  = kp_g3b_u04_add_then_divide
PatternSpec     = ps_g3b_u04_add_divide_joint_purchase_equal_share
ContextFamily   = gctx_cf_g3b_u04_add_divide_joint_purchase_equal_share
Operation       = (a+b)/c
Quantity roles  = first_shared_cost, second_shared_cost, payer_count
Question target = cost_per_person
Answer unit     = 元
```

## Before

```text
三明治費用共60元，果汁費用共90元。5人一起訂購並分享餐點，總費用平均分擔，每人要付多少元？
```

## New rendered review questions

### 1. 班級園遊會籌備

```text
5位同學共同準備班級園遊會，布置材料費60元，點心材料費90元。兩項費用由5人平均分擔，每人要付多少元？
```

### 2. 戶外學習準備

```text
5位同學一起準備戶外學習，活動手冊印製費60元，導覽器材租借費90元。兩項費用由5人平均分擔，每人要付多少元？
```

### 3. 運動練習預約

```text
5位同學一起安排運動練習，場地使用費60元，器材租借費90元。兩項費用由5人平均分擔，每人要付多少元？
```

### 4. 社區清潔準備

```text
5位同學共同準備社區清潔活動，工作手套費60元，清潔袋費90元。兩項費用由5人平均分擔，每人要付多少元？
```

### 5. 露營活動準備

```text
5位同學一起準備露營活動，營燈租借費60元，炊事用品費90元。兩項費用由5人平均分擔，每人要付多少元？
```

All five retain the same mathematical witness:

```text
(60 + 90) ÷ 5 = 30
answer = 30元
```

## Acceptance summary

```text
P01 candidate bindings             = 5
P01 valid bindings                 = 5
P01 binding errors                 = 0
rendered questions                 = 5
unique prompts                     = 5
unique context domains             = 5
unique semantic fingerprints       = 5
legacy prompts in new output       = 0
mathematical recomputation errors  = 0
human review packets               = 5
human decisions                    = 0
production-selectable bindings     = 0
runtime-resolvable bindings        = 0
```

## CI

```text
accepted head SHA    = 314b64b38a0701658d489a9332382541178e1048
Node Test run        = 29667776313 — success
Math CI Readback run = 29667776302 — success
working-tree gate    = success
```

The full Node suite includes P12 positive, deterministic replay, semantic-axis uniqueness, non-divisible arithmetic, answer recomputation, legacy-prompt leakage, false-production-admission, and rendered-review-packet checks.

## Scope boundary

P12 does not claim that public worksheets already use these variants.

```text
formal approved registry changed = false
production selectable            = false
runtime resolvable               = false
public router changed            = false
renderer changed                 = false
human review executed            = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_G3BU04_LEGACY_CONTEXT_STRUCTURE_READY
GOAL_DISTANCE_AFTER  = D2_GCTX_G3BU04_NEW_VISIBLE_CONTEXT_PILOT_ACCEPTED_PENDING_MERGE_AND_HUMAN_REVIEW
DISTANCE_REDUCED     = five exact learner-visible context candidates, P01 bindings, mathematical witnesses and rendered review evidence now exist beyond the four legacy prompts
REMAINING_BLOCKERS   = [merge, human semantic review, human mathematical review, formal production admission, runtime resolver integration, public HTML/PDF verification]
NEXT_SHORTEST_STEP   = GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission
```

## Closeout

1. **Distance shortened:** legacy-only candidate evidence → five new rendered activity-context candidates.
2. **Node advanced:** Global Context candidate binding and rendered-review evidence.
3. **Blocker removed:** the pilot no longer lacks learner-visible new contexts.
4. **New blocker:** five rendered prompts require explicit human approve/reject decisions before production admission.
5. **Next step:** review these exact five prompts and mathematical witnesses, then admit only approved variants.

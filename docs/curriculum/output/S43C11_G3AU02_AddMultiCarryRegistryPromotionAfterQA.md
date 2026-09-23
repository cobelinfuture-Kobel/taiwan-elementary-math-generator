# S43C11 G3A-U02 Add Multi-Carry Registry Promotion After QA

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C11_G3AU02_AddMultiCarryRegistryPromotionAfterQA
TASK_STATUS = REGISTRY_PROMOTION_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = registry_json_promotion_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C11_G3AU02_AddMultiCarryRegistryPromotionAfterQA
ROADMAP_ALIGNMENT = PASS
```

S43C11 follows S43C10R1 local PASS and promotes only the QA-verified add-multi-carry registry triplet. It does not regenerate browser selector modules and does not enable HTML KnowledgePoint modes.

## Files Changed

```text
data/curriculum/registry/batch_a_knowledge_points.json
data/curriculum/registry/batch_a_pattern_groups.json
data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
docs/curriculum/output/S43C11_G3AU02_AddMultiCarryRegistryPromotionAfterQA.md
```

## Promotion Target

```text
knowledgePointId = kp_g3a_u02_add_multi_carry
patternGroupId = pg_g3a_u02_add_multi_carry_seed
mappingId = map_g3a_u02_add_multi_carry_seed
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
sourceId = g3a_u02_3a02
```

## Registry Changes

```text
KnowledgePoint.htmlSelectableStatus = selectable
KnowledgePoint.holdReason = null
PatternGroup.visibilityStatus = visible
PatternGroup.generatorSupportStatus = carry_policy_supported
PatternGroup.validatorSupportStatus = carry_policy_verified
PatternGroup.htmlWorksheetStatus = printable_after_selector_regen
PatternGroup.answerKeyStatus = supported
PatternGroup.holdReason = null
Mapping.mappingStatus = qa_verified_mapped
Mapping.constraintStatus = carry_policy_verified
Mapping.generatorRequirement = carry_policy_enforced
Mapping.validatorRequirement = carry_policy_hook_verified
Mapping.htmlExposurePolicy = eligible_after_qa
Mapping.qaStatus = qa_verified
Mapping.holdReason = null
```

## Protection Preserved

```text
kp_g3a_u02_sub_multi_borrow remains hidden / internal_only / smoke_test_required
kp_g3a_u02_estimate_nearest_thousand remains not_selectable
kp_g3a_u02_word_problem_estimation_add_sub remains not_selectable
```

## Browser Selector Boundary Preserved

S43C11 intentionally does not regenerate browser selector modules.

Current generated selector module remains:

```text
BATCH_A_SELECTOR_AVAILABILITY.visibleCount = 0
BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount = 2
BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount = 2
VISIBLE_KNOWLEDGE_POINTS = []
```

Therefore production HTML selector behavior remains zero-visible until S43C12 regenerates browser registry modules.

## S43C11 Gate

```text
S43C11_GATE = PASS_REGISTRY_PROMOTION_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- roadmap alignment checked and passed
- only add-multi-carry KnowledgePoint promoted to selectable
- only add-multi-carry PatternGroup promoted to visible
- only add-multi-carry mapping promoted to eligible_after_qa / qa_verified
- subtract multi-borrow row remains hidden/internal/smoke_test_required
- D rows remain not_selectable
- browser selector modules not regenerated
- generated browser selector visibleCount remains 0
- HTML KP modes not enabled

GAPS:
- post-S43C11 npm test / CI not observed
- browser selector modules must be regenerated in S43C12 before visibleCount becomes 1
- HTML KP modes remain disabled until S43C13
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_VISIBLE_KP_QUERY_SURVIVAL_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_REGISTRY_TRIPLET_PROMOTED_PENDING_REGEN_AND_TEST_READBACK
DISTANCE_REDUCED     = first G3A-U02 add-multi-carry registry triplet is now selectable/visible/eligible_after_qa in raw registry data while generated browser projection is intentionally left unchanged until S43C12

FirstVisibleKPRegistryPromotion         0% -> 100%
BrowserRegistryVisibleCountOne          0% ->   0%
HTMLSingleVisibleKPEnablement           0% ->   0%
KPHTMLSelectablePath                   75% ->  80%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C11 npm test PASS 尚未 observed",
  "browser selector modules 尚未 regenerated with visibleCount = 1",
  "HTML KP modes 尚未 enabled for visible candidate",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C11R1_CIOrLocalTestReadback
```

# S43 Roadmap — BatchA KnowledgePoint Selectable HTML Worksheet

## 0. Roadmap Lock

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43R_RoadmapLock
TASK_STATUS = ROADMAP_LOCKED
WRITE_TYPE = roadmap_only
ROADMAP_AUTHORITY = binding_until_S43_closeout
```

This file is the controlling roadmap for the rest of S43. Until S43 is closed, future tasks must align with this roadmap unless a later explicit `S43R*_RoadmapRevision` task updates this file.

## 1. S43 Goal

S43 is not a general Batch A expansion task and not a free-form UI task. S43 has one target:

```text
Batch A 13 source units
→ each selectable/supported KnowledgePoint has registry coverage
→ each selectable/supported KnowledgePoint resolves to visible PatternGroup / PatternSpec
→ HTML can expose KnowledgePoint selection safely
→ worksheet generation remains validated
→ answer key remains supported
→ print path remains usable
→ no hidden / D-class row leakage
→ QA PASS
```

## 2. Non-Negotiable Scope Boundary

```text
IN SCOPE:
- S43A inventory and source-pattern coverage
- S43B schema / visibility policy locks
- S43C G3A-U02 prototype and first visible-KP path
- S43D HTML zero-visible selector and resolver groundwork
- S43E Batch A 13-unit KP expansion after prototype gate
- S43F generator / validator expansion after registry expansion gate
- S43G mixed KP worksheet QA after supported KP exists
- S43H final S43 closeout

OUT OF SCOPE unless explicitly reached by roadmap gate:
- Batch B/C/D/E
- production release
- unrelated UI redesign
- future worksheet product features
- student wrong-answer book / adaptive weighting
- AI fusion / literacy task generation beyond S43 KP selector needs
- direct registry promotion without QA gates
```

## 3. Current Roadmap Correction

A task-code drift was detected before this roadmap lock.

The recent tasks named:

```text
S43E1_G3AU02_FirstVisibleKnowledgePointPromotionPlan
S43E2_G3AU02_AddMultiCarryPromotionQA
S43E2R1_CIOrLocalTestReadback
```

are goal-aligned with S43, but they were incorrectly placed under S43E. They belong to the G3A-U02 prototype / first visible-KP path.

Correction:

```text
GOAL_DRIFT = false
TASK_CODE_DRIFT = true
CORRECTED_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
S43E_NOT_STARTED = true
```

From this roadmap forward:

```text
Do not continue S43E numbering for G3A-U02 carry-policy / promotion tasks.
Use S43C numbering until the first visible-KP prototype gate is complete.
Only enter S43E after the S43C and S43D gates listed below are satisfied.
```

## 4. Phase Map

```text
S43A = Inventory / current state scan
S43B = Schema and visibility policy lock
S43C = G3A-U02 prototype and first visible-KP path
S43D = HTML selector / state / query / resolver path
S43E = Batch A 13-unit KP expansion
S43F = Generator / validator expansion for supported KP groups
S43G = Mixed KnowledgePoint worksheet QA
S43H = Final S43 closeout
S43R = Roadmap / execution-control revisions only
```

## 5. Completed Before Roadmap Lock

```text
S43A1 = PASS
S43A2 = PASS
S43A3 = PASS
S43A4 = PASS
S43A5 = PASS

S43B1 = PASS
S43B2 = PASS
S43B3 = PASS
S43B4 = PASS
S43B5 = PASS

S43C1 = PASS
S43C2 = PASS
S43C3 = PASS
S43C4 = PASS
S43C5 = PASS

S43D1 = PASS
S43D2 = PASS
S43D3 = PASS
S43D4 = PASS
S43D5 = PASS
S43D6 = PASS
S43D7 = PASS
S43D7R1 = PASS
S43D7R2 = PASS_LOCAL_SYNCED_AND_TESTED
S43D8 = PASS_VISIBLE_PATTERN_GROUP_RESOLVER_IMPLEMENTED_READBACK_PENDING_CI_DUPLICATE_CLEANED
S43D8R1 = PASS_LOCAL_SYNCED_AND_TESTED
S43D9 = PASS_HTML_ZERO_VISIBLE_SELECTOR_UI_IMPLEMENTED_READBACK_PENDING_CI
S43D9R1 = PASS_LOCAL_SYNCED_AND_TESTED
```

## 6. Reclassified Completed Prototype Tasks

The following completed tasks are reclassified under S43C and remain valid evidence:

```text
S43C6A_G3AU02_FirstVisibleKnowledgePointPromotionPlan
  previous label = S43E1_G3AU02_FirstVisibleKnowledgePointPromotionPlan
  status = PASS_FIRST_VISIBLE_KP_PROMOTION_PLAN_LOCKED_NO_VISIBILITY_CHANGE

S43C6B_G3AU02_AddMultiCarryPromotionQA
  previous label = S43E2_G3AU02_AddMultiCarryPromotionQA
  status = PASS_PROMOTION_QA_GUARD_ADDED_STRICT_PROMOTION_BLOCKED_PENDING_TEST_READBACK

S43C6B_R1_CIOrLocalTestReadback
  previous label = S43E2R1_CIOrLocalTestReadback
  status = PASS_LOCAL_SYNCED_AND_TESTED
```

These are not deleted or rewritten. They are reclassified for future sequencing.

## 7. Current Effective Position

```text
CURRENT_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
CURRENT_STATE = first visible-KP candidate selected and guarded, but not promoted
CURRENT_VISIBLE_KP_COUNT = 0
CURRENT_SELECTOR_STATE = zero-visible sourceUnit-only safe mode
CURRENT_BLOCKER = strict carry policy / validator hook not decided
```

Current candidate:

```text
knowledgePointId = kp_g3a_u02_add_multi_carry
patternGroupId = pg_g3a_u02_add_multi_carry_seed
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
sourceId = g3a_u02_3a02
```

Current decision from promotion QA:

```text
PROMOTION_LEVEL_DECISION = NO_PROMOTION
STRICT_MULTI_CARRY_PROMOTION = BLOCKED
SEED_VISIBLE_WITH_WARNING = NOT_APPROVED_IN_S43C6B
```

## 8. Required Roadmap Sequence From This Point

### S43C — G3A-U02 Prototype and First Visible-KP Path

```text
S43C6_G3AU02_AddMultiCarryStrictPolicyDecision
S43C7_G3AU02_AddMultiCarryCarryPolicyOrSeedVisibleContract
S43C8_G3AU02_AddMultiCarryImplementationIfStrictPathSelected
S43C9_G3AU02_AddMultiCarryPositiveResolverFixture
S43C10_G3AU02_VisibleKPQuerySurvivalPatch
S43C11_G3AU02_AddMultiCarryRegistryPromotionAfterQA
S43C12_G3AU02_BrowserRegistryRegenVisibleCountOne
S43C13_G3AU02_HTMLSingleVisibleKPEnablement
S43C14_G3AU02_SingleVisibleKPSmokeQA
S43C15_G3AU02PrototypeCloseout
```

S43C gate:

```text
S43C_GATE = PASS only if:
- first G3A-U02 KP is legitimately visible/selectable
- visibleCount = 1 after registry regen
- hidden and D rows remain hidden / not_selectable
- resolver positive fixture passes
- query survival for the visible KP passes
- HTML can select the single visible KP
- sourceUnit worksheet path remains unaffected
- npm test or CI PASS observed
```

### S43D — HTML Selector Path

S43D base groundwork is already complete in zero-visible mode. After S43C creates one visible KP, S43D may continue only for visible-KP UI behavior.

```text
S43D10_HTMLSingleVisibleKnowledgePointSelectorPatch
S43D11_HTMLSingleVisibleKnowledgePointSelectorQA
S43D12_HTMLSameUnitMultiKPSelectorDesignOnly
```

S43D gate:

```text
S43D_GATE = PASS only if:
- sourceUnit mode remains supported
- one visible KP can be selected
- hidden / D rows cannot be selected by DOM or query params
- invalid KP IDs are dropped or rejected
- no unsupported mixed mode is enabled early
```

### S43E — Batch A 13-Unit KP Expansion

S43E must not begin until S43C_GATE is PASS and S43D visible-KP selector gate is at least single-KP safe.

```text
S43E1_G3A_U01_KPExpansion
S43E2_G3A_U02_KPExpansionCompletion
S43E3_G3A_U03_KPExpansion
S43E4_G3A_U06_KPExpansion
S43E5_G3B_U01_KPExpansion
S43E6_G3B_U04_KPExpansion
S43E7_G3B_U08_KPExpansion
S43E8_G4A_U01_KPExpansion
S43E9_G4A_U02_KPExpansion
S43E10_G4A_U04_KPExpansion
S43E11_G4A_U08_KPExpansion
S43E12_G4B_U01_KPExpansion
S43E13_G5A_U08_KPExpansion
```

S43E fixed output per unit:

```text
KnowledgePointNode list
PatternGroup list
KP to PatternSpec mapping
supportClass A/B/C/D classification
generatorSupport classification
validatorSupport classification
htmlPrintable classification
blockedReason for unsupported rows
```

S43E gate:

```text
S43E_GATE = PASS only if:
- 13 / 13 Batch A source units have KP registry coverage
- all supported KPs have PatternGroup / PatternSpec path
- all unsupported KPs have explicit blocked reason
- D rows remain not_selectable
- no unit bypasses source evidence
```

### S43F — Generator / Validator Expansion

S43F begins only after enough S43E rows exist to justify runtime implementation.

```text
S43F1_ExistingGeneratorCoverageClassification
S43F2_ExistingValidatorCoverageClassification
S43F3_NewPatternSpecNeededList
S43F4_NewGeneratorVariantNeededList
S43F5_NewValidatorHookNeededList
S43F6_ImplementSupportedPatternSpecsInBatches
S43F7_PerPatternSpecUnitTests
```

S43F gate:

```text
S43F_GATE = PASS only if:
- all exposed A/B/C PatternGroups can generate questions
- validator accepts valid generated questions
- validator rejects invalid or out-of-scope questions
- D rows cannot leak into HTML or resolver output
```

### S43G — Mixed KnowledgePoint Worksheet QA

```text
S43G1_SingleKnowledgePointSmokeQA
S43G2_SameUnitMultiKnowledgePointSmokeQA
S43G3_CrossUnitMultiKnowledgePointSmokeQA
S43G4_AnswerKeySmokeQA
S43G5_IframePreviewSmokeQA
S43G6_PrintSmokeQA
S43G7_RegressionQA
```

S43G gate:

```text
S43G_GATE = PASS only if:
- single KP worksheet path passes
- same-unit mixed KP worksheet path passes
- cross-unit mixed KP worksheet path passes only if explicitly enabled by resolver policy
- answer key remains correct
- print path remains usable
- no unsupported pattern leakage
```

### S43H — Final Closeout

```text
S43H1_FinalArtifactIndex
S43H2_CapabilityStatement
S43H3_KnownLimitList
S43H4_DistanceVectorUpdate
S43H5_S43FinalQAReadback
S43H6_S43Closeout
```

S43 final gate:

```text
S43_DONE = true only if:
- roadmap gates satisfied or explicitly revised
- no hidden / D leakage
- supported KP selection works as scoped
- worksheet output and answer key pass QA
- tests pass
```

## 9. Execution Rules After Roadmap Lock

Every future S43 task must begin by checking this file and must declare:

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43?
ROADMAP_NEXT_EXPECTED_STEP = ...
ROADMAP_ALIGNMENT = PASS / FAIL
```

If a requested task does not match the roadmap:

```text
Do not execute implementation.
Respond with ROADMAP_ALIGNMENT = FAIL.
Either map the request to the correct roadmap step or request an explicit S43R*_RoadmapRevision task.
```

## 10. Anti-Scope-Creep Rule For S43

```text
- One subtask only.
- Do not jump from S43C to S43E before S43C gate passes.
- Do not promote registry rows without explicit QA and test readback.
- Do not enable HTML KP mode before selector visibility and query survival are safe.
- Do not implement mixed-KP generation before single visible-KP path passes.
- Do not expand to all 13 units before G3A-U02 prototype gate passes.
- Do not treat S43Overall 99% as done; remaining 1% contains critical visibility and QA gates.
```

## 11. Current Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C6_G3AU02_AddMultiCarryStrictPolicyDecision
```

This is a decision task, not implementation. It must decide whether to pursue:

```text
Path A = strict carry-policy implementation and validator hook
Path B = seed-visible-with-warning policy with honest selector label
Path C = abandon add_multi_carry as first visible KP and choose a lower-risk candidate
```

No registry promotion may happen during S43C6.

## 12. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_POST_PROMOTION_QA_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_S43_ROADMAP_LOCKED_AND_TASK_CODE_DRIFT_CORRECTED
DISTANCE_REDUCED     = roadmap locked; task-code drift corrected; future S43 execution now has a binding route from current G3A-U02 prototype state to final S43 closeout

RoadmapControl                         0% -> 100%
TaskCodeAlignment                     70% -> 100%
FirstVisibleKPTestReadback           100% -> 100%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   40% ->  40%
S43Overall                             99% ->  99%
```

## 13. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "strict carry constraint for ps_g3a_u02_4digit_add_multi_carry 尚未 QA-verified",
  "explicit carryPolicy / algorithmConstraint / validatorHooks 尚未 exists",
  "browser validator 尚未驗證 carry occurrence",
  "S43C6 strict/seed/alternate path decision 尚未 locked",
  "resolver positive visible-KP fixture 尚未 implemented",
  "future visible-KP query survival 尚未 implemented",
  "registry triplet 尚未 promoted to selectable/visible/eligible_after_qa",
  "browser selector modules 尚未 regenerated with visibleCount = 1",
  "HTML KP modes 尚未 enabled for visible candidate",
  "S43E 13-unit KP expansion 尚未開始",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

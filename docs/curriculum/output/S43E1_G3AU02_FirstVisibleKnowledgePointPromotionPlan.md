# S43E1 G3A-U02 First Visible KnowledgePoint Promotion Plan

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E1_G3AU02_FirstVisibleKnowledgePointPromotionPlan
TASK_STATUS = PROMOTION_PLAN_LOCKED_NO_VISIBILITY_CHANGE
WRITE_TYPE = docs_only_promotion_plan
```

S43E1 defines the first candidate and gates for promoting one G3A-U02 KnowledgePoint from hidden-pending to visible/selectable. This task does not modify registry visibility, generated browser selector modules, HTML selector behavior, generator, validator, or worksheet builder.

## Precondition Evidence

```text
S43D8R1 local readback before S43D9:
- tests 830
- pass 830
- fail 0
- working tree clean

Operator post-S43D9 local readback provided in conversation:
- tests 830
- pass 830
- fail 0
- working tree clean
```

S43E1 treats post-S43D9 test readback as operator-provided prerequisite evidence for planning, but the actual promotion still requires a dedicated promotion QA task before any registry row becomes selectable.

## Source Registry Readback

Current G3A-U02 registry scope:

```text
sourceId = g3a_u02_3a02
unitCode = 3A-U02
unitTitle = 四位數的加減
```

Current materialized rows:

```text
A / hidden:
- kp_g3a_u02_add_multi_carry
- kp_g3a_u02_sub_multi_borrow

D / not_selectable:
- kp_g3a_u02_estimate_nearest_thousand
- kp_g3a_u02_word_problem_estimation_add_sub
```

Current browser selector projection remains:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

## Promotion Policy Applied

S43B4 requires all of the following before a row may become selectable-ready:

```text
KnowledgePointNode.htmlSelectableStatus = selectable
PatternGroup.visibilityStatus = visible
Mapping.htmlExposurePolicy = eligible_after_qa
Mapping.qaStatus = qa_verified
```

For A-class seed rows, S43B4 also requires:

```text
KnowledgePointNode.registryStatus = qa_verified
PatternGroup.registryStatus = qa_verified
Mapping.qaStatus = qa_verified
PatternGroup has at least one PatternSpec ID
generatorSupportStatus = supported or seed_supported
validatorSupportStatus = supported or seed_supported
htmlWorksheetStatus = printable or seed_printable
answerKeyStatus = supported or seed_supported
```

D-class rows remain prohibited during S43 and cannot be exposed through fallback UI, query params, direct resolver input, or mixed worksheet selection.

## Candidate Comparison

| Candidate | Current Class | Current State | Existing PatternSpec | Main blocker | Promotion priority |
|---|---:|---|---|---|---:|
| `kp_g3a_u02_add_multi_carry` | A | hidden / qa_pending | `ps_g3a_u02_4digit_add_multi_carry` | explicit carry enforcement not QA-verified | P1 |
| `kp_g3a_u02_sub_multi_borrow` | A | hidden / qa_pending | `ps_g3a_u02_4digit_sub_multi_borrow` | explicit borrow enforcement not QA-verified | P2 |
| `kp_g3a_u02_estimate_nearest_thousand` | D | not_selectable | none | planned_only / outside S43 printable path | blocked |
| `kp_g3a_u02_word_problem_estimation_add_sub` | D | not_selectable | none | word_problem_template_required | blocked |

## First Promotion Candidate Decision

```text
FIRST_VISIBLE_PROMOTION_CANDIDATE = kp_g3a_u02_add_multi_carry
PATTERN_GROUP = pg_g3a_u02_add_multi_carry_seed
PATTERN_SPEC = ps_g3a_u02_4digit_add_multi_carry
SOURCE_ID = g3a_u02_3a02
UNIT = 3A-U02 四位數的加減
```

Rationale:

```text
- Candidate is A-class and already materialized.
- Candidate has an existing browser PatternSpec.
- PatternGroup already references exactly one PatternSpec.
- Generator / validator / worksheet / answer-key support statuses are already seed-supported in the PatternGroup row.
- Addition multi-carry is lower risk than subtraction multi-borrow for the first visible candidate because it does not require non-negative operand ordering and does not need borrow-chain handling.
- Remaining blocker is focused: explicit carry enforcement must be QA-verified before visibility changes.
```

## Non-Decision

S43E1 does not promote the row yet. The following remain unchanged after this task:

```text
KnowledgePointNode.htmlSelectableStatus = hidden
PatternGroup.visibilityStatus = hidden
Mapping.htmlExposurePolicy = internal_only
Mapping.qaStatus = smoke_test_required
Mapping.holdReason = constraint_warning
Browser selector visibleCount = 0
HTML selector KP modes = disabled
```

## Required Promotion Gates for S43E2

S43E2 must perform QA before registry changes. Required gates:

```text
GATE_1_PATTERN_SPEC_READBACK:
- confirm ps_g3a_u02_4digit_add_multi_carry exists
- confirm sourceId = g3a_u02_3a02
- confirm operator is addition only
- confirm range and answer constraints match printable Grade 3A U02 expectations

GATE_2_GENERATOR_SMOKE_QA:
- generate deterministic sample set for ps_g3a_u02_4digit_add_multi_carry
- assert every item uses four-digit operands
- assert answer is integer and within answerMax
- assert no negative or invalid output possible
- assert answer key renders numericAnswer

GATE_3_CARRY_CONSTRAINT_QA:
- inspect generated sample set for carry occurrence
- define accepted promotion level:
  - strict: every generated item has at least one carry, or
  - seed-visible-with-warning: PatternSpec title remains coarse but selector label says seed four-digit addition, not strict every-item multi-carry
- S43E2 must choose one; no ambiguous promotion allowed

GATE_4_RESOLVER_POSITIVE_FIXTURE:
- create test fixture or temporary registry projection proving visible KP resolves to patternGroup and PatternSpec
- assert allocation is non-empty
- assert sourceUnit path still unaffected
- assert D rows still rejected

GATE_5_SELECTOR_QUERY_SURVIVAL:
- extend query-state to allow this visible KP ID only after browser selector projection exposes it
- assert hidden/D IDs still drop
- assert selected visible KP can survive URL hydration

GATE_6_BROWSER_REGISTRY_REGEN:
- change registry triplet only after gates 1-5 pass
- regenerate site/modules/curriculum/registry/*.js from authoritative registry JSON
- assert visibleCount = 1, hiddenPendingCount = 1, notSelectableCount = 2
```

## Future Registry Changes After QA Pass Only

If S43E2 passes, S43E3 may modify the triplet as follows:

```text
KnowledgePointNode:
knowledgePointId = kp_g3a_u02_add_multi_carry
registryStatus = qa_verified
htmlSelectableStatus = selectable
holdReason = null

PatternGroup:
patternGroupId = pg_g3a_u02_add_multi_carry_seed
registryStatus = qa_verified
visibilityStatus = visible
holdReason = null

Mapping:
mappingId = map_g3a_u02_add_multi_carry_seed
mappingStatus = qa_verified
constraintStatus = qa_verified OR seed_visible_with_constraint_note
htmlExposurePolicy = eligible_after_qa
qaStatus = qa_verified
holdReason = null
```

## Explicit Non-Scope for S43E1

```text
- do not edit data/curriculum/registry/*.json
- do not regenerate browser registry modules
- do not enable KP modes in HTML selector
- do not wire resolver to worksheet builder
- do not promote subtraction multi-borrow yet
- do not add C-class fine PatternSpecs
- do not expose D rows
```

## S43E1 Gate

```text
S43E1_GATE = PASS_FIRST_VISIBLE_KP_PROMOTION_PLAN_LOCKED_NO_VISIBILITY_CHANGE

PASS:
- first candidate selected: kp_g3a_u02_add_multi_carry
- source evidence read back from registry triplet
- S43B4 promotion policy applied
- D-class prohibition preserved
- promotion gates defined before registry changes
- no registry visibility changed
- no browser selector module regenerated
- no HTML selector mode enabled
- no KP worksheet generation enabled

GAPS:
- post-S43E1 npm test / CI not observed
- S43E2 promotion QA not executed
- carry constraint still not QA-verified
- visible-KP query survival not implemented
- resolver positive fixture not implemented
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_POST_SELECTOR_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_FIRST_VISIBLE_KP_PROMOTION_PLAN_LOCKED
DISTANCE_REDUCED     = S43 now has a concrete first visible KnowledgePoint candidate and promotion gates, moving from zero-visible UI to a controlled selectable-candidate path

HTMLZeroVisibleSelectorUI             100% -> 100%
FirstVisibleKPPromotionPlanning         0% -> 100%
FirstVisibleKPQA                        0% ->   0%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   20% ->  35%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43E1 npm test PASS 尚未 observed",
  "carry constraint for ps_g3a_u02_4digit_add_multi_carry 尚未 QA-verified",
  "S43E2 promotion QA 尚未 executed",
  "future visible-KP query survival 尚未 implemented",
  "resolver positive visible-KP fixture 尚未 implemented",
  "registry triplet 尚未 promoted to selectable/visible/eligible_after_qa",
  "browser selector modules 尚未 regenerated with visibleCount = 1",
  "HTML KP modes 尚未 enabled for visible candidate",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E2_G3AU02_AddMultiCarryPromotionQA
```

S43E2 should execute the QA gates for `kp_g3a_u02_add_multi_carry` before any registry visibility change.

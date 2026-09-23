# S43D4 Visible PatternGroup Resolver Design

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D4_VisiblePatternGroupResolverDesign
TASK_STATUS = RESOLVER_DESIGN
WRITE_TYPE = docs_only
```

S43D4 designs the future resolver that converts selector-safe KnowledgePoint / PatternGroup state into PatternSpec allocation for worksheet generation.

This task does not create resolver code, browser registry modules, tests, fine PatternSpec JSON, generator variants, validator variants, UI controls, or query/state implementation.

## Inputs

```text
S43D2 = browser registry delivery design
S43D3 = selector state and query-state design
Current sourceId generator path = buildBatchABrowserPlan -> generateBatchABrowserQuestions
Current browser validator = validateBatchABrowserPlan / validateBatchABrowserQuestion
```

## Current SourceId Path Readback

Current sourceId worksheet generation resolves PatternSpecs by sourceId:

```text
sourceId
-> getBatchAPatternSpecIdsForSource(sourceId)
-> allocateCounts(patternSpecIds, questionCount)
-> generate per PatternSpec
-> validate each generated question
-> build worksheetDocument
```

Current plan fields include:

```text
sourceId
questionCount
ordering
includeAnswerKey
generationSeed
sourceUnit
patternSpecIds
```

S43D4 must not replace this sourceId path. It designs a parallel resolver path for a future `batchAKnowledgePoint` mode.

## Resolver Goal

Future resolver should take selector-safe state from S43D3 and return a worksheet generation plan that can later feed a Batch A generator boundary.

Input:

```text
selectionMode
sourceId
selectedKnowledgePointIds
selectedPatternGroupIds
questionCount
ordering
generationSeed
includeAnswerKey
```

Output:

```text
ok
mode
sourceIds
knowledgePointIds
patternGroupIds
patternSpecIds
allocation
visibilityValidation
errors
warnings
```

## Non-Negotiable Revalidation

The resolver must revalidate visibility even if state/query already performed validation.

A candidate PatternGroup can resolve only when all linked records satisfy:

```text
KnowledgePointNode.htmlSelectableStatus = selectable
PatternGroup.visibilityStatus = visible
Mapping.htmlExposurePolicy = eligible_after_qa
Mapping.qaStatus = qa_verified
Mapping.patternSpecId != null
holdReason = null on all linked rows
supportClass != D
```

Rows that fail must be rejected or dropped. Hidden/internal and not_selectable rows must never resolve to PatternSpec IDs.

## Browser-Safe Registry Dependencies

Resolver must depend on S43D2 browser-safe selector helper APIs, not raw JSON.

Required future helper calls:

```text
listVisibleBatchAKnowledgePoints()
getVisibleBatchAKnowledgePoint(knowledgePointId)
getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId)
listBatchAKnowledgePointAvailabilityBySource(sourceId)
```

Forbidden resolver dependencies:

```text
raw data/curriculum/registry JSON in browser
hidden row arrays
D-class row arrays as selectable options
unverified mapping rows
patternSpecId = null mappings
```

## Resolver Modes

### sourceUnit

```text
selectionMode = sourceUnit
```

Behavior:

```text
Return control to existing sourceId path.
Do not resolve KP IDs or PatternGroup IDs.
Clear selectedKnowledgePointIds and selectedPatternGroupIds.
```

### singleKnowledgePoint

```text
selectionMode = singleKnowledgePoint
```

Required:

```text
exactly one visible KnowledgePoint ID
at least one visible PatternGroup
at least one non-null PatternSpec ID
all resolved PatternSpecs pass availability checks
```

### mixedKnowledgePointsSameUnit

```text
selectionMode = mixedKnowledgePointsSameUnit
```

Required:

```text
two or more visible KnowledgePoint IDs
all selected KPs share one sourceId
each KP resolves to at least one visible PatternGroup
all resolved PatternSpec IDs are non-null
```

Deferred until resolver QA exists.

### mixedKnowledgePointsCrossUnit

```text
selectionMode = mixedKnowledgePointsCrossUnit
```

Required:

```text
two or more visible KnowledgePoint IDs
may span multiple sourceIds
worksheet provenance preserves each sourceId
allocation preserves per-source traceability
```

Deferred until cross-unit resolver QA exists.

## Resolution Algorithm

Future resolver should use this deterministic sequence:

```text
1. Normalize selectionMode.
2. If sourceUnit, return sourceId handoff to existing path.
3. Load visible candidate set from browser-safe registry helpers.
4. Validate selectedKnowledgePointIds against visible candidate IDs.
5. Resolve each selected KP to visible PatternGroups.
6. Validate selectedPatternGroupIds if provided; otherwise choose visible PatternGroups for selected KPs.
7. Resolve PatternGroups through QA-verified mappings to non-null PatternSpec IDs.
8. Reject if no eligible PatternSpec IDs remain.
9. Allocate questionCount across selected PatternGroups and PatternSpecs.
10. Return a resolver plan with visibilityValidation details.
```

## PatternGroup Selection Rules

If selectedPatternGroupIds is empty:

```text
singleKnowledgePoint = use all visible PatternGroups for the selected KP
mixed modes = use one or more visible PatternGroups per selected KP according to allocation policy
```

If selectedPatternGroupIds is non-empty:

```text
only keep PG IDs that are visible and belong to selected visible KPs
reject PG IDs that are hidden, not_selectable, cross-source invalid, or unmapped
```

## Allocation Design

### Single PatternGroup

```text
allocation = [{ patternGroupId, patternSpecId, questionCount }]
```

### Multiple PatternGroups

```text
base = floor(questionCount / eligiblePatternGroupCount)
remainder distributed deterministically by sorted patternGroupId
```

### Multiple PatternSpecs inside one PatternGroup

Use PatternGroup allocationPolicy:

```text
single_pattern = all questions to one PatternSpec
average_across_patterns = split evenly
fixed_counts = use explicit counts when later supported
not_applicable = resolver error
```

## Resolver Plan Shape

Future resolved plan shape:

```text
schemaVersion = batch-a-kp-resolver-plan-v1
worksheetMode = batchAKnowledgePoint
selectionMode
sourceIds
knowledgePointIds
patternGroupIds
patternSpecIds
allocation
questionCount
ordering
generationSeed
includeAnswerKey
visibilityValidation
provenance
```

`visibilityValidation` should include aggregate results only:

```text
visibleAcceptedCount
rejectedCount
rejectionCodes
```

It must not expose hidden/internal/D row IDs in user-visible validation details.

## Error Codes

Reserved resolver errors:

```text
kp_resolver_selection_mode_invalid
kp_resolver_no_visible_kp
kp_resolver_kp_not_visible
kp_resolver_pattern_group_not_visible
kp_resolver_pattern_group_not_linked_to_kp
kp_resolver_mapping_not_qa_verified
kp_resolver_pattern_spec_missing
kp_resolver_all_candidates_rejected
kp_resolver_mixed_same_unit_source_mismatch
kp_resolver_cross_unit_not_supported_yet
kp_resolver_allocation_not_applicable
```

## Current G3A-U02 Expected Resolver Result

Given current S43C2 / S43D2 status:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

Any G3A-U02 KP-mode resolver request should return:

```text
ok = false
patternSpecIds = []
allocation = []
error includes kp_resolver_no_visible_kp or kp_resolver_all_candidates_rejected
```

The resolver must not resolve hidden A rows:

```text
kp_g3a_u02_add_multi_carry
kp_g3a_u02_sub_multi_borrow
```

The resolver must not resolve D rows:

```text
kp_g3a_u02_estimate_nearest_thousand
kp_g3a_u02_word_problem_estimation_add_sub
```

## Worksheet Handoff Boundary

Future worksheet builder integration should be additive:

```text
batchASource mode -> current buildBatchABrowserPlan path
batchAKnowledgePoint mode -> new visible PatternGroup resolver -> future generator path
```

Do not modify current sourceId path semantics to support KP mode.

The existing worksheetDocument should later preserve KP provenance:

```text
curriculumInfo.curriculumNodeIds = selected KnowledgePoint IDs or source IDs
provenance.patternSpecIds = resolved PatternSpec IDs
sections[].patternIds = resolved PatternSpec IDs
batchA.knowledgePointIds = selected KP IDs
batchA.patternGroupIds = resolved PG IDs
```

## Negative Resolver Cases

Future tests must reject:

```text
selectionMode unknown
singleKnowledgePoint with zero selected KP IDs
singleKnowledgePoint with multiple selected KP IDs
mixedSameUnit with one KP only
mixedSameUnit with KPs from different sourceIds
crossUnit before cross-unit QA is enabled
selected hidden A row
selected D row
selected PatternGroup not linked to selected KP
mapping exists but qaStatus is not qa_verified
mapping has patternSpecId = null
PatternGroup allocationPolicy = not_applicable
```

## Positive Resolver Cases

Future tests should accept only after a later explicit promotion task creates visible candidates:

```text
single visible KP -> one visible PatternGroup -> one QA-verified mapping -> one PatternSpec allocation
single visible KP -> one visible PatternGroup -> multiple PatternSpecs split by allocationPolicy
same-unit visible KPs -> PatternGroups from same sourceId -> deterministic allocation
```

S43D4 does not create any positive visible candidate.

## Implementation Boundary

Future implementation order:

```text
1. Implement browser registry modules from S43D2.
2. Implement selector state/query tests from S43D3.
3. Implement resolver as a pure function module.
4. Add resolver negative tests for current G3A-U02 zero-visible state.
5. Add resolver positive fixture only after explicit QA promotion creates visible rows.
6. Connect resolver to worksheet builder only after resolver tests pass.
```

## Out of Scope

```text
- implementing resolver code
- generating browser registry modules
- editing worksheet builder
- editing generator / validator
- editing state / query code
- editing HTML selector
- promoting any KP to selectable
- enabling mixed worksheet generation
```

## S43D4 Gate

```text
S43D4_GATE = PASS_VISIBLE_PATTERN_GROUP_RESOLVER_DESIGN

PASS:
- current sourceId resolver/generator path read back
- resolver input/output contract designed
- visibility revalidation rule locked
- browser-safe registry dependency locked
- sourceUnit / singleKP / mixed mode behavior designed
- deterministic resolution algorithm designed
- PatternGroup selection rules designed
- allocation rules designed
- resolver plan shape drafted
- resolver error codes reserved
- current G3A-U02 zero-visible expected behavior defined
- worksheet handoff boundary preserved
- no runtime/UI code changed

GAPS:
- resolver not implemented yet
- resolver tests not implemented yet
- browser registry modules not generated yet
- selector state/query implementation not implemented yet
- HTML selector not implemented yet
- no KP is selectable yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_SELECTOR_STATE_QUERY_STATE_DESIGNED
GOAL_DISTANCE_AFTER  = D2_VISIBLE_PATTERN_GROUP_RESOLVER_DESIGNED
DISTANCE_REDUCED     = S43 now has a resolver contract that can turn selector-safe KP/PatternGroup state into PatternSpec allocation while rejecting hidden/not_selectable rows

SelectorStateQueryDesign          100% -> 100%
VisiblePatternGroupResolverDesign   0% -> 100%
KPResolverImplementation            0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         87% ->  89%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "VisiblePatternGroup resolver 尚未 implemented",
  "resolver tests 尚未 implemented",
  "selector state/query implementation 尚未 implemented",
  "selector state/query tests 尚未 implemented",
  "browser registry modules 尚未 generated",
  "registry-to-browser transform tool 尚未 implemented",
  "HTML KnowledgePoint selector 尚未實作",
  "no KP is selectable yet",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D5_HTMLSelectorImplementationPlan
```

S43D5 should plan the actual HTML selector implementation sequence, still without exposing hidden/internal or not_selectable rows.

# S57F — G3B-U04 Semantic Selector Visibility and Production Worksheet QA Design Scan

```text
CURRENT_MAJOR_TASK = S57_G3B_U04_KPAndSemanticTemplateContract
CURRENT_SUBTASK = S57F_G3B_U04_SemanticSelectorVisibilityAndProductionWorksheetQA_DesignScan
TASK_STATUS = DESIGNSCAN_COMPLETE_IMPLEMENTATION_NOT_STARTED
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
SOURCE_ID = g3b_u04_3b04
UNIT = 3B-U04 兩步驟計算
INPUT_RUNTIME_STATUS = S57E_PASS_ACCEPTED_AND_CLOSED
OUTPUT = selector visibility, canonical routing, production worksheet, and public QA implementation plan
```

## 1. Scope Lock

### In scope

```text
- Promote the completed S57E hidden semantic runtime through a separately controlled lifecycle gate.
- Define the visible KnowledgePoint and PatternGroup projection for G3B-U04.
- Preserve the existing arithmetic-only consecutive-multiplication PatternSpec.
- Define pure semantic and numeric-plus-semantic mixed worksheet routing.
- Integrate the S57E blocking validator into the canonical production worksheet path.
- Define state, selector, answer-key, print, HTML, and PDF acceptance gates.
- Define regression protection for every unrelated Batch A unit and existing G3B-U04 source-unit behavior.
- Define a rollback-safe implementation order.
```

### Out of scope

```text
- No selector row is made visible by this DesignScan.
- No productionUse status is changed by this DesignScan.
- No browser state, router, worksheet, renderer, HTML, or CSS is modified by this DesignScan.
- No new mathematical KnowledgePoint or semantic family is introduced.
- No free-form AI generation is added.
- No new numeric PatternSpec is invented for the eight KnowledgePoints that currently have semantic families only.
- No Batch B/C/D/E unit is changed.
- No generic application-problem framework refactor is attempted.
```

## 2. Authoritative Inputs

### Immutable semantic authorities

```text
data/curriculum/mapping/S57_G3B_U04_SourceFieldKnowledgePointMapping.json
data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json
data/curriculum/contracts/S57_G3B_U04_SemanticValidationContract.json
data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json
```

### Runtime authorities completed by S57E

```text
data/curriculum/scenarios/S57E2_G3B_U04_SemanticScenarioRoleRegistry.json
site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js
site/modules/curriculum/batch-a/g3b-u04-semantic-scenarios.js
site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js
site/modules/curriculum/batch-a/g3b-u04-multiplicative-semantic-generator.js
site/modules/curriculum/batch-a/g3b-u04-semantic-validator.js
site/modules/curriculum/batch-a/g3b-u04-semantic-question-generator.js
site/modules/curriculum/batch-a/batch-a-browser-question-router-g3b-u04-extension.js
site/modules/curriculum/batch-a/batch-a-browser-validator-g3b-u04-extension.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet-g3b-u04-extension.js
```

### Accepted artifact evidence

```text
docs/curriculum/output/S57E_G3B_U04_SEMANTIC_RUNTIME_IMPLEMENTATION_FINAL_CLOSEOUT_PASS.marker
docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.html
docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.pdf
docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.manifest.json
```

## 3. Preflight Readback

```text
KnowledgePoints                         = 9 / 9
Semantic PatternSpecs                  = 32 / 32
Semantic PatternGroups                 = 9 / 9
Scenario family-context variants       = 117 / 117
Blocking validation stages             = 8 / 8
Blocking semantic error codes          = 25 / 25
Nonblocking style warnings              = 3 / 3
Hidden deterministic generators        = 32 / 32
Hidden worksheet and answer key         = PASS
Hidden HTML smoke                       = PASS
Regenerated hidden PDF smoke            = PASS, 16 pages
Current selector visibility             = 0
Current production use                  = FORBIDDEN
Current public projection changed       = false
```

S57E proved that the semantic runtime is usable. S57F is not a content-authoring task. It is a lifecycle, selector, canonical integration, and public regression task.

## 4. Existing Architecture Findings

### 4.1 Selector chain

The public selector is assembled through an extension chain ending at:

```text
site/modules/curriculum/registry/batch-a-selector-extension.js
```

The latest proven precedent is the G4A-U08 Phase2A selector extension. It demonstrates:

```text
KnowledgePoint row
→ PatternGroup row
→ one or more PatternSpec IDs
→ visible resolver allocation
→ browser state selection
→ canonical question router
```

S57F should extend this chain once. It must not create a second public selector registry.

### 4.2 Visible resolver and browser state

The existing browser state already supports:

```text
source unit selection
single KnowledgePoint selection
mixed KnowledgePoints within one unit
selected PatternGroup IDs
question count
ordering
answer-key inclusion
```

Therefore S57F does not require a new application-specific state machine. It requires truthful registry rows and canonical routing of the resolved allocation.

### 4.3 Current G3B-U04 production behavior

The public Batch A path currently retains the pre-S57 arithmetic-only runtime coverage:

```text
ps_g3b_u04_consecutive_multiplication
```

This existing PatternSpec must remain valid and available. S57F must not silently replace it with the four semantic consecutive-multiplication families.

### 4.4 S57E hidden path

S57E deliberately uses an explicit hidden mode:

```text
hiddenSemanticMode = g3b_u04_hidden_semantic
```

This is correct for smoke and internal QA. It is not an acceptable public contract because a public request must be derived from visible selector rows, not from a hidden flag or arbitrary PatternSpec list.

### 4.5 Canonical worksheet path

The public worksheet build uses the canonical Batch A router, validator, worksheet model, answer-key model, and renderer. S57F must promote the semantic runtime into this path. The separate S57E hidden worksheet extension remains useful for internal smoke but must not become a parallel public product path.

## 5. Locked Promotion Principles

### Principle P1 — Semantic content remains immutable

The mathematical and semantic fields approved by S57 and materialized by S57E are frozen:

```text
knowledgePointId
templateFamilyId
semanticSignature
equationShape
unknownRole
quantityRoles
contextDomains
promptSkeletonZh
requiredConstraints
```

S57F may change lifecycle metadata and public routing only. It may not rewrite semantic meaning.

### Principle P2 — Lifecycle status is separate from semantic authority

S57E PatternSpecs currently contain hidden/forbidden lifecycle values. S57F will add a dedicated lifecycle authority instead of rewriting 32 semantic definitions in place.

Planned artifact:

```text
data/curriculum/registry/promotions/S57F_G3B_U04_SemanticPromotionRegistry.json
```

Required fields:

```yaml
promotionRegistryId: s57f_g3b_u04_semantic_promotion
sourceId: g3b_u04_3b04
semanticContractRef: data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json
knowledgePointIds: string[9]
patternGroupIds: string[9]
patternSpecIds: string[32]
lifecycle:
  selectorStatus: visible
  runtimeStatus: production_routed
  validatorStatus: blocking_validator_required
  worksheetStatus: production_eligible
  productionUse: allowed
promotionEvidence:
  s57eFinalCloseout: string
  hiddenHtmlSmoke: string
  hiddenPdfSmoke: string
rollbackKey: s57f_g3b_u04_semantic_promotion
```

Runtime tests must reject a promotion overlay whose IDs or semantic references drift from S57E.

### Principle P3 — Nine visible mathematical KnowledgePoints

S57F exposes exactly the approved nine KnowledgePoints:

```text
kp_g3b_u04_add_then_divide
kp_g3b_u04_multiply_then_divide_average_unit_price
kp_g3b_u04_subtract_then_divide
kp_g3b_u04_divide_then_add
kp_g3b_u04_total_minus_shared_amount
kp_g3b_u04_group_total_minus_remaining
kp_g3b_u04_consecutive_multiplication
kp_g3b_u04_composite_multiplicative_ratio
kp_g3b_u04_multiplicative_quantity_chain
```

Context, package type, representation, and story setting remain tags. They must not reappear as fake KnowledgePoints.

### Principle P4 — Nine semantic PatternGroups plus one preserved numeric group

The visible semantic projection contains one semantic PatternGroup per KnowledgePoint:

```text
9 semantic PatternGroups
32 family-level semantic PatternSpecs
allocationPolicy = balanced_by_family
```

The existing arithmetic-only PatternSpec is retained as a separate numeric representation group under the same consecutive-multiplication KnowledgePoint:

```text
pg_g3b_u04_consecutive_multiplication_numeric
  → ps_g3b_u04_consecutive_multiplication

pg_g3b_u04_consecutive_multiplication_application
  → 4 semantic consecutive-multiplication PatternSpecs
```

Total planned visible groups for the nine KnowledgePoints:

```text
semantic groups = 9
preserved numeric groups = 1
visible groups = 10
```

This prevents arithmetic and application representations from being conflated while still allowing a mixed worksheet for the one KnowledgePoint that currently has both.

### Principle P5 — No fabricated numeric symmetry

Eight KnowledgePoints currently have semantic PatternSpecs only. S57F must not create numeric PatternSpecs merely to make every KnowledgePoint look symmetrical.

```text
existing numeric support = preserved
missing numeric support = displayed honestly
future numeric expansion = separate task
```

### Principle P6 — Visible selection must be registry-derived

Public generation is authorized only when:

```text
selected KnowledgePoint is visible
selected PatternGroup is visible
resolved PatternSpec belongs to the selected group
PatternSpec is listed in the S57F promotion registry
blocking validator is available
production eligibility accepts the plan
```

Public callers may not promote items by setting:

```text
g3bU04Semantic = true
hiddenSemanticMode = g3b_u04_hidden_semantic
arbitrary semantic PatternSpec IDs
```

Those inputs remain internal test hooks and must not be emitted by the UI.

### Principle P7 — Legacy source-unit default is preserved

Selecting G3B-U04 only by source unit must retain the existing arithmetic behavior until a user chooses visible semantic KnowledgePoints or PatternGroups.

This prevents the release from silently changing a previously numeric worksheet into a 32-family application worksheet.

```text
source-unit default = existing behavior
KnowledgePoint selection = new semantic production path
mixed-KP selection = explicit semantic or numeric-plus-semantic path
```

### Principle P8 — Semantic validation is mandatory in production

Every semantic question must pass:

```text
S57E5 eight-stage blocking validator
answer reconstruction
registered family check
registered KnowledgePoint check
registered scenario check
unit and classifier flow
realism checks
single-unambiguous-question check
```

The generic numeric validator may supplement but may never replace this validator.

### Principle P9 — One canonical public worksheet path

The production path after S57F must be:

```text
visible selector
→ visible PatternGroup resolver
→ canonical Batch A plan
→ canonical router
→ G3B-U04 semantic generator branch
→ S57E5 blocking validator
→ canonical worksheet document
→ canonical answer key
→ public HTML/print/PDF renderer
```

The hidden S57E worksheet extension remains an internal regression fixture.

## 6. Visible Registry Contract

### 6.1 KnowledgePoint row

Each visible KnowledgePoint row must contain:

```yaml
knowledgePointId: string
sourceId: g3b_u04_3b04
unitCode: 3B-U04
unitTitle: 兩步驟計算
displayName: Traditional Chinese user-facing label
supportClass: B
canonicalSkillTag: string
subskillTags: string[]
difficultyTags:
  - two_step
  - semantic_application
representationTags:
  - word_problem
patternGroupIds: string[]
patternSpecIds: string[]
qaStatusLabel: qa_verified
promotionRegistryId: s57f_g3b_u04_semantic_promotion
```

### 6.2 PatternGroup row

```yaml
patternGroupId: string
sourceId: g3b_u04_3b04
displayName: string
primaryKnowledgePointId: string
knowledgePointIds: [string]
representationTag: numeric | application_word_problem
patternSpecIds: string[]
allocationPolicy: single_pattern | balanced_by_family
visibilityStatus: visible
holdReason: null
promotionRegistryId: s57f_g3b_u04_semantic_promotion
```

### 6.3 Proposed user-facing labels

| KnowledgePoint | Display label |
|---|---|
| add then divide | 先合併再平均分 |
| multiply then divide average price | 先算總價再求平均價格 |
| subtract then divide | 先扣除再平均分或分組 |
| divide then add | 先平均分再加上原有數量 |
| total minus shared amount | 個人數量扣除平均分擔 |
| group total minus remaining | 先分組再扣除剩餘組數 |
| consecutive multiplication | 連續乘法兩步驟 |
| composite multiplicative ratio | 兩段倍數關係合成 |
| multiplicative quantity chain | 倍數關係推算最後數量 |

Labels describe the mathematical relationship. They do not use context nouns such as cake, tickets, teams, or age as KnowledgePoint names.

## 7. Resolver and Allocation Design

### 7.1 Single KnowledgePoint

```text
one selected semantic KnowledgePoint
→ one semantic PatternGroup
→ balanced allocation across that group's 3–5 families
```

For consecutive multiplication, the UI may expose two representation groups:

```text
numeric calculation
application word problem
```

If the user selects the KnowledgePoint without choosing a representation group, the generic resolver must use the selected visible groups supplied by state. It must not guess silently.

### 7.2 Mixed KnowledgePoints in the same unit

```text
selected KPs
→ selected visible PatternGroups
→ balanced allocation across groups
→ balanced allocation across families inside each semantic group
→ deterministic shuffle when requested
```

Required fairness:

```text
max group-count difference <= 1
max family-count difference within each group <= 1
questionCount is preserved exactly
```

### 7.3 Numeric-plus-semantic hybrid

The supported hybrid scope is deliberately narrow:

```text
ps_g3b_u04_consecutive_multiplication
+
selected semantic family PatternSpecs
```

The canonical router partitions the resolved allocation by runtime kind, generates each partition through its correct generator, validates each partition, then deterministically merges the questions.

### 7.4 Source-unit default

The source-unit plan continues using the current source-unit PatternSpec index. The 32 semantic PatternSpecs are not appended to the default source-unit list merely because they become visible in KnowledgePoint mode.

This behavior must be protected by an explicit regression test.

## 8. Canonical Router Integration

### Required behavior

The canonical router must inspect the resolved plan allocation and classify it as:

```text
legacy/nonsemantic
pure G3B-U04 semantic
G3B-U04 numeric plus semantic hybrid
invalid semantic scope
```

### Pure semantic branch

```text
visible allocation contains only S57F-promoted semantic PatternSpecs
→ call aggregate semantic generator with resolver allocation
→ run blocking validator per question
→ preserve resolver question counts and ordering
```

### Hybrid branch

```text
allocation contains promoted semantic PatternSpecs and the preserved numeric PatternSpec
→ partition allocation
→ generate numeric partition through existing expression path
→ generate semantic partition through semantic path
→ validate each with its required validator
→ merge and deterministically shuffle
```

### Forbidden behavior

```text
- Do not route by matching sourceId alone.
- Do not require or expose hiddenSemanticMode in public state.
- Do not accept semantic PatternSpecs not present in a visible selected group.
- Do not downgrade semantic errors to warnings.
- Do not fall back to a generic expression when semantic generation fails.
```

## 9. Canonical Validator and Worksheet Integration

### Validator chain

The latest production validator extension must delegate in this order:

```text
G3B-U04 semantic question
→ S57E5 semantic validator

other unit-specific question
→ existing latest unit validator extension

remaining Batch A question
→ base Batch A validator
```

### Worksheet contract

Semantic questions already satisfy the text-question surface. Canonical worksheet integration must preserve:

```text
prompt text
equation model
answer with unit
semantic snapshot
PatternSpec / KnowledgePoint metadata
answer-key item
avoid-page-break hint
```

### Layout profile

Production semantic questions require a dedicated long-text profile:

```text
question sheet: 2 columns, 4 rows per page
answer key: 1 column, 8 rows per page
longTextCardPolicy: avoidSplit
```

The profile applies only when a generated question has:

```text
sourceId = g3b_u04_3b04
kind = g3bU04SemanticWordProblem
```

It must not reduce density for existing arithmetic-only worksheets.

## 10. Browser State and Public UI

### Reuse existing generic state

The implementation should reuse:

```text
selectionMode
selectedKnowledgePointIds
selectedPatternGroupIds
questionCount
ordering
includeAnswerKey
```

No new G3B-U04-specific public state flag is allowed.

### Public selector behavior

The UI must:

```text
- list the nine visible KnowledgePoints under 3B-U04;
- show numeric/application representation choices only where both exist;
- allow multiple KnowledgePoints in the same unit;
- retain current question-count controls;
- retain answer-key and print controls;
- prevent cross-unit PatternGroup leakage;
- not display internal kp_/pg_/ps_/tpl_ identifiers;
```

### Empty and invalid selection handling

The public UI must block generation when:

```text
no visible KnowledgePoint is selected
selected PatternGroup does not belong to the selected KnowledgePoint
selected PatternSpec is not production-promoted
semantic and nonsemantic selections belong to different source units
```

Errors must be user-readable and typed internally.

## 11. Production Eligibility

S57F must update production eligibility with a narrowly scoped rule:

```text
sourceId = g3b_u04_3b04
selection is resolver-derived
all semantic PatternSpecs are S57F-promoted
all selected groups are visible
blocking validator version is available
question count is within current public limits
```

The rule must not broaden eligibility for:

```text
unregistered G3B-U04 PatternSpecs
hidden S57E test-only plans
other hidden Batch A candidates
arbitrary semantic objects supplied by caller code
```

## 12. Migration and Duplicate-Row Control

The historical S43E6 overlay contains twelve mixed rows combining operations, contexts, and representations. S57 supersedes that taxonomy.

S57F must ensure:

```text
- no historical S43E6 candidate row becomes visible alongside the nine S57 KPs;
- no duplicate KnowledgePoint ID exists in the visible registry;
- no duplicate PatternGroup ID exists;
- the existing arithmetic PatternSpec is attached to the canonical S57 consecutive-multiplication KP;
- historical rows remain traceable as superseded data, not as public selector rows;
- the p1_r2_r source-label mismatch remains isolated by the approved multiplication-then-division mapping.
```

Planned lifecycle overlay should contain explicit supersession references for the affected S43E6 rows.

## 13. Public QA Matrix

### 13.1 Registry QA

```text
9 / 9 visible KnowledgePoints
9 / 9 semantic PatternGroups
1 / 1 preserved numeric PatternGroup
32 / 32 promoted semantic PatternSpecs
0 duplicate KP IDs
0 duplicate PatternGroup IDs
0 duplicate PatternSpec memberships inside a group
0 visible historical S43E6 candidate rows
0 internal-ID leaks in display labels
```

### 13.2 State and resolver QA

```text
single KP selection
single semantic group selection
consecutive multiplication numeric selection
consecutive multiplication application selection
numeric-plus-application selection
mixed semantic KPs in one unit
invalid cross-unit selection
empty selection
stale PatternGroup ID
unpromoted PatternSpec injection
```

### 13.3 Generator and validator QA

```text
32-family visible path coverage
117 family-context coverage retained
25 blocking codes retained through canonical production path
3 style warnings remain nonblocking
answer reconstruction mandatory
no generic-fallback acceptance
no semantic question returned after validator failure
```

### 13.4 Count and fairness QA

```text
1 question
9 questions
32 questions
64 questions
200 questions
257 questions
640 questions
1000 questions
```

For each relevant count:

```text
requested count = generated count
allocation sum = requested count
family/group spread difference <= 1 where mathematically possible
same seed = identical worksheet
shuffle changes order but not membership
```

### 13.5 Legacy regression QA

```text
plain G3B-U04 source-unit generation remains unchanged
existing consecutive-multiplication arithmetic question remains valid
all unrelated Batch A source-unit routes remain byte/shape equivalent where deterministic
G4A-U08 numeric/application hybrid remains valid
question count, answer-key, and print controls remain valid
Pixel UI remains valid
```

### 13.6 Public HTML and PDF QA

Required public-path smoke:

```text
64-question semantic worksheet
64-question answer key
2-column question layout
1-column answer layout
Traditional Chinese text extraction
no clipped question cards
no split question cards
no internal-ID leakage
no unresolved placeholder
zero semantic errors
regenerated PDF page count recorded
```

The smoke must use the canonical public worksheet path, not the hidden S57E worksheet helper.

## 14. Implementation Sequence

### S57F1 — Promotion Lifecycle Registry

Create and validate:

```text
data/curriculum/registry/promotions/S57F_G3B_U04_SemanticPromotionRegistry.json
site/modules/curriculum/registry/g3b-u04-semantic-promotion.js
tests/curriculum/g3b-u04-semantic-promotion.test.js
```

Gate:

```text
32 semantic specs, 9 KPs, 9 semantic groups
all S57E evidence references present
semantic fields unchanged
production lifecycle status internally consistent
no selector behavior changed yet
```

### S57F2 — Visible Selector Registry Projection

Create:

```text
site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js
```

Update:

```text
site/modules/curriculum/registry/batch-a-selector-extension.js
```

Gate:

```text
9 visible KPs
10 visible groups
32 semantic specs plus 1 preserved numeric spec
historical S43E6 rows not visible
no duplicate IDs
```

### S57F3 — Resolver and Browser-State Integration

Integrate visible selection with the existing generic resolver and state.

Gate:

```text
single KP
multiple KPs same unit
numeric/application representation selection
invalid and stale selection rejection
no public hidden-mode flag
```

### S57F4 — Canonical Router and Hybrid Integration

Promote semantic and numeric-plus-semantic allocation into the canonical router.

Gate:

```text
pure semantic route
numeric route
numeric-plus-semantic hybrid route
exact count preservation
blocking validator failure prevents output
legacy source-unit default unchanged
```

### S57F5 — Canonical Validator, Worksheet, and Renderer Integration

Update the latest canonical validator/worksheet delegation and add the semantic long-text layout profile.

Gate:

```text
question sheet
answer key
equation and answer unit
semantic metadata snapshot
page-break safety
unrelated worksheet density unchanged
```

### S57F6 — Public Selector and Print Controls QA

Verify the public site and Pixel UI consume the new visible registry without unit-specific hidden flags.

Gate:

```text
Traditional Chinese labels
no internal IDs
question count controls
answer-key controls
print controls
browser generate action
error surface
```

### S57F7 — Production Regression, Stress, HTML/PDF Promotion Closeout

Run the complete public-path matrix and regenerate final HTML/PDF smoke artifacts.

Gate:

```text
604+ baseline tests remain green
new S57F tests green
all unrelated Batch A routes green
32 families reachable from visible selector
25 blocking codes preserved
1000-question stress green
public HTML smoke green
regenerated PDF smoke green
production promotion accepted
```

## 15. Rollback Design

S57F must remain reversible through one promotion boundary.

Rollback sequence:

```text
1. Disable/remove S57F promotion registry from production eligibility.
2. Remove G3B-U04 selector extension from the latest selector export.
3. Disable canonical semantic router branch.
4. Restore prior canonical validator/worksheet imports.
5. Keep all S57E hidden artifacts and tests intact.
```

Rollback must restore the pre-S57F public behavior without deleting semantic source, PatternSpecs, generators, validators, or hidden smoke evidence.

## 16. Forbidden Shortcuts

```text
- Making hiddenSemanticMode a public checkbox or URL parameter.
- Appending all 32 semantic PatternSpecs to the default source-unit route.
- Treating all contexts as separate KnowledgePoints.
- Combining all 32 families into one visible PatternSpec.
- Exposing a PatternGroup before promotion registry acceptance.
- Accepting a question because its final number is correct.
- Calling the generic numeric validator instead of the semantic validator.
- Hiding semantic failures by silently regenerating through a different family.
- Replacing the existing numeric consecutive-multiplication PatternSpec.
- Creating numeric PatternSpecs for unsupported KPs as part of this visibility task.
```

## 17. Acceptance Contract

S57F implementation is complete only when:

```text
promotion registry                         PASS
visible KP registry                        9 / 9
visible semantic PatternGroups             9 / 9
preserved numeric PatternGroup             1 / 1
promoted semantic PatternSpecs             32 / 32
visible resolver                           PASS
canonical pure-semantic route              PASS
canonical numeric-semantic hybrid route    PASS
blocking validator in production path      PASS
legacy source-unit behavior                PASS
public selector                            PASS
answer key and print                       PASS
1000-question stress                       PASS
public HTML smoke                          PASS
regenerated public PDF smoke               PASS
full npm test                              PASS
working tree                               clean
```

## 18. Design Gate Result

```text
S57F_SCOPE_LOCK = PASS
S57E_RUNTIME_READBACK = PASS
SELECTOR_ARCHITECTURE_SCAN = PASS
LIFECYCLE_PROMOTION_BOUNDARY = PASS
VISIBLE_KP_DECISION = PASS (9)
VISIBLE_GROUP_DECISION = PASS (9 semantic + 1 preserved numeric)
LEGACY_SOURCE_UNIT_PRESERVATION = PASS
CANONICAL_ROUTER_DESIGN = PASS
HYBRID_ROUTER_DESIGN = PASS
BLOCKING_VALIDATOR_PRODUCTION_REQUIREMENT = PASS
PUBLIC_UI_STATE_REUSE = PASS
PUBLIC_HTML_PDF_QA_MATRIX = PASS
ROLLBACK_BOUNDARY = PASS
RUNTIME_CODE_CHANGED = false
SELECTOR_VISIBILITY_CHANGED = false
PRODUCTION_USE_CHANGED = false
PUBLIC_PROJECTION_CHANGED = false
```

## 19. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3B_U04_HIDDEN_SEMANTIC_RUNTIME_COMPLETE_VISIBILITY_GATE_UNDESIGNED
GOAL_DISTANCE_AFTER  = D1_G3B_U04_SELECTOR_AND_PRODUCTION_PROMOTION_PATH_LOCKED
DISTANCE_REDUCED     = The shortest safe path from the completed hidden semantic runtime to visible KnowledgePoint selection, canonical production routing, answer-key/print output, and public HTML/PDF acceptance is now fully specified.
REMAINING_BLOCKERS   = [
  "S57F promotion lifecycle registry is not materialized",
  "9 semantic KnowledgePoints and 10 PatternGroups are not visible",
  "visible resolver and browser state are not connected",
  "canonical router does not yet route resolver-derived semantic allocation",
  "canonical worksheet does not yet apply the semantic long-text profile",
  "public selector and print controls have not been regression-tested",
  "public-path HTML and regenerated PDF smoke have not been accepted",
  "productionUse remains forbidden"
]
NEXT_SHORTEST_STEP = S57F1_G3B_U04_SemanticPromotionLifecycleRegistry
```

## 20. Closeout Boundary

```text
S57F_DESIGNSCAN_STATUS = PASS_DESIGN_LOCKED_IMPLEMENTATION_APPROVAL_REQUIRED
AUTO_CONTINUE_DECISION = STOP
STOP_REASON = PLANNING_TO_IMPLEMENTATION_REQUIRES_SEPARATE_APPROVAL
BLOCKER_TYPE = APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S57F_G3B_U04_SemanticSelectorVisibilityAndProductionWorksheetQA_DesignScan_PASS
REQUIRED_OPERATOR_ACTION = Approve S57F1_G3B_U04_SemanticPromotionLifecycleRegistry implementation scope.
NEXT_RESUME_TASK = S57F1_G3B_U04_SemanticPromotionLifecycleRegistry
```

# S57D — G3B-U04 PatternSpec and Semantic Generator Implementation Design Scan

```text
CURRENT_MAJOR_TASK = S57_G3B_U04_KPAndSemanticTemplateContract
CURRENT_SUBTASK = S57D_G3B_U04_PatternSpecAndSemanticGeneratorImplementation_DesignScan
TASK_STATUS = DESIGNSCAN_COMPLETE_IMPLEMENTATION_NOT_STARTED
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = s57d-g3b-u04-designscan
SOURCE_ID = g3b_u04_3b04
UNIT = 3B-U04 兩步驟計算
OUTPUT = one authoritative implementation design scan
```

## 1. Scope Lock

### In scope

```text
- Read the approved S57 18-field → 9-KnowledgePoint mapping.
- Read the approved 32-family semantic template registry.
- Read the approved eight-stage / 25-blocking-code semantic validation contract.
- Inspect the current Batch A PatternSpec, generator, validator, router, selector, worksheet, and test architecture.
- Decide the runtime artifact boundary and implementation order.
- Define the PatternSpec projection, semantic question model, generator pipeline, validator integration, QA gates, and rollback-safe rollout.
- Produce one implementation plan that can be executed without reopening the S57 source interpretation.
```

### Out of scope

```text
- No PatternSpec JSON or JavaScript runtime rows are created by S57D.
- No semantic generator code is implemented.
- No semantic validator code is implemented.
- No router, selector, browser state, HTML, renderer, worksheet, or PDF behavior is changed.
- No KnowledgePoint becomes visible or selectable.
- No productionUse promotion occurs.
- No Batch B/C/D/E work occurs.
- No rewrite of S57 source mapping, template registry, or semantic contract occurs.
```

## 2. Authoritative Inputs

The implementation must consume these S57 artifacts as the source of truth:

```text
data/curriculum/mapping/S57_G3B_U04_SourceFieldKnowledgePointMapping.json
data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json
data/curriculum/contracts/S57_G3B_U04_SemanticValidationContract.json
docs/curriculum/output/S57_G3B_U04_KPAndSemanticTemplateContract.md
```

Historical input retained only for migration comparison:

```text
data/curriculum/registry/unit_expansions/S43E6_G3B_U04_KPExpansion.json
```

The S43E6 overlay is not authoritative for the final KnowledgePoint taxonomy. S57 supersedes its twelve-row mixture of operation structures, contexts, and representations with nine mathematical KnowledgePoints plus context, representation, and difficulty tags.

## 3. Design-Scan Readback

### 3.1 Approved mathematical scope

```text
1. kp_g3b_u04_add_then_divide
   equationShape = (a+b)/c

2. kp_g3b_u04_multiply_then_divide_average_unit_price
   equationShape = (p*q)/r

3. kp_g3b_u04_subtract_then_divide
   equationShape = (a-b)/c

4. kp_g3b_u04_divide_then_add
   equationShape = a/b+c

5. kp_g3b_u04_total_minus_shared_amount
   equationShape = a-(b/c)

6. kp_g3b_u04_group_total_minus_remaining
   equationShape = (a/b)-c

7. kp_g3b_u04_consecutive_multiplication
   equationShape = a*b*c

8. kp_g3b_u04_composite_multiplicative_ratio
   equationShape = m*n

9. kp_g3b_u04_multiplicative_quantity_chain
   equationShape = a*m*n
```

### 3.2 Approved semantic-family coverage

```text
add then divide                                  = 5 families
multiply then divide average unit price          = 3 families
subtract then divide                             = 4 families
divide then add                                  = 3 families
personal total minus shared amount               = 3 families
total groups minus remaining groups              = 3 families
consecutive multiplication                       = 4 families
composite multiplicative ratio                   = 3 families
multiplicative quantity chain                     = 4 families
------------------------------------------------------------
total                                             = 32 families
```

### 3.3 Approved semantic safety boundary

```text
validation stages = 8
blocking codes = 25
style warnings = 3
semantic failure policy = BLOCK
numeric-answer-only acceptance = FORBIDDEN
prompt/equation silent repair = FORBIDDEN
implausible-but-arithmetically-valid acceptance = FORBIDDEN
```

## 4. Existing Runtime Architecture Findings

### 4.1 Generic Batch A path

The current path is:

```text
selector / browser state
→ visible PatternGroup resolver
→ batch-a-browser-question-router.js
→ unit-specific generator or generic generator
→ unit-specific validator extension or generic validator
→ batch-a-browser-worksheet.js
→ question sheet / answer key / HTML renderer
```

The generic expression generator is suitable for arithmetic-only PatternSpecs. It does not provide the semantic-role, event-order, ownership, unit-flow, realism, and answer-reconstruction guarantees required by S57.

### 4.2 Existing G3B-U04 runtime coverage

Current runtime support is limited to:

```text
ps_g3b_u04_consecutive_multiplication
```

This existing arithmetic PatternSpec must remain compatible. It does not satisfy the 32-family semantic application requirement by itself.

### 4.3 Proven implementation precedent

G4A-U08 Phase2A already establishes the correct architectural precedent:

```text
family-level PatternSpec definitions
+ dedicated semantic/application generator
+ dedicated validator extension
+ explicit question-router branch
+ PatternGroup-to-multiple-PatternSpec selector projection
+ positive, negative, high-count, mixed worksheet tests
```

S57E should follow this separation rather than adding semantic branches to the generic expression generator.

## 5. Locked Architecture Decisions

### Decision D1 — One semantic family equals one PatternSpec

```text
SEMANTIC_PATTERN_SPEC_COUNT = 32
```

A family is independently auditable only when it has its own PatternSpec ID. Combining several approved semantic signatures into one PatternSpec would make family coverage, role binding, negative tests, drift detection, and selector allocation ambiguous.

PatternSpec naming rule:

```text
ps_g3b_u04_<semantic-family-suffix>
```

The suffix must be derived from the existing `templateFamilyId` without changing semantic meaning.

### Decision D2 — Nine PatternGroups, one per KnowledgePoint

```text
PATTERN_GROUP_COUNT = 9
```

Each PatternGroup contains all family-level PatternSpecs for one approved KnowledgePoint.

```text
KnowledgePoint
→ one PatternGroup
→ 3–5 family-level PatternSpecs
```

The existing arithmetic-only `ps_g3b_u04_consecutive_multiplication` remains available. It must not be silently substituted for the four semantic consecutive-multiplication families.

### Decision D3 — Dedicated semantic question kind

```text
kind = g3bU04SemanticWordProblem
```

The semantic question kind is distinct from generic `expression`, generic `divisionWordProblem`, and G4A-U08 application questions. This prevents unrelated validators from accepting a G3B-U04 item based only on arithmetic correctness.

### Decision D4 — Dedicated generator and dedicated validator extension

Planned runtime modules:

```text
site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js
site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js
site/modules/curriculum/batch-a/batch-a-browser-validator-g3b-u04-extension.js
```

Required integration points:

```text
site/modules/curriculum/batch-a/batch-a-browser-question-router.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
```

The worksheet file should only receive the latest validator-extension import and, in the later smoke phase, a long-text layout profile. It must not own semantic generation logic.

### Decision D5 — Authoritative JSON plus drift-checked browser projection

Planned authoritative PatternSpec artifact:

```text
data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json
```

The runtime JS projection is required because the public site is static and currently consumes browser modules. However, tests must enforce full parity between the JSON registry and runtime definitions:

```text
32 / 32 PatternSpec IDs resolve
32 / 32 templateFamilyIds match
9 / 9 KnowledgePoint IDs match
all equation shapes match
all unknown roles match
all required constraints match
no extra runtime family exists
no approved family is omitted
```

### Decision D6 — Hidden-first rollout

The first implementation milestone must keep all new semantic KnowledgePoints and PatternGroups hidden.

```text
materialized = allowed
runtime callable by tests = allowed
browser visible = forbidden
HTML selectable = forbidden
productionUse promotion = forbidden
```

Visibility is a separate S57F gate after generator, validator, worksheet, and PDF smoke pass.

### Decision D7 — No AI free-form generation in the production path

S57E uses deterministic templates, deterministic role sampling, and seeded context selection.

```text
AI free-form prompt writing = not in runtime scope
AI-generated unregistered family = rejected
unregistered wording-only family = rejected
```

AI may remain an offline authoring aid only. Runtime production items must be reconstructable from registered roles and rules.

## 6. PatternSpec Contract

Each of the 32 PatternSpecs must contain at least:

```yaml
patternSpecId: string
sourceId: g3b_u04_3b04
unitCode: 3B-U04
kind: g3bU04SemanticWordProblem
knowledgePointId: string
templateFamilyId: string
semanticSignature: string
equationShape: string
unknownRole: string
quantityRoles: object
contextDomains: string[]
promptSkeletonZh: string
requiredConstraints: string[]
numericPolicyRef: S57.sharedNumericPolicy
semanticValidatorRef: S57_G3B_U04_SemanticValidationContract
answerModel:
  shape: semantic_equation_answer
  fields:
    - equationModel
    - finalAnswer
    - finalAnswerWithUnit
    - semanticSnapshot
generatorStatus: hidden_implementation_candidate
validatorStatus: blocking_validator_required
selectorStatus: hidden
productionUse: forbidden
```

### PatternGroup contract

```yaml
patternGroupId: pg_g3b_u04_<knowledge-point-suffix>
sourceId: g3b_u04_3b04
primaryKnowledgePointId: string
knowledgePointIds: [string]
patternSpecIds: string[]
allocationPolicy: balanced_by_family
visibilityStatus: hidden
holdReason: semantic_runtime_and_smoke_qa_required
```

## 7. Generated Question Contract

Every generated item must contain enough information to validate the story without trusting the rendered sentence.

```yaml
id: string
sourceId: g3b_u04_3b04
kind: g3bU04SemanticWordProblem
patternSpecId: string
knowledgePointId: string
templateFamilyId: string
semanticSignature: string
promptText: string
blankedDisplayText: string
displayText: string
equationModel: string
equationTokens: array
finalAnswer: integer
answerUnit: string
answerText: string
quantityRoleBindings: object
eventSequence: array
unknownRole: string
contextDomain: string
realismProfile: object | null
semanticSnapshot:
  sourceId: string
  knowledgePointId: string
  templateFamilyId: string
  semanticSignature: string
  equationShape: string
  quantityRoleBindings: object
  eventSequence: array
  unknownRole: string
  answerUnit: string
  contextDomain: string
  realismProfile: object | null
  validationCodes: array
metadata:
  patternId: string
  sourceId: string
  canonicalSkillIds: string[]
  skillTags: string[]
  difficultyTags: string[]
  patternTags: string[]
  curriculumNodeIds: string[]
```

`promptText` and `blankedDisplayText` may be identical for a word problem. `displayText` may include the answer for answer-key rendering but must never be used as the validation source.

## 8. Deterministic Generator Pipeline

The generator must execute in this order:

```text
1. Resolve approved PatternSpec.
2. Resolve approved template family.
3. Choose a context domain permitted by that family.
4. Choose a registered scenario profile compatible with the context.
5. Sample semantic quantity roles, not anonymous operands.
6. Enforce KnowledgePoint invariants and family constraints during sampling.
7. Enforce exact division, positive values, intermediate/final range, and realism profiles.
8. Build an explicit eventSequence.
9. Reconstruct equation tokens from semantic roles.
10. Compute intermediate values and final answer.
11. Render the registered Chinese prompt skeleton.
12. Build the required semantic snapshot.
13. Run the blocking semantic validator.
14. Return the item only when every blocking stage passes.
15. Retry with a deterministic derived seed or fail with a typed generation-exhausted error.
```

### Sampling policy

```text
- Sample backward from a valid answer/division relationship where exact division is required.
- Do not sample arbitrary operands and repair the story afterward.
- Do not mutate the prompt to hide invalid values.
- Use bounded deterministic retry.
- Record retry exhaustion as a blocking generation error.
```

### Family-balancing policy

```text
single-KP worksheet = balanced across that KP's approved families
full G3B-U04 semantic worksheet = balanced across nine PatternGroups, then across families
shuffle mode = deterministic after successful generation and validation
```

## 9. Scenario and Realism Registry Design

A scenario profile must bind object vocabulary, count nouns, legal actions, unit domains, and plausibility bounds.

```yaml
scenarioId: string
contextDomain: string
objectLabel: string
itemUnit: string | null
recipientUnit: string | null
packageUnit: string | null
measureUnit: string | null
currencyUnit: string | null
allowedActions: string[]
forbiddenActions: string[]
quantityBounds: object
ownershipModel: string
realismProfileRef: string | null
```

Required profile classes:

```text
- countable objects and packaging
- money and shared payment
- capacity and same-substance combining
- group/team/tray formation
- multiplicative comparison objects
- family age chain
- production within a common period
```

A noun bank alone is insufficient. Each scenario row must prove that the object, unit, classifier, action, and quantity bounds are mutually compatible.

## 10. Semantic Validator Design

The runtime validator must implement all eight approved stages in this order:

```text
1. structure
2. role_binding
3. arithmetic
4. unit_flow
5. event_semantics
6. realism
7. language_readback
8. answer_reconstruction
```

### Required behavior

```text
- All 25 S57 semantic error codes remain blocking.
- All three style codes remain warnings only.
- The validator must not silently correct input.
- The validator must not infer a missing role from the numeric expression.
- The validator must reconstruct the equation independently from semantic roles.
- The recomputed answer must equal the stored expression result and answer model.
- Unknown role and answer unit must match the question asked.
- The known source-heading mismatch must remain isolated and must never map the promotion family to addition-then-division.
```

### Additional runtime-only blocking codes

Implementation may add runtime infrastructure codes, provided they do not replace or weaken the 25 approved semantic codes. Required infrastructure candidates:

```text
G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED
G3B_U04_SEM_GENERATION_EXHAUSTED
G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED
G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED
G3B_U04_SEM_SNAPSHOT_INCOMPLETE
```

These additions require tests and must be recorded as implementation codes, not retroactively counted among the S57 contract's 25 codes.

## 11. Runtime Integration Design

### Pattern lookup chain

```text
source-pattern-g3b-u04-semantic-extension.js
→ delegates unknown IDs to the current extension chain
→ returns 32 semantic definitions for G3B-U04
```

The extension must preserve every existing Batch A PatternSpec and source-unit path.

### Router branch

The question router should add a dedicated branch before generic fallback:

```text
if G3B-U04 semantic plan
→ generateG3BU04SemanticQuestions(options)
else
→ preserve existing routes
```

A later hybrid mode may combine the existing numeric consecutive-multiplication pattern with semantic PatternGroups. Hybrid support is not required for the first hidden implementation milestone.

### Validator extension chain

```text
batch-a-browser-validator-g3b-u04-extension.js
→ validates G3B-U04 semantic items
→ delegates every unrelated item to the current validator extension
```

`batch-a-browser-worksheet.js` must import the newest extension only after the new validator passes standalone negative tests.

## 12. Test and Acceptance Matrix

### 12.1 Registry and drift tests

```text
- 32 PatternSpecs materialized.
- 9 KnowledgePoints represented.
- 32 template families represented exactly once.
- Family counts equal S57 coverageSummary.
- Every PatternSpec resolves to one approved KP and one approved family.
- Every required constraint is preserved.
- No S43E6 obsolete pseudo-KP returns as a mathematical KP.
```

### 12.2 Positive generator tests

```text
- At least one deterministic positive fixture for each of 32 families.
- At least one context-domain fixture per permitted profile class.
- Identical seed produces identical item.
- Different sequence seeds produce variation without changing family identity.
- Every generated item passes all eight validation stages.
```

### 12.3 Negative semantic tests

```text
- At least one failing fixture for each of the 25 blocking semantic codes.
- Wrong equation shape is blocked.
- Wrong unknown role is blocked.
- Actor ownership swap is blocked.
- Event-order reversal is blocked.
- Unit and classifier mismatch is blocked.
- Non-exact division is blocked.
- Promotion paid/received inconsistency is blocked.
- Conservation failure is blocked.
- Multiplicative direction reversal is blocked.
- Implausible age/package/container/object action is blocked.
- Ambiguous referent and multiple unknowns are blocked.
- Numeric-correct but semantic-wrong item is blocked.
- Wording-only duplicate family claim is blocked.
```

### 12.4 Stress and distribution tests

```text
- 200-question single-KP generation for each of nine KPs.
- 1,000-question all-family hidden stress run.
- 0 blocking validation failures.
- 0 unresolved placeholders.
- 0 future-domain leakage.
- 0 answer mismatch.
- Family allocation differs by at most one where equal distribution is requested.
- Context-domain concentration warning does not become a silent blocker.
```

### 12.5 Worksheet tests

```text
- Question sheet and answer key maintain identical numbering.
- Long word-problem cards use safe print layout and avoid split where possible.
- No internal kp_/pg_/ps_/tpl_ identifiers leak into student text.
- Metadata preserves KP, PatternGroup, PatternSpec, and template-family traceability.
- HTML smoke passes before any selector visibility promotion.
- Regenerated PDF smoke is required before S57F visibility work.
```

## 13. Planned Files for Implementation

### New data and runtime files

```text
data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json
site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js
site/modules/curriculum/batch-a/g3b-u04-semantic-scenarios.js
site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js
site/modules/curriculum/batch-a/batch-a-browser-validator-g3b-u04-extension.js
```

### Existing integration files expected to change

```text
site/modules/curriculum/batch-a/batch-a-browser-question-router.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
```

### Tests expected to be added

```text
tests/curriculum/g3b-u04-semantic-pattern-specs.test.js
tests/curriculum/batch-a/g3b-u04-semantic-generator.test.js
tests/curriculum/batch-a/g3b-u04-semantic-validator.test.js
tests/curriculum/batch-a/g3b-u04-semantic-negative-cases.test.js
tests/curriculum/batch-a/g3b-u04-semantic-stress.test.js
tests/curriculum/batch-a/g3b-u04-semantic-worksheet-smoke.test.js
```

### Explicitly deferred selector file

```text
site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js
```

This file belongs to S57F after hidden runtime QA. It must not be added during the first implementation wave.

## 14. Implementation Task Sequence

```text
S57E1_G3B_U04_SemanticPatternSpecMaterialization
  Materialize 32 authoritative PatternSpecs and registry-drift tests.

S57E2_G3B_U04_SemanticScenarioAndRoleRegistry
  Implement scenario profiles, units, classifiers, ownership, and realism bounds.

S57E3_G3B_U04_StructuralSemanticGenerator
  Implement the seven arithmetic/two-step KPs excluding multiplicative relation KPs.

S57E4_G3B_U04_MultiplicativeRelationGenerator
  Implement composite ratio and quantity-chain families, including age and production safeguards.

S57E5_G3B_U04_BlockingSemanticValidator
  Implement eight stages, 25 approved blocking codes, three style warnings, and runtime infrastructure codes.

S57E6_G3B_U04_HiddenRouterAndValidatorIntegration
  Integrate dedicated generation and validation behind hidden/non-selectable status.

S57E7_G3B_U04_FamilyCoverageNegativeAndStressQA
  Execute 32-family positives, 25-code negatives, determinism, distribution, and high-count stress.

S57E8_G3B_U04_HiddenWorksheetAndPDFSmokeCloseout
  Run HTML worksheet, answer-key, layout, regenerated PDF smoke, and authoritative CI readback.
```

After S57E8 passes:

```text
S57F_G3B_U04_SemanticSelectorVisibilityAndProductionWorksheetQA_DesignScan
```

S57F is not authorized by S57D.

## 15. Implementation Gates

### S57E PatternSpec gate

```text
32 / 32 families materialized
9 / 9 KPs represented
0 registry drift
0 orphan PatternSpecs
selector visibility remains hidden
```

### S57E generator gate

```text
32 / 32 families produce deterministic valid items
all divisions exact where required
all values inside approved range
all required roles bound exactly once
0 unresolved prompt placeholders
```

### S57E validator gate

```text
8 / 8 stages implemented
25 / 25 contract blocking codes testable
3 / 3 warning codes remain nonblocking
numeric-correct semantic-invalid fixtures rejected
answer reconstruction mandatory
```

### S57E hidden integration gate

```text
router resolves semantic plans
unrelated Batch A routes unchanged
worksheet and answer key render
HTML and PDF smoke pass
new KPs remain hidden and not selectable
productionUse remains forbidden
Math CI Readback passes with clean worktree
```

## 16. Risks and Required Controls

| Risk | Control |
|---|---|
| Family definitions drift between JSON and JS | Exact registry/runtime parity tests |
| Generic expression validator accepts semantic error | Dedicated kind and dedicated validator branch |
| Valid arithmetic with wrong event story | Event sequence plus answer reconstruction stages |
| Names/nouns create fake variation | Family ID fixed; wording variation is metadata only |
| Division frequently fails after random sampling | Backward sample from exact quotient relationships |
| Unit and package-level confusion | Scenario profiles bind units, classifiers, and hierarchy |
| Promotion story contradicts paid/received quantities | Promotion-specific role and realism checks |
| Age chain produces implausible values | Approved age profile and ordering enforced during sampling and validation |
| Runtime implementation exposes unverified KPs | Hidden-first rollout and deferred selector extension |
| Long text breaks worksheet layout | Dedicated word-problem layout smoke before visibility |
| Existing S46/UI work is destabilized | S57D is docs-only; S57E uses isolated unit modules and preserves delegation chain |

## 17. Design Gate Result

```text
S57D_SCOPE_LOCK = PASS
S57_INPUT_READBACK = PASS
RUNTIME_ARCHITECTURE_SCAN = PASS
PATTERN_SPEC_GRANULARITY_DECISION = PASS (32 family-level specs)
PATTERN_GROUP_DECISION = PASS (9 groups)
GENERATOR_BOUNDARY_DECISION = PASS (dedicated deterministic generator)
VALIDATOR_BOUNDARY_DECISION = PASS (dedicated eight-stage blocking validator)
HIDDEN_FIRST_ROLLOUT_DECISION = PASS
TEST_MATRIX_DEFINED = PASS
IMPLEMENTATION_ORDER_DEFINED = PASS
RUNTIME_CODE_CHANGED = false
BROWSER_PROJECTION_CHANGED = false
PRODUCTION_USE_CHANGED = false
```

## 18. Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3B_U04_CONTRACT_FULLY_CLOSED_IMPLEMENTATION_UNDESIGNED
GOAL_DISTANCE_AFTER  = D2_G3B_U04_PATTERN_SPEC_GENERATOR_VALIDATOR_IMPLEMENTATION_PATH_LOCKED
DISTANCE_REDUCED     = The path from the approved nine KPs and 32 semantic families to hidden runtime PatternSpecs, deterministic semantic generation, blocking validation, and worksheet smoke is now fully specified.
REMAINING_BLOCKERS   = [
  "32 semantic PatternSpecs are not materialized",
  "scenario and realism registries are not implemented",
  "runtime semantic generator is not implemented",
  "runtime eight-stage semantic validator is not implemented",
  "router and worksheet integration are not implemented",
  "family coverage, negative, stress, HTML, and PDF smoke QA are not run",
  "selector visibility and production worksheet promotion remain deferred"
]
NEXT_SHORTEST_STEP = S57E1_G3B_U04_SemanticPatternSpecMaterialization
```

## 19. Closeout Boundary

```text
S57D_STATUS = PASS_DESIGN_LOCKED_IMPLEMENTATION_APPROVAL_REQUIRED
AUTO_CONTINUE_DECISION = STOP
STOP_REASON = PLANNING_TO_IMPLEMENTATION_REQUIRES_SEPARATE_APPROVAL
BLOCKER_TYPE = APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S57D_G3B_U04_PatternSpecAndSemanticGeneratorImplementation_DesignScan_PASS
REQUIRED_OPERATOR_ACTION = Approve S57E1_G3B_U04_SemanticPatternSpecMaterialization implementation scope.
NEXT_RESUME_TASK = S57E1_G3B_U04_SemanticPatternSpecMaterialization
```

# N+1 Application Interpretation Proof SOP V1

```text
CONTRACT_ID = N_PLUS_ONE_APPLICATION_INTERPRETATION_PROOF_V1
PARENT_CONTRACT = APPLICATION_PROBLEM_SOP_V1
SINGLE_ITEM_CONTRACT = SINGLE_APPLICATION_ITEM_SOP_V1
MILESTONE = APP-SOP-A02_NPlusOneInterpretationProofAndMisconceptionContract
STATUS = PROOF_CONTRACT_DRAFT_LOCKED_FOR_REVIEW
RUNTIME_CHANGE = false
QUESTION_CONTENT_ADDED = false
PRODUCTION_ADMISSION_CHANGED = false
```

## 1. Purpose

This SOP defines the evidence required to call a single application capability `N_PLUS_1`.

It prevents four incorrect classifications:

```text
larger numbers = N+1
more arithmetic steps = N+1
longer wording = N+1
new story nouns = N+1
```

An N+1 claim is valid only when the learner must perform one nearest, observable, independently verifiable interpretive act that is not already included in the base application capability.

## 2. Formal definition

```text
N = an admitted application capability node.

N+1 = the nearest candidate application capability node reachable from N
without requiring another unmastered semantic node.
```

Required graph result:

```text
baseCapabilityId → candidateCapabilityId
shortestSemanticDistance = 1
intermediateSemanticNodeRequired = false
```

The classification is relative to the declared base capability and prerequisite set. A pattern family does not have a universal N+1 level independent of the learner path.

## 3. Proof package

Every N+1 candidate must provide one complete proof package:

```text
identity
base capability
candidate capability
prerequisite closure
new interpretive act
paired control evidence
interpretation witness
misconception models
counterfactual evidence
cross-context invariance
validator delta
proof verdict
```

No production claim is allowed from a title or difficulty label alone.

## 4. Prerequisite closure

Required fields:

```text
requiredPrerequisiteCapabilityIds
availablePrerequisiteCapabilityIds
missingPrerequisiteCapabilityIds
```

Admission requires:

```text
missingPrerequisiteCapabilityIds = []
```

If a required semantic prerequisite is missing, the result is:

```text
DEFERRED_MISSING_PREREQUISITE
```

If the candidate requires a distinct intermediate semantic node, the result is:

```text
DEFERRED_NOT_ADJACENT
```

The candidate may later be reconsidered relative to a different base node.

## 5. New interpretive act

Exactly one primary interpretive act must be declared.

Allowed V1 values:

```text
UNKNOWN_ROLE_SHIFT
REMAINDER_INTERPRETATION
RELATION_CHAIN
DUAL_CONSTRAINT_RESOLUTION
CONSERVATION_OR_TRANSFER
COMPARISON_DECISION
UNIT_ROLE_INTERPRETATION
IRRELEVANT_INFORMATION_FILTER
```

Several observable changes may accompany one act, but they must form one coherent teachable capability.

Example:

```text
base = report quotient and remainder
candidate = decide minimum containers
newInterpretiveAct = REMAINDER_INTERPRETATION
```

The candidate is not admitted when two independent new interpretive acts are necessary.

## 6. Paired-control evidence

The strongest comparison keeps numeric demand stable and changes only the semantic target or decision.

Required controls:

```text
sameNumericPrerequisites = true
sameOrEquivalentNumbers = true
sameNumberDomain = true
sameOrEquivalentSurfaceLoad = true
semanticDeltaOnly = true
```

The pair must identify:

```text
basePrompt
candidatePrompt
baseTargetRole
candidateTargetRole
baseExpectedAnswer
candidateExpectedAnswer
```

The comparison must explain why any answer change comes from interpretation rather than arithmetic load.

## 7. Interpretation fork

The candidate must contain an interpretation fork: two plausible paths after correct or nearly correct arithmetic, only one of which satisfies the context.

Required fields:

```text
forkPoint
validInterpretationPath
plausibleMisinterpretationPath
contextConditionThatResolvesFork
```

Example:

```text
50 ÷ 6 = 8 remainder 2

path A: report 8 full groups
path B: use 9 resources to handle all people

condition: every person must receive a seat
```

Without a genuine fork, the candidate is ordinarily `SINGLE_DIRECT`, not `SINGLE_N_PLUS_1`.

## 8. Interpretation witness

The learner must leave compact evidence of the new interpretation.

Allowed witness types:

```text
TARGET_ROLE_SELECTION
RELATION_ORDER_SELECTION
DECISION_REASON_SELECTION
COMPARISON_EVIDENCE
ERROR_DIAGNOSIS
SHORT_ANSWER_MEANING
```

Witness requirements:

```text
witnessTargetsNewInterpretiveAct = true
witnessCanDistinguishCorrectArithmeticFromCorrectInterpretation = true
witnessDoesNotRevealAnswer = true
```

A witness that merely repeats the equation is invalid.

## 9. Misconception taxonomy

Every candidate requires at least two semantic misconception models. A recommended robust package contains three or more.

Initial taxonomy:

```text
TARGET_ROLE_CONFUSION
OPERATION_KEYWORD_MATCHING
QUOTIENT_ONLY
REMAINDER_AS_TARGET
COMPUTED_NOT_INTERPRETED
RELATION_ORDER_REVERSAL
CONSTRAINT_IGNORED
UNIT_ROLE_CONFUSION
IRRELEVANT_INFORMATION_USED
PART_WHOLE_ROLE_SWAP
COMPARISON_DIRECTION_REVERSAL
CONSERVATION_VIOLATION
```

Each model stores:

```text
misconceptionId
misconceptionType
triggerCondition
expectedWrongAnswerOrDecision
diagnosticMeaning
blockingOrDiagnosticSeverity
```

Random arithmetic distractors are not semantic misconception evidence.

## 10. Diagnostic coverage

The misconception set must distinguish at least these states when relevant:

```text
CALCULATION_FAIL
CALCULATION_PASS_INTERPRETATION_FAIL
ANSWER_ROLE_OR_UNIT_FAIL
FULL_PASS
```

For an N+1 decision item, at least one misconception must represent a learner who computes correctly but interprets incorrectly.

## 11. Counterfactual evidence

A counterfactual changes one context condition while preserving the numeric prerequisites.

Required:

```text
changedContextCondition
numericPrerequisitesPreserved = true
expectedInterpretationChanged = true
expectedAnswerOrDecisionChanged = true
```

Example:

```text
all students need seats → 9 vehicles
count only completely filled vehicles → 8 vehicles
```

A candidate fails when the system returns the same decision after the decisive condition is reversed.

## 12. Cross-context invariance

The same N+1 capability should survive movement across at least two compatible global-context families.

Required evidence:

```text
contextFamilyA
contextFamilyB
sharedRoleGraph
sharedNewInterpretiveAct
contextSpecificUnits
sameValidatorDelta
```

Example:

```text
transport capacity
packaging capacity
```

Both may use remainder interpretation, but their surface nouns and answer units differ. The core role graph and decision rule remain stable.

Cross-context invariance prevents a single memorized phrase from being treated as a capability.

## 13. Keyword robustness

At least one paraphrase must remove or replace common operation keywords while preserving the semantic model.

Required:

```text
originalSurfaceTemplate
paraphrasedSurfaceTemplate
roleGraphEquivalent = true
expectedAnswerEquivalent = true
```

The item must not depend on fixed words such as `平均`, `一共`, `剩下`, `至少`, or `最多` as the sole basis for choosing an operation.

## 14. Validator delta

An N+1 proof must identify validation that does not exist at N.

Required fields:

```text
baseValidatorChecks
candidateAdditionalValidatorChecks
```

At least one additional semantic check is required.

Examples:

```text
base: quotient and remainder reconstruction
candidate: remainder decision and answer-role validation
```

If the candidate can be fully admitted by the unchanged base validator, the N+1 claim is not proven.

## 15. Answer-meaning validation

The proof must verify:

```text
answerRoleValidated = true
answerUnitValidated = true
contextDecisionValidated = true
interpretationStatementValidated = true
```

A numerically correct value with the wrong role or unit remains invalid.

## 16. Proof verdicts

Allowed verdicts:

```text
PROVEN_N_PLUS_1_CANDIDATE
NOT_N_PLUS_1_SAME_CAPABILITY
DEFERRED_MISSING_PREREQUISITE
DEFERRED_NOT_ADJACENT
REJECTED_NUMERIC_LOAD_ONLY
REJECTED_DECORATIVE_CONTEXT
REJECTED_NO_INTERPRETATION_FORK
REJECTED_VALIDATOR_DELTA_MISSING
REJECTED_NON_UNIQUE_INTERPRETATION
```

`PROVEN_N_PLUS_1_CANDIDATE` is still not production admission. Production requires later executable validator and worksheet evidence.

## 17. Minimum proof gate

A proof passes only when:

```text
BASE_CAPABILITY_DEFINED = true
CANDIDATE_CAPABILITY_DEFINED = true
PREREQUISITE_CLOSURE_PASS = true
SHORTEST_SEMANTIC_DISTANCE = 1
ONE_PRIMARY_INTERPRETIVE_ACT = true
PAIRED_CONTROL_PASS = true
INTERPRETATION_FORK_EXISTS = true
INTERPRETATION_WITNESS_VALID = true
MISCONCEPTION_MODELS >= 2
CALCULATION_PASS_INTERPRETATION_FAIL_MODEL_EXISTS = true
COUNTERFACTUAL_TEST_PASS = true
CROSS_CONTEXT_INVARIANCE_PASS = true
KEYWORD_ROBUSTNESS_PASS = true
VALIDATOR_DELTA_EXISTS = true
ANSWER_MEANING_VALIDATION_PASS = true
```

## 18. Evidence lifecycle

```text
DRAFT_PROOF
PREREQUISITE_VERIFIED
PAIRED_CONTROL_VERIFIED
MISCONCEPTION_COVERAGE_VERIFIED
COUNTERFACTUAL_VERIFIED
CROSS_CONTEXT_VERIFIED
VALIDATOR_DELTA_VERIFIED
PROVEN_N_PLUS_1_CANDIDATE
```

Any changed base capability, operation model, or prerequisite graph invalidates the proof until revalidated.

## 19. A02 scope boundary

A02 defines proof structure and evidence contracts only.

```text
production question authoring = forbidden
runtime generator modification = forbidden
runtime validator modification = forbidden
renderer modification = forbidden
public UI modification = forbidden
global context family authoring = forbidden
unit context binding admission = forbidden
PBL schema implementation = forbidden
production admission change = forbidden
POST_GOLDEN migration controller modification = forbidden
```

Abstract fixtures may be used to test the contract. They are not production questions.

## 20. A02 acceptance

A02 passes only when:

```text
prerequisite and adjacency evidence are machine represented
paired-control invariants are machine represented
interpretation-fork evidence is mandatory
semantic misconception coverage is mandatory
counterfactual and cross-context evidence are mandatory
validator delta is mandatory
proof verdicts are fixed
no runtime or production behavior changes
```

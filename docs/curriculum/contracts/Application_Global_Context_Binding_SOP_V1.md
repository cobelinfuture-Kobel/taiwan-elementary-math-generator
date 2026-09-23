# Application Global Context Binding SOP V1

```text
CONTRACT_ID = APPLICATION_GLOBAL_CONTEXT_BINDING_SOP_V1
PARENT_CONTRACT = APPLICATION_PROBLEM_SOP_V1
MILESTONE = APP-SOP-A04_GlobalContextBindingAndAdmissionRegistries
STATUS = REGISTRY_CONTRACT_DRAFT_LOCKED_FOR_REVIEW
RUNTIME_CHANGE = false
QUESTION_CONTENT_ADDED = false
PRODUCTION_ADMISSION_CHANGED = false
```

## 1. Purpose

This SOP defines how a KnowledgePoint and canonical operation model may use an existing global-context family for:

```text
SINGLE_DIRECT
SINGLE_N_PLUS_1
PBL_TASK_SET
```

A context binding is an admission record, not a story-writing shortcut. The binding must preserve mathematical authority and prove that the event can carry the required quantity roles, units, constraints, interpretation witness, and final answer meaning.

## 2. Mandatory binding order

```text
KnowledgePoint
→ Canonical Operation Model
→ Application Capability
→ requiredContextAffordances
→ compatible Global Context Family
→ roleBindings
→ unitFlow
→ semanticConstraints
→ admitted surface templates
→ answer witness
```

Forbidden order:

```text
choose an SDG or story
→ insert numbers
→ infer mathematics afterward
```

## 3. Authority separation

### Mathematics authority

Owned by:

```text
data/curriculum/knowledge/units/<sourceId>.knowledge-operation.json
```

It controls:

```text
operation signature
operand roles
unknown role
number constraints
unit invariants
answer model
validation invariants
```

### Context authority

Owned by:

```text
data/curriculum/context/registry/
```

It controls:

```text
event structure
actors
places
objects
activities
surface templates
semantic safety restrictions
SDG tags
```

### Binding authority

Owned by:

```text
data/curriculum/application/registry/application-context-bindings.json
```

It controls:

```text
KnowledgePoint eligibility
operation-model eligibility
application-mode eligibility
context-family eligibility
role bindings
unit flow
semantic constraints
forbidden combinations
surface-template admission
answer-witness contract
```

A context family may not mutate mathematics.

## 4. Binding identity

Each binding requires:

```text
bindingId
sourceId
knowledgePointId
canonicalOperationModelId
applicationModes
contextFamilyId
admissionStatus
```

The tuple below must be unique:

```text
sourceId
+ knowledgePointId
+ canonicalOperationModelId
+ contextFamilyId
+ applicationMode
```

## 5. Required context affordances

The application capability declares what the event must support.

Examples:

### Minimum-container decision

```text
fixed maximum capacity
all people or items must be handled
partial final resource is permitted
nonzero remainder requires another resource
```

### Maximum-complete-group decision

```text
fixed group size
only complete groups count
partial group does not count
```

### Comparison decision

```text
two or more admissible options
shared comparison basis
explicit constraint or goal
one uniquely defensible decision
```

The binding must prove every required affordance is provided by the selected context family.

## 6. Role binding

Every mathematical role must bind to one context role.

Required fields:

```text
mathRoleId
contextRoleId
semanticMeaning
quantityType
unit
cardinality
```

Rules:

- no required mathematical role may remain unbound;
- one context role may not serve conflicting mathematical roles;
- answer role and answer unit must be explicit;
- actor, object, place, and event labels cannot replace quantity-role evidence.

## 7. Unit flow

The binding must declare unit flow from givens to answer.

Example:

```text
totalPeople: 人
capacityPerVehicle: 人/輛
minimumVehicleCount: 輛
```

Required checks:

```text
all input units allowed
operation unit transformation valid
answer unit matches target role
surface template uses the admitted unit
```

## 8. Semantic constraints

Semantic constraints define event rules that affect interpretation or decision.

Examples:

```text
every person needs a seat
all items must be packed
vehicle capacity cannot be exceeded
only complete teams count
remaining stock may be stored
budget cannot be exceeded
```

A constraint is mandatory when removing it changes the correct interpretation or final decision.

## 9. Forbidden combinations

Each binding may declare forbidden combinations such as:

```text
context family incompatible with answer unit
partial resource prohibited but ceil rule required
context implies equal sharing while model asks group count
surface template reveals the operation being assessed
context introduces unadmitted decimal or fraction arithmetic
SDG topic requires external facts not included in the prompt
```

A matched family with a forbidden combination remains rejected.

## 10. Surface-template admission

A context family may contain many templates. The binding admits templates individually.

Required template checks:

```text
role placeholders complete
no role collision
no missing constraint
no operation leakage
natural Traditional Chinese
age appropriate
answer remains unique
keyword robustness preserved
```

Noun substitution alone does not create a new context family or capability.

## 11. Answer-witness contract

Every admitted binding must define how the generated item proves answer meaning.

Required:

```text
answerRole
answerUnit
interpretationStatementPattern
allowedWitnessTypes
misconceptionCompatibility
counterfactualCompatibility
```

For PBL, it also includes:

```text
milestone witness compatibility
final product compatibility
constraint satisfaction witness
```

## 12. Application-mode eligibility

A binding declares one or more modes:

```text
SINGLE_DIRECT
SINGLE_N_PLUS_1
PBL_TASK_SET
```

Eligibility is mode-specific. A context may support a direct single item but not PBL, or support one N+1 interpretation but not another.

`SINGLE_N_PLUS_1` additionally requires an admitted N+1 proof reference.

`PBL_TASK_SET` additionally requires an admitted graph type and final-product type.

## 13. Admission registry

Admission decisions are recorded in:

```text
data/curriculum/application/registry/application-admission-registry.json
```

Each record identifies:

```text
candidateId
candidateType
bindingId
currentStage
decision
evidenceRefs
blockingReasons
```

Allowed candidate types:

```text
SINGLE_APPLICATION_BINDING
N_PLUS_ONE_PROOF
PBL_CONTEXT_BINDING
SURFACE_TEMPLATE_BINDING
```

## 14. Admission lifecycle

```text
DRAFT
KNOWLEDGE_POINT_ELIGIBILITY_VERIFIED
OPERATION_MODEL_VERIFIED
CONTEXT_AFFORDANCES_VERIFIED
ROLE_BINDING_VERIFIED
UNIT_FLOW_VERIFIED
SEMANTIC_CONSTRAINTS_VERIFIED
SURFACE_TEMPLATES_VERIFIED
ANSWER_WITNESS_VERIFIED
VALIDATOR_READY
QA_VALIDATED
PRODUCTION_ADMITTED
```

A04 creates empty registries and contracts only. It does not create `PRODUCTION_ADMITTED` records.

## 15. Rejected and deferred states

```text
REJECTED_DECORATIVE_CONTEXT
REJECTED_AFFORDANCE_MISMATCH
REJECTED_ROLE_MISMATCH
REJECTED_UNIT_FLOW_MISMATCH
REJECTED_SEMANTIC_CONSTRAINT_MISSING
REJECTED_FORBIDDEN_COMBINATION
REJECTED_NON_UNIQUE_ANSWER
REJECTED_TEMPLATE_OPERATION_LEAKAGE
DEFERRED_MISSING_N_PLUS_ONE_PROOF
DEFERRED_MISSING_PBL_CONTRACT
DEFERRED_VALIDATOR_NOT_READY
```

Every rejection or deferral requires at least one explicit reason.

## 16. Registry fail-closed rules

Runtime consumers must eventually reject:

```text
binding ID not present
binding admission status below PRODUCTION_ADMITTED
unknown KnowledgePoint or operation model
context family not found
required role not bound
unit flow invalid
required semantic constraint absent
forbidden combination matched
surface template not individually admitted
N+1 proof missing
PBL graph or final product unsupported
```

A04 only establishes these contracts; runtime enforcement begins later.

## 17. Bootstrap registry policy

Initial registries are intentionally empty:

```text
bindings = []
admissionRecords = []
```

This proves that no existing application question is silently promoted by creating the SOP.

Population begins only after A05 validators and pilot evidence exist.

## 18. A04 scope boundary

```text
new global-context family authoring = forbidden
production binding population = forbidden
production admission = forbidden
runtime generator modification = forbidden
runtime validator modification = forbidden
renderer modification = forbidden
public UI modification = forbidden
application question authoring = forbidden
POST_GOLDEN migration controller modification = forbidden
```

## 19. A04 acceptance

A04 passes only when:

```text
binding schema exists
admission-record schema exists
binding registry exists and is empty
admission registry exists and is empty
mathematics and context authority are separated
role binding and unit flow are mandatory
mode-specific eligibility is represented
N+1 and PBL references are conditionally required
production admission remains absent
```

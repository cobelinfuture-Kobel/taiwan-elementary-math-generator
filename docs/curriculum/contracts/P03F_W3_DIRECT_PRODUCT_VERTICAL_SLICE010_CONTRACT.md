# P03F W3 Direct Product Vertical Slice010 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P03F_W3DirectProductVerticalSlice010Implementation
QUEUE_POSITION = 10
TARGET_EVIDENCE_LEVEL = E6_D0_COMPLETE
```

## Frozen identity

```text
sliceId = p03e_q010_r6_g4a_u09_4a09_profile_decimal_c1
sourceNodeId = g4a_u09_4a09
knowledgePointId = kp_g4a_u09_hundredth_representation
runtimeProfileId = profile_decimal
intraWavePrerequisiteRank = 6
requiredCapabilities = [cap_decimal_domain_validator, cap_decimal_number_system]
predecessor = p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1
```

## Source and PatternSpec authority

The source-backed authority is the existing W02 canonical-operation and hidden PatternSpec materialization. Public materialization must preserve:

```text
operationModelId = op_g4a_u09_hundredth_representation
operationFamilyId = decimal_representation
patternGroupId = pg_g4a_u09_hundredth_representation_numeric
patternSpecId = ps_g4a_u09_hundredth_representation_decimal_numeric
requestedUnknownRole = decimal
givenRoles = [whole, fractionalUnits, placeUnit]
canonicalExpression = decimal = whole + fractionalUnits * placeUnit
```

The bounded Slice010 witness is:

```text
whole = 0
fractionalUnits = 1
placeUnit = 0.01
decimal = 0.01
canonicalIdentity = 1e-2
```

## Product path

Slice010 must use the existing shared path:

```text
public selector
→ shared browser planner
→ shared operation-family generator adapter
→ shared decimal number-system consumer
→ shared decimal domain validator
→ shared worksheet assembler
→ shared answer-key path
→ shared HTML renderer
→ Chromium PDF print
```

No parallel generator, validator, worksheet or renderer is permitted.

## Scope boundary

Allowed:

- One public source: `g4a_u09_4a09`.
- One KnowledgePoint: `kp_g4a_u09_hundredth_representation`.
- One numeric PatternGroup and PatternSpec.
- Numeric mode only.
- Eight deterministic, unique witnesses.
- A4 question page plus answer-key page.

Forbidden:

- The other six G4A-U09 KnowledgePoints.
- Decimal arithmetic.
- Application stories or Global Context expansion.
- W4 or later-wave dependent implementation.
- UI or renderer refactoring unrelated to this bounded adapter.
- Starting queue position 11 before Slice010 reaches E6 D0.

## E6 D0 gate

```text
authority complete
PatternSpec parity complete
shared generator connected
shared validator connected
public selector connected
Pixel current surface connected
worksheet connected
answer key connected
HTML generated
Chromium PDF generated
8 / 8 questions validated
8 / 8 answers validated
0 duplicate prompts
0 overflow findings
0 semantic-scope findings
physical PDF pages = 2
visual review passed
artifact hashes exact
full Node regression passed
required CI passed
PR merged
post-merge closeout completed
```

Until every gate is true:

```text
productAdmissionState = RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE
slice010KnowledgePointAdmitted = false
queuePositionConsumed = 9
```

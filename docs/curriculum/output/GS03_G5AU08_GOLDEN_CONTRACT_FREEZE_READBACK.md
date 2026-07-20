# GS03 G5A-U08 Golden Contract Freeze

## Status

```text
PASS_E1_GOLDEN_CONTRACT_FROZEN_PENDING_EXACT_HEAD_CI_AND_MERGE
```

## Golden identity

```text
goldenContractId      = G5AU08_GOLDEN_V1
goldenContractVersion = 1.0.0
sourceId              = g5a_u08_5a08
status                = FROZEN_FOR_GS04_CONSUMPTION
freeze layers         = schema / binding / generator / validator / renderer
authority files       = 20
```

GS03 does not implement a runtime consumer or batch adapter. It freezes the current G5A-U08 production authority so GS04 can consume one explicit, versioned contract instead of copying unit-specific runtime.

## Frozen counts

```text
KnowledgePoints              = 11
PatternGroups                = 17
PatternSpecs                 = 30
numeric PatternSpecs         = 19
application PatternSpecs     = 11
generator PatternSpec union  = 30
TemplateFamilies             = 10
global context families      = 18
UnitContextBindings          = 18
surface templates            = 54
seed QA                      = 90
```

## Authority layers

The contract snapshots twenty current authority files with SHA-256 digests and required API/export tokens.

```text
schema
- S60D application template / SDG contract
- G5A-U08 source PatternGroup / PatternSpec authority
- GS02 global context family registry

binding
- GS02 UnitContextBinding registry
- promotion registry and production overlay
- worksheet promotion and eligibility
- canonical router

generator
- numeric generator
- application generator/core
- application batch planner

validator
- numeric validator
- application validator/core

renderer
- S60J renderer
- canonical worksheet assembly
- worksheet document pipeline
- preview / print pipeline
```

## Frozen safety rules

```text
allowed depths                    = N / N_PLUS_1
public N+2                        = false
formal-equation public mode       = false
generic fallback                  = false
free-form AI runtime composition  = false
unsupported PatternSpec           = block
blocking validator returns output = false
internal IDs visible              = false
question/answer numbering parity  = required
iframe print invocation           = required
```

The GS02 context corpus remains candidate-only at GS03:

```text
globalContextProductionSelectableAtFreeze = false
globalContextRuntimeResolvableAtFreeze     = false
contextMayChangeMath                       = false
contextMayReplaceTemplateFamily            = false
```

## Anti-drift contract

```text
PER_UNIT_NEW_GENERATOR_MAX = 0
PER_UNIT_NEW_VALIDATOR_MAX = 0
PER_UNIT_NEW_RENDERER_MAX  = 0
PER_UNIT_NEW_WORKFLOW_MAX  = 0
```

A shared capability extension requires at least two affected units, explicit approval, a Golden version bump for contract mutation, and a migration note for breaking changes.

## GitHub-hosted acceptance

The GS03 workflow completed:

```text
Golden materialization        = PASS
Golden snapshot validation    = PASS
20 authority hash validation  = PASS
required API/token validation = PASS
exact count validation        = PASS
anti-drift mutation tests     = PASS
contract-only scope audit     = PASS
deterministic output commit   = PASS
```

A temporary validator diagnostic exposed one GS03-only JavaScript syntax issue (`await` in a formal parameter default). It was corrected by loading the committed contract inside the async function body. No runtime authority was changed.

Authoritative outputs:

```text
data/curriculum/golden/G5AU08_GOLDEN_V1.contract.json
docs/curriculum/output/GS03_G5AU08_GOLDEN_CONTRACT_SNAPSHOT.json
```

## Claim and PR parity

```text
Actual Evidence Level  = E1_DATA_STRUCTURE_READY
Maximum Claim          = E1_DATA_STRUCTURE_READY
Visible Output Changed = false
Human Review Type      = none
Human Review Ready     = false
Runtime Integrated     = false
Production Admitted    = false
```

This synchronization commit ensures exact-head CI reads the final E1 Claim, final PR body, frozen contract, PASS marker and closeout readback from the same pull-request event.

## Program state

```text
PROGRAM_ID      = G5AU08_GOLDEN_SAMPLE_V1
TASK_BUDGET     = 6
LAST_COMPLETED  = GS03_G5AU08_GoldenContractFreeze
COMPLETED_COUNT = 3
REMAINING_COUNT = 3
NEXT_ALLOWED    = GS04_G5AU08_SharedRuntimeAndBatchAdapter
PROGRAM_LOCK    = ACTIVE
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G5AU08_GLOBAL_18_FAMILY_CANDIDATE_CORPUS_READY
GOAL_DISTANCE_AFTER  = D2_G5AU08_GOLDEN_V1_CONTRACT_FROZEN
DISTANCE_REDUCED     = Schema, binding, generator, validator and renderer authority are now a versioned fail-closed snapshot consumable by GS04.
REMAINING_BLOCKERS   = [exact-head CI, merge]
NEXT_SHORTEST_STEP   = GS04_G5AU08_SharedRuntimeAndBatchAdapter
```

## Continuation

```text
AUTO_CONTINUE_DECISION = CONTINUE
STOP_REASON = NONE
ACTION = Merge GS03 after exact-head gates pass, then immediately start GS04.
```

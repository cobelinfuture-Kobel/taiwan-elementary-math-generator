# G4B-U04 R2E — Controlled SDG Template Variants and Context Mode

```text
TASK = G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
BASE_DESIGN = G4B_U04_R2_SemanticDedupLayoutAndSDGDesignLock
```

## Scope

R2E adds a deterministic controlled-context layer after the existing canonical generator and blocking validator have produced a mathematically accepted question.

```text
existing canonical question
→ validator-backed Class C / D output
→ R2E allowlisted context resolver
→ R2E replay validator
→ worksheet metadata
→ Classic / Pixel / query-state surfaces
```

R2E does not add or modify KnowledgePoints, PatternGroups, PatternSpecs, formulas, answer models, renderer profiles or the S72/R2C base promotion lifecycle.

## Public context modes

```text
mixed
 daily_life
sdg
```

The default is `mixed`.

- `daily_life` preserves the existing controlled Class D prompt.
- `sdg` applies an allowlisted fictional variant to every eligible Class D question.
- `mixed` deterministically targets approximately two-thirds daily-life and one-third SDG among eligible questions. Very small worksheets do not force an SDG item.
- Class C, payment-ceiling and source-backed discount questions remain unchanged and are reported as `not_applicable` when no approved SDG mapping exists.

## Eligible PatternSpecs

```text
ps_g4b_u04_floor_complete_groups
ps_g4b_u04_ceiling_minimum_required
ps_g4b_u04_round_then_add
ps_g4b_u04_round_then_subtract
ps_g4b_u04_round_then_multiply
ps_g4b_u04_round_then_divide
```

No generic context fallback exists.

## Allowlisted SDG goals

```text
6  clean water and water conservation
7  renewable energy and electricity saving
11 sustainable transport and community facilities
12 recycling, reuse and responsible packaging
13 tree planting and emissions-reduction activities
15 habitat and forest restoration activities
```

Every student-facing quantity is fictional exercise data. Current statistics, political persuasion, moral grading, fear-based language and free-form AI generation are forbidden.

## Mathematical authority preservation

For an SDG variant, R2E may replace only the controlled semantic prompt, unit-facing answer text, context object and template-role presentation.

The replay validator requires the following to remain identical to the deterministic Class D base question:

```text
input
derived
finalAnswer
answerModelShape
formalMappingId
sourceMappingCandidateId
patternGroupId
knowledgePointId
```

The validator also deterministically re-renders the selected allowlisted variant and rejects unknown variants, render drift, unsafe claims or any mathematical mutation.

## Canonical integration

The public question router delegates G4B-U04 to the R2E canonical wrapper. The wrapper:

1. normalizes `contextMode`;
2. calls the existing canonical resolver and generator;
3. applies controlled context only after base generation succeeds;
4. recalculates prompt signatures after context rendering;
5. validates every resulting canonical question;
6. rejects duplicate rendered prompts;
7. reports deterministic context allocation.

Generic fallback and free-form AI remain false in canonical route metadata.

## Worksheet integration

The browser worksheet chain is:

```text
existing S76J worksheet chain
→ R2D layout resolution and readback
→ R2E context metadata overlay
→ preview / print
```

R2E writes:

```text
worksheetDocument.publicControls.contextMode
worksheetDocument.contextAllocation
worksheetDocument.metadata.contextMode
worksheetDocument.metadata.contextAllocation
worksheetDocument.validationSummary.contextValidatorVersion
worksheetDocument.batchA.contextMode
worksheetDocument.g4bU04Summary.contextMode
worksheetDocument.provenance.contextContractVersion
worksheetDocument.configSnapshot.contextMode
worksheetDocument.summary.dailyLifeContextCount
worksheetDocument.summary.sdgContextCount
worksheetDocument.summary.contextNotApplicableCount
```

Non-G4B-U04 worksheet routes are returned unchanged.

## Public UI and query state

Classic and Pixel expose the same three context modes. Both controls synchronize through the existing context control and stale-output invalidation paths.

G4B-U04 query state supports:

```text
contextMode=mixed
contextMode=daily_life
contextMode=sdg
```

Unsupported values normalize to `mixed`. G5-only `depthMode` remains absent from G4B-U04 output.

## Focused acceptance

The R2E focused suites require:

```text
13 KnowledgePoints unchanged
13 PatternGroups unchanged
19 PatternSpecs unchanged
S72/R2C base lifecycle unchanged
all six SDG goals covered
only six approved PatternSpecs eligible
daily_life preserves base prompts
sdg covers every eligible question
mixed allocation deterministic
small mixed worksheets do not force SDG
payment and discount prompts remain source-faithful
Class C remains non-SDG
math mutation blocked
unknown variant blocked
unsafe claims blocked
Classic query round-trip
Pixel canonical worksheet path
R2E → R2D → S76J scaffold delegation
```

## Pending final-head gates

```text
Node Test
S42 Branch Test
Math CI Readback
S96D focused + full-suite enforcement
S75 G4B-U04 HTML/PDF smoke
R2D six-scenario HTML/PDF smoke
R2E controlled-context HTML/PDF smoke or R2F full recloseout gate
```

## Fixed boundaries

```text
KnowledgePoint count changed = false
PatternGroup count changed = false
PatternSpec count changed = false
formula changed = false
answer model changed = false
renderer profile changed = false
S72/R2C promotion authority changed = false
generic context fallback allowed = false
free-form AI allowed = false
current real-world statistics allowed = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2D_CLOSED_NEXT_R2E

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2E_IMPLEMENTED_PENDING_CI

DISTANCE_REDUCED =
Connected the approved controlled SDG context contract to canonical generation, deterministic replay validation, worksheet metadata, Classic and Pixel controls, and query-state round-trip without changing curriculum or mathematical authority.

REMAINING_BLOCKERS = [
  "R2E final-head CI not completed",
  "R2E HTML/PDF context readback not completed",
  "R2E implementation PR not merged",
  "R2F production recloseout not completed"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2E_CIHTMLPDFAndCloseout

STOP_REASON = NONE
```

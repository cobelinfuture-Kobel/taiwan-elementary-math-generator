# G4B-U04 R2E — Controlled SDG Template Variants and Context Mode

```text
TASK = G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
IMPLEMENTATION_PR = 213
MERGE_SHA = d35ab3b814d09aa6ecb78232f18a538a26cdd4d1
ACCEPTED_RUNTIME_HEAD = 8571ea4cc1003abdf09e0d48d25c840c85e20e3b
FINAL_IMPLEMENTATION_HEAD = a5b87511ab02481ab1a5f4078d3a4d2f0057b60f
```

## 1. Scope

R2E adds a deterministic controlled-context layer after the existing canonical generator and blocking validator have produced a mathematically accepted question.

```text
existing canonical question
→ validator-backed Class C / D output
→ R2E allowlisted context resolver
→ deterministic replay validator
→ prompt-signature recalculation
→ worksheet metadata
→ Classic / Pixel / query-state surfaces
```

R2E does not add or modify KnowledgePoints, PatternGroups, PatternSpecs, formulas, answer models, renderer profiles or the S72/R2C base promotion lifecycle.

## 2. Public context modes

```text
contextMode = mixed | daily_life | sdg
default = mixed
```

- `daily_life` preserves the existing controlled Class D prompt.
- `sdg` applies an allowlisted fictional variant to every eligible Class D question.
- `mixed` deterministically uses approximately two daily-life questions for each SDG question among eligible items.
- Very small mixed worksheets do not force an SDG item.
- Class C, payment-ceiling and source-backed discount questions remain unchanged when no approved mapping exists.

## 3. Eligible PatternSpecs

```text
ps_g4b_u04_floor_complete_groups
ps_g4b_u04_ceiling_minimum_required
ps_g4b_u04_round_then_add
ps_g4b_u04_round_then_subtract
ps_g4b_u04_round_then_multiply
ps_g4b_u04_round_then_divide
```

No generic context fallback exists.

## 4. Allowlisted SDG goals

```text
6  clean water and water conservation
7  renewable energy and electricity saving
11 sustainable transport and community facilities
12 recycling, reuse and responsible packaging
13 tree planting and emissions-reduction activities
15 habitat and forest restoration
```

All quantities are fictional exercise data. Current real-world statistics, political persuasion, moral grading, fear-based language and free-form AI generation are forbidden.

## 5. Mathematical authority preservation

The controlled-context renderer may change only the semantic prompt, display unit, context object and template-role presentation.

The replay validator requires these fields to remain identical to the deterministic base question:

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

It also deterministically re-renders the selected allowlisted variant and blocks unknown variants, render drift, unsafe claims or mathematical mutation.

## 6. Canonical and worksheet integration

The public question router delegates G4B-U04 to the R2E canonical wrapper. The wrapper:

1. normalizes `contextMode`;
2. calls the existing canonical resolver and generator;
3. applies controlled context only after base generation succeeds;
4. recalculates prompt signatures after context rendering;
5. validates every resulting canonical question;
6. rejects duplicate rendered prompts;
7. reports deterministic context allocation.

The worksheet chain is:

```text
existing S76J worksheet chain
→ R2D layout resolution and readback
→ R2E context metadata overlay
→ preview / print
```

R2E records context mode, allocation, validator version, source task IDs, safety provenance and daily-life / SDG / not-applicable counts in the worksheet document.

## 7. Public UI and compatibility

Classic, Pixel and query-state expose the same three modes. Explicit `daily_life` and `sdg` values round-trip through the browser plan. Unsupported values normalize to `mixed`.

The default `mixed` mode is not redundantly serialized, preserving the R2D/S74 legacy URL and public-control readback. G5-only `depthMode` remains absent from G4B-U04 output.

R2D layout resolution remains authoritative and answer-key layout remains profile-controlled.

## 8. Acceptance evidence

```text
Node Test                         PASS
S42 Branch Test                   PASS
Math CI Readback                  PASS
S96D focused + full-suite         PASS
S75 68-question G4B-U04 HTML/PDF  PASS
R2D six-scenario HTML/PDF         PASS
DOM containment                   PASS
PDF nonblank-page checks          PASS
A4 text bounding-box checks       PASS
PR #213                           MERGED
```

## 9. Authority invariants

```text
KnowledgePoints = 13 unchanged
PatternGroups   = 13 unchanged
PatternSpecs    = 19 unchanged
formulas        = unchanged
answer models   = unchanged
renderer profiles = unchanged
S72/R2C promotion authority = unchanged
generic context fallback = forbidden
free-form AI = forbidden
current real-world statistics = forbidden
```

## 10. Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2D_CLOSED_NEXT_R2E

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2E_CLOSED_NEXT_R2F

DISTANCE_REDUCED =
Controlled context generation, deterministic replay validation, browser-plan
propagation, Classic/Pixel/query-state controls, worksheet metadata and existing
HTML/PDF regressions are implemented, accepted, merged and formally closed.

REMAINING_BLOCKERS = [
  "R2F production stress and D0 recloseout"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2F_ProductionStressAndD0Recloseout

STOP_REASON = NONE
```

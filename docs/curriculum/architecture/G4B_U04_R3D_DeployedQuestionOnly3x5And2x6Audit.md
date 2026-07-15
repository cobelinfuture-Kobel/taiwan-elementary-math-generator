# G4B_U04_R3D_DeployedQuestionOnly3x5And2x6Audit

## Status

`PASS_ACCEPTED_AND_CLOSED`

## Final authority

- audit implementation PR: `#224`;
- audit merge SHA: `712c513c1dba2299c0ad8adba805991e025e37ba`;
- deployed production SHA: `712c513c1dba2299c0ad8adba805991e025e37ba`;
- deployed authority commit: `1893c9a0549365a6cee5fb3f75d3be1084cc17e3`;
- deployed workflow run: `29424893452`;
- authority path: `docs/ci/latest-g4b-u04-r3d-deployed-approved-layouts.json`;
- authority status: `PASS`;
- production use: `allowed_deployed_ui_print`.

## Scope

This milestone verifies the merged G4B-U04 R3C production layout through the actual deployed Classic UI and print target.

No production runtime, curriculum authority, formula, answer model, generator, validator, context mode, or renderer behavior was changed by R3D.

## Deployed scenarios

| Scenario | Mode | Requested | Resolved | Questions | Answers | Result |
|---|---|---:|---:|---:|---:|---|
| auto-safe-3x5 | `auto_safe` | 4×10 | 3×5 | 15 | 0 | PASS |
| custom-2x6 | `custom_with_caps` | 2×6 | 2×6 | 12 | 0 | PASS |

Both scenarios use the existing combined inverse reasoning selection:

- `kp_g4b_u04_inverse_rounding_unknown_digit` / `pg_g4b_u04_inverse_digit_set`;
- `kp_g4b_u04_inverse_rounding_possible_original` / `pg_g4b_u04_inverse_original_values`.

Each finite pool has 12 unique prompts. The combined validator-backed capacity is 24, which covers the 15-question 3×5 scenario while keeping the `inverseLong` profile authoritative.

## Accepted deployed evidence

For both scenarios:

- source, mixed same-unit selection, question mode and layout mode replayed through public controls;
- exact two-KnowledgePoint and two-PatternGroup query authority passed;
- requested and resolved layout metadata matched;
- question pages contained only question number and question text;
- response prompt count was zero;
- answer card and answer page counts were zero;
- DOM overflow count was zero;
- inter-card overlap count was zero;
- preview layout readback was truthful;
- iframe print target was invoked;
- console error count was zero;
- page error count was zero;
- generic fallback and free-form AI remained false.

## Main CI

The merged audit passed main CI with 1,511 tests / 1,511 pass / 0 fail and a clean working tree.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U04_R3C_MERGED_DEPLOYED_CONTRACT_UNVERIFIED
GOAL_DISTANCE_AFTER  = D0_G4B_U04_R3_QUESTION_ONLY_APPROVED_LAYOUTS_CLOSED
DISTANCE_REDUCED     = deployed Classic UI, query replay, preview, layout containment and print authority completed
REMAINING_BLOCKERS   = NONE
NEXT_SHORTEST_STEP   = NONE_WITHIN_G4B_U04_R3_APPROVED_SCOPE
```

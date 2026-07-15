# G4B_U04_R3D_DeployedQuestionOnly3x5And2x6Audit

## Status

`IMPLEMENTED_PENDING_CI_AND_DEPLOYED_AUDIT`

## Scope

This milestone verifies the already-merged G4B-U04 R3C production layout through the actual deployed Classic UI and print target.

No production runtime, curriculum authority, formula, answer model, generator, validator, context mode, or renderer behavior is changed by R3D.

## Required deployed scenarios

| Scenario | Mode | Requested | Required resolved | Questions | Answers |
|---|---|---:|---:|---:|---:|
| auto-safe-3x5 | `auto_safe` | 4×10 | 3×5 | 15 | 0 |
| custom-2x6 | `custom_with_caps` | 2×6 | 2×6 | 12 | 0 |

Both scenarios use the inverse possible-original-values KnowledgePoint and PatternGroup so the `inverseLong` profile is authoritative.

## Blocking acceptance

- source, selection mode, question mode and layout mode replay through the public controls;
- exact requested and resolved layout metadata;
- question pages contain only the question number and question text;
- response prompt count is zero;
- answer cards and answer pages are zero;
- DOM overflow count is zero;
- inter-card overlap count is zero;
- preview readback is truthful;
- iframe print target is invoked;
- console and page errors are zero;
- generic fallback and free-form AI remain false.

## Authority

The workflow writes structured PASS or FAIL evidence to:

`docs/ci/latest-g4b-u04-r3d-deployed-approved-layouts.json`

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U04_R3C_MERGED_DEPLOYED_CONTRACT_UNVERIFIED
GOAL_DISTANCE_AFTER  = D0 only after deployed R3D status PASS and final closeout
```

## Next shortest step

`G4B_U04_R3D_CIAndDeployedAuditThenR3Closeout`

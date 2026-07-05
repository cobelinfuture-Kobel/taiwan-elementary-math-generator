# S43G4D Completed Units Unfinished KnowledgePoint Audit

## Scope

Read-only audit for currently closed units:

- G3A-U02
- G3A-U03
- G3A-U06

This audit checks repo-known registry/runtime/selector state only. It does not re-open source PDFs or redefine curriculum scope.

## Summary

```text
Completed unit-level closeout units = 3
Known selector-visible KP count = 10
G3A-U02 = 4 KP
G3A-U03 = 4 KP
G3A-U06 = 2 KP
Repo-known unfinished KP inside these three units = 0
Formal registry materialization debt = 8 overlay-only or stale rows
```

## Unit audit table

| Unit | Repo-known KP total | Selector-visible KP | Runtime PatternSpec | Worksheet/AnswerKey/HTML QA | Unfinished repo-known KP | Main remaining debt |
|---|---:|---:|---:|---|---:|---|
| G3A-U02 | 4 | 4 | 4 | PASS | 0 | formal registry stale for 2 promoted rows |
| G3A-U03 | 4 | 4 | 4 | PASS | 0 | overlay-only, not materialized in master registry |
| G3A-U06 | 2 | 2 | 2 | PASS | 0 | overlay-only, not materialized in master registry |

## G3A-U02 detail

| KP | Selector | Runtime | QA | Status | Debt |
|---|---|---|---|---|---|
| kp_g3a_u02_add_multi_carry | visible | supported | PASS | DONE | none |
| kp_g3a_u02_sub_multi_borrow | visible | supported | PASS | DONE | none |
| kp_g3a_u02_estimate_nearest_thousand | visible via extension | supported | PASS | DONE_RUNTIME | master registry row still says D/not_selectable |
| kp_g3a_u02_word_problem_estimation_add_sub | visible via extension | supported via source-pattern-extension | PASS | DONE_RUNTIME | master registry row still says D/not_selectable |

G3A-U02 has no additional repo-known unfinished KP beyond these four.

## G3A-U03 detail

| KP | Selector | Runtime | QA | Status | Debt |
|---|---|---|---|---|---|
| kp_g3a_u03_2digit_by_1digit_carry | visible via extension | supported | PASS | DONE_RUNTIME | not materialized in master registry |
| kp_g3a_u03_10_multiple_by_1digit | visible via extension | supported | PASS | DONE_RUNTIME | not materialized in master registry |
| kp_g3a_u03_3digit_by_1digit | visible via extension | supported | PASS | DONE_RUNTIME | not materialized in master registry |
| kp_g3a_u03_consecutive_multiplication_two_step | visible via extension | supported | PASS | DONE_RUNTIME | not materialized in master registry |

G3A-U03 has no additional repo-known unfinished KP beyond these four.

## G3A-U06 detail

| KP | Selector | Runtime | QA | Status | Debt |
|---|---|---|---|---|---|
| kp_g3a_u06_exact_division_check | visible via extension | supported | PASS | DONE_RUNTIME | not materialized in master registry |
| kp_g3a_u06_divisibility_exact_check | visible via extension | supported | PASS | DONE_RUNTIME | not materialized in master registry |

G3A-U06 has no additional repo-known unfinished KP beyond these two.

## Repair policy for deficiencies

Do not wait for all Batch A units if the deficiency affects one of these conditions:

1. The unit-level closeout claim is false or overstates support.
2. A selector-visible KP cannot generate worksheet, answer key, or HTML.
3. A validator/generator defect can produce invalid questions or answers.
4. The defect blocks the next unit from using the same shared mechanism.

Defer until after all Batch A units only if the deficiency is structural cleanup and does not break current usage:

1. Master registry materialization for already passing overlay rows.
2. Refactoring selector-extension into generated projection.
3. Cross-unit mixed mode.
4. Batch A productionUse gate.

## Recommended decision

For these three completed units, there is no missing repo-known KP that must be filled before continuing to the next unit.

The next shortest effective step remains:

```text
S43G5_G3B_U01_Phase1SelectionScan
```

Parallel or later cleanup task:

```text
S43H1_FormalRegistryMaterializationForClosedUnits
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_CLOSED_UNITS_HAVE_10_KP_BUT_UNFINISHED_KP_STATUS_UNVERIFIED
GOAL_DISTANCE_AFTER  = D1_CLOSED_UNITS_REPO_KNOWN_UNFINISHED_KP_AUDITED
DISTANCE_REDUCED     = confirmed no repo-known unfinished KP inside G3A-U02/G3A-U03/G3A-U06; separated runtime completion from formal registry debt
REMAINING_BLOCKERS   = [
  "formal registry projection still uses selector extension overlay",
  "G3A-U02 has two stale master registry rows for already-promoted KP",
  "G3A-U03 and G3A-U06 are overlay-only, not materialized in master registry",
  "cross-unit mixed KnowledgePoint mode remains deferred",
  "Batch A productionUse still not allowed"
]
NEXT_SHORTEST_STEP   = S43G5_G3B_U01_Phase1SelectionScan
```

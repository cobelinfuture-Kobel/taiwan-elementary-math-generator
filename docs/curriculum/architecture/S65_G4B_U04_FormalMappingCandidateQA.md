# S65 — G4B-U04 FormalMapping Candidate QA

```text
TASK = S65_G4B_U04_FormalMappingCandidateQA
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
MAPPINGS_REVIEWED = 17
MAPPINGS_ACCEPTED = 17
MAPPINGS_REJECTED = 0
QA_CORRECTIONS = 3
```

## 1. Scope

S65 validates the 17 S64 FormalMapping candidates using formula boundary vectors, source examples, inverse-enumeration checks and mutation cases.

```text
S64 candidate mapping
→ formula and semantic review
→ boundary-vector execution
→ mutation rejection
→ corrected candidate contract
```

This task does not materialize FormalMapping, create PatternSpecs, implement a generator or validator, expose a selector, or authorize production use.

## 2. QA result

```text
mapping candidates reviewed = 17
accepted after correction = 17
rejected = 0
formula families reviewed = 8
positive vectors = 36
mutation cases = 20
```

The 12 KnowledgePoint, 12 PatternGroup-candidate and 17 mapping-candidate counts remain unchanged.

## 3. Corrections applied

### 3.1 Unique method identification guard

The original mapping correctly intended a unique `methodChoiceAnswer`, but the generation condition was underspecified.

```text
down(v,u) = floor(v/u) × u
up(v,u) = ceil(v/u) × u
halfUp(v,u) = floor((v+u/2)/u) × u
```

When `v` is not a multiple of `u`, half-up equals either down or up. The shared result is ambiguous, while the opposite result identifies exactly one method. Exact multiples are also ambiguous because all three methods coincide.

The effective generation guard is:

```text
input_not_multiple_of_unit
shown_result_matches_exactly_one_method
shown_result_differs_from_half_up_output
ambiguous_shared_result_forbidden
```

Examples:

```text
753 to hundreds, shown 700 → unique: unconditional down
749 to hundreds, shown 800 → unique: unconditional up
753 to hundreds, shown 800 → forbidden: up and half-up both match
700 to hundreds, shown 700 → forbidden: all three methods match
```

### 3.2 Inverse interval clamp

The integer half-up preimage is globally clamped:

```text
intersect([y-u/2,y+u/2-1], [0,maxInput])
```

For a result of zero rounded to tens, valid sources are `0..4`, not `-5..4`.

### 3.3 Payment denomination source boundary

Source-backed payment mappings are restricted to:

```text
paymentDenominations = [100, 1000]
```

Other denominations require new source evidence or an explicitly approved extension.

## 4. Accepted formula contracts

```text
unconditional down  = floor(v/u) × u
unconditional up    = ceil(v/u) × u
round half up       = floor((v+u/2)/u) × u
maximum full groups = floor(total/groupSize)
minimum required    = ceil(total/capacity)
minimum payment     = ceil(price/denomination) × denomination
banknote count      = ceil(price/denomination)
inverse interval    = intersect([y-u/2,y+u/2-1], [0,maxInput])
```

## 5. Accepted boundary vectors

The executable QA covers 36 vectors, including:

```text
753 down to hundreds = 700
753 up to hundreds = 800
647 half-up to tens = 650
647 half-up to hundreds = 600
2768 half-up to hundreds = 2800
2768 half-up to thousands = 3000
26743041 half-up to ten-thousands = 26740000

8427 items, 10 per full box = 842 full boxes
8427 items, 10 per box, all items packed = 843 boxes
12999 dollars, save 1000 per month = 13 months
7699 dollars using 1000-dollar notes = 8000 dollars / 8 notes
7699 dollars using 100-dollar notes = 7700 dollars / 77 notes

57389 rounded to ten-thousands, then ×6 = 360000
695400 rounded to ten-thousands, then ÷5 = 140000
```

Inverse checks:

```text
30000 to ten-thousands → 25000..34999
47000 to thousands → 46500..47499
0 to tens → 0..4

2□318 → 30000 to ten-thousands → □ = 5,6,7,8,9
47□61 → 47000 to thousands → □ = 0,1,2,3,4
```

For `4,□□99` rounding to `45000` at the thousands place:

```text
44599, 44699, 44799, 44899, 44999,
45099, 45199, 45299, 45399, 45499
```

## 6. Mutation review

Twenty executable defect classes are rejected, covering:

```text
wrong down/up method
output direction violation
half-up threshold 649/650 error
floor/ceiling remainder inversion
insufficient or non-minimal payment
one-fewer banknote accepted
unsupported denomination
ambiguous method-choice item
negative inverse-preimage leakage
inverse upper-endpoint off by one
missing or extra inverse digits
visible-digit mismatch
noninteger estimated division
```

## 7. Effective artifacts

```text
data/curriculum/mapping/g4b_u04_formal_mapping_candidates.json
data/curriculum/mapping/g4b_u04_formal_mapping_candidate_qa.json
tests/curriculum/s65-g4b-u04-formal-mapping-candidate-qa.test.js
```

Future PatternSpec work must consume the QA-corrected S64 artifact and the S65 overlay together.

## 8. CI and merge evidence

```text
implementation PR = #97
implementation merge commit = 1a47d92c868923c797220f7ad72e77a8572053a2
main CI run = 29191041071
main CI readback commit = 16e066a8f17e81afdcaa43c3f198eace141d9c5e
tests = 999
pass = 999
fail = 0
working tree = clean
```

## 9. Acceptance gate

```text
17 / 17 candidate mappings reviewed
17 / 17 accepted after correction
3 / 3 blocking design findings corrected
36 / 36 positive vectors accepted
20 / 20 mutation classes rejected
payment denomination boundary locked
inverse interval globally clamped
unique method-choice generation guard locked
FormalMapping materialized = false
PatternSpecs created = false
generator implemented = false
validator implemented = false
productionUse = forbidden
```

## 10. Distance and next step

```text
GOAL_DISTANCE_BEFORE = D3_G4B_U04_17_FORMAL_MAPPING_CANDIDATES_DESIGNED
GOAL_DISTANCE_AFTER  = D2_G4B_U04_FORMAL_MAPPING_CANDIDATES_QA_LOCKED
DISTANCE_REDUCED     = Verified all 17 candidate mappings, corrected three blocking contract defects, and locked executable formula, boundary, inverse and mutation behavior for PatternSpec design.
REMAINING_BLOCKERS   = [
  "PatternSpec contract not designed",
  "answer-model schemas not materialized",
  "generator and validator not implemented"
]
NEXT_SHORTEST_STEP   = S66_G4B_U04_PatternSpecContractDesign
STOP_REASON          = NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```

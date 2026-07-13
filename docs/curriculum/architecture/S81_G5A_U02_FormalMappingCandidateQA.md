# S81 — G5A-U02 FormalMapping Candidate QA

```text
TASK = S81_G5A_U02_FormalMappingCandidateQA
STATUS = PASS_CI_SYNCED_AND_MERGED
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## 1. Scope

S81 reviews every S80 FormalMapping candidate against the two manually reviewed source packets, S79 canonical KnowledgePoint boundaries, integer number-theory invariants, answer-shape closure and mutation resistance.

```text
S78 manual visual extraction
→ S79 KnowledgePoint/source-identity QA
→ S80 FormalMapping candidate design
→ S81 FormalMapping candidate QA
```

S81 is a QA overlay. It does not materialize FormalMappings or PatternSpecs and does not implement a generator, validator runtime, selector, worksheet, renderer or production route.

## 2. QA result

```text
mapping candidates reviewed             = 22
accepted after correction               = 22
rejected                                = 0
blocking corrections                    = 5
formula families reviewed               = 13
positive vectors                        = 41
mutation requirements                   = 30
```

All 22 S80 candidate identities remain valid. Five contracts were too broad or underspecified for safe PatternSpec consumption and are corrected by the S81 overlay.

## 3. Blocking corrections

### 3.1 Factor relation biconditional

S80 could be read as:

```text
"a and b are factors of n exactly when a*b=n"
```

That converse is false. For example, 2 and 3 are both factors of 12, but `2×3≠12`.

The effective rule is now:

```text
For positive integers n and d:
d is a factor of n
⇔ there exists a positive integer q such that d×q=n
⇔ n÷d has zero remainder and q=n÷d.
```

A displayed equality `a×b=n` proves that `a` and `b` are complementary factors. It does not imply that every arbitrary pair of factors multiplies to `n`.

### 3.2 Factor-pair stopping rule

Waiting only until a factor pair repeats is unsafe for nonsquare targets because the pair search crosses without an equal middle pair.

The effective pair enumeration is:

```text
factorPairs(n)
= all (a,n/a) such that
  1 ≤ a ≤ floor(sqrt(n))
  and n mod a = 0
```

This guarantees:

- square-root pairs appear once;
- nonsquare searches terminate when the first factor would exceed its complement;
- no symmetric duplicate is emitted;
- all complementary pairs are retained.

### 3.3 Target parity versus factor-count parity

Two different theorems are now separated:

```text
target n is even ⇔ 2 is in factorSet(n)
factorSet(n).length is odd ⇔ n is a perfect square
```

The number's odd/even status may not be inferred from whether the factor count is odd/even. Likewise, square status may not be inferred from the target's parity.

### 3.4 Remainder-transfer witness

The effective contract is closed as:

```text
D > d ≥ 2
D mod d = 0
q ≥ 0
0 ≤ r < D
N = qD + r

therefore:
N mod d = r mod d
and 0 ≤ N mod d < d
```

The source example is reproduced by `N=93`, `D=24`, `d=8`, `q=3`, `r=21`, giving remainder `5` when divided by 8.

### 3.5 Four-digit source predicate binding

The source-backed password question must preserve exact digit positions:

```text
x1 is a common factor of 22 and 33,
and also a common factor of 45 and 60.

x3 is a common factor of 6 and 8,
and x3 differs from x1.

70 is a common multiple of positive digits x2 and x4:
x2 divides 70 and x4 divides 70.
This does not mean lcm(x2,x4)=70.

The four-digit number is divisible by 3 and 5.
All four digits are distinct.
```

The closed predicate set has exactly one solution:

```text
1725
```

`lcm(7,5)=35`, while 70 is still a common multiple of 7 and 5. This distinction is mandatory.

## 4. Effective consumption rule

S82 and later consumers must use:

```text
S80 base candidate design
+ S81 QA overlay with higher precedence
```

The five S81 corrections override the corresponding S80 wording. Consumers may not materialize the uncorrected base contracts directly.

Machine-readable QA authority:

```text
data/curriculum/mapping/g5a_u02_formal_mapping_candidate_qa.json
```

## 5. Executable QA

The test suite verifies:

- exact 22/22 accepted mapping coverage;
- all five blocking corrections;
- factor sets and factor pairs for source and boundary examples;
- complete common-factor and GCF calculations;
- range-constrained equal partitions;
- source remainder transfer;
- rectangle square-side and square-area results;
- four closed problem-type labels;
- the unique source-backed tuple `1725`;
- 30 mutation defect classes.

Key positive examples include:

```text
factorSet(56)          = [1,2,4,7,8,14,28,56]
factorPairs(56)        = [(1,56),(2,28),(4,14),(7,8)]
commonFactors(72,90)   = [1,2,3,6,9,18]
gcf(27,18)             = 9
possible groups 60,
within 10..16          = [10,12,15]
24-person remainder
transfer 21 to divisor 8 = 5
square sides 36×28     = [1,2,4]
square areas 36×28     = [1,4,16]
password                = 1725
```

## 6. Source identity boundary

The candidate pipeline remains resolved:

| sourceId | canonical title | role |
|---|---|---|
| `g5a_u02_5a02a` | 因數 | `factor_core` |
| `g5a_u02_5a02a1` | 公因數 | `common_factor_gcf_extension` |

The second packet's public/source metadata still must be corrected to display `公因數` and preserve `/5a03b/` before public catalog promotion. S81 does not mutate source metadata.

## 7. Scope boundary

```text
source metadata mutation       = false
FormalMapping materialization  = false
PatternSpec creation           = false
generator implementation       = false
validator implementation       = false
public selector                = disabled
productionUse                  = forbidden
```

## 8. CI and merge evidence

```text
implementation PR              = #130
implementation merge           = 26429dccc3d7e42aca48139cd04c56e4e18caf6e
initial PR Math CI run          = 29226607528
final PR Math CI run            = 29226740061
fresh-main Math CI run          = 29226909138
fresh-main readback             = 623ecb75b662330a30def95c3ee1607d4350cdfb
tests                           = 1140
pass                            = 1140
fail                            = 0
working tree                    = clean
```

The initial PR CI failure was limited to a QA assertion wording mismatch: the executable test searched for the phrase `perfect square`, while the JSON expressed the same rule only as `isPerfectSquare(n)`. The overlay wording was normalized to state both forms. No formula, candidate identity, answer model or runtime behavior changed. The final PR CI and every Node, S42, G4B-U01, G5A-U08 and G4B-U04 smoke workflow then passed.

## 9. Distance and handoff

```text
GOAL_DISTANCE_BEFORE = D2_G5A_U02_18_PATTERN_GROUP_AND_22_FORMAL_MAPPING_CANDIDATES_DESIGNED
GOAL_DISTANCE_AFTER  = D2_G5A_U02_22_FORMAL_MAPPING_CANDIDATES_QA_LOCKED
DISTANCE_REDUCED     = Reviewed all mapping contracts and removed five correctness/ambiguity blockers before PatternSpec design.
REMAINING_BLOCKERS   = [
  "S82 must consume S80 plus the higher-precedence S81 overlay",
  "5a02a1 public/source metadata still requires correction",
  "PatternSpec contracts and runtime support are absent"
]
NEXT_SHORTEST_STEP   = S82_G5A_U02_PatternSpecContractDesign
STOP_REASON          = NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```

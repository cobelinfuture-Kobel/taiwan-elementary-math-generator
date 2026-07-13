# S82 — G5A-U02 PatternSpec Contract Design

```text
TASK = S82_G5A_U02_PatternSpecContractDesign
STATUS = CONTRACT_DESIGN_COMPLETE_PENDING_QA
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## Scope

S82 converts the 22 S81-accepted FormalMapping candidates into deterministic PatternSpec contract candidates.

```text
S80 FormalMapping candidate base
+ S81 higher-precedence QA overlay
→ S82 PatternSpec contract design
```

S82 does not materialize FormalMappings, PatternGroups or PatternSpecs. It does not implement generators, runtime validators, public selectors, worksheet routing or production use.

## Authority precedence

S81 overrides S80 for five corrected targets. Direct consumption of the uncorrected S80 wording is forbidden.

| S81 correction | S82 target |
|---|---|
| factor relation biconditional | `ps_g5a_u02_factor_relation_equivalence` |
| factor-pair stopping rule | `ps_g5a_u02_factor_pair_enumeration` |
| target parity vs factor-count parity | `ps_g5a_u02_complete_factor_list_statement_evaluation` |
| remainder witness and range | `ps_g5a_u02_remainder_transfer` |
| four-digit positional predicates | `ps_g5a_u02_multi_constraint_digit_code` |

## Cardinality

```text
KnowledgePoints                 = 18
PatternGroups                   = 18
PatternSpec contracts           = 22
Class C                         = 14
Class D                         = 8
Answer-model schemas            = 16
Controlled Class D templates    = 8
S81 overlay applications        = 5
```

Mode distribution:

```text
concept                = 4
numeric                = 6
representation         = 1
reasoning              = 3
application            = 4
reasoning_application  = 2
geometry_application   = 2
```

The contract is stored as one index plus component artifacts for rules, answer schemas, controlled templates, PatternGroups, Class C and Class D PatternSpecs, and the validator contract. This keeps the 22-contract authority finite and reviewable without changing lifecycle semantics.

## Deterministic rule families

S82 freezes these contract-level rules:

```text
divides(d,n)
factorSet(n)
factorPairs(n)
factorListFromPairs(n)
commonFactorSet(a,b)
greatestCommonFactor(a,b)
missingFactorValues
equalPartitionSolutions
targetParity
factorCountParity
remainderTransfer
rectangleSquareSideLengths
squareTileAreas
problemTypeClassification
digitCodeSolutions
```

### Correct factor relation

```text
d is a factor of n
⇔ ∃ positive q: d×q=n
⇔ n mod d=0
```

A displayed `a×b=n` witnesses a complementary pair. Arbitrary factors are not required to multiply to `n`.

### Correct factor-pair domain

```text
factorPairs(n)
= {(a,n/a) | 1≤a≤floor(sqrt(n)) and n mod a=0}
```

The square-root pair appears once. Nonsquare searches stop at the crossing point without waiting for repetition.

### Separate parity theorems

```text
n is even ⇔ 2∈factorSet(n)
|factorSet(n)| is odd ⇔ n is a perfect square
```

These theorems are not interchangeable.

### Closed remainder transfer

```text
D>d≥2
D mod d=0
q≥0
0≤r<D
N=qD+r

N mod d = r mod d
```

### Source-backed digit-code contract

The current source family binds exact positions:

```text
x1 divides 22, 33, 45 and 60
x3 divides 6 and 8, and x3≠x1
positive x2 and x4 each divide 70
the four-digit number is divisible by 3 and 5
all digits are distinct
```

The unique tuple is:

```text
[1,7,2,5] → 1725
```

`70 is a common multiple` means each relevant digit divides 70. It does not mean their least common multiple equals 70.

## Answer schemas

The 16 answer shapes remain distinct:

```text
relationClassificationAnswer
integerListAnswer
factorPairListAnswer
orderedFactorRelationAnswer
missingValueMapAnswer
selectionSetAnswer
booleanAnswer
integerListWithUnitAnswer
problemTypeLabelAnswer
structuredInferenceAnswer
booleanSetAnswer
remainderAnswer
integerAnswer
lengthListAnswer
areaListAnswer
digitTupleAnswer
```

List answers require complete, unique and ordered values. Geometry answers preserve length versus squared-area units. The password answer preserves digit order and the encoded four-digit value.

## Controlled Class D templates

Every Class D contract is attached to a source-backed controlled template family:

1. all equal-partition segment counts;
2. range-constrained recipient counts;
3. remainder transfer;
4. maximum equal grouping;
5. all equal packaging counts;
6. rectangle-to-square side lengths;
7. square tile areas;
8. source-backed four-digit password.

Free-form AI generation and generic fallback are forbidden.

## Validator contract

Validation is designed as nine blocking stages:

```text
1. identity
2. lifecycle and source mapping
3. integer domain and global boundary
4. formal number-theory rule
5. answer schema
6. controlled semantics and template
7. S81 overlay
8. completeness and uniqueness
9. no-fallback result
```

The contract defines 64 unique blocking codes and four non-blocking layout or metadata warnings. A blocking failure may not return a question or fallback item.

## Source identity boundary

```text
g5a_u02_5a02a  = 因數 / factor_core
g5a_u02_5a02a1 = 公因數 / common_factor_gcf_extension
```

Both packet IDs remain stable. Before public catalog promotion, the second packet metadata must display `公因數` and preserve `/5a03b/`. S82 does not perform that metadata mutation.

## Scope boundary

```text
source metadata mutation       = false
FormalMapping materialization  = false
PatternGroup materialization   = false
PatternSpec materialization    = false
generator implementation       = false
validator implementation       = false
public selector                = disabled
canonical routing              = disabled
productionUse                  = forbidden
```

## Acceptance

S82 is accepted only when:

1. all 22 S81-accepted mappings project one-to-one;
2. all 18 KnowledgePoints and PatternGroups are covered;
3. all five S81 corrections are applied with higher precedence;
4. all 16 answer schemas are deterministic;
5. every Class D contract uses a controlled template;
6. all source evidence and implementation classes match S80;
7. the validator design is blocking and fallback-free;
8. no materialization or runtime behavior is introduced.

## Distance

```text
GOAL_DISTANCE_BEFORE =
D2_G5A_U02_22_FORMAL_MAPPING_CANDIDATES_QA_LOCKED

GOAL_DISTANCE_AFTER =
D2_G5A_U02_22_PATTERNSPEC_CONTRACTS_DESIGNED_PENDING_QA

DISTANCE_REDUCED =
Projected all 22 QA-accepted FormalMapping candidates into deterministic
PatternSpec contracts with 16 answer schemas, 8 controlled Class D template
families and the five mandatory S81 corrections.

REMAINING_BLOCKERS = [
  "PatternSpec contract QA has not executed",
  "5a02a1 public/source metadata correction remains pending",
  "FormalMapping and PatternSpec materialization are absent",
  "Generator and blocking validator runtime are absent"
]

NEXT_SHORTEST_STEP =
S83_G5A_U02_PatternSpecContractQA

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```

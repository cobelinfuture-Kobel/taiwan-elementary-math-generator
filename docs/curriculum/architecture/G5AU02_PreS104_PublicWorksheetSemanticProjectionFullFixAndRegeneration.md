# G5AU02 Pre-S104 Public Worksheet Semantic Projection FullFix and Regeneration

## Authority

This milestone repairs the public worksheet and regenerated artifact boundary after the operator manually reviewed `g5a_u02_01(1).pdf`.

The reviewed PDF contained sixty mathematically correct answers, but it did not consistently expose the S101–S103 semantic representations already admitted by the canonical runtime. It also exposed internal placeholder names, ambiguous statement numbering and incomplete explanatory answer text.

This task is a bounded precondition repair. It does not execute or close S104.

## Locked scope

```text
G5A-U02 public question projection
G5A-U02 public answer-key wording
G5A-U02 semantic HTML renderer
60-question HTML/PDF regeneration
focused and full regression acceptance
```

Frozen:

```text
S104 integrated acceptance
P1/P2 patterns
other units
free-form AI
generic fallback
runtime web search
global layout redesign
```

## Root cause

The uploaded PDF reflected an earlier worksheet serialization path:

- ribbon tasks showed only segment counts rather than count/length pairs;
- rectangle and tile tasks did not visibly preserve structured geometry;
- common-factor and GCF tasks omitted factor-set/intersection witnesses and included stale degenerate operands;
- the source `1725` reference was repeated as if it were the default generated family;
- internal keys such as `p1`, `p4` and `p10` reached learner-facing content;
- numbered statements appeared as `1.2`, `2.6` and similar decimal-like strings;
- divisibility judgments requested an explanation but the answer key returned only `是` or `否`;
- maximum-grouping answers omitted the unit `組`.

S101–S103 canonical generation and blocking validation already closed most mathematical causes. This milestone closes the public projection, answer wording, renderer and regenerated-artifact boundary.

## Public symbol policy

Internal unknown keys remain canonical internal data, but the learner-facing projection uses ordered Traditional Chinese symbols:

```text
甲、乙、丙、丁、戊、己、庚、辛
```

Question prompts, answer text, HTML and PDF must contain no public token matching `p\d+`.

## Statement-numbering policy

Multi-statement reasoning uses:

```text
① ② ③ ④ …
```

A learner-facing string matching a decimal-like numbered statement such as `1.2 是…` is blocking.

## Answer-key policy

### Divisibility judgments

The answer must satisfy the instruction to explain through exact division:

```text
是，66÷1=66，沒有餘數。
否，30÷4=7 餘 2，不能整除。
```

### Complete factor-list unknowns

Answer keys use the same public symbols as the question:

```text
目標數=45；甲=3、乙=15
```

### Statement sets

Answer keys preserve statement identity:

```text
① 是、② 否、③ 否、④ 否
```

### Grouping applications

Maximum equal grouping answers include `組`.

## Integrated semantic renderer

The shared public renderer admits the existing S101 structured models and extends structured HTML presentation to S102, S103 and public unknown symbols:

```text
partition_count_length_pairs
rectangle_square_partition_diagram
square_tile_side_area_chain
parallel_factor_sets_with_intersection
common_factor_set_with_gcf
unique_digit_code_constraints
symbolic_complete_factor_sequence
```

Question pages contain prompts, required representations and blank response roles. Canonical answers remain answer-key-only.

## Regeneration authority

The corrected artifact is deterministic:

```text
questionCount = 60
generationSeed = 104001
canonicalPatternCount = 22
questionPageSize = 6
questionColumns = 2
answerPageSize = 6
answerColumns = 1
```

The deployable browser bundle is rebuilt from canonical source before generation.

Expected generated artifacts:

```text
docs/curriculum/output/pre-s104/G5AU02_PreS104_Regenerated60.html
docs/curriculum/output/pre-s104/G5AU02_PreS104_Regenerated60.pdf
docs/curriculum/output/pre-s104/G5AU02_PreS104_Regenerated60.manifest.json
docs/curriculum/output/pre-s104/G5AU02_PreS104_Regenerated60.audit.json
```

CI artifacts are evidence and are not committed as permanent generated corpus files.

## Blocking acceptance

```text
60 / 60 question records
60 / 60 answer records
22 / 22 canonical patterns represented
S101 paired/geometry markers present
S102 factor-set/intersection markers present
S103 generated-family marker present
source profile default repeat count = 0
source 1725 default repeat count = 0
internal ID leakage count = 0
internal placeholder leakage count = 0
decimal-like statement numbering count = 0
question answer leakage count = 0
DOM cell overflow count = 0
DOM page overflow count = 0
PDF bbox overflow count = 0
blank PDF pages = 0
CJK semantic readback = PASS
complete Node regression = PASS
```

## Fixed boundaries

- PatternSpec, KnowledgePoint, PatternGroup, FormalMapping and source IDs remain stable.
- S101–S103 mathematical generation and blocking validator authority remains canonical.
- The source `1725` item remains reference-only.
- The generated digit-code family remains deterministic and exact-one-solution.
- No P1/P2 repair is included.
- S104 remains unimplemented until this precondition gate passes and is merged.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_PRE_S104_GENERATED_WORKSHEET_BLOCKERS_CONFIRMED
GOAL_DISTANCE_TARGET = D1_G5A_U02_PRE_S104_PUBLIC_SEMANTIC_REGENERATION_ACCEPTED
DISTANCE_REDUCED = stale public worksheet semantics replaced by current canonical S101-S103 representations and corrected answer wording
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S104_P0IntegratedSemanticRendererHTMLPDFAcceptance
```

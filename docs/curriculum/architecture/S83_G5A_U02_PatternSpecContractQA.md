# S83 — G5A-U02 PatternSpec Contract QA

```text
TASK = S83_G5A_U02_PatternSpecContractQA
STATUS = PASS_CI_SYNCED_AND_MERGED
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## Scope

S83 audits the complete S82 contract bundle without materializing or rewriting the S82 base.

```text
S82 PatternSpec contract base
+ S83 higher-precedence QA overlay
→ effective contract for S84 and later consumers
```

Reviewed authority:

```text
PatternSpec contracts = 22
PatternGroups         = 18
Answer schemas        = 16
Controlled templates  = 8
Validator stages      = 9
Blocking codes        = 64
Mutation cases        = 36
```

All 22 contracts are accepted after six blocking QA corrections. No contract is rejected.

## Correction 1 — closed answer schemas

All 16 answer models are closed objects with explicit properties and `additionalProperties = false`.

The factor relation answer now distinguishes positive and negative cases:

```text
isFactor = true
→ quotient is a positive integer
→ candidateDivisor × quotient = target

isFactor = false
→ quotient = null
→ target mod candidateDivisor ≠ 0
```

List, pair, selection, unit, remainder, geometry and digit-tuple answers now have explicit item shapes, completeness, order, uniqueness and unit rules.

## Correction 2 — exact template role binding

Every placeholder in the eight controlled templates has a one-to-one binding to an input, context, derived or fixed value.

The former free `{answerRole}` slot is forbidden. Equal partition is split into two closed variants:

1. list all possible segment counts, answer unit `段`;
2. list all possible per-segment integer quantities, answer unit inherited from the source quantity.

## Correction 3 — application semantics and units

Grouping and packaging wording now means:

```text
all groups have the same count of category A
and all groups have the same count of category B
```

It does not require category A and category B to have equal counts within a group.

Geometry unit conversion is explicit:

```text
公分 → 平方公分
公尺 → 平方公尺
```

The password template is fixed to the source-backed positional predicates; arbitrary rule paraphrases are forbidden.

## Correction 4 — problem-type decision table

`factor`, `multiple`, `common_factor` and `common_multiple` are selected only through four finite, mutually exclusive controlled cases.

If no case or more than one case matches, generation and validation block. Free-form semantic fallback is forbidden.

## Correction 5 — closed statement grammar

Allowed factor statements preserve relation direction:

```text
candidate is a factor of target
target is a multiple of candidate
```

Complete-factor-list reasoning uses only closed statement kinds for membership, multiple relation, symmetric products, target parity and perfect-square status.

Target parity and factor-count parity remain separate theorems. Boolean answers preserve statement order and exact vector length.

## Correction 6 — validator coverage

The effective validator contract contains nine ordered blocking stages. Missing hooks from the S82 stage registry are restored:

```text
validateG5AU02SelectionSet
validateG5AU02BooleanStatement
validateG5AU02CompleteFactorInference
validateG5AU02ParitySeparation
validateG5AU02StatementGrammar
```

Every S81-corrected PatternSpec must also run `validateG5AU02S81Overlay`.

All 64 S82 blocking codes are assigned exactly once. No stage is empty, and no unknown, duplicate or uncovered code is allowed.

## Mutation QA

Thirty-six executable mutation cases cover schema opening, omitted fields, invalid conditional witnesses, incomplete lists and pairs, unbound roles, free answer-role restoration, application semantic conflation, unit drift, password predicate drift, ambiguous classification, unknown statement kinds, parity conflation, missing stages and hooks, and duplicate/missing/unknown blocking codes.

Every mutation must produce at least one blocking QA error.

## Source and lifecycle boundary

The source-backed vectors remain deterministic, including factor pairs, common factors, GCF applications, remainder transfer, geometry areas and the unique password `1725`.

```text
source metadata mutation       = false
FormalMapping materialization  = false
PatternGroup materialization   = false
PatternSpec materialization    = false
generator implementation       = false
validator implementation       = false
public selector                = disabled
canonical routing              = disabled
production use                 = forbidden
```

The `g5a_u02_5a02a1` public metadata correction to `公因數` and `/5a03b/` remains a later promotion prerequisite.

## Merge and CI evidence

```text
implementation PR          = 134
implementation merge       = f96e30d3b5c717d77ecddb81447fdc72b0285004
PR Math CI                 = 29235676645
fresh-main Math CI         = 29235912361
fresh-main readback commit = 4819382d9a83760b1b2fd46039178ea2a12b3919
tests                      = 1157
pass                       = 1157
fail                       = 0
working tree               = clean
```

PR and fresh-main validation also passed Node Test, S42 branch regression, G4B-U01 smoke and print-layout regression, G4B-U04 HTML/PDF smoke, and G5A-U08 production smoke.

## Distance

```text
GOAL_DISTANCE_BEFORE =
D2_G5A_U02_22_PATTERNSPEC_CONTRACTS_DESIGNED_PENDING_QA

GOAL_DISTANCE_AFTER =
D2_G5A_U02_22_PATTERNSPEC_CONTRACTS_QA_LOCKED

DISTANCE_REDUCED =
Reviewed all 22 PatternSpec contracts, closed 16 answer schemas,
role-bound eight controlled templates, locked semantic decision and
statement grammars, and completed exact nine-stage/64-code validator coverage.

REMAINING_BLOCKERS = [
  "g5a_u02_5a02a1 public source metadata correction remains pending",
  "FormalMapping, PatternGroup and PatternSpec materialization are absent",
  "Generator and blocking validator runtime are absent",
  "Public selector, canonical routing, worksheet and renderer integration are absent"
]

NEXT_SHORTEST_STEP =
S84_G5A_U02_FormalMappingAndHiddenPatternSpecMaterialization

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```

# G5AU02-S98 All-22 Source Method and Representation Parity Audit

## Purpose

S97 closed the six blocking cases where the learner could not see enough information to answer. S98 asks a different question:

> Does each of the 22 public PatternSpecs preserve the teaching method, mathematical language roles and representation used by the original `5a02a` and `5a02a1` source packets?

A question can be learner-visible and arithmetically correct while still losing the source method. S98 therefore does not reuse prompt completeness as a substitute for source parity.

## Scope boundary

This is an audit-only milestone.

- no generator change;
- no validator change;
- no renderer change;
- no public UI or worksheet behavior change;
- no PatternSpec, KnowledgePoint or answer-model identity change;
- no other unit is inspected or modified.

The machine-readable authority is:

`data/curriculum/audits/G5AU02_S98_All22SourceMethodAndRepresentationParityAudit.json`

## Source method inventory

### `5a02a` — 因數

The source includes:

- factor criterion through both multiplication decomposition and exact division;
- sequential trial division with a visible table;
- multiplication-pair search and stopping logic;
- U-shaped ascending factor recording and symmetric pairing;
- factor-sequence reconstruction;
- candidate-number selection;
- divisibility direction language;
- segment-count and length-per-segment paired roles;
- recipient-range filtering;
- factor/multiple/common-factor/common-multiple wording discrimination;
- complete-factor-list variable reasoning and statement evaluation;
- remainder transfer through a divisor-multiple relation and story witness.

### `5a02a1` — 公因數

The source includes:

- common-factor intersection with smallest/greatest marking;
- complete common-factor list followed by greatest-common-factor selection;
- maximum grouping and all-possible packaging role discrimination;
- rectangle partition and square-tile diagrams;
- factor-decomposition methods for common factors;
- side-length-to-area reasoning;
- a source-backed four-digit code combining common factors, common multiples, divisibility and distinct digits.

## Rubric

Each PatternSpec is classified independently across four dimensions:

1. `semanticRoleParity`
   - `PASS`: quantity and operation roles match the source;
   - `PARTIAL`: the answer target remains related, but one or more source roles were collapsed.
2. `methodParity`
   - `PASS`: the source solving method is retained or required;
   - `PARTIAL`: part of the method remains but is not fully observable;
   - `MISSING`: the public behavior reduces the task to an answer-only form.
3. `representationParity`
   - `PARTIAL`: some structure is visible but the source representation is incomplete;
   - `MISSING`: a source table, relation, U-shape or diagram is absent;
   - `NOT_REQUIRED`: the source task is fundamentally linguistic or contextual.
4. `generativeDiversity`
   - `PASS`: deterministic samples remain nondegenerate;
   - `PARTIAL`: allowed samples can collapse the intended two-number reasoning;
   - `SOURCE_FIXED`: the public generator repeats one source example rather than a family.

`learnerVisibleComplete=true` means S97 provides enough information to answer. It does not mean the other four dimensions pass.

## Aggregate result

```text
Canonical PatternSpecs                 = 22 / 22 audited
Learner-visible complete               = 22 / 22

Semantic-role parity
  PASS                                 = 16
  PARTIAL                              = 6

Method parity
  PASS                                 = 10
  PARTIAL                              = 8
  MISSING                              = 4

Representation parity
  PARTIAL                              = 6
  MISSING                              = 8
  NOT_REQUIRED                         = 8

Generative diversity
  PASS                                 = 19
  PARTIAL                              = 2
  SOURCE_FIXED                         = 1

Repair priority
  P0                                   = 12
  P1                                   = 6
  P2                                   = 4
```

## P0 findings

The twelve P0 rows form five bounded repair tracks.

### 1. Method witnesses and mathematical language

- factor relation does not require both multiplication and division witnesses;
- statement judgment undercovers `整除／被整除／因數／倍數` direction changes;
- problem-type classification uses dictionary definitions rather than source-like quantity roles;
- complete-factor-list statement evaluation uses fixed, mostly trivial statements.

### 2. Structured representations

- trial-division table is missing;
- factor-list-from-pairs is indistinguishable from ordinary factor enumeration;
- rectangle-square partition diagram is missing;
- square-tile diagram and side-to-area chain are missing.

### 3. Application-role parity

- equal-partition ribbon questions ask only segment count and omit the paired length-per-segment role.

### 4. Nontrivial common-factor sampling

- common-factor enumeration and greatest-common-factor generation allow equal operands, which can collapse the intended two-set intersection task.

### 5. Source-example separation

- the four-digit code PatternSpec now exposes the complete source conditions, but every regeneration still repeats `1725`.

## P1 and P2 interpretation

P1 rows have an incomplete representation or a simplified method but do not block the mathematical target. P2 rows already preserve the source roles and are retained as regression-only or low-priority context refinements.

## Acceptance contract

S98 passes only when:

- all 22 canonical PatternSpec IDs appear exactly once and in canonical order;
- the audit retains the 14 Class C / 8 Class D split;
- all rows reference one of the two approved source packets;
- every gap has an issue code, priority and bounded repair track;
- aggregate counts are recomputed from rows and match the declared summary;
- the audit does not modify runtime behavior;
- full Node regression remains green.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_SIX_BLOCKING_PATTERNS_CLOSED
GOAL_DISTANCE_TARGET = D1_G5A_U02_ALL22_METHOD_REPRESENTATION_GAPS_CLASSIFIED
DISTANCE_REDUCED = all 22 PatternSpecs receive source-grounded method, representation, diversity and repair-priority status
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S99_P0SourceMethodAndRepresentationFullFixContract
```

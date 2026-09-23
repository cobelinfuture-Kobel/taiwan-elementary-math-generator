# G5AU02-S100 P0 Method Witness, Language and Reasoning FullFix

## Authority

S100 implements the first bounded runtime milestone defined by `G5AU02-S99_P0SourceMethodAndRepresentationFullFixContract`.

The approved source authority remains:

- `g5a_u02_5a02a` for factor methods, exact division, factor-pair transformation, divisibility language and problem classification;
- the S98 all-22 audit for the P0 finding and repair priority;
- the S99 contract for model kinds, blocking codes and scope boundaries.

## Locked scope

S100 changes exactly six PatternSpecs:

```text
ps_g5a_u02_factor_relation_equivalence
ps_g5a_u02_factor_enumeration_trial_division
ps_g5a_u02_factor_list_from_pairs
ps_g5a_u02_factor_statement_judgement
ps_g5a_u02_problem_type_classification
ps_g5a_u02_complete_factor_list_statement_evaluation
```

S101 partition/geometry, S102 common-factor sampling, S103 digit-code generation, P1/P2 patterns and other units are unchanged.

## Root causes closed

### Factor relation

The previous question exposed only a yes/no factor judgment. S100 retains both source methods:

- multiplication decomposition witness;
- division witness with quotient, remainder and exactness.

False cases expose nonexact evidence rather than fabricating an integer quotient witness.

### Trial division

The previous implementation returned only the final factor list. S100 generates all rows from divisor `1` through `floor(sqrt(target))`, including:

```text
divisor
quotient
remainder
isExact
```

The complete factor list is recomputed from exact rows and their paired quotients.

### Factor pairs to ordered list

The previous prompt was indistinguishable from direct factor enumeration. S100 exposes all completed factor pairs and explicitly requires:

```text
flatten -> deduplicate -> ascending order
```

### Controlled divisibility language

S100 admits exactly four finite grammar families:

```text
candidate_is_factor_of_target
target_is_multiple_of_candidate
target_is_divisible_by_candidate
candidate_divides_target
```

Truth is derived from structured subject/object roles and arithmetic, not parsed from Chinese prompt text.

### Source-like problem classification

Dictionary definitions are replaced by four controlled quantity-role scenarios:

```text
equal_partition_single_quantity             -> factor
repeated_grouping_single_quantity            -> multiple
equal_partition_two_quantities               -> common_factor
synchronized_repetition_two_quantities       -> common_multiple
```

Each scenario stores its quantity roles and expected label as structured fields.

### Complete-factor-list reasoning

The former fixed set of mostly trivial statements is replaced by controlled statement families covering:

- candidate factor membership;
- target multiple relation;
- factor-count parity;
- square-number/odd-factor-count inference;
- paired-factor product verification.

Every generated set contains both true and false statements and requires at least one structural inference.

## Structured display models

S100 activates the six S99 model kinds:

```text
factor_relation_dual_witness
trial_division_table
factor_pairs_to_ordered_list
controlled_divisibility_statement
number_theory_problem_type_scenario
factor_list_reasoning_statement_set
```

The public question record retains the structured model and a self-contained Traditional Chinese prompt. Top-level answer, structured answer and answer text remain absent from student records.

## Blocking validation

All S99 `G5AU02_P0_*` codes for these six patterns are implemented. Validation operates on structured fields and independently recomputes canonical answers.

The runtime blocks:

- absent or inconsistent dual witnesses;
- incomplete or arithmetically invalid trial rows;
- factor-set mismatch;
- absent pair source or invalid pair-to-list transformation;
- unknown grammar family, reversed roles or wrong truth value;
- unknown scenario, absent quantity roles or label mismatch;
- trivial statement sets, invalid truth patterns or missing inference.

## Runtime boundary

The six S100 PatternSpecs are routed through the canonical hidden-projection binding. All remaining Class C and Class D patterns retain their existing runtime paths. PatternSpec, KnowledgePoint, FormalMapping, source and answer-model IDs remain stable.

No free-form AI, generic fallback or cross-unit behavior is introduced.

## Acceptance

### Source runtime

```text
6 patterns × 64 deterministic seeds = 384 scenarios
required = 384 / 384 PASS
```

Coverage additionally requires:

- all four grammar families;
- all four scenario families;
- true and false factor/divisibility samples;
- both learner task modes;
- all five reasoning-statement families;
- every named blocking validator code.

### Browser bundle

```text
6 patterns × 64 bundled questions = 384 scenarios
required = 384 / 384 PASS
```

Every bundled question must retain the expected display-model kind, complete prompt status, self-contained prompt and answer-record isolation.

### Regression and integration

Before merge:

- complete Node regression must pass;
- canonical browser bundle must be synchronized;
- public browser, print and HTML/PDF gates must remain green;
- shared exact-layout and answer-boundary gates must not regress.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_P0_FULLFIX_CONTRACT_LOCKED
GOAL_DISTANCE_TARGET = D1_G5A_U02_S100_METHOD_LANGUAGE_REASONING_FIXED
DISTANCE_REDUCED = six P0 PatternSpecs gain source-method witnesses, controlled language, source-like quantity roles and nontrivial factor-list reasoning
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S101_P0PartitionAndGeometryRepresentationFullFix
```

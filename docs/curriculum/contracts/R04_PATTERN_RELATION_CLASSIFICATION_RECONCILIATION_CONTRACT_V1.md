# R04 Pattern-Relation Classification Reconciliation Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01A1_R04PatternRelationClassificationCorrectionAndW1Rebase
```

## Purpose

This contract resolves a narrow semantic collision in the R04 profile classifier:

```text
factor / multiple vocabulary
versus
pattern / sequence / relation semantics
```

The canonical KnowledgePoint:

```text
kp_g4a_u07_quantity_multiplicative_pattern
```

means fixed-ratio sequence recognition. Its source-backed invariant is that the ratio between adjacent stages remains fixed. It is not factor enumeration, divisibility, common multiple, GCD, or LCM reasoning.

## Classification rule

When one KnowledgePoint corpus matches both:

```text
rule_factor_multiple
rule_pattern_relation
```

and it contains explicit pattern/relation semantics, `rule_pattern_relation` must take precedence.

The override is intentionally narrow. Ordinary factor/multiple KnowledgePoints retain `profile_factor_multiple`.

## Required corrected mapping

```text
primaryRuntimeProfileId = profile_pattern_relation
classificationRuleId    = rule_pattern_relation
required capabilities include:
  cap_pattern_sequence_reasoning
  cap_pattern_relation_validator
```

Because both capabilities are contract-only, the corrected delivery state is:

```text
BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES
```

and the corrected delivery wave is:

```text
R05-W6
```

## W1 rebase

```text
W1 KnowledgePoints = 21
W1 source nodes     = 4
W6 KnowledgePoints = 33
total KP count      = 482
```

`kp_g4a_u07_quantity_multiplicative_pattern` must not appear in the P01A W1 product inventory.

## Boundaries

```text
new generator created       = false
new validator created       = false
production admission changed = false
W6 implementation started    = false
existing 15-unit baseline changed = false
recursive-improvement admin  = false
```

The next valid product step is `P01D1_G5BU05LargeNumberVerticalSlice`.

# GCTX-P07 Existing PatternSpec Semantic Eligibility Audit

## 1. Milestone

`GCTX-P07_ExistingPatternSpecSemanticEligibilityAudit` audits every PatternSpec reachable from the canonical public selector composer and assigns one closed semantic-eligibility decision.

This milestone does not create global context records, migrate unit authority, implement a validator or resolver, alter generators, or change worksheet rendering.

## 2. Authority

The audit consumes:

- `site/modules/curriculum/registry/batch-a-selector-composer.js`;
- all KnowledgePoint rows exposed by `listVisibleBatchAKnowledgePoints()`;
- all PatternGroups exposed by `getVisiblePatternGroupsForKnowledgePoint()`;
- all selector-derived `patternSpecIds`.

The expected public source set is the existing 15-unit source registry. The following units already own structured or partially structured context authority:

- G3B-U04;
- G3B-U08;
- G4B-U04;
- G5A-U02;
- G5A-U08.

## 3. Closed decisions

| Decision | Meaning | P08 eligibility |
|---|---|---|
| `eligible_existing_authority` | Controlled semantic signal exists and the unit already owns context authority. | Yes |
| `eligible_binding_backfill` | Controlled semantic signal exists but a global ApprovedSemanticBinding must be added. | Yes |
| `not_applicable_non_semantic` | Numeric, concept, representation, estimation, or non-contextual reasoning only. | No |

Existing unit authority alone does not make a numeric-only PatternSpec eligible.

## 4. Controlled semantic signals

A PatternGroup is semantic only when at least one controlled signal is present:

1. a mode token containing `application`, including `reasoning_application` and `geometry_application`;
2. `contextualReasoning = true`;
3. an approved representation tag such as `controlled_semantic_application`, `word_problem`, or `contextual_reasoning`;
4. a non-empty `contextTypes` array paired with a non-numeric mode or approved representation tag.

Names, titles, or the presence of arbitrary text are not evidence.

## 5. Blocking behavior

The audit blocks when:

- an unexpected source appears or an expected source disappears;
- a visible KnowledgePoint exposes no PatternGroup;
- a PatternGroup exposes no PatternSpec ID;
- one PatternSpec receives conflicting decisions;
- a decision falls outside the closed decision registry.

The audit intentionally does not force every KnowledgePoint into an application context.

## 6. Known authority assertions

The current effective authority must retain:

- G4B-U04: 6 eligible application PatternSpecs;
- G5A-U02: 8 eligible Class D/application-derived PatternSpecs;
- G5A-U08: 9 application plus 2 contextual-reasoning PatternSpecs, total 11.

These are drift gates, not population targets.

## 7. Acceptance

Focused Node tests must prove:

- all 15 public sources are present;
- every selector-reachable PatternSpec has exactly one decision;
- no duplicate or conflicting source/PatternSpec key exists;
- known authority counts remain exact;
- non-semantic PatternSpecs have no semantic signal;
- P08 can consume only the two eligible decisions.

## 8. Scope boundary

```text
no ApprovedSemanticBinding rows
no global registry seed
no production context corpus
no validator implementation
no resolver implementation
no unit migration
no renderer or UI change
```

## 9. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_VALIDATOR_CONTRACT_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_EXISTING_PATTERNSPEC_ELIGIBILITY_AUDIT_PENDING_CI
DISTANCE_REDUCED     = every selector-reachable PatternSpec receives deterministic semantic eligibility ownership
REMAINING_BLOCKERS   = [CI acceptance, merge, binding backfill, authority normalization, population, validator, resolver, migrations]
NEXT_SHORTEST_STEP   = GCTX-P08_ApprovedSemanticBindingBackfillAndLegacyAuthorityNormalization
```

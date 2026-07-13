# S76E G4A-U08 Existing PatternSpec Reclassification

```text
TASK = S76E_G4A_U08_ExistingPatternSpecReclassification
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
UNIT = 4A-U08 整數四則
```

## Scope

S76E reclassifies the twelve existing Phase2A application templates under the S76D canonical KnowledgePoint and PatternGroup registry. It does not modify generation, validation, public routing, worksheet assembly, rendering, or production lifecycle.

## Result

- existing templates reclassified: 12;
- canonical PatternSpec identities assigned: 12;
- target PatternGroups reached: 12;
- legacy template IDs preserved: yes;
- legacy four coarse application KP IDs preserved as compatibility anchors: yes;
- extension groups incorrectly claimed as existing runtime: zero.

## Main correction

The old coarse `app_mul_div_sequence` bucket is now separated into:

- multiply then share;
- unit rate then scale;
- divide then divide.

The old add/sub and parentheses/application buckets are likewise separated by event order, intermediate quantity, and unknown-role semantics.

## Deferred source-authority groups

The following S76D groups remain hidden and are not falsely mapped to current Phase2A runtime:

- comparison chain;
- equal-value unit price;
- relative difference;
- two-cost-component payment.

They remain scheduled for S76I.

## Compatibility boundary

S76E is metadata-only. The existing generator continues to emit legacy output. S76F will introduce the canonical GeneratedItem adapter that consumes this reclassification table.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_HIDDEN_KP_PATTERN_GROUP_REGISTRY_REBASED
GOAL_DISTANCE_AFTER  = D2_G4A_U08_EXISTING_PATTERNS_RECLASSIFIED_PENDING_ADAPTER
DISTANCE_REDUCED     = Existing Phase2A templates now resolve to distinct PatternGroups and canonical PatternSpec identities instead of only four coarse KP buckets.
REMAINING_BLOCKERS   = Canonical GeneratedItem adapter; ValidatorContract rebase; mutation rejection; four missing source groups; public integration; full-source stress.
NEXT_SHORTEST_STEP   = S76F_G4A_U08_CanonicalGeneratedItemAdapter
```

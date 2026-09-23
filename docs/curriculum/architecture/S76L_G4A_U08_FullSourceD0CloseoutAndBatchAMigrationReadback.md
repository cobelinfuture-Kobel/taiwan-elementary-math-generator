# S76L — G4A-U08 Full-Source D0 Closeout and Batch A Migration Readback

```text
TASK = S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback
STATUS = PASS_MIGRATION_READBACK_D0_BLOCKED
SOURCE_ID = g4a_u08_4a08
```

## Result

S76L completed the fresh-main D0 gate evaluation and Batch A migration cost readback. It does **not** declare full-source D0.

The merged S76K runtime and HTML/PDF evidence are accepted, but legacy executable coverage is not equivalent to canonical ontology closure. Four of the five S76B full-source coverage metrics remain below threshold.

## Fresh-main evidence

```text
S76K PR                    = #154
S76K merge commit          = c995a2e5d741bbc07f000205eed8d145b7002f13
S76K accepted head         = 268f7e5344c850ed02116bd97ad6dfe4d9f344bd
S76K readback commit       = 81a42776c61de6242580259499aaef357899f36e
S76K HTML/PDF run          = 29268903266
S76K artifact              = 8286611935
```

Accepted S76K smoke evidence:

```text
questions                  = 120
answer-key items            = 120
question pages              = 15
answer pages                = 20
PDF pages                   = 35
nonblank rendered pages     = 35
DOM cell overflow           = 0
DOM page overflow           = 0
PDF bbox overflow           = 0
internal-ID leak            = 0
unresolved placeholder      = 0
CJK glyph rendering         = PASS
```

## Canonical denominator

The S76A/S76D authority is:

```text
KnowledgePoints             = 15
numeric KnowledgePoints     = 11
application KnowledgePoints = 4
PatternGroups               = 28
numeric PatternGroups       = 11
application core groups     = 13
application extension groups = 4
```

Implemented canonical scope:

```text
existing application PatternGroups/PatternSpecs = 12
Phase2B extension PatternGroups/PatternSpecs     = 4
adapter contracts                                = 16
validator contracts                              = 16
mutation-covered PatternGroups                   = 16
public canonical PatternGroups                   = 4
```

The public application selector still uses four legacy coarse compatibility groups for Phase2A. Only the four S76J Phase2B groups are canonical S76D PatternGroups on the public worksheet path.

## Full-source D0 metrics

| Metric | Result | S76B threshold | Gate |
|---|---:|---:|---|
| `SOURCE_KP_COVERAGE` | 15 / 15 = 100.00% | 90% | PASS |
| `KP_PATTERN_COVERAGE` | 4 / 15 = 26.67% | 90% | FAIL |
| `KP_VALIDATOR_COVERAGE` | 4 / 15 = 26.67% | 85% | FAIL |
| `KP_MUTATION_COVERAGE` | 16 / 28 = 57.14% | 80% | FAIL |
| `PUBLIC_WORKSHEET_REACHABILITY` | 4 / 28 = 14.29% | 85% | FAIL |

Therefore:

```text
FULL_SOURCE_D0_ELIGIBLE = false
FULL_SOURCE_D0_DECLARED = false
CURRENT_DISTANCE        = D1
```

## Exact unclosed scope

### Numeric ontology gap

All 11 canonical numeric KnowledgePoints have registry PatternGroups, but they do not yet have canonical PatternSpec, adapter, validator and mutation closure.

The existing numeric runtime exposes 10 legacy PatternSpecs. Mapping 10 legacy structures onto 11 canonical numeric objectives requires at least one split or new PatternSpec; a one-to-one migration cannot be assumed.

### Missing application group

`pg_g4a_u08_app_cost_overlay` is source-authoritative but has no PatternSpec, generator, validator or mutation contract.

### Public canonical reachability gap

Twenty-four of the 28 canonical PatternGroups are not publicly worksheet-reachable:

```text
11 numeric core groups
12 existing application canonical groups
 1 application cost-overlay group
```

The 12 existing application PatternSpecs remain executable through legacy coarse public groups, but that compatibility path does not satisfy canonical PatternGroup reachability.

## Batch A migration cost readback

### KEEP

- stable legacy numeric generator behavior;
- stable Phase2A application generator behavior;
- operand and answer bounds;
- worksheet and answer-key assembly;
- current renderer behavior;
- legacy URLs and selector aliases.

### ADAPT

- map or split 10 numeric legacy PatternSpecs across 11 canonical numeric KPs/PGs;
- emit canonical numeric GeneratedItem metadata;
- add numeric PatternGroup validator contracts and equivalence/AST mutation rejection;
- route the 12 existing application canonical PatternGroups rather than only coarse compatibility groups;
- retain coarse public IDs as aliases during migration.

### ADD

- at least one missing or split numeric PatternSpec;
- full closure for `pg_g4a_u08_app_cost_overlay`;
- canonical resolver and worksheet reachability for 24 currently unreachable groups.

Minimum remaining closure counts:

```text
PatternSpec closures         = 12
validator contract closures  = 12
mutation coverage closures   = 12
public canonical routes      = 24
```

## Pilot conclusion

The adapter-first strategy was effective for preserving stable runtime behavior and adding the four missing Phase2B source groups with bounded risk. The pilot also shows that executable legacy coverage must not be used as a proxy for canonical KnowledgePoint fidelity or public canonical reachability.

For later Batch A units, migration planning must inventory the canonical numeric layer before scheduling a D0 closeout. Otherwise the project can pass generation, worksheet and PDF tests while still failing the ontology gate.

## Scope boundary

S76L changes no generator, validator, selector, resolver, worksheet, renderer, CSS or public UI behavior. It adds only machine-readable coverage evidence, executable readback QA, closeout documentation and status normalization for S76K.

## Closeout

```text
GOAL_DISTANCE_BEFORE = D1_G4A_U08_FULL_SOURCE_STRESS_SEMANTIC_HTML_PDF_ACCEPTED
GOAL_DISTANCE_AFTER  = D1_G4A_U08_D0_GATE_QUANTIFIED_NUMERIC_CANONICAL_GAP
DISTANCE_REDUCED     = Prevented a false D0 declaration and converted the remaining ontology gap into exact KP, PG, validator, mutation and public-route closure counts.
REMAINING_BLOCKERS   = [11 numeric KPs without canonical closure, 12 PGs without PatternSpecs/validators/mutations, 24 PGs not publicly reachable, next step outside approved S76A-S76L scope]
NEXT_SHORTEST_STEP   = S76M_G4A_U08_NumericCanonicalGapClosureDesignScan
STOP_REASON          = NEXT_STEP_OUTSIDE_APPROVED_SCOPE
BLOCKER_TYPE         = FULL_SOURCE_D0_GATE
LAST_COMPLETED_STATUS = PASS_MIGRATION_READBACK_D0_BLOCKED
REQUIRED_OPERATOR_ACTION = Approve S76M planning scope for numeric canonical mapping/splitting and app_cost_overlay closure.
NEXT_RESUME_TASK      = S76M_G4A_U08_NumericCanonicalGapClosureDesignScan
```

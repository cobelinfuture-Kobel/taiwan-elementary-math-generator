# Global Capability-Based Delivery Wave Rebase Contract V1

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R05_DeliveryWaveRebase
AUTHORITY_MODE = SHADOW
```

## Purpose

R05 converts the R03 prerequisite graph and R04 shared runtime capability matrix into one bounded implementation sequence. A delivery wave is an engineering admission sequence, not a KnowledgePoint taxonomy, curriculum chapter order, or legacy Batch.

```text
R03 direct prerequisite graph
+
R04 required capability closure and delivery evidence
→
R05 capability-based delivery wave
+
intra-wave prerequisite rank
```

## Nine bounded waves

```text
R05-W0  PRODUCTION_BASELINE_PRESERVED
R05-W1  EXISTING_PRODUCTION_CAPABILITY_ADMISSION
R05-W2  SHADOW_FOUNDATION_HARDENING
R05-W3  DECIMAL_FRACTION_NUMBER_DOMAIN
R05-W4  QUANTITY_MEASUREMENT_UNIT_SYSTEM
R05-W5  GEOMETRY_SPATIAL_VISUAL
R05-W6  DATA_PATTERN_RELATION
R05-W7  RATIO_RATE_CROSS_DOMAIN
R05-W8  MULTI_DOMAIN_COMPLETION
```

The wave set is fixed for this rebase. R05 may not create one wave per unit or one capability per KnowledgePoint.

## Assignment rules

1. All 482 canonical KnowledgePoints receive exactly one assignment.
2. Required capability dependencies are expanded transitively before delivery status is evaluated.
3. Legacy Batch A–E is copied only for provenance and may not choose a wave.
4. Required prerequisite waves may not occur after the dependent KnowledgePoint wave.
5. Alternative prerequisite groups use the minimum satisfying source route.
6. Supporting edges do not affect delivery waves.
7. KnowledgePoints in the same wave are ordered by prerequisite rank.
8. A natural capability dependency chain remains in its highest required domain wave.
9. Independent contract-only gaps spanning multiple delivery domains enter W8.
10. Production admission remains deferred to R06/R07.

## Existing 15-unit D0 baseline

The existing product baseline is 15 public units represented by 16 source nodes because `g5a_u02_5a02` has two source nodes.

```text
rebuildRequired      = false
revalidationRequired = true
migrationMode        = compatibility attachment in R06
productionUse        = preserved
deliveryWave         = R05-W0
```

R05 does not rebuild, demote, hide, or replace these units. It marks their canonical KnowledgePoints for R06 compatibility migration. If the new Global prerequisite/capability model demands contract-only facilities that were not required by the proven legacy D0 path, R05 records a reconciliation requirement instead of invalidating the product baseline.

## Quantity boundary proof

```text
kp_mass_times_integer
→ shadow quantity identity and same-unit arithmetic
→ contract-only quantity-domain validator
→ base and final delivery R05-W4
→ unit conversion and mixed-unit normalization remain unnecessary

kp_mass_mixed_unit_add_sub
→ contract-only quantity-domain validator, conversion, and mixed-unit normalization
→ base and final delivery R05-W4
```

This preserves the R04 capability distinction: both require a quantity validator, but only mixed-unit arithmetic requires conversion and normalization.

## Mainline boundary

```text
current production consumer = site/assets/browser/pipeline/build-worksheet-document.js
production consumer changed = false
legacy compatibility moved  = false
production cutover allowed  = false
parallel runtime pipeline   = false
```

R06 must attach legacy identities to the Global KP/capability authority. R07 remains the only task permitted to cut over the production consumer.

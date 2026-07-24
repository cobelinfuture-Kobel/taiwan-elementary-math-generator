# GCKG R05 Delivery Wave Rebase Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R05_DeliveryWaveRebase
STATUS = PASS_R05_CAPABILITY_BASED_DELIVERY_WAVE_REBASE
MAINLINE_INTEGRATION_STATUS = DELIVERY_SEQUENCE_ONLY
```

## Result

```text
canonical KnowledgePoints = 482
shared capabilities       = 58
bounded delivery waves    = 9
protected public units    = 15
protected source nodes    = 16
```

Every KnowledgePoint receives:

```text
baseDeliveryWaveId
deliveryWaveId
intraWavePrerequisiteRank
effectiveRequiredRuntimeCapabilityIds
contractOnlyRequiredCapabilityIds
waveEscalatedByPrerequisite
productionAdmissionState
r06CompatibilityMigrationRequired
```

The executable runtime and validator emit the authoritative per-wave counts. The sum of all wave assignments must remain 482. Existing D0 rows whose legacy runtime proof is narrower than the new Global model are retained in W0 and counted as R06 reconciliation requirements rather than product failures.

## Executable wave metrics

```text
R05-W0  KnowledgePoints = 156   capability plans = 22
R05-W1  KnowledgePoints =  22   capability plans =  0
R05-W2  KnowledgePoints =   0   capability plans =  5
R05-W3  KnowledgePoints =  84   capability plans =  7
R05-W4  KnowledgePoints =  53   capability plans =  5
R05-W5  KnowledgePoints =  79   capability plans =  7
R05-W6  KnowledgePoints =  32   capability plans =  9
R05-W7  KnowledgePoints =  32   capability plans =  3
R05-W8  KnowledgePoints =  24   capability plans =  0
------------------------------------------------------
Total    KnowledgePoints = 482   capability plans = 58
```

```text
prerequisite-escalated KnowledgePoints = 48
protected Global-model reconciliation = 9
```

`R05-W2` contains five shadow capability-hardening actions but no direct KnowledgePoint admission. KnowledgePoints needing those shadow facilities also require a later domain validator or prerequisite and therefore remain in W4 or another later wave.

## Rebased sequence

```text
W0 existing 15-unit D0 preservation
W1 non-baseline KPs already covered by production capabilities
W2 shadow authority and shared semantic capability hardening; KP admission may remain in a later validator/domain wave
W3 decimal/fraction number-domain foundations
W4 quantity, measurement, conversion, and time
W5 geometry, spatial, and visual representation
W6 data, charts, patterns, and symbolic relations
W7 ratio, percent, speed, and rate
W8 independent multi-domain completion gaps
```

## Existing 15 units

The 15 completed units are not rebuilt. Their current UI, generators, validators, Global Context/PBL bindings, worksheet output, answer key, HTML, and print path remain authoritative.

```text
15_UNITS_REBUILD_REQUIRED              = false
15_UNITS_COMPATIBILITY_MIGRATION       = required in R06
15_UNITS_REVALIDATION                  = required
15_UNITS_CURRENT_PRODUCTION_USE        = preserved
15_UNITS_PUBLIC_OUTPUT_CHANGE_EXPECTED = false
GLOBAL_MODEL_DIFFERENCES               = recorded for R06, not treated as D0 demotion
```

## Anti-parallel-line proof

```text
production consumer changed = false
new generator created       = false
new validator created       = false
new renderer created        = false
legacy Batch used as wave   = false
production cutover allowed  = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2
GOAL_DISTANCE_AFTER  = D2
DISTANCE_REDUCED     = The 482-node graph and 58-capability matrix now have one bounded capability-based delivery sequence, while the existing 15-unit D0 baseline remains protected.
REMAINING_BLOCKERS   = [legacy 15-unit identities not migrated, production consumer not cut over, contract-only capabilities not implemented]
NEXT_SHORTEST_STEP   = R06_LegacyCompatibilityMigration
```

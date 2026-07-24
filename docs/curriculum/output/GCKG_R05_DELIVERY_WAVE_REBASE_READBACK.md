# GCKG R05 Delivery Wave Rebase Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R05_DeliveryWaveRebase
STATUS = PASS_R05_CAPABILITY_BASED_DELIVERY_WAVE_REBASE_WITH_P01A1_CORRECTION
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

The sum of all wave assignments remains 482. Existing D0 rows remain protected in W0.

## Corrected executable wave metrics

```text
R05-W0  KnowledgePoints = 156   capability plans = 22
R05-W1  KnowledgePoints =  21   capability plans =  0
R05-W2  KnowledgePoints =   0   capability plans =  5
R05-W3  KnowledgePoints =  84   capability plans =  7
R05-W4  KnowledgePoints =  53   capability plans =  5
R05-W5  KnowledgePoints =  79   capability plans =  7
R05-W6  KnowledgePoints =  33   capability plans =  9
R05-W7  KnowledgePoints =  32   capability plans =  3
R05-W8  KnowledgePoints =  24   capability plans =  0
------------------------------------------------------
Total    KnowledgePoints = 482   capability plans = 58
```

## P01A1 correction

```text
KnowledgePoint = kp_g4a_u07_quantity_multiplicative_pattern
Old profile    = profile_factor_multiple
Correct profile = profile_pattern_relation
Old wave       = R05-W1
Correct wave   = R05-W6
```

The correction is semantic, not Batch-based. The KnowledgePoint's source-backed capability is fixed-ratio pattern recognition; its required pattern generator and validator are not production-admitted. It therefore cannot remain in W1.

## Rebased sequence

```text
W0 existing 15-unit D0 preservation
W1 21 non-baseline KPs already covered by production capabilities
W2 shadow authority and shared semantic capability hardening
W3 decimal/fraction number-domain foundations
W4 quantity, measurement, conversion, and time
W5 geometry, spatial, and visual representation
W6 33 data, charts, patterns, and symbolic relations KPs
W7 ratio, percent, speed, and rate
W8 independent multi-domain completion gaps
```

## Existing 15 units

The 15 completed units are not rebuilt. Their UI, generators, validators, worksheet output, answer key, HTML, and print path remain authoritative.

## Anti-parallel-line proof

```text
new generator created       = false
new validator created       = false
new renderer created        = false
legacy Batch used as wave   = false
production baseline changed = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2
GOAL_DISTANCE_AFTER  = D2
DISTANCE_REDUCED     = One false W1 admission candidate is moved to its correct W6 capability domain; the full-product queue now reflects mathematical semantics and actual runtime readiness.
REMAINING_BLOCKERS   = [21 W1 vertical slices, W2-W8 capability and product delivery, P09 UI, P10 full closeout]
NEXT_SHORTEST_STEP   = P01D1_G5BU05LargeNumberVerticalSlice
```

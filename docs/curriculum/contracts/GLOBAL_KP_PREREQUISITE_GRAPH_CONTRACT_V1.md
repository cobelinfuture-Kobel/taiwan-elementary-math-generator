# Global KnowledgePoint Prerequisite Graph Contract V1

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID    = R03_GlobalPrerequisiteGraph
STATUS     = GLOBAL_KP_PREREQUISITE_GRAPH_SHADOW_AUTHORITY_READY
```

## 1. Authority and scope

R03 consumes the merged R02 canonical KnowledgePoint registry and materializes one shadow prerequisite graph for all **482** canonical KnowledgePoints.

This graph is:

- a capability dependency graph;
- directed from prerequisite to dependent capability;
- independent of legacy Batch A–E boundaries;
- not a curriculum chronology graph;
- not a Pattern lineage graph;
- not a tag hierarchy;
- not a production consumer cutover.

The existing production worksheet consumer remains:

```text
site/assets/browser/pipeline/build-worksheet-document.js
```

## 2. Edge contract

Edge authority is stored as gzip-compressed JSON encoded into pure-text Base64 chunks; runtime materialization expands it to the following full edge contract:

Every materialized edge contains:

```text
edgeId
fromKnowledgePointId
toKnowledgePointId
dependencyStrength
dependencyRole
alternativeGroupId
isImmediatePrerequisite
distanceBearing
rationale
evidenceRefs
status
introducedVersion
```

### dependencyStrength

```text
required     = hard prerequisite; all required parents combine as AND
alternative  = one approved route in an alternativeGroup
supporting   = useful for instruction/remediation, but does not block readiness
```

### dependencyRole

```text
conceptual_foundation
procedural_foundation
relation_model_foundation
representation_foundation
domain_extension_foundation
```

## 3. Graph invariants

The validator blocks:

```text
KP_GRAPH_UNKNOWN_NODE
KP_GRAPH_SELF_LOOP
KP_GRAPH_DUPLICATE_EDGE
KP_GRAPH_CYCLE_DETECTED
KP_GRAPH_REDUNDANT_TRANSITIVE_EDGE
KP_GRAPH_ALTERNATIVE_GROUP_MISSING
KP_GRAPH_ALTERNATIVE_GROUP_TOO_SMALL
KP_GRAPH_NODE_ACCOUNTING_INVALID
KP_GRAPH_ROOT_HAS_INCOMING_DISTANCE_EDGE
KP_GRAPH_MAINLINE_BOUNDARY_VIOLATION
```

Direct `required` edges must be transitively reduced. Chronology, shared tags, similar names, or larger numbers alone are not sufficient evidence for an edge.

Every canonical KnowledgePoint is accounted for exactly once as:

```text
has at least one incoming distance-bearing edge
OR
approved scope/domain root
OR
boundary review required
```

## 4. N+1 readiness

For mastered set `M`, candidate `C` is ready when:

```text
C is not in M
AND every required direct prerequisite of C is in M
AND every alternativeGroup satisfies minimumSatisfied
```

Supporting edges do not block readiness.

R03 may return multiple ready KnowledgePoints. It does not declare one globally unique next lesson.

## 5. Cross-Batch quantity example

The graph explicitly separates:

```text
mass unit/scale understanding
+ integer multiplication
→ weight × integer

kg/g conversion
+ integer addition
+ integer subtraction
→ mixed-unit mass addition/subtraction
```

Therefore an integer arithmetic application with a stable same unit can use the existing integer relation model, while a question that requires kg↔g normalization remains blocked until the conversion KnowledgePoint is mastered and its runtime capability is delivered in R04/R05.

## 6. Materialized metrics

```text
KnowledgePoints = 482
Edges           = 668
required        = 665
alternative     = 2
supporting      = 1
roots           = 25
boundary review = 0
```

Role distribution:

```text
conceptual_foundation       = 143
procedural_foundation       = 222
relation_model_foundation   = 166
representation_foundation   = 43
domain_extension_foundation = 94
```

## 7. Deferred work

R03 does not materialize:

- runtime capability requirements;
- delivery waves;
- legacy ID cutover;
- production resolver changes;
- generator, validator, renderer, or UI changes.

Those remain assigned to R04–R07.

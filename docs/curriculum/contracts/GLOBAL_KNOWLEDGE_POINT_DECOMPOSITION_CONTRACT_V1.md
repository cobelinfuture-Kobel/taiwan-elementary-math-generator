# Global KnowledgePoint Decomposition Contract V1

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R01_GlobalKnowledgePointDecompositionContract_From_PR350MergeSHA
PRODUCT_BASELINE = PR #350 merge 9846627e1263d9dfb3e9e2318989cc5ae94c35dd
STATUS = CONTRACT_BOUND_NOT_CUT_OVER
```

## 1. Purpose

This contract defines how the 79 G3-G6 curriculum source nodes are decomposed into Global KnowledgePoint candidates without creating a parallel product authority or replacing the merged 15-unit D0 worksheet runtime.

The product mainline remains:

```text
source evidence
→ KnowledgePoint
→ PatternGroup / PatternSpec
→ existing resolver and generator
→ validator
→ worksheet document
→ answer key
→ HTML / print / PDF
```

The current production consumer remains:

```text
site/assets/browser/pipeline/build-worksheet-document.js
```

R01 does not change that consumer.

## 2. Frozen baseline

The decomposition contract is bound to the product baseline merged by PR #350:

```text
completed public units = 15
Batch A completed units = 13
Batch B completed units = 2
numeric worksheet = 15/15
application worksheet = 15/15
Global Context = 15/15
approved PBL = 5/5
validator / answer key / HTML / print = 15/15
product distance = D0
```

The full curriculum source scope remains:

```text
Batch A source nodes = 13
Batch B source nodes = 24
Batch C source nodes = 17
Batch D source nodes = 16
Batch E source nodes = 9
Total source nodes = 79
```

These legacy Batch assignments are delivery provenance only. They do not define KnowledgePoint boundaries.

## 3. Source unit and KnowledgePoint cardinality

The following relationships are required:

```text
one source unit → one or more KnowledgePoints
one KnowledgePoint → one or more source evidence references
```

A source title cannot be promoted directly into a KnowledgePoint.

A KnowledgePoint candidate must describe one capability that is:

1. independently teachable;
2. independently diagnosable;
3. bound to an explicit validator capability;
4. supported by curriculum or reviewed source evidence;
5. distinguishable from surface wording, difficulty and representation changes.

## 4. Required candidate contract

Every R02 candidate must contain:

```text
knowledgePointId
canonicalNameZh
capabilityStatement
indispensableConcepts
reasoningInvariant
misconceptionFamilies
validatorCapability
allowedVariationAxes
sourceRefs
legacyBatchRefs
candidateStatus
prerequisiteDeclaration
runtimeCapabilityDeclaration
mainlineBinding
```

The authoritative schema is:

```text
data/curriculum/global/schema/global-knowledge-point-candidate.schema.json
```

## 5. Boundary rules

A Pattern remains in the same KnowledgePoint when:

```text
primary learning outcome is unchanged
AND no new indispensable concept is introduced
AND reasoning invariant is unchanged
AND the validator capability remains reusable
```

A new KnowledgePoint candidate is permitted only when:

```text
a new indispensable capability exists
AND the capability is independently teachable
AND the capability is independently diagnosable
AND an independent validator contract can be defined
AND curriculum or reviewed source evidence supports the boundary
```

The following cannot create a KnowledgePoint by themselves:

```text
source unit title
larger numbers or greater item difficulty
a representation change
an application context change
legacy Batch membership
```

## 6. R01/R02 fail-closed boundaries

R01 and R02 must not materialize prerequisite edges or runtime capability mappings.

Every candidate must contain:

```json
{
  "prerequisiteDeclaration": {
    "mode": "DEFERRED_TO_R03",
    "directPrerequisiteKnowledgePointIds": []
  },
  "runtimeCapabilityDeclaration": {
    "mode": "DEFERRED_TO_R04",
    "requiredRuntimeCapabilityIds": []
  }
}
```

This prevents candidate authoring from silently deciding graph topology or implementation delivery order.

## 7. Mainline integration rule

Every candidate must bind to:

```text
productBaselineMergeSha = 9846627e1263d9dfb3e9e2318989cc5ae94c35dd
existingConsumerEntryPoint = site/assets/browser/pipeline/build-worksheet-document.js
productionCutoverAllowed = false
```

Forbidden during R01-R06:

```text
second curriculum authority
second production resolver
second generator / validator / worksheet pipeline
replacement of the 15-unit D0 runtime
production cutover before R07
legacy authority retirement before runtime proof
```

## 8. Fixed continuation

```text
R02 = materialize and reconcile KP candidates for all 79 source nodes
R03 = build the Global prerequisite graph
R04 = map shared runtime capabilities
R05 = rebase delivery waves
R06 = migrate existing 15-unit IDs and compatibility views
R07 = cut existing consumers over to the new authority
R08 = full regression, runtime proof and legacy-authority retirement
```

R01 is complete only when the JSON contract, JSON Schema, validator, tests and milestone claim agree on these boundaries.

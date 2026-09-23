# Global Legacy Compatibility Migration Contract V1

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R06_LegacyCompatibilityMigration
AUTHORITY_MODE = SHADOW_COMPATIBILITY
```

## Purpose

R06 attaches the existing 15-unit D0 product baseline to the R02–R05 Global KnowledgePoint, prerequisite, capability, and delivery-wave authorities without rebuilding the product and without changing the production consumer.

```text
legacy product unit / sourceId
→ existing knowledge-operation authority
→ exact canonical KnowledgePoint identity
→ R04 capability mapping
→ R05 protected W0 assignment
→ R06 compatibility unit
```

## Production authority rules

1. KnowledgePoint IDs from each unit `knowledge-operation.json` remain unchanged.
2. Existing question/PatternSpec IDs, operation-model IDs, source paths, and product sourceIds remain unchanged.
3. `g5a_u02_5a02a` and `g5a_u02_5a02a1` aggregate into the existing product unit `g5a_u02_5a02`.
4. The old S43 `batch_a_*` registries are compatibility inputs only. They are not promoted to Global authority.
5. S43 rows may resolve as exact aliases, renamed aliases, split aliases, or non-production deferred rows.
6. A supported production legacy row may not remain unresolved.

## Nine Global-model differences

The R05 readback found nine protected D0 KnowledgePoints whose proven legacy runtime scope is narrower than the new Global prerequisite/capability model.

R06 resolves each difference with a scope fence:

```text
existing approved legacy PatternSpec
→ remains production allowed

new Global PatternSpec using that KnowledgePoint
→ must satisfy the complete Global capability contract
→ cannot inherit the legacy exception
```

This preserves D0 evidence without weakening future Global admission.

## R07 handoff

R06 does not change `site/assets/browser/pipeline/build-worksheet-document.js`. R07 must perform dual-read parity before the Global authority can become primary. Legacy IDs remain compatibility aliases after cutover.

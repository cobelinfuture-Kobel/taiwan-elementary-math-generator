# POSTG-MIG-A03 G3A-U03 Candidate Readback

```text
PROGRAM_ID = POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1
TASK_ID = POSTG-MIG-A03_G3A_U03_GoldenConformanceAndKnowledgeOperationMigration
SOURCE_ID = g3a_u03_3a03
UNIT = 3A-U03 乘法
STATUS = A03_EFFECTIVE_SELECTOR_REGISTERED_PENDING_EXACT_HEAD_EVIDENCE
```

## Authoritative candidate scope

```text
KnowledgePoints = 7
OperationModels = 7
PatternGroups = 7
PatternSpecs = 7
numeric coverage = COMPLETE
application coverage = COMPLETE
new capability expansion = false
new unit-specific runtime = false
```

The effective selector exposes:

1. 二位數乘以一位數
2. 10 的倍數乘以一位數
3. 三位數乘以一位數
4. 兩步驟連續乘法
5. 兩步驟連續乘法應用題
6. 三位數中間為 0 乘一位數
7. 乘法缺位推理

## Remaining gates

1. Generate and validate all seven PatternSpecs through the shared runtime.
2. Validate the KnowledgeOperation JSON against the canonical schema.
3. Generate exact-head HTML/PDF/hash/DOM evidence.
4. Regenerate designer Excel and audit CSV.
5. Promote to `GOLDEN_CONFORMANT` and activate G3A-U06 only after all gates pass.

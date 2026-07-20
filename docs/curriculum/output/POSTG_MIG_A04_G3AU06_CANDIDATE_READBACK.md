# POSTG-MIG-A04 G3A-U06 Candidate Readback

```text
PROGRAM_ID = POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1
TASK_ID = POSTG-MIG-A04_G3A_U06_GoldenConformanceAndKnowledgeOperationMigration
SOURCE_ID = g3a_u06_3a06
UNIT = 3A-U06 二位數除以一位數
STATUS = A04_EFFECTIVE_SELECTOR_REGISTERED_PENDING_EXACT_HEAD_EVIDENCE
```

## Authoritative candidate scope

```text
KnowledgePoints = 6
OperationModels = 6
PatternGroups = 6
PatternSpecs = 6
numeric coverage = COMPLETE
application coverage = COMPLETE
new capability expansion = false
new unit-specific runtime = false
```

The effective selector exposes:

1. 二位數除以一位數整除
2. 整除檢查
3. 二位數除以一位數有餘數
4. 包含除：分裝
5. 等分除：平分
6. 奇偶數條件判斷

Quotative packaging and partitive equal-sharing remain separate semantic models even though both use division.

## Remaining gates

1. Generate and validate all six PatternSpecs through the shared runtime.
2. Validate the KnowledgeOperation JSON against the canonical schema.
3. Generate exact-head HTML/PDF/hash/DOM evidence.
4. Regenerate designer Excel and audit CSV.
5. Promote to `GOLDEN_CONFORMANT` and activate G3B-U01 only after all gates pass.

# POSTG-MIG-A04 G3A-U06 Candidate Readback

```text
PROGRAM_ID = POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1
TASK_ID = POSTG-MIG-A04_G3A_U06_GoldenConformanceAndKnowledgeOperationMigration
SOURCE_ID = g3a_u06_3a06
UNIT = 3A-U06 二位數除以一位數
STATUS = SUPERSEDED_BY_AUTHORITATIVE_CLOSEOUT
```

## Accepted candidate scope

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

## Closeout authority

The candidate gates passed and this readback is retained as historical input evidence. The current authoritative results are:

- `docs/curriculum/output/POSTG_MIG_A04_G3AU06_D0_READBACK.md`
- `docs/curriculum/output/postg/a04-g3a-u06/POSTG_MIG_A04_G3AU06_RUNTIME_READBACK.json`
- `data/project/milestones/POSTG-MIG-A04.claim.json`

```text
ConformanceState = GOLDEN_CONFORMANT
KnowledgeRegistryState = VALIDATED_COMPLETE
QueueTransition = G3A-U06 COMPLETE; G3B-U01 ACTIVE
GOAL_DISTANCE = D9
```

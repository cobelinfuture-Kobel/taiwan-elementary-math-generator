# POSTG-MIG-A02 G3A-U02 Candidate Readback

```text
PROGRAM_ID = POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1
TASK_ID = POSTG-MIG-A02_G3A_U02_GoldenConformanceAndKnowledgeOperationMigration
SOURCE_ID = g3a_u02_3a02
UNIT = 3A-U02 四位數的加減
STATUS = A02_EFFECTIVE_SELECTOR_REGISTERED_PENDING_EXACT_HEAD_EVIDENCE
```

## Authoritative candidate scope

```text
production-visible KnowledgePoints = 10
operation models = 10
visible PatternGroups = 10
bound PatternSpecs = 10
numeric coverage = COMPLETE
application coverage = COMPLETE
new capability expansion = false
new unit-specific runtime = false
```

The initial two-row inventory represented only the base A-class registry. The effective composed selector is authoritative for runtime migration and currently exposes ten capabilities:

1. 四位數加法多次進位
2. 四位數減法多次退位
3. 整千估算
4. 加減應用題估算
5. 加法缺位填空
6. 減法缺位填空
7. 加法等式缺位填空
8. 減法等式缺位填空
9. 減法中間缺位填空
10. 連續退位中間有0

All ten rows use the formal source ID `g3a_u02_3a02`. The temporary bridge source is not part of the effective selector or the migration descriptor.

## Remaining gates

1. Validate all ten capabilities through focused generator and validator regressions.
2. Validate the KnowledgeOperation JSON against the canonical schema.
3. Generate exact-head 40-question HTML/PDF/hash/DOM evidence.
4. Regenerate the designer Excel and audit CSV from authoritative JSON.
5. Promote to `GOLDEN_CONFORMANT` and advance G3A-U03 only after all gates pass.

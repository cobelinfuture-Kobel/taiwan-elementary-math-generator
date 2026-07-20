# POSTG-MIG-A02 G3A-U02 Candidate Readback

```text
PROGRAM_ID = POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1
TASK_ID = POSTG-MIG-A02_G3A_U02_GoldenConformanceAndKnowledgeOperationMigration
SOURCE_ID = g3a_u02_3a02
UNIT = 3A-U02 四位數的加減
STATUS = A02_KNOWLEDGE_OPERATION_CANDIDATE
```

## Authoritative candidate scope

```text
production-visible KnowledgePoints = 2
operation models = 2
visible PatternGroups = 2
bound PatternSpecs = 2
application expansion = false
estimation expansion = false
new unit-specific runtime = false
```

The candidate registers only the current A-class shared-runtime capability:

- `kp_g3a_u02_add_multi_carry` → `ps_g3a_u02_4digit_add_multi_carry`
- `kp_g3a_u02_sub_multi_borrow` → `ps_g3a_u02_4digit_sub_multi_borrow`

The following source rows remain explicitly excluded from this migration because their required runtime capability is outside A02 scope:

- nearest-thousand estimation
- estimation word problem

## Remaining gates

1. Register G3A-U02 in the shared post-Golden adapter.
2. Validate the KnowledgeOperation JSON against the canonical schema.
3. Run focused generator/validator mutation tests.
4. Generate exact-head 40-question HTML/PDF/hash/DOM evidence.
5. Promote the unit to `GOLDEN_CONFORMANT` and advance G3A-U03 only after all gates pass.

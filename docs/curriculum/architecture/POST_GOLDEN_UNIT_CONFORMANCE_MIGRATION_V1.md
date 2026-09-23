# POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1

## Ultimate goal

Migrate the twelve public units that are not yet Golden-conformant through the existing
`G5AU08_GOLDEN_V1` shared runtime until all fifteen public units are:

```text
GOLDEN_CONFORMANT = 15
IN_PROGRESS_GOLDEN_NATIVE = 0
LEGACY_COMPLETED_PENDING_GOLDEN_VALIDATION = 0
ACTIVE_SOURCE_ID = NONE
PENDING_COUNT = 0
```

The program also materializes one authoritative knowledge-operation JSON for every unit.
The unit JSON owns knowledge points, canonical operation models, operand and unknown roles,
number constraints, answer types, validation invariants, and existing-question bindings.

## Fixed task order

| Order | Task |
|---:|---|
| A00 | `POSTG-MIG-A00_ProgramContractFleetBaselineAndKnowledgeRegistryFoundation` |
| A01 | `POSTG-MIG-A01_G3A_U01_GoldenConformanceAndKnowledgeOperationMigration` |
| A02 | `POSTG-MIG-A02_G3A_U02_GoldenConformanceAndKnowledgeOperationMigration` |
| A03 | `POSTG-MIG-A03_G3A_U03_GoldenConformanceAndKnowledgeOperationMigration` |
| A04 | `POSTG-MIG-A04_G3A_U06_GoldenConformanceAndKnowledgeOperationMigration` |
| A05 | `POSTG-MIG-A05_G3B_U01_GoldenConformanceAndKnowledgeOperationMigration` |
| A06 | `POSTG-MIG-A06_G3B_U08_GoldenConformanceAndKnowledgeOperationMigration` |
| A07 | `POSTG-MIG-A07_G4A_U01_GoldenConformanceAndKnowledgeOperationMigration` |
| A08 | `POSTG-MIG-A08_G4A_U02_GoldenConformanceAndKnowledgeOperationMigration` |
| A09 | `POSTG-MIG-A09_G4A_U04_GoldenConformanceAndKnowledgeOperationMigration` |
| A10 | `POSTG-MIG-A10_G4A_U08_GoldenConformanceAndKnowledgeOperationMigration` |
| A11 | `POSTG-MIG-A11_G4B_U01_GoldenConformanceAndKnowledgeOperationMigration` |
| A12 | `POSTG-MIG-A12_G4B_U04_GoldenConformanceAndKnowledgeOperationMigration` |
| A13 | `POSTG-MIG-A13_ProgramControllerAndKnowledgeRegistryCloseout` |

The order inherits the deterministic GS06 queue. Only one migration unit may be active.

## Knowledge authority

```text
Unit JSON
  = authoritative mathematical and binding data

Master Index JSON
  = fleet presence, status, task assignment and artifact locations

Generated XLSX
  = designer review view

Generated CSV
  = Git/audit summary view
```

Excel and CSV are generated from JSON. Manual dual maintenance is forbidden.

The generated workbook has these sheets:

1. `Unit_Index`
2. `Knowledge_Point_Map`
3. `Operation_Models`
4. `Number_Constraints`
5. `Question_Coverage`
6. `Migration_Review`

## Existing Golden anchors

The three existing Golden-conformant units remain conformance anchors and do not re-enter
the migration state machine:

- `g3b_u04_3b04`
- `g5a_u08_5a08`
- `g5a_u02_5a02`

Their new knowledge-operation JSON backfill is assigned to A01 because A01 is the first task
that consumes all three as cross-unit regression anchors. This backfill must not change their
conformance or production eligibility.

## Per-unit fixed flow

```text
Unit baseline
→ Knowledge-point inventory
→ Canonical operation-model registry
→ Number/answer contracts
→ Unit JSON schema pass
→ Existing-question bindings
→ Golden contract
→ Shared generator/validator/renderer/workflow
→ Production HTML/PDF
→ Hash and runtime readback
→ Golden-anchor regression
→ Master index/XLSX/CSV regeneration
→ Controller transition to GOLDEN_CONFORMANT
```

## A00 boundary

A00 approves and machine-defines the program. It does not:

- migrate a unit;
- change production eligibility;
- change public output;
- expand application-question coverage;
- add scenario families;
- alter worksheet labels or layout;
- add a unit-specific generator, validator, renderer, or workflow.

Application-question expansion and compact student-page layout remain in the separate
`POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1` program.

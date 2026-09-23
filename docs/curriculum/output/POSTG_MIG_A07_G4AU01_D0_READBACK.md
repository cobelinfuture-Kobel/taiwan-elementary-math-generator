# POSTG-MIG-A07 G4A-U01 D0 Readback

```text
PROGRAM_ID = POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1
TASK_ID = POSTG-MIG-A07_G4A_U01_GoldenConformanceAndKnowledgeOperationMigration
SOURCE_ID = g4a_u01_4a01
STATUS = PASS_GOLDEN_CONFORMANT_PENDING_MERGE
EVIDENCE_LEVEL = E5_PRODUCTION_ADMITTED
```

## Authority closed

- KnowledgePoints: 18
- Canonical Operation Models: 18
- PatternGroups: 18
- PatternSpecs: 18
- KnowledgeOperation schema: PASS
- Unmapped KnowledgePoints: 0
- Unmapped existing questions: 0
- Conflicting operation models: 0

Application capability remains explicit: direct place-value and comparison skills are not forced into stories; the two existing application KnowledgePoints remain required, and digit arrangement remains optional/context-capable.

## Common-validator blocker removed

The shared validator now supports `g4aU01DigitArrangementMaxMin` and reconstructs the witness instead of merely accepting the kind:

- five valid unique digits;
- descending maximum;
- ascending minimum with zero forbidden at the leading position;
- numeric versus word-problem mode;
- mode-specific unit contract;
- exact answer-text and final-answer reconstruction.

Mutation fixtures reject forged maximum/minimum values, duplicate or malformed digit sets, invalid mode/unit combinations and forged answers.

## Exact-head production evidence

Candidate head `0e1225d90b7f13b3b3bf81861f94b61b7cd5d323`, workflow run `29786997485`, artifact `8478854609`:

```text
Questions = 40
Answer-key items = 40
KnowledgePoint coverage = 18 / 18
PatternGroup coverage = 18 / 18
PatternSpec coverage = 18 / 18
Validator errors = 0
Validator warnings = 0
Question pages = 5
Answer-key pages = 7
PDF pages = 4
Canonical generator → worksheet identity parity = PASS
Internal ID leak = false
Placeholder leak = false
```

```text
HTML SHA-256 = 3dd86dab5a9e537f974bc1a5590e3608de3b4a5560aa124959657a3f1b8b7b82
PDF SHA-256  = d1f9ecfb25c632f9ef4ec517a660d5be86abde9f5a10686561a6ee2cc52a95a4
Artifact digest = sha256:1b51000c8d1419e2df5f98022c95eda963a77c1d6492d8fa9fb6af985a2c81f3
```

## Runtime lineage

```text
source-pattern-index + G4A-U01 Phase 1/3 authority
→ G4A-U01 KnowledgeOperation registry
→ shared post-Golden source-unit adapter
→ existing Phase 1 / Phase 3 runtime-fix generators
→ common Batch A validator
→ existing worksheet assembly and S60J renderer
→ HTML / PDF / hash / DOM readback
```

No new unit-specific generator, validator, renderer or workflow was added. No question, scenario, semantic definition, public layout or student-page label was changed.

## Program transition

```text
GOAL_DISTANCE_BEFORE = D7_POST_GOLDEN_MIGRATION_G3BU08_CONFORMANT_G4AU01_ACTIVE
GOAL_DISTANCE_AFTER  = D6_POST_GOLDEN_MIGRATION_G4AU01_CONFORMANT_G4AU02_ACTIVE
DISTANCE_REDUCED     = 1 unit migration
CURRENT UNIT         = g4a_u01_4a01 → GOLDEN_CONFORMANT / COMPLETE
NEXT ACTIVE UNIT     = g4a_u02_4a02 → IN_PROGRESS_GOLDEN_NATIVE / ACTIVE
REMAINING_BLOCKERS   = [final exact-head CI, PR merge]
NEXT_SHORTEST_STEP   = merge PR #299, then begin POSTG-MIG-A08
```

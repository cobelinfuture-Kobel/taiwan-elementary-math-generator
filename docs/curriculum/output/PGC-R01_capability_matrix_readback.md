# PGC-R01 Public Capability Matrix Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R01_PublicKnowledgePointCapabilityMatrix
STATUS     = PASS_FOCUSED_PENDING_FULL_REGRESSION_AND_MERGE
```

## Accepted authority

```text
PUBLIC_SOURCE_COUNT                   = 26
VISIBLE_KNOWLEDGE_POINT_COUNT         = 193
PUBLIC_SURFACE_COUNT                  = 3
VISIBLE_KP_SURFACE_ACCOUNTED          = 579 / 579
VISIBLE_KP_SURFACE_WITH_CAPABILITY    = 545
VISIBLE_KP_SURFACE_EXPLICIT_R02_GAP   = 34
CAPABILITY_ROW_COUNT                  = 1222
UNIQUE_PATTERN_GROUP_COUNT            = 246
UNIQUE_PATTERN_SPEC_COUNT             = 350
PUBLIC_UI_OPTION_ACCOUNTED            = 156 / 156
R01_BLOCKING_GAP_COUNT                = 0
R02_UI_BINDING_GAP_COUNT              = 56
R03_CAPACITY_UNVERIFIED_COUNT         = 1222
```

## Gate interpretation

R01 requires every public source, visible KnowledgePoint, public question-type option and public surface path to be accounted. A surface pair is accepted only when it has either:

1. at least one real capability row with PatternGroup, PatternSpec, generator, validator, HTML and print lineage; or
2. an explicit fail-closed downstream surface gap.

The deprecated 404 fallback does not expose profile-driven application/reasoning controls outside the static G5A-U08 block. R01 therefore does not fabricate 34 nonexistent 404 capabilities. Those selector-visible but non-configurable pairs are registered as `FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY` and assigned to PGC-R02.

## Evidence lineage

```text
CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS
→ batch-a-selector-p03f13-extension.js
→ PatternGroup / application / PBL public admissions
→ public_generation_capability_matrix.json
→ public_generation_capability_matrix.csv
→ PGC-R01_capability_gap_report.md
```

## CI sequencing note

The first full Node run observed the pre-materialization PR head: V4 tests were present while the deterministic matrix still contained the previous V3 fail-closed artifact. The dedicated PGC-R01 workflow then materialized and committed the final V4 authority. This readback commit intentionally triggers full regression again against the synchronized code and artifacts.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN
GOAL_DISTANCE_AFTER  = D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED_PENDING_FULL_CI_AND_MERGE
DISTANCE_REDUCED     = all public capability and explicit-absence paths are uniquely queryable
REMAINING_BLOCKERS   = [R01_FULL_REGRESSION_AND_MERGE, PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY]
NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding
```

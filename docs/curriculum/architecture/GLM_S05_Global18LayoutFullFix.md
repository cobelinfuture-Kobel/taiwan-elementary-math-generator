# GLM-S05 — Global 18-Layout FullFix

```text
TASK = GLM-S05_Global18LayoutFullFix
STATUS = IMPLEMENTED_PENDING_CI_AND_GAP_REPAIR
DEPENDS_ON = GLM-S04_GlobalLayoutArchitectureDesign
PUBLIC_UNIT_COUNT = 15
APPROVED_LAYOUT_COUNT = 18
FOCUSED_DOCUMENT_SCENARIOS = 270
```

## 1. Shared implementation

S05 implements the architecture as shared runtime components rather than per-unit layout patches:

```text
global public layout registry and normalizer
→ source-unit canonical adapter
→ existing generator and validator
→ global exact question-layout overlay
→ independent answer layout
→ common metadata and readback
```

The global registry owns exactly:

```text
3×1  3×2  3×3  3×4  3×5
2×1  2×2  2×3  2×4  2×5  2×6
1×1  1×2  1×3  1×4  1×5  1×6  1×7
```

Default public layout is 3×5.

## 2. State and migration

All public config state is normalized through the shared registry. Approved requests are preserved exactly. Legacy 4–6-column or over-limit row values migrate to 3×5 with explicit warning metadata. Invalid nonlegacy values block.

Classic exposes only columns 1–3. The maximum row input changes with the selected column:

```text
3 columns → 5 rows
2 columns → 6 rows
1 column  → 7 rows
```

## 3. Global exact overlay

After a source has generated and validated question display models, the overlay:

- validates the global request;
- repaginates questions with exact approved columns and rows;
- preserves question order, content, numbering and renderer classes;
- preserves answer pagination independently;
- writes requested, resolved, migration and adapter metadata;
- forbids a source profile from silently lowering approved dimensions.

## 4. Source-unit adapters

### G4B-U04

Public source-unit mode is internally adapted to all 13 promoted KnowledgePoints and all 13 promoted PatternGroups. It continues through the existing canonical router, validator, context layer and G4B renderer authority.

### G5A-U02

Public source-unit mode is internally adapted to all 18 visible KnowledgePoints and PatternGroups. It uses the existing dynamic runtime, making requested count and layout authoritative. The fixed static worksheet remains only a legacy diagnostic path.

## 5. Focused acceptance

The dedicated focused test requires:

- one runtime matrix with 18 unique layouts;
- default 3×5 and explicit legacy migration;
- complete G4B and G5A source-unit adapters;
- 15 units × 18 layouts = 270 exact source-unit documents;
- exactly 18 questions for every scenario;
- zero caps, ignored layouts or blocked scenarios;
- answer layout independent for representative generic and specialized units.

Initial CI is also the authority for identifying any remaining source-specific generation-validator inconsistency, particularly the known 4A-U01 first-difference case. Such defects are repaired without weakening validators.

## 6. Boundary

S05 does not change curriculum authority, arithmetic formulas, answer models, question wording, generic fallback or free-form AI policy. The eleven previously exact units are regression-only.

## 7. Continuation

After focused and full CI pass:

```text
GLM-S06_270ScenarioPostFixAcceptance
→ rerun all 270 HTML/PDF scenarios
→ require 270 exact documents and zero render defects
```

## 8. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_EXACT_LAYOUT_ARCHITECTURE_LOCKED_PENDING_FULLFIX
GOAL_DISTANCE_AFTER  = D1_GLOBAL_FULLFIX_IMPLEMENTED_PENDING_CI_AND_270_HTML_PDF_ACCEPTANCE
DISTANCE_REDUCED     = shared registry, adapters, exact overlay, controls and metadata implemented
REMAINING_BLOCKERS   = focused CI, source-specific gap repairs, full CI, S06-S08
NEXT_SHORT_STEP      = GLM-S05_FocusedCIAndGapRepair
STOP_REASON          = NONE
```

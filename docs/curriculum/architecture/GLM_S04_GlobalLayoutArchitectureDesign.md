# GLM-S04 — Global 18-Layout Architecture Design

```text
TASK = GLM-S04_GlobalLayoutArchitectureDesign
STATUS = DESIGN_LOCKED_PENDING_CI
DEPENDS_ON = GLM-S00 + GLM-S01 + GLM-S02 + GLM-S03
IMPLEMENTATION = GLM-S05_Global18LayoutFullFix
```

## 1. Design conclusion

The measured problem is not a general rendering failure. GLM-S03 proved that all 251 currently generated source-unit outputs are visually contained and printable across 1,531 PDF pages. The remaining defect is fragmented ownership of the requested question-page layout:

- eleven units already preserve all 18 requests;
- 4A-U01 and 4A-U02 silently apply source-specific row caps;
- G4B-U04 rejects the public `sourceUnit` route even though its canonical route is production-ready;
- G5A-U02 returns a fixed static worksheet and ignores question count and layout.

Therefore S05 must add one global exact-layout architecture while preserving current renderer and curriculum behavior.

## 2. Target pipeline

```text
public controls and query state
→ source-unit plan adapter
→ existing source generator and blocking validator
→ existing question display projection
→ global exact question-layout overlay
→ independent answer-layout resolution
→ truthful layout metadata/readback
→ existing HTML renderer and print pipeline
```

The global overlay is downstream of content generation. It may repaginate question display models but may not regenerate, rewrite or reinterpret questions.

## 3. Single approved-layout authority

`GLM_S00_PublicCompletedUnit18LayoutContract.json` remains the sole public layout registry:

```text
3×1  3×2  3×3  3×4  3×5
2×1  2×2  2×3  2×4  2×5  2×6
1×1  1×2  1×3  1×4  1×5  1×6  1×7
```

No unit may own a different public allowlist. Source profiles may control typography, card classes, answer density and specialized rendering, but they may not reduce an approved question-page request.

## 4. Public controls and migration

The Classic controls must expose only:

```text
columns = 1, 2, 3
rows depend on columns:
3 columns → 1–5
2 columns → 1–6
1 column  → 1–7
```

Default:

```text
3 columns × 5 rows
```

Legacy 4–6-column or over-limit row values are not production-approved. A stale query or saved state may migrate to 3×5 only with an explicit migration warning and metadata. Silent migration is forbidden. Invalid nonlegacy values block generation with a public validation message.

The approved request contract is exact:

```text
requestedQuestionLayout == resolvedQuestionLayout
layoutExact = true
```

## 5. Global exact question-layout overlay

The overlay applies to all 15 public units after question display models exist and before final pagination.

Responsibilities:

- validate the requested layout against the global registry;
- preserve exact approved columns and rows;
- repaginate question display models;
- preserve question order, content and numbering;
- preserve source renderer classes and typography;
- preserve current question-only behavior where already approved;
- emit common layout metadata and preview readback;
- leave answer pagination independent.

The overlay is idempotent. Applying it to one of the eleven exact units must not alter generated questions, answers, PatternSpec routing, question order or public wording.

## 6. Source-unit adapters

### G4B-U04

Public `sourceUnit` remains the user-facing mode. Internally, the adapter resolves it to:

```text
selectionMode = mixedKnowledgePointsSameUnit
selected KnowledgePoints = all promoted G4B-U04 KnowledgePoints
selected PatternGroups = all promoted G4B-U04 PatternGroups
questionMode = mixed
```

The adapter must delegate the existing canonical router, validator, context layer and G4B layout resolver. It may not create a generic fallback or an alternate formula path.

The already accepted G4B R4 matrix, inverse-long profile, prompt deduplication and production PDF gates remain authoritative.

### G5A-U02

Public `sourceUnit` must adapt to the existing dynamic all-promoted-KnowledgePoint/all-PatternGroup runtime so that:

- requested question count is authoritative;
- requested approved layout is authoritative;
- current compact, reasoning and contextual content remains validator-backed;
- the fixed 22-question static worksheet becomes legacy diagnostic evidence, not the production source-unit result.

No generic fallback is allowed.

## 7. 4A-U01 and 4A-U02 caps

The global overlay supersedes existing source-level question-page row caps for approved requests:

```text
4A-U01: current max rows 4 → approved global ranges
4A-U02: current max rows 5 → approved global ranges
```

This is not a deletion of source renderer safety. Typography and card presentation remain source-owned. S05 must prove that the newly exact layouts retain the S03 zero-overflow and zero-overlap result.

## 8. Separate 4A-U01 generation repair

The 4A-U01 deterministic 1×6 baseline exposed a first-difference generator/validator inconsistency. This is separate from layout resolution.

S05 must repair:

```text
batch_a_g4a_u01_first_difference_missing
batch_a_g4a_u01_first_difference_invalid
batch_a_answer_incorrect
```

The repair may align generated evidence and validator expectations, but may not weaken the validator or change curriculum semantics.

## 9. Answer-layout independence

The global 18-layout matrix applies only to question pages.

Answer pages continue to use current safe profile authority:

- answer columns and rows are resolved independently;
- changing question layout cannot force answer density;
- answer numbering remains consistent with question numbering;
- answer-key-off output contains zero answer cards and pages.

## 10. Common metadata

Every successful public worksheet must expose:

```text
contractVersion
requestedQuestionLayout
resolvedQuestionLayout
resolvedAnswerLayout
resolutionAuthority
authorizedLayoutId
legacyMigrationApplied
sourceUnitAdapterApplied
layoutExact
```

The same values must appear consistently in WorksheetDocument, config snapshot, summary, public controls and preview readback. Readback is hidden from printed student output.

## 11. Regression-only units

These eleven units require no document-layer repair:

```text
3A-U01  3A-U02  3A-U03  3A-U06
3B-U01  3B-U04  3B-U08
4A-U04  4A-U08
4B-U01
5A-U08
```

S05 may route them through the global overlay, but their question semantics and existing exact outputs must remain unchanged. Their primary purpose in S06 is regression protection.

## 12. FullFix boundary

S05 is a FullFix, not four unrelated patches.

Required shared components:

1. global approved-layout registry runtime projection;
2. public layout normalizer and dependent-control model;
3. source-unit adapter layer;
4. global exact question-layout overlay;
5. common metadata/readback projection;
6. focused gap-unit repairs;
7. global and unit-level tests.

Forbidden:

- per-unit duplicate layout matrices;
- silently increasing current caps without global authority;
- special-casing only 3×5, 2×6 and 1×7;
- bypassing canonical generators or validators;
- weakening 4A-U01 validation;
- retaining G5A-U02 static output as the production source-unit path;
- changing formulas, answer models or curriculum authority;
- minimal fixes.

## 13. S05 implementation order

```text
S05-A  runtime global layout registry and normalizer
S05-B  common exact-layout overlay and metadata
S05-C  Classic controls and query-state migration
S05-D  G4B-U04 source-unit canonical adapter
S05-E  G5A-U02 dynamic source-unit adapter
S05-F  4A-U01 / 4A-U02 cap supersession
S05-G  4A-U01 generation-validator consistency repair
S05-H  focused tests, full CI and pre-S06 evidence
```

Implementation remains one S05 milestone. The substeps exist to control sequencing and evidence, not to permit partial production acceptance.

## 14. Acceptance before S06

S05 focused acceptance requires:

- all 15 source-unit plans resolve all 18 layouts exactly at the document layer;
- G4B-U04 source-unit mode generates through canonical authority;
- G5A-U02 honors requested count and layout dynamically;
- 4A-U01 first-difference output passes its blocking validator;
- answer layout remains independent;
- legacy unapproved values produce explicit migration evidence;
- the eleven exact units retain semantic output and routing.

S06 then reruns the full 270 HTML/PDF matrix. S07 adds the 90 answer-boundary scenarios. S08 verifies deployed Classic UI, query replay, source switching and print.

## 15. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_270_HTML_PDF_BASELINE_CAPTURED_PENDING_ARCHITECTURE
GOAL_DISTANCE_AFTER  = D1_GLOBAL_EXACT_LAYOUT_ARCHITECTURE_LOCKED_PENDING_FULLFIX
DISTANCE_REDUCED     = one shared pipeline and four bounded repair surfaces defined from measured evidence
REMAINING_BLOCKERS   = S05 implementation, S06 270 acceptance, S07 answer stress, S08 deployed closeout
NEXT_SHORT_STEP      = GLM-S05_Global18LayoutFullFix
STOP_REASON          = NONE
```

# S22F G3-to-G6 Curriculum Matrix Artifact Creation — QA Readback

## 1. Files Created

| # | Path | Type |
|---|---|---|
| 1 | docs/curriculum/mapping/S22D_G3toG6_CurriculumNodeCandidateMatrix.md | Markdown matrix |
| 2 | docs/curriculum/registry/curriculum_node_candidates.g3_to_g6.json | Registry JSON |
| 3 | docs/curriculum/registry/tag_registry.bootstrap.json | Registry JSON |
| 4 | docs/curriculum/registry/canonical_skills.bootstrap.json | Registry JSON |
| 5 | docs/curriculum/registry/candidate_mapping_rules.bootstrap.json | Registry JSON |
| 6 | docs/curriculum/schemas/curriculum_node_candidate.schema.json | JSON Schema |
| 7 | docs/curriculum/schemas/tag_registry.schema.json | JSON Schema |
| 8 | docs/curriculum/schemas/canonical_skill.schema.json | JSON Schema |
| 9 | docs/curriculum/schemas/candidate_mapping_rule.schema.json | JSON Schema |
| 10 | docs/curriculum/qa/S22F_G3toG6_CurriculumMatrixArtifactCreation_Readback.md | QA readback |

## 2. Files Intentionally Not Modified

- src/ (all files untouched)
- site/ (all files untouched)
- tests/ (all files untouched)
- package.json (untouched)
- package-lock.json (untouched)
- docs/curriculum/sources/ (untouched)
- PDF files (untouched)
- Existing S21A-S21G files in mapping/ (untouched)
- tools/ directory (no permanent changes; temp validation script deleted)

## 3. JSON Parse Status

All 4 registry JSON files and all 4 schema JSON files parse successfully.

| File | Parse |
|---|---|
| curriculum_node_candidates.g3_to_g6.json | OK |
| tag_registry.bootstrap.json | OK |
| canonical_skills.bootstrap.json | OK |
| candidate_mapping_rules.bootstrap.json | OK |
| curriculum_node_candidate.schema.json | OK |
| tag_registry.schema.json | OK |
| canonical_skill.schema.json | OK |
| candidate_mapping_rule.schema.json | OK |

## 4. Schema Validation Status

Schemas written to JSON Schema draft 2020-12.
All schemas parse as valid JSON.
Structural cross-reference validation performed programmatically (see Section 5-6).

## 5. Node Count

| Metric | Value | Status |
|---|---|---|
| total | 79 | OK |
| g3a | 9 | OK |
| g3b | 10 | OK |
| g4a | 10 | OK |
| g4b | 10 | OK |
| g5a | 14 | OK |
| g5b | 11 | OK |
| g6a | 9 | OK |
| g6b | 6 | OK |

## 6. Priority Counts (Computed from JSON)

| Priority | Count |
|---|---|
| v1_priority | 13 |
| future_priority | 56 |
| planned_only | 10 |
| Total | 79 |

## 7. S22F Priority Count Correction

S22F_PRIORITY_COUNT_CORRECTION = NOT_NEEDED

The row-level count (v1=13, future=56, planned=10) matches the expected counts.
The JSON prioritySummary field reflects these exact values.
The markdown matrix Priority Summary section documents these counts.

## 8. Confirmation

| Check | Result |
|---|---|
| No productionRuntime=true in any registry artifact | CONFIRMED |
| No sourceBacked anywhere | CONFIRMED |
| No answerStatus=verified anywhere | CONFIRMED |
| No ExampleItem anywhere | CONFIRMED |
| No PatternSpec anywhere | CONFIRMED |
| No OCR artifacts anywhere | CONFIRMED |
| No src/ modifications | CONFIRMED |
| No site/ modifications | CONFIRMED |
| No tests/ modifications | CONFIRMED |
| No package.json modifications | CONFIRMED |
| All extractionStatus = shallow_candidate | CONFIRMED |
| All sourceAuthorityStatus = metadata_backed | CONFIRMED |
| All IDs unique | CONFIRMED |
| All canonicalSkillTags exist in canonical_skills.bootstrap.json | CONFIRMED (92 skills registered) |
| All supportStatusTags exist in tag_registry.bootstrap.json | CONFIRMED |
| All questionKindTags exist in tag_registry.bootstrap.json (by tagId or alias) | CONFIRMED |
| V1 priority node lock (13 nodes) | CONFIRMED |

## 9. G5 sourceSubunit Preservation

| nodeId | expected sourceSubunit | actual | Status |
|---|---|---|---|
| g5a_u02_5a02a | a | a | OK |
| g5a_u02_5a02a1 | a1 | a1 | OK |
| g5a_u03_5a03a | a | a | OK |
| g5a_u03_5a03a1 | a1 | a1 | OK |
| g5a_u05_5a05a | a | a | OK |
| g5a_u05_5a05a1 | a1 | a1 | OK |
| g5a_u10_5a10a | a | a | OK |
| g5a_u10_5a10a1 | a1 | a1 | OK |
| g5b_u05_5b05a | a | a | OK |
| g5b_u10_5b10a | a | a | OK |

All G5 subunit values preserved correctly.

## 10. Production Boundary

- All registry files: productionRuntime: false
- All schema files: productionRuntime: { const: false } enforced
- No production code paths added or modified
- Temporary validation script deleted after run

## 11. Final Status

**S22F_G3toG6_CurriculumMatrixArtifactCreation = PASS**

All 10 artifact files created.
All validation checks passed.
No forbidden content detected.
Production boundary respected.

## S22F2 Patch Applied

S22F2 canonicalized domainTags and questionKindTags to official TagRegistry tagIds.
See S22F2_G3toG6_TagReferenceCanonicalizationPatch_Readback.md for details.

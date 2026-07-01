# S22F3 G3-to-G6 SourceId Normalization Patch — QA Readback

## 1. Preflight Result

| Check | Status |
|---|---|
| Repo root | math-worksheet-generator |
| Git status | Clean (only untracked curriculum artifacts, no production files dirty) |
| Target files exist | Yes (all 3 confirmed) |
| src/site/tests/package dirty | No |

## 2. Files Modified

| File | Change |
|---|---|
| docs/curriculum/registry/curriculum_node_candidates.g3_to_g6.json | sourceId normalized to equal curriculumNodeCandidateId (79 changes) |
| docs/curriculum/mapping/S22D_G3toG6_CurriculumNodeCandidateMatrix.md | S22F3 SourceId Normalization Note added |
| docs/curriculum/schemas/curriculum_node_candidate.schema.json | sourceId description, pattern regex, and examples tightened |

## 3. Files Created

| File | Type |
|---|---|
| docs/curriculum/qa/S22F3_G3toG6_SourceIdNormalizationPatch_Readback.md | QA readback |

## 4. Files Intentionally Not Modified

- src/ (all files untouched)
- site/ (all files untouched)
- tests/ (all files untouched)
- package.json (untouched)
- package-lock.json (untouched)
- docs/curriculum/sources/ (untouched)
- PDF files (untouched)
- S21A-S21G files (untouched)
- docs/curriculum/registry/tag_registry.bootstrap.json (not changed)
- docs/curriculum/registry/canonical_skills.bootstrap.json (not changed)
- docs/curriculum/registry/candidate_mapping_rules.bootstrap.json (not changed)
- docs/curriculum/schemas/tag_registry.schema.json (not changed)
- docs/curriculum/schemas/canonical_skill.schema.json (not changed)
- docs/curriculum/schemas/candidate_mapping_rule.schema.json (not changed)
- docs/curriculum/qa/S22F_G3toG6_CurriculumMatrixArtifactCreation_Readback.md (not changed)
- docs/curriculum/qa/S22F2_G3toG6_TagReferenceCanonicalizationPatch_Readback.md (not changed)

## 5. sourceId Normalization Summary

| Metric | Value |
|---|---|
| Total nodes | 79 |
| sourceId changed | 79 (all nodes) |
| Before | sourceId = short code (e.g., 3a01, 5a02a, 6b06) |
| After | sourceId = curriculumNodeCandidateId (e.g., g3a_u01_3a01, g5a_u02_5a02a, g6b_u06_6b06) |
| sourceCode | Unchanged (remains short code) |

## 6. JSON Validation Result

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

## 7. Node Count Result

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

## 8. Priority Count Result

| Priority | Count | Status |
|---|---|---|
| v1_priority | 13 | OK |
| future_priority | 56 | OK |
| planned_only | 10 | OK |

## 9. sourceId Equality Validation Result

- All 79 nodes: sourceId == curriculumNodeCandidateId ✓
- 0 mismatches ✓

## 10. sourceId Regex Validation Result

Pattern: `^(g[3-6][ab]_u\d{2}_[3-6][ab]\d{2}(a1|a)?)$`

- All 79 sourceId values match regex ✓
- 0 failures ✓

## 11. Tag Stability Result

| Tag Type | Bad References | Status |
|---|---|---|
| domainTags | 0 | OK |
| questionKindTags | 0 | OK |
| supportStatusTags | 0 | OK |
| canonicalSkillTags | 0 | OK |

All canonical tag references from S22F2 preserved ✓

## 12. G5 sourceSubunit Preservation Result

| nodeId | expected | Status |
|---|---|---|
| g5a_u02_5a02a | a | OK |
| g5a_u02_5a02a1 | a1 | OK |
| g5a_u03_5a03a | a | OK |
| g5a_u03_5a03a1 | a1 | OK |
| g5a_u05_5a05a | a | OK |
| g5a_u05_5a05a1 | a1 | OK |
| g5a_u10_5a10a | a | OK |
| g5a_u10_5a10a1 | a1 | OK |
| g5b_u05_5b05a | a | OK |
| g5b_u10_5b10a | a | OK |

All G5 subunit values preserved correctly ✓

## 13. Production Boundary Result

| Check | Status |
|---|---|
| productionRuntime = false | OK |
| extractionStatus = shallow_candidate | OK |
| sourceAuthorityStatus = metadata_backed | OK |
| No sourceBacked true | OK |
| No answerStatus verified | OK |
| No ExampleItem | OK |
| No PatternSpec | OK |
| No OCR artifacts | OK |
| No src/ modifications | OK |
| No site/ modifications | OK |
| No tests/ modifications | OK |
| No package.json modifications | OK |

## 14. Final Status

**S22F3_G3toG6_SourceIdNormalizationPatch = PASS**

All 79 sourceId values successfully normalized to full-form curriculumNodeCandidateId.
All validation checks passed.
No data loss. Tag references preserved. Production boundary respected.
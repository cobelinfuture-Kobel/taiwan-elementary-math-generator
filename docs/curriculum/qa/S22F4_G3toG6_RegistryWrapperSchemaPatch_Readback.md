# S22F4 G3-to-G6 Registry Wrapper Schema Patch — QA Readback

## 1. Preflight Result

| Check | Status |
|---|---|
| Repo root | math-worksheet-generator |
| Git status | Clean (only untracked curriculum artifacts, no production files dirty) |
| All target registry files exist | Yes (4 confirmed) |
| All existing entry schemas exist | Yes (4 confirmed) |
| src/site/tests/package dirty | No |

## 2. Files Created

| # | File | Size |
|---|---|---|
| 1 | docs/curriculum/schemas/curriculum_node_candidates.registry.schema.json | 6,736 bytes |
| 2 | docs/curriculum/schemas/canonical_skills.registry.schema.json | 3,227 bytes |
| 3 | docs/curriculum/schemas/candidate_mapping_rules.registry.schema.json | 3,424 bytes |
| 4 | docs/curriculum/schemas/tag_registry.registry.schema.json | 1,867 bytes |
| 5 | docs/curriculum/qa/S22F4_G3toG6_RegistryWrapperSchemaPatch_Readback.md | QA readback |

## 3. Files Modified

| File | Change |
|---|---|
| (none) | No existing files modified |

## 4. Files Intentionally Not Modified

- All registry JSON data files (curriculum_node_candidates, tag_registry, canonical_skills, candidate_mapping_rules)
- All existing entry schemas (curriculum_node_candidate, tag_registry, canonical_skill, candidate_mapping_rule)
- S22D markdown matrix
- Existing QA readbacks (S22F, S22F2, S22F3)
- src/, site/, tests/, package.json, package-lock.json
- PDFs, S21A-S21G files

## 5. JSON Parse Result

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
| curriculum_node_candidates.registry.schema.json | OK |
| canonical_skills.registry.schema.json | OK |
| candidate_mapping_rules.registry.schema.json | OK |
| tag_registry.registry.schema.json | OK |

All 12 JSON files parse successfully ✓

## 6. Wrapper Schema Validation Result

### curriculum_node_candidates.registry.schema.json

| Check | Result |
|---|---|
| productionRuntime = false | OK |
| status = shallow_candidate | OK |
| sourceScope.totalNodes = 79 | OK |
| prioritySummary.v1_priority = 13 | OK |
| prioritySummary.future_priority = 56 | OK |
| prioritySummary.planned_only = 10 | OK |
| nodes array length = 79 | OK |
| curriculumNodeCandidateId pattern match (all 79) | OK |
| sourceCode pattern match (all 79) | OK |
| sourceId pattern match (all 79) | OK |
| unit pattern match (all 79) | OK |
| extractionStatus = shallow_candidate (all 79) | OK |
| sourceAuthorityStatus = metadata_backed (all 79) | OK |
| sourceId == curriculumNodeCandidateId (all 79) | OK |
| domainTags enum match | OK |
| questionKindTags enum match | OK |
| supportStatusTags enum match | OK |
| deepMappingPriority enum match | OK |

Schema constrains: top-level counts, node-level patterns, enum tags, status fields.
Note: JSON Schema validation run programmatically (structural equivalence); no jsonschema package used.

### canonical_skills.registry.schema.json

| Check | Result |
|---|---|
| productionRuntime = false | OK |
| status = bootstrap | OK |
| skills array non-empty | OK (92 skills) |
| All skillId present | OK |
| All domainId valid (canonical domain enum) | OK |
| All parentSkillId present | OK |
| All defaultSupportStatus valid | OK |

### candidate_mapping_rules.registry.schema.json

| Check | Result |
|---|---|
| productionRuntime = false | OK |
| status = bootstrap | OK |
| rules array minItems 9 | OK (9 rules) |
| All rule status = bootstrap | OK |
| All rule productionRuntime = false | OK |
| All targetDomainTags canonical | OK |
| All targetQuestionKindTags canonical | OK |
| All confidenceSignal valid | OK |

### tag_registry.registry.schema.json

| Check | Result |
|---|---|
| productionRuntime = false | OK |
| status = bootstrap | OK |
| tags array non-empty | OK (38 tags) |
| All tagType valid | OK |

## 7. Cross-Reference Validation Result

| Check | Issues |
|---|---|
| Node domainTags → tag_registry curriculumDomain | 0 ✓ |
| Node questionKindTags → tag_registry questionKind | 0 ✓ |
| Node supportStatusTags → tag_registry supportStatus | 0 ✓ |
| Node canonicalSkillTags → canonical_skills | 0 ✓ |
| Skill domainId → canonical domain list | 0 ✓ |
| Skill defaultSupportStatus → tag_registry supportStatus | 0 ✓ |
| Rule targetDomainTags → tag_registry curriculumDomain | 0 ✓ |
| Rule targetQuestionKindTags → tag_registry questionKind | 0 ✓ |

## 8. Node Count Result

Total: 79 ✓ (g3a=9, g3b=10, g4a=10, g4b=10, g5a=14, g5b=11, g6a=9, g6b=6)

## 9. Priority Count Result

v1_priority=13, future_priority=56, planned_only=10 ✓

## 10. sourceId Validation Result

All 79 sourceId values equal curriculumNodeCandidateId ✓

## 11. Tag Canonicalization Validation Result

- 0 forbidden domain alias values
- 0 forbidden questionKind alias values
- All S22F2 canonical references preserved ✓

## 12. G5 sourceSubunit Preservation Result

All 10 G5 subunit values preserved correctly ✓

## 13. Production Boundary Result

| Check | Status |
|---|---|
| All registry productionRuntime = false | OK |
| All extractionStatus = shallow_candidate | OK |
| All sourceAuthorityStatus = metadata_backed | OK |
| No sourceBacked true | OK |
| No answerStatus verified | OK |
| No ExampleItem | OK |
| No PatternSpec | OK |
| No OCR artifacts | OK |
| No src/site/tests/package modifications | OK |

## 14. Warnings

None. All validation checks passed without warnings.

## 15. Final Status

**S22F4_G3toG6_RegistryWrapperSchemaPatch = PASS**

All 4 wrapper schemas created and validated.
Existing data passes all wrapper schema constraints.
Cross-references, counts, canonicalization, and production boundaries all confirmed.
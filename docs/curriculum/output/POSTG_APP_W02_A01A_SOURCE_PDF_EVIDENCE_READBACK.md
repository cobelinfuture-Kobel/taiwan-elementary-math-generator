# POSTG-APP W02-A01A Source PDF Evidence Readback

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-W02-A01A_13SourceNodePdfEvidenceInventoryAndRenderabilityVerification
STATUS = PASS_E3_SHADOW_RUNTIME_INTEGRATED_PENDING_CI_AND_MERGE
```

## Evidence result

```text
SOURCE_NODE_COUNT = 13
SOURCE_PDF_REFERENCE_COUNT = 13
UNIQUE_PDF_CONTENT_COUNT = 12
TOTAL_PAGE_COUNT = 31
TEXT_LAYER_AVAILABLE_COUNT = 13
FIRST_PAGE_RENDER_AVAILABLE_COUNT = 13
DUPLICATE_CONTENT_GROUP_COUNT = 1
OCR_USED = false
PRIVATE_PDF_COPIED_TO_REPOSITORY = false
```

Each private source PDF was downloaded from its exact Drive file identity, SHA-256 hashed, page-counted, checked with `pdftotext -layout`, and rendered on the first page with Poppler. The repository stores only evidence references and verification facts; it does not copy private PDF bytes.

## Deduplication result

```text
SHARED_SHA256 = 5ba57aff6a973bd1a8df63791155df7b15fe25ec2b546fc94fb2d8a8323070b3
SOURCE_NODES = [g4a_u06_4a06, g4b_u03_4b03]
POLICY = PARSE_ONCE_PROJECT_TO_SEPARATE_SOURCE_NODES
```

The two source nodes point to byte-identical「假分數與帶分數」evidence. A01B must parse the evidence once but still generate separate source-node-specific KnowledgeOperation records. It must not count this as two independent curriculum sources.

## Claim boundary

```text
KNOWLEDGE_POINT_COUNT_CLAIMED = 0
CANONICAL_OPERATION_MODEL_COUNT_CLAIMED = 0
KP_APPLICATION_CLASSIFICATION_COMPLETE = false
STORY_TEMPLATE_COUNT_CLAIMED = 0
WORKSHEET_OUTPUT = false
PRODUCTION_ADMISSION_ALLOWED = false
```

A01A proves that the source evidence is available and operable. It does not yet interpret page-level mathematics into KnowledgePoints.

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D4_SOURCE_METADATA_ONLY
GOAL_DISTANCE_AFTER = D4_HASH_LOCKED_RENDERABLE_SOURCE_EVIDENCE_READY
DISTANCE_REDUCED = 13 source metadata references now resolve to 13 verified PDF references, 31 renderable pages and 12 unique content identities; duplicate evidence is normalized before KnowledgeOperation authoring
REMAINING_BLOCKERS = [PAGE_LEVEL_KNOWLEDGE_OPERATION_EXTRACTION_PENDING, KP_APPLICATION_CLASSIFICATION_PENDING]
NEXT_SHORTEST_STEP = POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification
```

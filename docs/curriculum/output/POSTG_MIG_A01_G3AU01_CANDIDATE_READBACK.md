# POSTG-MIG-A01 G3A-U01 Candidate Readback

## Current state

```text
SOURCE_ID = g3a_u01_3a01
CONFORMANCE_STATE = IN_PROGRESS_GOLDEN_NATIVE
PRODUCTION_ELIGIBILITY = false
CANDIDATE_EVIDENCE_LEVEL = E3_SHADOW_RUNTIME_INTEGRATED
```

## Knowledge authority

```text
8 visible KnowledgePoints
→ 8 canonical operation models
→ 8 visible PatternGroups
→ 20 existing PatternSpecs
→ 20 exact question bindings
```

Authority:

`data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json`

Application-capability classification remains unassessed in Program A and is deferred to
`POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1`.

## Runtime lineage

```text
Visible selector authority
→ existing G3A-U01 generator / existing shared ordering router
→ shared post-Golden question-lineage adapter
→ existing shared blocking validator
→ existing shared worksheet assembly
→ existing shared HTML renderer
```

The candidate adds no unit-specific generator, validator, renderer, or workflow. Public default
selection remains unchanged until current HTML/PDF/hash/readback evidence passes and the unit is
promoted to `GOLDEN_CONFORMANT`.

## Remaining A01 gates

1. Focused generation and mutation CI for all 20 PatternSpecs.
2. Current-runtime 40-question HTML and PDF artifacts.
3. Artifact hashes, DOM readback, PDF page readback, and zero validator errors.
4. Knowledge-operation JSON backfill for the three existing Golden regression anchors.
5. Cross-unit regression proving anchor conformance and production states are unchanged.
6. Controller transition: G3A-U01 complete and G3A-U02 active.

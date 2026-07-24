# Global Authoritative Consumer Cutover Contract V1

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R07_AuthoritativeConsumerCutover
AUTHORITY_MODE = GLOBAL_PRIMARY
LEGACY_AUTHORITY_ROLE = COMPATIBILITY_ALIAS_READ_ONLY
```

## Purpose

R07 makes the R02–R06 Global KnowledgePoint, prerequisite, capability, delivery-wave, and compatibility authorities the default resolver for the existing 15-unit public product baseline.

```text
public sourceId
→ R07 Global authority descriptor
→ canonical KnowledgePoint and PatternGroup selection
→ existing production generator / validator / renderer
```

The public entry point remains:

```text
site/assets/browser/pipeline/build-worksheet-document.js
```

The entry-point path and existing public query IDs do not change. Only the authority used before generation changes.

## Cutover rules

1. All 15 existing product units resolve through Global authority by default.
2. Existing source IDs, KnowledgePoint IDs, PatternSpec/question IDs, selected KPs, and selected PatternGroups remain valid.
3. Existing post-golden task IDs may remain in old links, but they are compatibility metadata rather than activation requirements.
4. Legacy authority becomes a read-only compatibility alias and cannot become primary again without an explicit rollback task.
5. Unknown KnowledgePoint IDs fail closed.
6. Non-baseline sources pass through unchanged.
7. Application and PBL routes keep their existing generators and admissions.
8. R07 creates no unit-specific generator, validator, renderer, or parallel runtime pipeline.
9. The nine R06 scope fences remain active: existing approved legacy patterns remain usable, while new Global patterns must satisfy complete Global capability contracts.

## Dual-read identity parity

R07 compares the current browser-visible authority and existing legacy/post-golden descriptors before constructing the production plan.

The parity contract covers:

```text
sourceId preservation
KnowledgePoint selection preservation
PatternGroup selection preservation
PatternSpec/question identity preservation
existing production-use preservation
```

R07 does not claim visual parity. UI, worksheet, answer-key, HTML, Chromium PDF, and browser-print parity are the R08 acceptance scope.

## Product sequencing lock

The approved sequence is:

```text
R07 authority cutover
→ R08 15-unit UI/HTML/PDF migration closeout
→ P01–P08 W1–W8 product delivery
→ P09 79-source public UI integration
→ P10 full UI/HTML/PDF/print product closeout
→ recursive-improvement administration backend
```

The recursive-improvement administration backend must not start before `P10_FullUIHTMLPDFPrintProductCloseout`.

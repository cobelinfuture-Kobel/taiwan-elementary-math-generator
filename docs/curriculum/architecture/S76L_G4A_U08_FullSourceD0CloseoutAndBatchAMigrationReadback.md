# S76L — G4A-U08 Full-Source D0 Closeout and Batch A Migration Readback

```text
TASK = S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Closeout scope

S76L converts the merged S76A–S76K evidence into the final production lifecycle for G4A-U08. It does not add or modify curriculum content, generation logic, selector behavior, resolver behavior, worksheet assembly, renderer templates or visual styles.

The accepted chain is:

```text
source authority
→ 15 KnowledgePoints
→ 28 PatternGroups
→ existing PatternSpec reclassification
→ canonical adapter
→ blocking validator
→ mutation rejection
→ four Phase2B generators
→ public resolver / selector / worksheet
→ full-source stress and semantic QA
→ Chromium HTML/PDF smoke
→ D0 production closeout
```

## Authority and executable coverage

Authoritative registry:

```text
KnowledgePoints                     = 15
PatternGroups                       = 28
numeric PatternGroups               = 11
application core PatternGroups      = 13
application extension PatternGroups = 4
```

Executable public surface:

```text
legacy numeric PatternSpecs      = 10
Phase2A application PatternSpecs = 12
Phase2B canonical PatternSpecs   = 4
total executable PatternSpecs    = 26
```

The authoritative PatternGroup count and executable PatternSpec count are intentionally different. S76L does not infer a false one-to-one mapping.

## S76K evidence accepted

```text
implementation PR       = #154
merge commit             = c995a2e5d741bbc07f000205eed8d145b7002f13
validated head SHA       = 268f7e5344c850ed02116bd97ad6dfe4d9f344bd
workflow count           = 8
workflow failures        = 0
primary stress questions = 1806
maximum accepted count   = 1000
first rejected count     = 1001
```

HTML/PDF evidence:

```text
workflow run = 29268903266
artifact ID  = 8286611935
artifact     = s76k-g4a-u08-public-html-pdf-smoke
artifact SHA = sha256:baf1d77e6b989b5efee273adeda91c1b909e70033cc4b84caa3e96b684f93e66
expires      = 2026-08-12T17:04:39Z
```

The smoke verified 120 questions and 120 answers, DOM containment, nonblank rendered pages, A4 PDF bounding boxes, Traditional Chinese extraction, final answer-page content, and zero internal-ID or unresolved-placeholder leakage.

## Fresh-main acceptance

S76L rechecks the merged main branch with three bounded routes:

```text
numeric source-unit route   = 50 questions / 10 PatternSpecs
Phase2A application route   = 60 questions / 12 PatternSpecs
Phase2B canonical route     = 120 questions / 4 PatternGroups / 4 PatternSpecs
Phase2B answer key          = 120 answers
```

All routes remain executable through the current Batch A browser chain.

## Production lifecycle

The final production overlay is authoritative:

```text
productionUse = allowed
distance      = D0_G4A_U08
HTML/PDF      = production_smoke_pass
Batch A readback = accepted
```

S76J generated records retain `preview_only_pending_s76k` as immutable historical evidence. S76L does not rewrite those snapshots. Release eligibility is determined by the final S76L production overlay, which records the accepted S76K CI and artifact evidence.

## Batch A migration readback

Migration is additive and bounded:

```text
Batch A source units before = 13
Batch A source units after  = 13
public surfaces before      = 3
public surfaces after       = 3
G4A-U08 visible KP rows     = 8 before / 8 after
```

Preserved:

- source-unit route;
- existing Phase2A KnowledgePoint routes;
- Batch A source ordering and membership;
- classic, fallback404 and pixel public surfaces;
- existing renderer visual behavior.

Added:

- explicit Phase2B PatternGroup route for the four promoted extension groups.

## Scope boundary

S76L changes no:

- source evidence;
- KnowledgePoint or PatternGroup membership;
- PatternSpec or generator implementation;
- validator semantics;
- selector/resolver allocation logic;
- worksheet structure;
- renderer or CSS visual behavior;
- Batch A aggregate source count.

## Task closeout

1. **縮短哪一段距離**：將已合併的 S76K stress／HTML／PDF 證據轉為正式 production-allowed D0 lifecycle。
2. **推進哪一個節點**：推進 production promotion、fresh-main acceptance 與 Batch A migration readback。
3. **解除 blocker**：解除 G4A-U08 的 production-use、D0 closeout 與 Batch A migration readback blocker。
4. **新增 blocker**：無 G4A-U08 blocker；下一單元仍需 source priority lock。
5. **下一個最短有效步驟**：`S77_BatchA_NextUnitSourcePriorityLock`。

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4A_U08_FULL_SOURCE_STRESS_SEMANTIC_HTML_PDF_ACCEPTED_D0_CLOSEOUT_PENDING
GOAL_DISTANCE_AFTER  = D0_G4A_U08
DISTANCE_REDUCED     = Converted merged S76K stress and HTML/PDF evidence into an authoritative production-allowed D0 overlay and verified fresh-main Batch A migration invariants.
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = S77_BatchA_NextUnitSourcePriorityLock
```

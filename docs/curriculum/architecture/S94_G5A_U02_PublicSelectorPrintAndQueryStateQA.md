# S94 G5A-U02 Public Selector, Print and Query-State QA

## Status

`IMPLEMENTED_PENDING_CI`

## Scope

S94 exposes G5A-U02 as a public **source-unit preview candidate** on the shared Classic, fallback 404 and Pixel source registries.

Included:

- source-unit option `5A-U02 因數與公因數`;
- shared browser build-pipeline routing;
- commit-pinned S93 canonical HTML authority;
- Classic/404/Pixel preview support through the shared preview renderer;
- browser print through the existing preview-frame print path;
- answer-key enabled and suppressed paths;
- generic query-state round-trip for source, answer-key, seed and layout fields;
- stale-output invalidation inherited from existing Classic and Pixel controls;
- Traditional Chinese public warning that the candidate is fixed at 22 verified questions.

Excluded:

- arbitrary regeneration or random resampling;
- public KnowledgePoint or PatternGroup selection for G5A-U02;
- modification of the S90 resolver, S91 worksheet contract, S92 renderer or S93 artifact;
- production promotion;
- generic fallback;
- free-form AI.

## Public-candidate architecture

```text
public source selector
→ sourceId = g5a_u02_5a02
→ S94 public candidate adapter
→ pinned S93 HTML at merge commit 5bd0e6d3...
→ shared preview frame
→ browser print
```

The public adapter does not duplicate the generator. It projects the closed S93 artifact into the existing public preview/print surfaces.

## Candidate contract

```text
questionCount        = 22 fixed verified questions
answerCount          = 22 when answer key is enabled
questionPageCount    = 22
answerPageCount      = 22 when enabled
selectionMode        = sourceUnit only
arbitraryRegeneration = false
productionUse        = preview_only_pending_s95
```

The existing `questionCount` query field remains serializable for cross-unit URL compatibility, but G5A-U02 displays a warning and resolves to the verified 22-question candidate. This prevents a URL from overstating unsupported generation behavior.

## Query state

The existing generic query-state authority already parses and serializes:

- `sourceId`;
- `questionCount`;
- `ordering`;
- `answerKey`;
- `generationSeed`;
- `columns`;
- `rowsPerPage`.

G5A-U02 adds no unsupported unit-specific fields. KnowledgePoint and PatternGroup IDs remain unavailable for this unit in S94.

## Print and stale-output safety

Classic and fallback use the established `markOutputStale()` gate. Pixel uses the established `pixel:worksheet-stale` and watched-control gate. The print button is enabled only after a successful candidate build and preview creation.

The candidate HTML is fetched from an immutable raw GitHub URL pinned to the accepted S93 merge commit, injected into `srcdoc`, and printed through the existing same-origin preview-frame window.

## Lifecycle

```text
selectorStatus        = public_source_unit_candidate
browserPipelineStatus = public_static_candidate_connected
printStatus           = public_print_candidate
queryStateStatus      = source_unit_round_trip_supported
productionUse         = preview_only_pending_s95
arbitraryRegeneration = false
genericFallback       = false
freeFormAI             = false
```

## Acceptance

S94 is accepted when:

- Node Test passes;
- Math CI Readback passes;
- S42 Branch Test passes;
- existing HTML/PDF regressions pass;
- the PR merges;
- fresh-main readback matches the merge commit.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_HIDDEN_BROWSER_AND_HTML_PDF_SMOKE_VERIFIED_AND_CLOSED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_PUBLIC_PREVIEW_PRINT_QUERY_CANDIDATE_IMPLEMENTED_PENDING_CI
```

## Next shortest step

After PR CI, merge and fresh-main closeout:

`S95_G5A_U02_ProductionStressHTMLPDFAndD0Closeout`

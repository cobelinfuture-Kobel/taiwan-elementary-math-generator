# S95 G5A-U02 Production Stress HTML/PDF and D0 Closeout

## Scope

S95 promotes G5A-U02 from the S94 public preview candidate to a production-allowed **canonical static release** after deterministic generator, validator, worksheet, renderer and Chromium PDF stress verification.

The D0 scope is deliberately bounded:

- public source-unit selection is allowed;
- the accepted 22-question canonical worksheet is production-allowed;
- answer-key enabled and suppressed print paths are allowed;
- the internal canonical generator is stress-tested across variable counts and seeds;
- arbitrary browser regeneration remains disabled;
- public KnowledgePoint and PatternGroup selection remain out of scope;
- generic fallback and free-form AI remain forbidden.

## Stress matrix

```text
question counts = 1, 22, 44, 100, 200
seeds          = 10
answer modes   = with answer / questions only
scenarios      = 100
```

Every scenario must pass:

- exact question count;
- exact answer count or complete answer suppression;
- canonical blocking validation;
- deterministic replay for the same seed;
- output variation across different seeds;
- Traditional Chinese A4 HTML generation;
- no mutation of S91/S92 hidden lifecycle authorities.

The largest scenario produces a 200-question and 200-answer HTML/PDF stress artifact. Chromium verification requires:

- 200 question cards;
- 200 answer cards;
- zero DOM overflow;
- every PDF page nonblank;
- zero PDF bounding-box overflow;
- nonblank final answer page.

## Lifecycle

```text
selectorStatus              = public_source_unit
browserPipelineStatus       = public_static_canonical_connected
printStatus                 = public_print_allowed
productionUse               = allowed_canonical_static_release
arbitraryBrowserRegeneration = false
genericFallback             = false
freeFormAI                   = false
```

The Batch A core registry remains fixed at 13 units. G5A-U02 remains an isolated public release projection and is not inserted into the Batch A core authority.

## D0 definition

```text
D0_G5A_U02_CANONICAL_STATIC_PRODUCTION_RELEASE
```

D0 here means the unit has a stable, selectable, validated and printable production worksheet output. It does not claim arbitrary browser-side regeneration. That capability requires a separate browser-runtime milestone.

## Acceptance

S95 is accepted only when:

- Node Test passes;
- Math CI Readback passes;
- S42 Branch Test passes;
- S93 hidden HTML/PDF regression passes;
- S95 production stress HTML/PDF workflow passes;
- all existing unit HTML/PDF regressions pass;
- PR merges;
- fresh-main readback matches the exact merge commit.

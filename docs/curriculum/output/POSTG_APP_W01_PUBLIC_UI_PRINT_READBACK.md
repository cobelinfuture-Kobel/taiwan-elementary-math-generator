# POSTG-APP W01 Public UI Print Readback

## Outcome

The W01 E5 production-admitted global-context application capability is connected to the existing public worksheet selector, preview pipeline and print control without changing the public route.

## Public selection surface

- Seven reviewed W01 application groups are exposed as `全域情境應用題` choices.
- Numeric and application choices remain separate.
- Each public group resolves to one exact production-admitted PatternSpec.
- The overlay does not mutate the canonical Golden registry, counts or lineage.

## Runtime and print gate

- Selected W01 groups are projected to the A06D-reviewed mathematical relation family.
- Operands, expression and final answer are preserved from the production generator result.
- Projection fails closed when the admitted PatternSpec is absent or the mathematical-preservation gate fails.
- Generated application questions pass through the existing worksheet document, preview and answer-key print pipeline.
- The public HTML surfaces retain the selector, preview frame and print button.

## Evidence binding

- A06D review data SHA-256: `94044b3e6c75c414f6d64ee3bef315164c9a352a8b2b4231171aee0ec0535035`
- A06D review manifest SHA-256: `595ff5e5fd21ee11eca6f2b2ac28d2d82dabeae9369c25986fa6c9cc55fca6f8`
- Operator admission: `POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision`
- Integration test: `tests/site/postg-app-w01-public-ui-print-integration.test.js`

## Closeout

```text
PUBLIC_SELECTION_ENABLED = true
PUBLIC_PREVIEW_ENABLED = true
PUBLIC_PRINT_ENABLED = true
PUBLIC_ROUTE_CHANGED = false
PROGRAM_D0_COMPLETE = false
```

The next mainline task remains `POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification`.

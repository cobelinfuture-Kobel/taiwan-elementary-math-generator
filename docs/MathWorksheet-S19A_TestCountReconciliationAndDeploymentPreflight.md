# MathWorksheet-S19A Test Count Reconciliation And Deployment Preflight

## 1. Summary

S19A verifies the S18 to S19 test-count delta and checks whether the current `site/` output is ready for a future GitHub Pages deployment.

Current result:

```bash
npm test
# 169 tests, 0 failures
```

Decision:

- `S19A PASS`
- proceed to `S20_GitHubPagesAutomatedDeployment`

## 2. Test Count Reconciliation

Known baselines:

- S18: `183` tests, `0` failures
- S19 observed: `169` tests, `0` failures
- Delta: `-14`

### Exact explanation of the delta

The `-14` delta is explained by test consolidation in two rewritten site test files, plus one new validation-focused file added in S19.

Changed site test files:

- `tests/site/site-config-editor.test.js`
- `tests/site/site-operator-controls.test.js`
- `tests/site/site-config-validation-messaging.test.js` added

Per-file test count reconciliation:

- `site-config-editor.test.js`
  - previous S18-era file: `36` tests
  - current S19 file: `15` tests
  - delta: `-21`
- `site-operator-controls.test.js`
  - previous S18-era file: `23` tests
  - current S19 file: `21` tests
  - delta: `-2`
- `site-config-validation-messaging.test.js`
  - added in S19: `9` tests
  - delta: `+9`

Net:

- `-21 - 2 + 9 = -14`

### What changed conceptually

`site-config-editor.test.js` was consolidated heavily:

- removed duplicate localization checks that overlapped with renderer and HTML structure checks
- removed repeated rejection tests already covered by direct helper tests
- removed some broad “still works after localization” style tests that duplicated existing generation and readiness coverage
- kept the core editor behavior, reset behavior, helper behavior, import-boundary checks, and Traditional Chinese label checks

`site-operator-controls.test.js` was only lightly consolidated:

- replaced one loose “invalid range may or may not fail” test with stricter S19 validation-messaging coverage
- removed overlap that is now covered more precisely in `site-config-validation-messaging.test.js`

`site-config-validation-messaging.test.js` added the new S19 coverage for:

- operand range validation
- zero-operator messaging
- division divisor guardrails
- subtraction non-negative feasibility guidance
- impossible-generation friendly error translation
- stale-preview safety pattern

### Coverage-loss assessment

No broken test discovery was found.

No `.skip` / `.only`-based silent loss was found.

No required S18 or S19 coverage area is currently missing.

The count drop is therefore explained as consolidation and replacement, not accidental loss of execution.

## 3. Test Discovery Check

Runner:

- `package.json` uses `node --test`

Confirmed discovered and executed site files:

- `tests/site/site-operator-controls.test.js`
- `tests/site/site-config-validation-messaging.test.js`
- `tests/site/site-config-editor.test.js`
- `tests/site/site-readiness.test.js`
- `tests/site/site-scaffold.test.js`

Discovery checks performed:

- `npm test` output included active tests from all required S19 site files
- recursive test-file scan found `17` `.test.js` files total
- no `test.skip`
- no `describe.skip`
- no `it.skip`
- no `test.only`
- no `describe.only`
- no `it.only`

## 4. Current Test File Counts

Current `test(...)` counts by file:

- `tests/core/evaluate-expression.test.js`: `17`
- `tests/core/generate-expression.test.js`: `15`
- `tests/core/number-value.test.js`: `4`
- `tests/core/pattern-planning.test.js`: `5`
- `tests/core/validate-config.test.js`: `11`
- `tests/core/worksheet-assembly.test.js`: `10`
- `tests/core/worksheet-formatting.test.js`: `5`
- `tests/core/worksheet-pagination.test.js`: `5`
- `tests/renderer/generator-backed-preview.test.js`: `9`
- `tests/renderer/html-renderer.test.js`: `12`
- `tests/renderer/preview-shell.test.js`: `5`
- `tests/renderer/static-preview-workflow.test.js`: `5`
- `tests/site/site-config-editor.test.js`: `15`
- `tests/site/site-config-validation-messaging.test.js`: `9`
- `tests/site/site-operator-controls.test.js`: `21`
- `tests/site/site-readiness.test.js`: `12`
- `tests/site/site-scaffold.test.js`: `9`

Total:

- `169`

## 5. S18 Regression Coverage Check

S18 operator-control coverage remains active.

Still covered:

1. add / subtract / multiply / divide checkbox presence
2. default operator state
3. `setOperatorEnabled()`
4. `getOperatorsEnabled()`
5. `globalOperators` sync
6. `operatorSlots` sync
7. `allowedOperatorsBySlot` sync
8. invalid operator token rejection
9. at least one operator required
10. operand range update behavior
11. NaN / non-finite operand range rejection

Coverage sources:

- `tests/site/site-operator-controls.test.js`
- `tests/site/site-config-validation-messaging.test.js`

No S18 blocker-level coverage gap was found.

## 6. S19 Validation Messaging Coverage Check

S19 validation-messaging coverage is active.

Covered cases:

1. first operand `min > max`
2. second operand `min > max`
3. zero-operator state
4. division divisor range `0..0`
5. division divisor range includes `0` and valid values
6. subtraction impractical under non-negative policy
7. impossible generation / candidate pool failure
8. raw generator error not surfaced directly to the user-facing test message
9. stale worksheet object not replaced on failed generation

Coverage source:

- `tests/site/site-config-validation-messaging.test.js`

## 7. GitHub Pages Deployment Preflight

Preflight result:

- current `site/` output is deployment-ready for a static GitHub Pages rollout

Verified:

1. `site/index.html` loads assets with relative paths
2. `site/404.html` is present, valid, and localized
3. browser modules use relative imports compatible with subpath deployment
4. no local-only absolute filesystem paths are required
5. no dev-server-only assumption is required for runtime module loading
6. no bundler or build step is currently required
7. static assets under `site/assets/` are present and referenced correctly
8. tests do not depend on deployment-only behavior

Non-blocking note:

- `site/modules/renderer/html-renderer.js` still contains a default fallback stylesheet string pointing at `./src/renderer/print-styles.css`
- current browser runtime explicitly passes `./assets/styles/print-styles.css`, so this is not a deployment blocker today
- it is worth normalizing during deployment hardening for clarity

## 8. Files Changed

- `docs/MathWorksheet-S19A_TestCountReconciliationAndDeploymentPreflight.md`

## 9. Final Decision

`S19A PASS`

Reason:

- final test result is `169` tests, `0` failures
- the `183 -> 169` delta is fully explained
- required S18 regression coverage remains present
- required S19 validation-messaging coverage is active
- no accidental `.skip` / `.only` usage exists
- no GitHub Pages blocker was found in the current static `site/` structure

## 10. Recommended Next Task

`S20_GitHubPagesAutomatedDeployment`

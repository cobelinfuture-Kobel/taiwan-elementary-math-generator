S49C_BatchAAndBrowserPathReleaseQA

CURRENT_MAJOR_TASK = S49_PixelUIFullQA
CURRENT_SUBTASK = S49C_BatchAAndBrowserPathReleaseQA
TASK_STATUS = IMPLEMENTED_PR_CI_PENDING
OUTPUT = GitHub Pages artifact, Classic/Pixel browser-path, module-graph, and 13-source release QA

## 1. Preflight

S49B1 was accepted and merged:

```text
PR = #15
MERGE_SHA = ec636ef92f0aaa3fc73dc38aae4c7e5a2cd98fc9
PR Math CI Readback #1000 = success
PR Node Test #1329 = success
PR S42 Branch Test #80 = success
Main Math CI Readback #1008 = PASS_CI_SYNCED_AND_CLEAN
tests = 619
pass = 619
fail = 0
workingTree = clean
```

## 2. Scope Lock

```text
- Verify that GitHub Pages deploys site/ only after npm test.
- Verify Classic /, fallback /404.html, and Pixel /pixel/ local asset references.
- Verify repository-project Pages subpath safety; no site entry reference may require domain-root deployment.
- Verify Classic and Pixel browser module graphs contain only existing site-local imports.
- Verify Pixel release registry exposes exactly the same 13 Batch A source units as the shared registry.
- Verify grade / semester routes can reach every public sourceId.
- Do not modify public HTML, CSS, JavaScript, generator, validator, renderer, registry, or PatternSpec.
- Do not continue G3B-U04 / S57F2 promotion work.
```

## 3. Files Created

```text
tests/ui/pixel-browser-path-release-qa.test.js
docs/curriculum/output/S49C_BatchAAndBrowserPathReleaseQA.md
```

No public site file was modified.

## 4. QA Coverage

### GitHub Pages workflow contract

The test requires:

```text
npm test runs in the Test job
Deploy job needs Test
upload-pages-artifact path = site
Deploy uses actions/deploy-pages@v4
```

### Static HTML and CSS path integrity

The QA reads:

```text
site/index.html
site/404.html
site/pixel/index.html
```

Every local `href` and `src` must:

```text
- stay inside site/;
- exist in the Pages artifact;
- avoid root-absolute paths that break repository GitHub Pages;
- resolve directory links to an index.html;
- preserve local CSS url() asset integrity.
```

### Project Pages route simulation

Using a simulated base:

```text
https://example.invalid/taiwan-elementary-math-generator/
```

The test confirms:

```text
Classic → pixel/ resolves under the repository path
Pixel → ../index.html resolves to the Classic route
Pixel preview stylesheet resolves to assets/styles/print-styles.css under the repository path
```

### Browser module graph

Entry modules:

```text
site/assets/browser/main.js
site/pixel/pixel-ui.js
site/pixel/pixel-live-preview.js
site/pixel/pixel-print-surface.js
```

All static relative imports are recursively resolved. Every imported file must exist and remain inside `site/`.

### Batch A public release registry

The QA compares:

```text
listBatchASourceUnits()
listPixelSourceOptions()
```

Acceptance:

```text
shared source count = 13
Pixel source count = 13
sourceId sets are identical
sourceIds are unique
every grade has at least one semester route
every grade-semester route has at least one source
every public source is reachable through its grade-semester filter
visibleKnowledgePointCount is a non-negative integer
```

## 5. Shared-Core Integrity

```text
Production behavior changed = false
Public site files changed = false
Generator changed = false
Validator changed = false
Renderer changed = false
Registry changed = false
PatternSpec changed = false
```

## 6. Acceptance Status

```text
Pages workflow release QA = WRITTEN
Classic / fallback / Pixel asset-path QA = WRITTEN
Repository Pages subpath QA = WRITTEN
Browser module-graph QA = WRITTEN
13-source Batch A release registry QA = WRITTEN
PR CI = PENDING
Main CI = PENDING
Deploy GitHub Pages = NOT REQUIRED FOR IMPLEMENTATION; test/docs only
```

## 7. Closeout

1. 本任務縮短了哪一段距離？
   - It moves Pixel release readiness from functional full-chain coverage to deploy-artifact and browser-path coverage.
2. 推進了哪一個系統節點？
   - GitHub Pages release path / Browser module loading / Batch A public registry projection.
3. 是否解除 blocker？
   - At implementation level, it removes the blocker "Need S49C Batch A / browser-path release QA".
4. 是否增加新的 blocker？
   - No production blocker. PR and main CI must pass before S50.
5. 下一個最短有效步驟是什麼？
   - S49C_PR_CIReadbackAndMerge.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_FUNCTIONAL_QA_CI_PASS
GOAL_DISTANCE_AFTER = D1_WEBUI_BROWSER_PATH_RELEASE_QA_WRITTEN_PR_CI_PENDING
DISTANCE_REDUCED = Classic, fallback, Pixel, shared module imports, repository Pages-relative paths, and all 13 public Batch A source routes now have one executable release contract.
REMAINING_BLOCKERS = ["Need S49C PR CI", "Need S49C merge", "Need main Math CI Readback", "Need S50 final production gate"]
NEXT_SHORTEST_STEP = S49C_PR_CIReadbackAndMerge
STOP_REASON = ci_readback_required
BLOCKER_TYPE = PR_CI_REQUIRED
LAST_COMPLETED_STATUS = S49C_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Wait for or provide PR CI results for branch s49c-batcha-browser-path-release-qa.
NEXT_RESUME_TASK = S49C_PR_CIReadbackAndMerge

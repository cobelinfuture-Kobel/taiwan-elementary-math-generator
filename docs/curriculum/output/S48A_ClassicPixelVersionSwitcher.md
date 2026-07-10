S48A_ClassicPixelVersionSwitcher

CURRENT_MAJOR_TASK = S48_PixelUIVersionAndReleaseSurface
CURRENT_SUBTASK = S48A_ClassicPixelVersionSwitcher
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Bidirectional Classic / Pixel public UI version switch

## 1. Scope Check

```text
- Preserve Classic UI at /
- Preserve Pixel UI at /pixel/
- Add a visible Classic-to-Pixel switch without replacing Classic
- Keep the existing Pixel-to-Classic switch
- Do not modify generator / validator / renderer / registry / PatternSpec
- Do not continue unrelated curriculum-content tasks
```

## 2. Files Modified

```text
site/index.html
site/404.html
site/assets/styles/app.css
```

## 3. Files Created

```text
tests/ui/classic-pixel-version-switch.test.js
```

## 4. Public Behavior

Classic main route now exposes:

```text
標準版 Classic
切換至像素風版 Beta
```

The Classic 404 fallback exposes:

```text
返回標準版首頁
切換至像素風版 Beta
```

The existing Pixel route continues to expose:

```text
回到標準版
Classic 保留
```

This completes the user-visible bidirectional version switch while keeping both UIs independently usable.

## 5. Accessibility / Styling

The Classic switch uses:

```text
app-shell__version-nav
version-chip
version-link
```

The link has a visible focus state and does not rely on JavaScript for navigation.

## 6. Test Coverage

New tests verify:

```text
- Classic index links to ./pixel/
- Classic 404 fallback links to the standard index and ./pixel/
- Pixel index links back to ../index.html
- Classic and Pixel preservation labels exist
- version switch CSS and focus-visible styles exist
```

## 7. Shared-Core Integrity

No generator, validator, renderer, registry, selector-state, worksheet-state, or PatternSpec file was modified.

## 8. Acceptance Status

```text
Classic-to-Pixel link = STATIC PASS
Pixel-to-Classic link = STATIC PASS
404 fallback links = STATIC PASS
Keyboard focus styling = STATIC PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 9. Closeout

1. 本任務縮短了哪一段距離？
   - It moves the two public UI versions from separate routes to a discoverable bidirectional version surface.
2. 推進了哪一個系統節點？
   - WebUI navigation / PublicRelease entry surface.
3. 是否解除 blocker？
   - At implementation level, it removes the blocker "Need Classic/Pixel version-switch completion".
4. 是否增加新的 blocker？
   - No functional blocker. CI and Pages readback are required because public site files changed.
5. 下一個最短有效步驟是什麼？
   - S48A_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_HTML_PRINT_QA_CI_PASS
GOAL_DISTANCE_AFTER = D1_WEBUI_DUAL_VERSION_SWITCH_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Classic and Pixel are now mutually discoverable public interfaces while remaining separate and sharing the same worksheet core.
REMAINING_BLOCKERS = ["Need Math CI Readback for S48A", "Need Deploy GitHub Pages readback for S48A", "Need broader Pixel functional QA", "Need final production gate"]
NEXT_SHORTEST_STEP = S48A_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S48A_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success for the latest S48A commit.
NEXT_RESUME_TASK = S48A_CIReadbackAndPagesDeployReadback

# S50 Pixel UI Final Production Gate

```text
CURRENT_MAJOR_TASK = S50_PixelUIProductionCloseout
CURRENT_SUBTASK = S50_PixelUIFinalProductionGate
TASK_STATUS = IMPLEMENTED_PR_CI_PENDING
OUTPUT = Final Classic/Pixel public-release gate before D0 closeout
```

## 1. Preflight

```text
S49A Classic Regression QA = PASS
S49B Pixel Functional QA = PASS_CI_SYNCED_AND_MERGED
S49C Batch A / Browser Path Release QA = PASS_CI_SYNCED_AND_MERGED
S49C PR = #16
S49C MERGE_SHA = 9afd884b5cc4e109abe9974abe8c9ed5833664ec
S49C Main Math CI Readback #1012 = PASS_CI_SYNCED_AND_CLEAN
S49C Main tests = 629
S49C Main pass = 629
S49C Main fail = 0
S49C Main workingTree = clean
```

## 2. Scope Lock

```text
- Preserve Classic UI as the stable public interface.
- Preserve Pixel UI as the usable public Beta interface.
- Verify Classic, fallback, and Pixel public surfaces remain discoverable and operable.
- Verify accepted S49 QA layers remain present.
- Verify GitHub Pages still uses test-before-deploy and publishes site/.
- Execute every public Batch A source through Pixel generation, validator, preview, answer-key, and print.
- Do not add new UI behavior.
- Do not modify generator, validator, renderer, registry, PatternSpec, or curriculum content.
- Do not continue G3B-U04 / S57 implementation work.
```

## 3. Files Created

```text
tests/ui/pixel-final-production-gate.test.js
docs/curriculum/output/S49C_CIAndMergeReadback.md
docs/curriculum/output/S50_PixelUIFinalProductionGate.md
```

No production site file is modified.

## 4. Final Gate Coverage

### Public surfaces

```text
Classic / = present
Classic → Pixel link = present
Fallback /404.html = present
Fallback → Classic and Pixel links = present
Pixel /pixel/ = present
Pixel → Classic link = present
Pixel Beta label = present
Pixel known-limits disclosure = present
Classic generator and preview controls = present
Pixel selector, generation, preview, answer, and print controls = present
```

### Release QA continuity

```text
classic-regression-qa.test.js = required
pixel-functional-qa.test.js = required
pixel-browser-path-release-qa.test.js = required
```

### GitHub Pages contract

```text
npm test before deploy = required
Deploy needs Test = required
artifact path = site
production deploy action = actions/deploy-pages@v4
```

### Final 13-source execution

Every source returned by the Pixel registry must pass:

```text
Pixel worksheet state
→ shared generator
→ shared validator
→ worksheet-document-v1
→ shared HTML preview
→ answer-key behavior
→ shared iframe print
```

Both ordering modes and both answer-key modes are exercised across the 13 public sourceIds.

## 5. Acceptance Status

```text
Final gate test = WRITTEN
Production behavior changed = false
Public site files changed = false
PR CI = PENDING
Merge = PENDING
Main CI = PENDING
Final GitHub Pages deploy readback = PENDING
D0 final closeout marker = PENDING
```

## 6. Closeout

1. 本任務縮短了哪一段距離？
   - It consolidates the accepted Classic, Pixel, registry, generator, validator, renderer, answer-key, print, and Pages-path evidence into one final executable production gate.
2. 推進了哪一個系統節點？
   - WebUI production release gate and worksheet-output delivery path.
3. 是否解除 blocker？
   - At implementation level, it removes the blocker "S50 final production gate not implemented".
4. 是否增加新的 blocker？
   - No product blocker. PR CI, merge, main CI, and final Pages deployment evidence remain.
5. 下一個最短有效步驟是什麼？
   - S50_PR_CIReadbackAndMerge.

```text
GOAL_DISTANCE_BEFORE = D1_WEBUI_BROWSER_PATH_RELEASE_QA_CI_SYNCED_AND_MERGED
GOAL_DISTANCE_AFTER  = D1_WEBUI_FINAL_PRODUCTION_GATE_WRITTEN_PR_CI_PENDING
DISTANCE_REDUCED     = One final executable gate now protects both public versions and the complete 13-source worksheet delivery chain before release closeout.
REMAINING_BLOCKERS   = ["Need S50 PR CI", "Need S50 merge", "Need main Math CI readback", "Need final GitHub Pages deploy readback", "Need D0 closeout marker"]
NEXT_SHORTEST_STEP   = S50_PR_CIReadbackAndMerge
STOP_REASON          = CI_PENDING
BLOCKER_TYPE         = PR_CI_REQUIRED
LAST_COMPLETED_STATUS = S50_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Wait for PR CI on branch s50-pixel-ui-final-production-gate.
NEXT_RESUME_TASK     = S50_PR_CIReadbackAndMerge
```

# G4B_U04_R4_SourceSwitchAndFlexibleCustomLayoutRepair

## Status

`PASS_ACCEPTED_AND_CLOSED`

## Reported regressions

1. After generating a G4B-U04 worksheet, selecting another source unit could be reverted to G4B-U04.
2. Editing the generic column and row inputs while `auto_safe` remained active continued to resolve the inverse-long profile to 3×5, so a requested 2×6 layout appeared unavailable.

## Confirmed root causes

### Missing source registry authority and duplicate ownership

`g4b_u04_4b04` was absent from the main public source registry. Query parsing and config-state normalization therefore rejected the source, while the G4B control adapter compensated by dynamically creating and repeatedly restoring the source option. That duplicate ownership could reclaim the dropdown after the user selected another unit.

### Custom layout activation gap

The generic column and row inputs did not activate `custom_with_caps`. The main state consequently retained `auto_safe`, whose inverse-long default is 3×5.

## Final repair

- G4B-U04 is registered as a specialized public source.
- The legacy 13-unit generic source list remains unchanged.
- Main config/query-state exclusively owns source option creation, initial hydration and persistence.
- G4B public controls no longer create or set the active source option.
- Changing either `columns-input` or `rows-per-page-input` while G4B-U04 is active activates `custom_with_caps` before the main change handler reads the controls.
- Other units remain unaffected.
- `auto_safe` remains 3×5.

## Approved inverse-long custom matrix

| Columns | Allowed rows | Maximum questions per full page |
|---:|---:|---:|
| 3 | 1–5 | 15 |
| 2 | 1–6 | 12 |
| 1 | 1–7 | 7 |

The matrix contains 18 exact approved layouts. Requests above a column-specific row limit cap to 3×5, 2×6, or 1×7. Requests above three columns cap to three columns and then apply the three-column row limit.

## Production evidence

- implementation PR: `#226`;
- implementation merge: `981735f89b4f7222ad3c506fa134a5e88fbfe0ec`;
- main CI authority commit: `d461e8e05eb779f5a34170afbbfe8823c2032b08`;
- main CI: 1,516 tests / 1,516 pass / 0 fail / clean tree;
- deployed authority commit: `e2ef8ec4f4a5f26c0c60f3f948a86dbf13bae09e`;
- deployed workflow run: `29462947905`;
- deployed authority path: `docs/ci/latest-g4b-u04-r4-deployed-pages-smoke.json`;
- deployed authority status: `PASS`;
- production use: `allowed_deployed_ui_print`.

## Accepted source-switch evidence

After generating a G4B-U04 worksheet and selecting G5A-U08:

- source dropdown value remained `g5a_u08_5a08`;
- URL `sourceId` remained `g5a_u08_5a08`;
- G4B controls became hidden;
- stale G4B query state did not reclaim the unit selector.

## Accepted layout evidence

All 18 approved resolver combinations passed. The three maximum boundaries were also tested through production HTML/PDF and the deployed Classic UI:

| Layout | Deployed questions | Deployed pages | 200-question production pages | Result |
|---:|---:|---:|---:|---|
| 3×5 | 15 | 1 | 14 | PASS |
| 2×6 | 12 | 1 | 17 | PASS |
| 1×7 | 7 | 1 | 29 | PASS |

For every deployed maximum-boundary scenario:

- `layoutMode = custom_with_caps`;
- requested and resolved layouts matched exactly;
- `layoutCapped = false`;
- answer cards and answer pages were zero;
- response prompts were zero;
- DOM overflow was zero;
- inter-card overlap was zero;
- iframe print was invoked;
- console and page errors were zero;
- generic fallback and free-form AI remained false.

The 200-question HTML/PDF acceptance additionally passed exact page count, all-pages-nonblank and zero PDF text bounding-box overflow.

## Scope boundary

The public source registry metadata was corrected to include an already-promoted specialized production unit. No KnowledgePoint, PatternGroup, PatternSpec, formula, answer model, generator semantics, validator semantics, context templates, or curriculum evidence changed.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U04_R3_D0_MARKER_PRESENT_BUT_PUBLIC_UI_REGRESSIONS_REPORTED
GOAL_DISTANCE_AFTER  = D0_G4B_U04_R4_SOURCE_SWITCH_FLEXIBLE_LAYOUTS_CLOSED
DISTANCE_REDUCED     = source ownership, unit switching, 18-layout custom matrix, production PDF and deployed Classic UI completed
REMAINING_BLOCKERS   = NONE
NEXT_SHORTEST_STEP   = NONE_WITHIN_G4B_U04_R4_APPROVED_SCOPE
```

# G4B_U04_R4_SourceSwitchAndFlexibleCustomLayoutRepair

## Status

`IMPLEMENTED_PENDING_CI_AND_DEPLOYED_AUDIT`

## Reported regressions

1. After generating a G4B-U04 worksheet, selecting another source unit could be reverted to G4B-U04.
2. Editing the generic column and row inputs while `auto_safe` remained active continued to resolve the inverse-long profile to 3×5, so a requested 2×6 layout appeared unavailable.

## Confirmed root causes

### Missing source registry authority and duplicate ownership

`g4b_u04_4b04` was not registered in `site/modules/curriculum/batch-a/source-units.js`. As a result, query parsing and config-state normalization rejected the G4B-U04 source and fell back to the first source unit. The G4B control layer compensated by dynamically creating the option and repeatedly applying the stale URL value, which could later reclaim the dropdown after the user selected another unit.

### Custom layout activation gap

The generic column and row inputs did not activate `custom_with_caps`. Therefore the main state correctly retained `auto_safe`, whose inverse-long default is 3×5.

## Repair contract

- G4B-U04 is a first-class entry in the public source registry.
- The main config/query-state layer exclusively owns source option creation, initial hydration and persistence.
- G4B public controls must never create or set the active source option.
- Changing either `columns-input` or `rows-per-page-input` while G4B-U04 is active activates `custom_with_caps` before the main change handler reads the controls.
- Other units are unaffected.
- `auto_safe` remains 3×5.

## Approved inverse-long custom matrix

| Columns | Allowed rows | Maximum questions per full page |
|---:|---:|---:|
| 3 | 1–5 | 15 |
| 2 | 1–6 | 12 |
| 1 | 1–7 | 7 |

The matrix contains 18 exact approved layouts. Requests above a column-specific row limit cap to 3×5, 2×6, or 1×7. Requests above three columns cap to three columns and then apply the three-column row limit.

## Blocking acceptance

- public source registry and query-state accept `g4b_u04_4b04`;
- initial G4B URL hydration selects the correct unit without a control-layer override;
- stale G4B query state cannot reclaim the source dropdown after another unit is selected;
- source dropdown and URL remain on the selected non-G4B unit after a generated worksheet exists;
- changing either print dimension automatically activates and persists `custom_with_caps`;
- all 18 approved custom layouts resolve exactly without a warning;
- 3×5, 2×6, and 1×7 each pass 200-question HTML/PDF production acceptance;
- question-only output remains active;
- zero answer output, DOM overflow, card overlap, blank PDF pages, or PDF text bounding-box overflow;
- deployed Classic UI repeats the source-switch and maximum-layout checks;
- console and page errors remain zero.

## Scope boundary

The public source registry metadata is corrected to include an already-promoted production unit. No KnowledgePoint, PatternGroup, PatternSpec, formula, answer model, generator semantics, validator semantics, context templates, or curriculum evidence changes.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U04_R3_D0_MARKER_PRESENT_BUT_PUBLIC_UI_REGRESSIONS_REPORTED
GOAL_DISTANCE_AFTER  = D0 only after CI, merge and deployed R4 authority PASS
```

## Next shortest step

`G4B_U04_R4_CIProductionAndDeployedPagesAudit`

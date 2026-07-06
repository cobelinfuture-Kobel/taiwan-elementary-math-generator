# S43E5 R3 G3B-U01 Division Place-Value Implementation — Pending Readback

```text
CURRENT_MAJOR_TASK = S43E5_G3B_U01_KPExpansion
CURRENT_SUBTASK = S43E5_R3B_TO_R3I_G3BU01_DivisionPlaceValueImplementation
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3b_u01_3b01
```

## Completed Scope

```text
S43E5_R3A DesignScan = DONE
S43E5_R3B ExistingKPRenameAndRegistryPatch = IMPLEMENTED
S43E5_R3C 2DigitPlaceValueCases = IMPLEMENTED
S43E5_R3D 3DigitPlaceValueCases = IMPLEMENTED
S43E5_R3E QuotientZeroCases = IMPLEMENTED
S43E5_R3F DivisionWithRemainder = IMPLEMENTED
S43E5_R3G GeneratorValidatorIntegration = IMPLEMENTED
S43E5_R3H UIRegistrySelectorIntegration = IMPLEMENTED
S43E5_R3I MixedAllocationOrderingQA = IMPLEMENTED
S43E5_R3J WorksheetBrowserPDFSmoke = PENDING_MANUAL_PDF_SMOKE
S43E5_R3K Closeout = PENDING_READBACK
```

## Final UI KnowledgePoints

```text
1. kp_g3b_u01_2digit_division_place_value_cases = 二位數除以一位數商位判斷
2. kp_g3b_u01_3digit_by_1digit_regroup_hundreds = 三位數除以一位數
3. kp_g3b_u01_3digit_division_place_value_cases = 三位數除以一位數商位判斷
4. kp_g3b_u01_quotient_zero_cases = 商中有 0 的除法
5. kp_g3b_u01_division_with_remainder = 有餘數除法
```

## Main Implementation Files

```text
docs/curriculum/mapping/S43E5_R3A_G3BU01_DivisionPlaceValue_DesignScan.md
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/batch-a/g3b-u01-division-generator.js
site/modules/curriculum/batch-a/g3a-u06-division-generator.js
site/modules/curriculum/batch-a/g3a-u06-division-ordering-generator.js
site/modules/curriculum/batch-a/batch-a-browser-validator.js
tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js
```

## Validation Required

```text
git pull public main
npm test
git status
```

After local PASS, generate PDF smoke for:

```text
1. G3B-U01 → 二位數除以一位數商位判斷
2. G3B-U01 → 三位數除以一位數
3. G3B-U01 → 三位數除以一位數商位判斷
4. G3B-U01 → 商中有 0 的除法
5. G3B-U01 → 有餘數除法
6. G3B-U01 → 同單位混合知識點隨機
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3B_U01_R3_FORMAL_MAPPING_PATTERN_SPEC_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER  = D1_G3B_U01_R3_GENERATOR_VALIDATOR_UI_MIXED_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED     = G3B-U01 R3 moved from design to implemented selector, PatternSpec, generator, validator, and mixed allocation support
REMAINING_BLOCKERS   = ["npm test readback pending", "browser PDF smoke pending", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = git pull public main; npm test; git status
```

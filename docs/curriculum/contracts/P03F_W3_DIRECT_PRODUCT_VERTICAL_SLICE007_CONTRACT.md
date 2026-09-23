# P03F W3 Direct Product Vertical Slice 007 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice007Implementation
QUEUE      = 7
SOURCE     = g3b_u07_3b07
KP         = kp_g3b_u07_fraction_unit_conversion
TARGET     = E6_D0_COMPLETE
```

## Frozen product contract

The slice admits exactly one source-backed KnowledgePoint. It exposes two numeric PatternSpecs and two application PatternSpecs under separate PatternGroups. The application classification is `APPLICATION_REQUIRED`; every application prompt must preserve the large-unit, items-per-large-unit, fractional-unit and item-count roles.

The only required W3 capabilities are `cap_fraction_domain_validator` and `cap_fraction_number_system`. Both numeric and application routes must consume the shared generator, validator, Classic/Pixel selectors, WorksheetDocument, answer-key and renderer paths. No new source, parallel pipeline, generic fallback, free-form AI generation or slice008 work is allowed.

## D0 acceptance

- queue position and predecessor identity are exact;
- source evidence, KnowledgePoint, tags, FormalMapping and four PatternSpecs are bound;
- both conversion directions preserve total quantity;
- six numeric and six application witnesses validate;
- two committed HTML and two committed Chromium PDF artifacts match recorded SHA256 values;
- visual review finds no clipping, overlap, broken glyphs, duplicate prompts, overflow or semantic-role loss;
- exact-head Node and Chromium CI pass before merge.

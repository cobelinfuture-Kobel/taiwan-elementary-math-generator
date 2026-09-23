# P03F W3 Direct Product Vertical Slice043 Readback

## Final status

```text
TASK = P03F_W3DirectProductVerticalSlice043_E6_D0Closeout
STATUS = PASS_D0_CLOSED
GOAL_DISTANCE = D0
QUEUE = q043 / rank10 / g4b_u08_4b08
SOURCE = 等值分數
PUBLIC_INVENTORY_AT_ADMISSION = 33 sources / 243 visible KPs
G4B_U08 = 7 visible / 0 hidden / 0 notSelectable
PRODUCTION_ADMISSION = true
SLICE044_MAY_START = true
```

## Exact product scope

```text
KPs =
  kp_g4b_u08_fraction_number_line_distance
  kp_g4b_u08_mixed_fraction_order_constraints

PatternGroups =
  pg_g4b_u08_fraction_number_line_distance_numeric
  pg_g4b_u08_mixed_fraction_order_constraints_numeric

Public numeric PatternSpecs =
  ps_g4b_u08_fraction_number_line_distance_coordinate_numeric
  ps_g4b_u08_fraction_number_line_distance_distance_numeric
  ps_g4b_u08_mixed_fraction_order_constraints_possible_values_numeric

Hidden application PatternSpec =
  ps_g4b_u08_mixed_fraction_order_constraints_possible_values_application

Capabilities =
  cap_fraction_domain_validator
  cap_fraction_number_system
  cap_number_line_representation (number-line KP only)

fraction arithmetic = NOT REQUIRED
```

Formal boundary:

```text
coordinate answer = exact rational coordinate from unit fraction step and step count
distance answer = absolute exact rational difference between two coordinates
bounds answer = exhaustive set of integer numerators satisfying strict rational bounds
number-line representation = required only for coordinate/distance patterns
application / Global Context = forbidden
fraction arithmetic promotion = forbidden
parallel generator / validator / renderer = forbidden
Slice044 implementation = not part of Slice043 closeout
```

The closeout authority is the actual merged Slice043 selector projection, not a synthetic second product authority.

## Implementation evidence

```text
PR = #627
HEAD = f1a7246a19c2febd14aaf312d9188f32b4c56793
MERGE = 7fe42337ccfac8d5489525ef02f5605af37a5a16
NODE = 3234 / 3234 PASS
NODE_RUN = 32102888490
NODE_JOB = 95606695892
NODE_ARTIFACT = 9312228020
NODE_DIGEST = sha256:5fa62430a4b265a802be88ab97820497422d70fda62479d40a67dbffe927e13d
PRODUCT_RUN = 32102888442
PRODUCT_JOB = 95606695945
PRODUCT_ARTIFACT = 9312169455
PRODUCT_DIGEST = sha256:97f7d460173641ab120ddade596d345888b2027c6693e0bdab147e8da9c5f418
```

Product acceptance:

```text
QUESTIONS / ANSWERS = 24 / 24
PATTERN WITNESSES = 8 coordinate / 8 distance / 8 bounds
QUESTION / ANSWER PAGES = 3 / 3
PHYSICAL_PDF_PAGES = 6
SCREENSHOTS = 6
FRACTION NUMBER-LINE REPRESENTATIONS = 32
ANSWER MISMATCH = 0
CROSS_LAYER_MISMATCH = 0
APPLICATION_LEAK = 0
FRACTION_ARITHMETIC_LEAK = 0
DUPLICATE_PROBLEM = 0
REPRESENTATION_OVERFLOW / PAGE_OVERFLOW = 0 / 0
CONSOLE / PAGE ERRORS = 0 / 0
SHARED_RENDERER = true
SHARED_PAGINATION = true
PARALLEL_PIPELINE = false
SLICE044_EXPANSION = false
MANUAL_VISUAL = 6 / 6 PASS
HTML_SHA256 = 69ea841f7949129e1e64d418d8bd88450bdecb17baccdb7192fbe6b5ce56521b
PDF_SHA256 = 3cf1405bee4217ec7b053f13c1d219c44a2ca6c5b80e7a214625ecaaa956a853
```

Manual visual readback of the exact final-head product artifact confirmed question pages 1–3 and answer pages 1–3 have no clipping, overlap, broken glyphs or question/answer misalignment. The two-column eight-question-per-page layout is consistent; fraction number-line marks, fraction/mixed-number values and possible-values answers are legible.

## Post-merge Main/Pages E2E

```text
PR = #628
HEAD = 138a8eb14f4143b819ce45c8f34958afc88546d0
MERGE = 5be183b60bdb2c5e3ad8942b5cc5a1d716ce50f5
RUN = 32155565321
JOB = 95771821627
ARTIFACT = 9331889922
DIGEST = sha256:d3c0786de6b3e846271dbcfe33eb16cac67fd845526d0893f0022c7c3bdf71da
STATUS = PASS_P03F43_POSTMERGE_MAIN_PAGES_E2E
DEPLOYED_ASSETS = 9 / 9 exact SHA matches
PUBLIC = 33 sources / 243 visible KPs
G4B_U08 = 7 / 0 / 0
QUESTIONS / ANSWERS = 24 / 24
PATTERN WITNESSES = 8 / 8 / 8
QUESTION / ANSWER PAGES = 3 / 3
REPRESENTATIONS / SVG / POINT_MARKERS = 32 / 32 / 48
EXACT_ANSWER_MISMATCH = 0
REPRESENTATION_MISMATCH = 0
UNEXPECTED_PATTERN = 0
DUPLICATE_PROBLEM = 0
INTERNAL_ID_LEAKAGE = 0
PRINT_INVOCATION = 1
CONSOLE / PAGE / REQUEST / SERVER ERRORS = 0 / 0 / 0 / 0
SHARED_RENDERER = true
APPLICATION_EXPANSION = false
GLOBAL_CONTEXT_EXPANSION = false
FRACTION_ARITHMETIC_EXPANSION = false
PARALLEL_PIPELINE = false
SIBLING_KP_PROMOTION = false
SLICE044_STARTED = false
```

The first E2E evidence head failed only because the evidence runner incorrectly required the selector-projection module to contain the literal source ID even though that module imports and re-exports the canonical source constant. The deployed asset SHA already matched. The exact-head remediation removed only that redundant token requirement; all SHA, selector, generator, validator, answer, rendering and scope assertions remained intact and then passed.

## D0 closeout evidence

```text
CANDIDATE_PR = #629
CANDIDATE_HEAD = 38d3f7b49c6800c1e9121a762da2f6bcc63b03c6
CANDIDATE_MERGE = be978149e6f97119dcc6efe46759d49f19abb04a
CANDIDATE_NODE = 3240 / 3240 PASS
CANDIDATE_NODE_RUN = 32175212817
CANDIDATE_NODE_JOB = 95835700194
CANDIDATE_NODE_ARTIFACT = 9338898512
CANDIDATE_NODE_DIGEST = sha256:a26f975752ecf913b4f6dd5bcc12e64c40e9d3e53cb289394fd761fe30f5dfd4
CANONICAL_R00_STATUS = PASS_ALL_793_LEGAL_ROUTES
R00_RUN = 32175212436
R00_SUCCESSFUL_RERUN_JOB = 96053724121
R00_ARTIFACT = 9363986697
R00_DIGEST = sha256:6d3fc43ba00178bcfffa7b76d0b847c9987da41b57dd79f0d6eb954fefe7fe69
ROUTES legal / executed / terminal / pass / fail = 793 / 793 / 793 / 793 / 0
FULL_NINE_GATE_PASS = 793
SHARDS / HTML / PDF = 16 / 16 / 16
FINAL_CHECKPOINT = 793 authoritative
BROWSER_CONSOLE / PAGE ERRORS = 0 / 0
EXIT_CODE = 0
PRODUCT_MUTATION_USED = false
CAPACITY_AUTHORITY_MUTATION_USED = false
PER_ROUTE_PATCH_USED = false
```

The first current-head R00 attempt reached the deployed A03 smoke after all focused contracts, full regression and Chromium installation had passed, then failed because GitHub Pages returned HTTP 503 and left public source options empty. Failure artifact `9338901207` records `FAIL_DEPLOYED_PUBLIC_SITE_SMOKE`, `PUBLIC_SOURCE_OPTIONS_EMPTY` and the single console error `503`; page errors were zero. The exact same head was rerun with no repository change. Successful A03 artifact `9363525072` records `PASS_DEPLOYED_PUBLIC_SITE_SMOKE`, HTTP 200, 6 questions / 6 answers and zero console/page errors. The rerun then passed ten-route replay, three-route capacity replay and the full canonical 793-route replay. Final reconciliation therefore classifies the original A03 failure as transient deployed Pages availability, binds only the successful same-head authority, and does not mutate production runtime or replay authority.

## Forbidden scope remained closed

- no hidden application PatternSpec promotion
- no Global Context expansion
- no fraction-arithmetic capability promotion
- no second generator, validator, renderer or worksheet pipeline
- no q044 / Slice044 implementation inside Slice043 closeout

## Next resume task

```text
P03F_W3DirectProductVerticalSlice044Implementation
```

Slice043 is production-admitted D0. The frozen queue may now advance to Slice044 after this final reconciliation passes CI and merges.

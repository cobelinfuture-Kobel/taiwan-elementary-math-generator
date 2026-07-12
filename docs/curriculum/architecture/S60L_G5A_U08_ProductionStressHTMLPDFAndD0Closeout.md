# S60L — G5A-U08 Production Stress, HTML/PDF and D0 Closeout

```text
TASK = S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout
STATUS = PASS_CI_SYNCED_AND_MERGED
```

## Production promotion

```text
sourceId = g5a_u08_5a08
productionUse = allowed
distance = D0_G5A_U08
```

Coverage accepted:

```text
KnowledgePoints = 11
PatternGroups = 17
PatternSpecs = 30
application template families = 10
public count matrix = 1 / 11 / 29 / 72 / 120 / 200
cumulative validated stress = 1033
```

The production path includes numeric, application and reasoning questions, N and N+1 depth, daily-life and SDG contexts, worksheet assembly, answer-key assembly and the S60J renderer profiles.

## HTML/PDF acceptance

Committed artifacts:

```text
docs/curriculum/output/smoke/S60L_G5A_U08_PublicWorksheet.html
docs/curriculum/output/smoke/S60L_G5A_U08_PublicWorksheet.pdf
docs/curriculum/output/smoke/S60L_G5A_U08_PublicWorksheet.manifest.json
```

Verified results:

```text
questions = 120
answers = 120
question pages = 15
answer pages = 20
PDF pages = 35
nonblank pages = 35
DOM overflow = 0
PDF bbox overflow = 0
internal ID leak = 0
unresolved placeholder = 0
last answer page = nonblank
```

PDF text verification applies Unicode NFKC normalization before checking Traditional Chinese headings, because PDF extraction may represent `頁` as the compatibility glyph `⾴`. The visible text and content gate remain mandatory.

## FullFix history

1. Disabled production renderer debug data attributes.
2. Aligned the smoke artifact with the canonical 120-question coverage seed.
3. Replaced raw `{{` / `}}` counting with complete placeholder-token detection so CSS braces are not false positives.
4. Normalized extracted PDF text with Unicode NFKC before the Traditional Chinese title gate.
5. Removed the temporary diagnostic workflow before merge.

No acceptance criterion was removed or weakened.

## CI and merge evidence

```text
implementation PR = #86
implementation merge commit = 1ccdc578fcf6795e287c67f62742e6853e326b6f
main CI run = 29184339273
main tests = 975
main pass = 975
main fail = 0
main working tree = clean
main CI readback commit = f900ba0596fe8805b459899f9e6d5df654db9267
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_PUBLIC_UI_PRINT_QUERY_STATE_ACCEPTED_PRODUCTION_CLOSEOUT_PENDING
GOAL_DISTANCE_AFTER  = D0_G5A_U08_PRODUCTION_USE_ALLOWED_HTML_PDF_VERIFIED
DISTANCE_REDUCED     = Completed production promotion, 1,033-question stress coverage and committed 120-question HTML/PDF verification with answer key.
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = S60M_BatchA_AllUnitsProductionCloseout
```

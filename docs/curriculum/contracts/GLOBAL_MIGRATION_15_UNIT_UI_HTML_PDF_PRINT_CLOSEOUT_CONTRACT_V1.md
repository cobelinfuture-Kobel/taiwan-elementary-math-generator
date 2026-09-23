# Global Migration 15-Unit UI / HTML / PDF / Print Closeout Contract V1

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R08_15UnitGlobalMigrationUIHTMLPDFCloseout
```

## Purpose

R08 proves that the R07 Global-primary authority cutover did not regress the existing 15-unit product line.

The acceptance path is:

```text
public UI
→ Global-primary source / KP / PatternSpec authority
→ existing shared generator and validator
→ worksheet and answer key
→ HTML renderer
→ browser preview and print
→ Chromium PDF
```

## Required product evidence

```text
15 / 15 public source options
15 / 15 numeric worksheets
15 / 15 application worksheets
5 / 5 approved PBL projections
35 / 35 answer keys
35 / 35 Global-primary authority metadata
35 / 35 HTML renders
35 / 35 Chromium PDFs
0 page-overflow findings
live UI preview and print = PASS
full Node regression = PASS
```

Each generated document must contain all three authority projections:

```text
worksheetDocument.metadata.r07AuthoritativeConsumerCutover.authorityMode = GLOBAL_PRIMARY
worksheetDocument.configSnapshot.globalAuthorityCutover.authorityMode = GLOBAL_PRIMARY
worksheetDocument.publicControls.authorityMode = GLOBAL_PRIMARY
```

The legacy authority must remain:

```text
COMPATIBILITY_ALIAS_READ_ONLY
```

## Scope boundary

R08 does not add curriculum units, PatternSpecs, generators, validators, renderers, or UI features. It closes only the migration of the existing 15-unit product baseline.

```text
R08 closes 15-unit Global migration = true
R08 closes full 79-source product line = false
```

After R08, the mainline continues with W1–W8 delivery. The recursive-improvement administration backend remains forbidden until `P10_FullUIHTMLPDFPrintProductCloseout`.

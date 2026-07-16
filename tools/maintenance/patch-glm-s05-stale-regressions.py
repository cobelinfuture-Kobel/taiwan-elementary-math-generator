from pathlib import Path

REPLACEMENTS = {
    "tests/site/g4b-u01-public-selector-print-controls.test.js": [
        (
            'assert.equal(document.printOptions.rowsPerPage, 8);',
            'assert.equal(document.printOptions.rowsPerPage, 5);',
        ),
    ],
    "tests/site/g4b-u04-public-ui-print-query-state.test.js": [
        (
            'assert.equal(result.worksheetDocument.layoutResolution.layoutMode, "custom_with_caps");',
            'assert.equal(result.worksheetDocument.layoutResolution.layoutMode, "exact_approved_matrix");',
        ),
        (
            'assert.equal(result.worksheetDocument.layoutResolution.layoutMode, "auto_safe");',
            'assert.equal(result.worksheetDocument.layoutResolution.layoutMode, "exact_approved_matrix");',
        ),
    ],
    "tests/site/g4b-u04-r2e-context-query-ui.test.js": [
        (
            'assert.equal(document.publicControls.layoutMode, "custom_with_caps");',
            'assert.equal(document.publicControls.layoutMode, "exact_approved_matrix");',
        ),
    ],
}

for relative_path, replacements in REPLACEMENTS.items():
    path = Path(relative_path)
    text = path.read_text(encoding="utf-8")
    for old, new in replacements:
        count = text.count(old)
        if count != 1:
            raise SystemExit(f"Expected exactly one match in {relative_path}: {old!r}; got {count}")
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")

print("Patched GLM-S05 stale regression expectations.")

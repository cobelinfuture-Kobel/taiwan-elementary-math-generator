#!/usr/bin/env python3
"""Generate deterministic designer XLSX and audit CSV from the knowledge master index."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

FIXED_ZIP_TIME = (1980, 1, 1, 0, 0, 0)

SHEET_NAMES = [
    "Unit_Index",
    "Knowledge_Point_Map",
    "Operation_Models",
    "Number_Constraints",
    "Question_Coverage",
    "Migration_Review",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--master-index",
        default="data/curriculum/knowledge/master/POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1.master-index.json",
    )
    parser.add_argument("--units-dir", default="data/curriculum/knowledge/units")
    parser.add_argument(
        "--xlsx",
        default="build/reports/Golden_Knowledge_Operation_Master.xlsx",
    )
    parser.add_argument(
        "--csv",
        default="build/reports/Golden_Knowledge_Operation_Master.summary.csv",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def safe_load_unit(path: Path) -> dict | None:
    if not path.exists():
        return None
    return load_json(path)


def flatten(master: dict, units_dir: Path) -> dict[str, list[list[object]]]:
    unit_rows: list[list[object]] = [[
        "Source ID", "Unit Code", "Title", "Grade", "Semester", "Domain",
        "Conformance State", "Queue State", "Queue Ordinal", "Program Role",
        "Assigned Task", "Unit JSON", "Unit JSON Exists", "Knowledge Registry State",
        "Knowledge Points", "Operation Models", "Question Bindings",
        "Schema Validation", "Application Capability",
    ]]
    kp_rows: list[list[object]] = [[
        "Source ID", "KP ID", "Knowledge Point Name", "Scope",
        "Application Capability", "Numeric Count", "Application Count",
    ]]
    operation_rows: list[list[object]] = [[
        "Source ID", "KP ID", "Model ID", "Canonical Expressions",
        "Operand Roles", "Unknown Roles", "Answer Type", "Equivalent Forms",
    ]]
    constraint_rows: list[list[object]] = [[
        "Source ID", "KP ID", "Model ID", "Constraint", "Validation Invariant",
    ]]
    coverage_rows: list[list[object]] = [[
        "Source ID", "Numeric Coverage", "Application Coverage",
        "Knowledge Point Count", "Operation Model Count", "Question Binding Count",
        "Unmapped KP", "Unmapped Questions", "Conflicting Models",
    ]]
    review_rows: list[list[object]] = [[
        "Source ID", "Review Status", "Review Notes", "Knowledge Registry State",
        "Assigned Task",
    ]]

    for row in master.get("rows", []):
        unit_path = Path(row["unitJsonPath"])
        if not unit_path.is_absolute():
            unit_path = Path.cwd() / unit_path
        if not unit_path.exists():
            unit_path = units_dir / Path(row["unitJsonPath"]).name
        unit = safe_load_unit(unit_path)

        unit_rows.append([
            row.get("sourceId"), row.get("unitCode"), row.get("title"),
            row.get("grade"), row.get("semester"), row.get("domain"),
            row.get("conformanceStatus"), row.get("queueState"),
            row.get("queueOrdinal"), row.get("programRole"),
            row.get("assignedKnowledgeRegistryTaskId"), row.get("unitJsonPath"),
            bool(unit), row.get("knowledgeRegistryState"),
            row.get("knowledgePointCount"), row.get("operationModelCount"),
            row.get("existingQuestionBindingCount"), row.get("schemaValidationStatus"),
            row.get("applicationCapabilityState"),
        ])

        coverage = (unit or {}).get("coverage", {})
        knowledge_points = (unit or {}).get("knowledgePoints", [])
        bindings = (unit or {}).get("existingQuestionBindings", [])
        operation_count = sum(len(kp.get("operationModels", [])) for kp in knowledge_points)
        coverage_rows.append([
            row.get("sourceId"), coverage.get("numeric", "UNASSESSED"),
            coverage.get("application", "UNASSESSED"), len(knowledge_points),
            operation_count, len(bindings), row.get("unmappedKnowledgePointCount"),
            row.get("unmappedExistingQuestionCount"), row.get("conflictingOperationModelCount"),
        ])

        review = (unit or {}).get("review", {})
        review_rows.append([
            row.get("sourceId"), review.get("status", "PENDING"),
            " | ".join(review.get("notes", [])), row.get("knowledgeRegistryState"),
            row.get("assignedKnowledgeRegistryTaskId"),
        ])

        for kp in knowledge_points:
            kp_rows.append([
                row.get("sourceId"), kp.get("knowledgePointId"),
                kp.get("knowledgePointName"), kp.get("scope"),
                kp.get("applicationCapability"), kp.get("existingNumericQuestionCount"),
                kp.get("existingApplicationQuestionCount"),
            ])
            for model in kp.get("operationModels", []):
                operand_roles = "; ".join(
                    f"{key}={value}" for key, value in sorted(model.get("operandRoles", {}).items())
                )
                operation_rows.append([
                    row.get("sourceId"), kp.get("knowledgePointId"), model.get("modelId"),
                    " | ".join(model.get("canonicalExpressions", [])), operand_roles,
                    " | ".join(model.get("unknownRoles", [])), model.get("answerType"),
                    " | ".join(model.get("equivalentForms", [])),
                ])
                constraints = model.get("numberConstraints", [])
                invariants = model.get("validationInvariants", [])
                width = max(len(constraints), len(invariants), 1)
                for index in range(width):
                    constraint_rows.append([
                        row.get("sourceId"), kp.get("knowledgePointId"), model.get("modelId"),
                        constraints[index] if index < len(constraints) else "",
                        invariants[index] if index < len(invariants) else "",
                    ])

    return {
        "Unit_Index": unit_rows,
        "Knowledge_Point_Map": kp_rows,
        "Operation_Models": operation_rows,
        "Number_Constraints": constraint_rows,
        "Question_Coverage": coverage_rows,
        "Migration_Review": review_rows,
    }


def excel_column(index: int) -> str:
    result = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        result = chr(65 + remainder) + result
    return result


def cell_xml(ref: str, value: object, header: bool = False) -> str:
    style = ' s="1"' if header else ""
    if value is None:
        return f'<c r="{ref}"{style} t="inlineStr"><is><t></t></is></c>'
    if isinstance(value, bool):
        return f'<c r="{ref}"{style} t="b"><v>{1 if value else 0}</v></c>'
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return f'<c r="{ref}"{style}><v>{value}</v></c>'
    text = escape(str(value))
    preserve = ' xml:space="preserve"' if text != text.strip() else ""
    return f'<c r="{ref}"{style} t="inlineStr"><is><t{preserve}>{text}</t></is></c>'


def worksheet_xml(rows: list[list[object]]) -> str:
    max_columns = max((len(row) for row in rows), default=1)
    columns = "".join(
        f'<col min="{index}" max="{index}" width="22" customWidth="1"/>'
        for index in range(1, max_columns + 1)
    )
    body = []
    for row_index, row in enumerate(rows, start=1):
        cells = "".join(
            cell_xml(f"{excel_column(column_index)}{row_index}", value, row_index == 1)
            for column_index, value in enumerate(row, start=1)
        )
        body.append(f'<row r="{row_index}">{cells}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<sheetViews><sheetView workbookViewId="0">'
        '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
        '</sheetView></sheetViews>'
        f'<cols>{columns}</cols><sheetData>{"".join(body)}</sheetData>'
        f'<autoFilter ref="A1:{excel_column(max_columns)}1"/>'
        '</worksheet>'
    )


def zip_write(archive: zipfile.ZipFile, name: str, content: str) -> None:
    info = zipfile.ZipInfo(name, FIXED_ZIP_TIME)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    archive.writestr(info, content.encode("utf-8"))


def write_xlsx(path: Path, sheets: dict[str, list[list[object]]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet_entries = []
    rel_entries = []
    content_overrides = []
    for index, name in enumerate(SHEET_NAMES, start=1):
        sheet_entries.append(
            f'<sheet name="{escape(name)}" sheetId="{index}" r:id="rId{index}"/>'
        )
        rel_entries.append(
            f'<Relationship Id="rId{index}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{index}.xml"/>'
        )
        content_overrides.append(
            f'<Override PartName="/xl/worksheets/sheet{index}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )

    workbook = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<sheets>{"".join(sheet_entries)}</sheets></workbook>'
    )
    workbook_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        f'{"".join(rel_entries)}'
        f'<Relationship Id="rId{len(SHEET_NAMES)+1}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/></Relationships>'
    )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/styles.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        f'{"".join(content_overrides)}</Types>'
    )
    root_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
        'Target="xl/workbook.xml"/></Relationships>'
    )
    styles = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'
        '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
        '<fills count="2"><fill><patternFill patternType="none"/></fill>'
        '<fill><patternFill patternType="gray125"/></fill></fills>'
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
        '</styleSheet>'
    )

    with zipfile.ZipFile(path, "w") as archive:
        zip_write(archive, "[Content_Types].xml", content_types)
        zip_write(archive, "_rels/.rels", root_rels)
        zip_write(archive, "xl/workbook.xml", workbook)
        zip_write(archive, "xl/_rels/workbook.xml.rels", workbook_rels)
        zip_write(archive, "xl/styles.xml", styles)
        for index, name in enumerate(SHEET_NAMES, start=1):
            zip_write(archive, f"xl/worksheets/sheet{index}.xml", worksheet_xml(sheets[name]))


def write_summary_csv(path: Path, master: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = [
        "sourceId", "unitCode", "title", "grade", "semester", "domain",
        "conformanceStatus", "queueState", "queueOrdinal", "programRole",
        "assignedKnowledgeRegistryTaskId", "unitJsonPath", "unitJsonExists",
        "knowledgeRegistryState", "knowledgePointCount", "operationModelCount",
        "existingQuestionBindingCount", "schemaValidationStatus",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        for row in master.get("rows", []):
            writer.writerow(row)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> int:
    args = parse_args()
    master_path = Path(args.master_index)
    xlsx_path = Path(args.xlsx)
    csv_path = Path(args.csv)
    master = load_json(master_path)
    sheets = flatten(master, Path(args.units_dir))
    write_xlsx(xlsx_path, sheets)
    write_summary_csv(csv_path, master)

    with zipfile.ZipFile(xlsx_path) as archive:
        required = {
            "[Content_Types].xml", "xl/workbook.xml", "xl/styles.xml",
            *{f"xl/worksheets/sheet{i}.xml" for i in range(1, 7)},
        }
        missing = sorted(required.difference(archive.namelist()))
        if missing:
            raise RuntimeError(f"XLSX missing required entries: {missing}")

    readback = {
        "programId": master.get("programId"),
        "unitCount": len(master.get("rows", [])),
        "sheetRowCounts": {name: len(rows) - 1 for name, rows in sheets.items()},
        "xlsxPath": str(xlsx_path),
        "xlsxSha256": sha256(xlsx_path),
        "csvPath": str(csv_path),
        "csvSha256": sha256(csv_path),
    }
    print(json.dumps(readback, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

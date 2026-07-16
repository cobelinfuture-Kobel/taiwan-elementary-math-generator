#!/usr/bin/env python3
"""Inspect transient GLM-S03 PDFs for page, blank-page and text-boundary defects."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageStat
from pypdf import PdfReader

PAGE_RE = re.compile(
    r'<page[^>]*width="([0-9.]+)"[^>]*height="([0-9.]+)"[^>]*>(.*?)</page>',
    re.S,
)
WORD_RE = re.compile(
    r'<word[^>]*xMin="([0-9.]+)"[^>]*yMin="([0-9.]+)"[^>]*xMax="([0-9.]+)"[^>]*yMax="([0-9.]+)"',
    re.S,
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def inspect_pdf(pdf_path: Path, work_root: Path) -> dict:
    reader = PdfReader(str(pdf_path))
    page_count = len(reader.pages)
    render_dir = work_root / pdf_path.stem
    render_dir.mkdir(parents=True, exist_ok=True)
    prefix = render_dir / "page"
    subprocess.run(
        ["pdftoppm", "-png", "-r", "55", str(pdf_path), str(prefix)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )
    images = sorted(render_dir.glob("page-*.png"))
    nonblank_count = 0
    blank_pages: list[int] = []
    for index, image_path in enumerate(images, start=1):
        with Image.open(image_path) as image:
            grayscale = image.convert("L")
            stat = ImageStat.Stat(grayscale)
            minimum, maximum = stat.extrema[0]
            variance = stat.var[0]
            if minimum < 245 and maximum > minimum and variance > 3:
                nonblank_count += 1
            else:
                blank_pages.append(index)

    bbox_path = render_dir / "bbox.html"
    subprocess.run(
        ["pdftotext", "-bbox-layout", str(pdf_path), str(bbox_path)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )
    bbox_text = bbox_path.read_text(encoding="utf-8", errors="ignore")
    bbox_pages = PAGE_RE.findall(bbox_text)
    overflows: list[dict] = []
    for page_index, (width_raw, height_raw, body) in enumerate(bbox_pages, start=1):
        width = float(width_raw)
        height = float(height_raw)
        for coordinates in WORD_RE.findall(body):
            x_min, y_min, x_max, y_max = map(float, coordinates)
            if (
                x_min < -0.5
                or y_min < -0.5
                or x_max > width + 0.5
                or y_max > height + 0.5
            ):
                overflows.append(
                    {
                        "page": page_index,
                        "xMin": x_min,
                        "yMin": y_min,
                        "xMax": x_max,
                        "yMax": y_max,
                        "pageWidth": width,
                        "pageHeight": height,
                    }
                )

    return {
        "pdfBytes": pdf_path.stat().st_size,
        "pdfSha256": sha256(pdf_path),
        "pdfPageCount": page_count,
        "renderedPageCount": len(images),
        "nonblankPdfPageCount": nonblank_count,
        "blankPdfPageCount": len(blank_pages),
        "blankPdfPages": blank_pages,
        "bboxPageCount": len(bbox_pages),
        "pdfBoundingBoxOverflowCount": len(overflows),
        "firstPdfBoundingBoxOverflow": overflows[0] if overflows else None,
    }


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: inspect-glm-s03-pdfs.py <input.json> <output.json>")
    input_path = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    pdf_paths = [Path(item["pdfPath"]).resolve() for item in payload["pdfs"]]
    missing = [str(path) for path in pdf_paths if not path.is_file()]
    if missing:
        raise SystemExit(f"GLM_S03_PDF_MISSING:{missing[:3]}")

    temporary_root = Path(tempfile.mkdtemp(prefix="glm-s03-pdf-inspect-"))
    try:
        results = {
            str(path): inspect_pdf(path, temporary_root)
            for path in pdf_paths
        }
    finally:
        shutil.rmtree(temporary_root, ignore_errors=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps({"schemaVersion": "glm-s03-pdf-inspection-v1", "results": results}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

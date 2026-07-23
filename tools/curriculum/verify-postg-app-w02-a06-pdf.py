#!/usr/bin/env python3

import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageStat
from pypdf import PdfReader


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else 'docs/curriculum/output/postg-app/w02-a06')
    package = json.loads((root / 'POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE.json').read_text(encoding='utf-8'))
    jobs = [
        (
            'NUMERIC',
            root / 'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf',
            len(package['numericWorksheetDocument']['questionPages'])
            + len(package['numericWorksheetDocument']['answerKeyPages']),
        ),
        (
            'APPLICATION',
            root / 'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf',
            len(package['applicationWorksheetDocument']['questionPages'])
            + len(package['applicationWorksheetDocument']['answerKeyPages']),
        ),
    ]
    page_re = re.compile(r'<page[^>]*width="([0-9.]+)"[^>]*height="([0-9.]+)"[^>]*>(.*?)</page>', re.S)
    word_re = re.compile(r'<word[^>]*xMin="([0-9.]+)"[^>]*yMin="([0-9.]+)"[^>]*xMax="([0-9.]+)"[^>]*yMax="([0-9.]+)"', re.S)
    summary = []

    for mode, pdf_path, expected_pages in jobs:
        reader = PdfReader(str(pdf_path))
        actual_pages = len(reader.pages)
        row = {
            'mode': mode,
            'pdfPath': str(pdf_path),
            'expectedLogicalPages': expected_pages,
            'actualPdfPages': actual_pages,
            'sizeBytes': pdf_path.stat().st_size,
        }
        summary.append(row)
        print(json.dumps(row, ensure_ascii=False))
        if actual_pages != expected_pages:
            raise SystemExit(f'{mode} page mismatch actual={actual_pages} expected={expected_pages}')

        render_dir = Path('/tmp') / f'w02-a06-{mode.lower()}'
        render_dir.mkdir(parents=True, exist_ok=True)
        subprocess.run(['pdftoppm', '-png', '-r', '85', str(pdf_path), str(render_dir / 'page')], check=True)
        images = sorted(render_dir.glob('page-*.png'))
        if len(images) != expected_pages:
            raise SystemExit(f'{mode} rendered page mismatch actual={len(images)} expected={expected_pages}')
        for image_path in images:
            stat = ImageStat.Stat(Image.open(image_path).convert('L'))
            if stat.extrema[0][0] >= 250 or stat.var[0] <= 3:
                raise SystemExit(f'{mode} blank page {image_path}')

        bbox_path = render_dir / 'bbox.html'
        subprocess.run(['pdftotext', '-bbox-layout', str(pdf_path), str(bbox_path)], check=True)
        text = bbox_path.read_text(encoding='utf-8', errors='ignore')
        overflow = []
        for index, (width, height, body) in enumerate(page_re.findall(text), 1):
            width, height = float(width), float(height)
            for coords in word_re.findall(body):
                x0, y0, x1, y1 = map(float, coords)
                if x0 < -0.5 or y0 < -0.5 or x1 > width + 0.5 or y1 > height + 0.5:
                    overflow.append((index, x0, y0, x1, y1))
        if overflow:
            raise SystemExit(f'{mode} PDF bbox overflow count={len(overflow)} first={overflow[0]}')

        empty_pages = [index for index, page in enumerate(reader.pages, 1) if not (page.extract_text() or '').strip()]
        if empty_pages:
            raise SystemExit(f'{mode} text-empty PDF pages={empty_pages[:10]}')
        print(f'{mode} PDF PASS pages={expected_pages}')

    print(json.dumps({'status': 'PASS', 'jobs': summary}, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

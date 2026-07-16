import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { chromium } from "playwright";

const ROOT = resolve("docs/curriculum/output/g4b-u04-r4-flexible-layouts");
const MATRIX_PATH = resolve(ROOT, "matrix-manifest.json");
const RENDER_ROOT = "/tmp/g4b-u04-r4-flexible-layouts";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    encoding: "utf8",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

run("node", ["tools/curriculum/generate-g4b-u04-r4-flexible-layouts.mjs"]);
let matrix = JSON.parse(readFileSync(MATRIX_PATH, "utf8"));
rmSync(RENDER_ROOT, { recursive: true, force: true });
mkdirSync(RENDER_ROOT, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const scenario of matrix.scenarios) {
    const directory = resolve(ROOT, scenario.scenarioId);
    const manifestPath = resolve(directory, scenario.manifestFile);
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(pathToFileURL(resolve(directory, scenario.htmlFile)).href, { waitUntil: "networkidle" });
    const containment = await page.evaluate(() => {
      const questionPages = [...document.querySelectorAll(".g4b-u04-page--questions")];
      const cells = [...document.querySelectorAll(".g4b-u04-cell--question")];
      const responsePrompts = [...document.querySelectorAll(".g4b-u04-cell__response")];
      const answerSections = [...document.querySelectorAll(".worksheet-section--answer-key")];
      const overflow = cells.filter((node) =>
        node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
      );
      const overlaps = [];
      for (const questionPage of questionPages) {
        const pageCells = [...questionPage.querySelectorAll(".g4b-u04-cell--question")];
        const rects = pageCells.map((node) => ({
          number: node.querySelector(".g4b-u04-cell__number")?.textContent ?? null,
          rect: node.getBoundingClientRect(),
        }));
        for (let left = 0; left < rects.length; left += 1) {
          for (let right = left + 1; right < rects.length; right += 1) {
            const a = rects[left].rect;
            const b = rects[right].rect;
            const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (overlapWidth > 0.5 && overlapHeight > 0.5) {
              overlaps.push({
                left: rects[left].number,
                right: rects[right].number,
                overlapWidth,
                overlapHeight,
              });
            }
          }
        }
      }
      return {
        questionPageCount: questionPages.length,
        questionCellCount: cells.length,
        responsePromptCount: responsePrompts.length,
        answerSectionCount: answerSections.length,
        overflowCount: overflow.length,
        interCardOverlapCount: overlaps.length,
        firstOverflow: overflow[0]?.outerHTML.slice(0, 600) ?? null,
        firstOverlap: overlaps[0] ?? null,
      };
    });

    if (containment.questionCellCount !== scenario.questionCount) {
      throw new Error(`${scenario.scenarioId} question cells ${containment.questionCellCount}/${scenario.questionCount}`);
    }
    if (containment.questionPageCount !== scenario.expectedQuestionPageCount) {
      throw new Error(`${scenario.scenarioId} DOM pages ${containment.questionPageCount}/${scenario.expectedQuestionPageCount}`);
    }
    if (containment.responsePromptCount !== 0 || containment.answerSectionCount !== 0) {
      throw new Error(`${scenario.scenarioId} question-only contract failed: ${JSON.stringify(containment)}`);
    }
    if (containment.overflowCount !== 0) {
      throw new Error(`${scenario.scenarioId} DOM overflow ${containment.overflowCount}; ${containment.firstOverflow}`);
    }
    if (containment.interCardOverlapCount !== 0) {
      throw new Error(`${scenario.scenarioId} overlap ${containment.interCardOverlapCount}; ${JSON.stringify(containment.firstOverlap)}`);
    }

    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: resolve(directory, scenario.pdfFile),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    await page.close();

    scenario.domOverflowCount = 0;
    scenario.interCardOverlapCount = 0;
    scenario.responsePromptCount = 0;
    writeFileSync(manifestPath, `${JSON.stringify(scenario, null, 2)}\n`, "utf8");

    const renderedDirectory = resolve(RENDER_ROOT, scenario.scenarioId);
    mkdirSync(renderedDirectory, { recursive: true });
    run("pdftoppm", [
      "-png",
      "-r",
      "110",
      resolve(directory, scenario.pdfFile),
      resolve(renderedDirectory, "page"),
    ]);
  }
} finally {
  await browser.close();
}

run("python3", ["-c", String.raw`
from pathlib import Path
from PIL import Image, ImageStat
from pypdf import PdfReader
import json
import subprocess
import re

root = Path('docs/curriculum/output/g4b-u04-r4-flexible-layouts')
render_root = Path('/tmp/g4b-u04-r4-flexible-layouts')
matrix_path = root / 'matrix-manifest.json'
matrix = json.loads(matrix_path.read_text(encoding='utf-8'))
for scenario in matrix['scenarios']:
    directory = root / scenario['scenarioId']
    manifest_path = directory / scenario['manifestFile']
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    pdf = directory / scenario['pdfFile']
    expected = scenario['expectedQuestionPageCount']
    reader = PdfReader(str(pdf))
    if len(reader.pages) != expected:
        raise SystemExit(f"{scenario['scenarioId']} PDF pages {len(reader.pages)}/{expected}")
    files = sorted((render_root / scenario['scenarioId']).glob('page-*.png'))
    if len(files) != expected:
        raise SystemExit(f"{scenario['scenarioId']} rendered pages {len(files)}/{expected}")
    nonblank = 0
    for path in files:
        image = Image.open(path).convert('L')
        stat = ImageStat.Stat(image)
        if stat.extrema[0][0] < 245 and stat.var[0] > 5:
            nonblank += 1
    if nonblank != expected:
        raise SystemExit(f"{scenario['scenarioId']} nonblank pages {nonblank}/{expected}")
    bbox = Path('/tmp') / f"{scenario['scenarioId']}-r4-bbox.html"
    subprocess.run(['pdftotext', '-bbox-layout', str(pdf), str(bbox)], check=True)
    text = bbox.read_text(encoding='utf-8', errors='ignore')
    page_re = re.compile(r'<page[^>]*width="([0-9.]+)"[^>]*height="([0-9.]+)"[^>]*>(.*?)</page>', re.S)
    word_re = re.compile(r'<word[^>]*xMin="([0-9.]+)"[^>]*yMin="([0-9.]+)"[^>]*xMax="([0-9.]+)"[^>]*yMax="([0-9.]+)"', re.S)
    pages = page_re.findall(text)
    if len(pages) != expected:
        raise SystemExit(f"{scenario['scenarioId']} bbox pages {len(pages)}/{expected}")
    overflow = []
    for page_index, (width, height, body) in enumerate(pages, 1):
        width, height = float(width), float(height)
        for coords in word_re.findall(body):
            x0, y0, x1, y1 = map(float, coords)
            if x0 < -0.5 or y0 < -0.5 or x1 > width + 0.5 or y1 > height + 0.5:
                overflow.append((page_index, x0, y0, x1, y1, width, height))
    if overflow:
        raise SystemExit(f"{scenario['scenarioId']} PDF bbox overflow {len(overflow)} first={overflow[0]}")
    manifest['actualPdfPageCount'] = expected
    manifest['nonblankPdfPageCount'] = expected
    manifest['pdfBoundingBoxOverflowCount'] = 0
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
`]);

matrix = JSON.parse(readFileSync(MATRIX_PATH, "utf8"));
for (const scenario of matrix.scenarios) {
  const directory = resolve(ROOT, scenario.scenarioId);
  const manifestPath = resolve(directory, scenario.manifestFile);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const pdfBytes = readFileSync(resolve(directory, scenario.pdfFile));
  Object.assign(manifest, {
    status: "PASS_PRODUCTION_LAYOUT_ACCEPTANCE",
    pdfSha256: sha256(pdfBytes),
    pdfBytes: pdfBytes.length,
  });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  Object.assign(scenario, manifest);
}
matrix.status = "PASS_PRODUCTION_LAYOUT_ACCEPTANCE";
writeFileSync(MATRIX_PATH, `${JSON.stringify(matrix, null, 2)}\n`, "utf8");
console.log(JSON.stringify(matrix, null, 2));

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { chromium } from "playwright";

const ROOT = resolve("docs/curriculum/output/experiments/g4b-u04-r3b-3x5");
const MANIFEST_PATH = resolve(ROOT, "manifest.json");
const RENDER_ROOT = "/tmp/g4b-u04-r3b-3x5-rendered";

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

run("node", ["tools/curriculum/generate-g4b-u04-r3b-3x5-experiment.mjs"]);
let manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(pathToFileURL(resolve(ROOT, manifest.htmlFile)).href, { waitUntil: "networkidle" });
  const containment = await page.evaluate(() => {
    const cells = [...document.querySelectorAll(".g4b-u04-cell")]
      .filter((node) => !node.classList.contains("g4b-u04-cell--filler"));
    const overflow = cells.filter((node) =>
      node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
    );
    return {
      cellCount: cells.length,
      overflowCount: overflow.length,
      firstOverflow: overflow[0]?.outerHTML.slice(0, 800) ?? null,
    };
  });
  if (containment.cellCount !== 200) {
    throw new Error(`R3B rendered card count ${containment.cellCount}/200`);
  }
  if (containment.overflowCount !== 0) {
    throw new Error(`R3B DOM overflow ${containment.overflowCount}; first=${containment.firstOverflow}`);
  }
  manifest.domOverflowCount = 0;
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: resolve(ROOT, manifest.pdfFile),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  });
  await page.close();
} finally {
  await browser.close();
}
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

rmSync(RENDER_ROOT, { recursive: true, force: true });
mkdirSync(RENDER_ROOT, { recursive: true });
const pdfPath = resolve(ROOT, manifest.pdfFile);
run("pdftoppm", ["-png", "-r", "110", pdfPath, `${RENDER_ROOT}/page`]);
run("python3", ["-c", String.raw`
from pathlib import Path
from PIL import Image, ImageStat
from pypdf import PdfReader
import json

root = Path('docs/curriculum/output/experiments/g4b-u04-r3b-3x5')
manifest_path = root / 'manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
pdf = root / manifest['pdfFile']
reader = PdfReader(str(pdf))
if len(reader.pages) != 14:
    raise SystemExit(f"R3B PDF page count {len(reader.pages)}/14")
files = sorted(Path('/tmp/g4b-u04-r3b-3x5-rendered').glob('page-*.png'))
if len(files) != 14:
    raise SystemExit(f"R3B rendered page count {len(files)}/14")
nonblank = 0
for path in files:
    image = Image.open(path).convert('L')
    stat = ImageStat.Stat(image)
    if stat.extrema[0][0] < 245 and stat.var[0] > 5:
        nonblank += 1
if nonblank != 14:
    raise SystemExit(f"R3B nonblank page count {nonblank}/14")
manifest['actualPdfPageCount'] = 14
manifest['nonblankPdfPageCount'] = 14
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
`]);

const bboxPath = "/tmp/g4b-u04-r3b-3x5-bbox.html";
run("pdftotext", ["-bbox-layout", pdfPath, bboxPath]);
const bboxText = readFileSync(bboxPath, "utf8");
const pages = [...bboxText.matchAll(/<page[^>]*width="([0-9.]+)"[^>]*height="([0-9.]+)"[^>]*>([\s\S]*?)<\/page>/g)];
if (pages.length !== 14) {
  throw new Error(`R3B bbox page count ${pages.length}/14`);
}
const overflow = [];
for (const [pageOffset, match] of pages.entries()) {
  const width = Number(match[1]);
  const height = Number(match[2]);
  const body = match[3];
  for (const word of body.matchAll(/<word[^>]*xMin="([0-9.]+)"[^>]*yMin="([0-9.]+)"[^>]*xMax="([0-9.]+)"[^>]*yMax="([0-9.]+)"/g)) {
    const [x0, y0, x1, y1] = word.slice(1).map(Number);
    if (x0 < -0.5 || y0 < -0.5 || x1 > width + 0.5 || y1 > height + 0.5) {
      overflow.push({ page: pageOffset + 1, x0, y0, x1, y1, width, height });
    }
  }
}
if (overflow.length > 0) {
  throw new Error(`R3B PDF bbox overflow ${overflow.length}; first=${JSON.stringify(overflow[0])}`);
}

manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const pdfBytes = readFileSync(pdfPath);
manifest.status = "PASS_TEST_ONLY_AWAITING_USER_CONFIRMATION";
manifest.pdfBoundingBoxOverflowCount = 0;
manifest.pdfSha256 = sha256(pdfBytes);
manifest.pdfBytes = pdfBytes.length;
manifest.productionProfileChanged = false;
manifest.nextDecision = "USER_REVIEW_PDF_THEN_DECIDE_PRODUCTION_CHANGE";
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));

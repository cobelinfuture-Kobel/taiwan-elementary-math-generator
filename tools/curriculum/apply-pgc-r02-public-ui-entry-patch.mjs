import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function replaceExact(filePath, before, after) {
  const absolute = path.join(repoRoot, filePath);
  const original = fs.readFileSync(absolute, "utf8");
  if (!original.includes(before)) {
    if (original.includes(after)) return false;
    throw new Error(`${filePath}: expected patch anchor missing`);
  }
  const updated = original.replace(before, after);
  fs.writeFileSync(absolute, updated);
  return true;
}

const changes = [];
changes.push(replaceExact(
  "site/index.html",
  'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="200" value="20"',
  'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="20" value="20" data-capacity-status="fail-closed-pending-pgc-r03"',
));
changes.push(replaceExact(
  "site/index.html",
  '<script type="module" src="./assets/browser/public-control-ui.js"></script>',
  '<script type="module" src="./assets/browser/public-capability-ui.js"></script>',
));
changes.push(replaceExact(
  "site/404.html",
  'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="200" value="20"',
  'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="20" value="20" data-capacity-status="fail-closed-pending-pgc-r03"',
));
changes.push(replaceExact(
  "site/404.html",
  '<script type="module" src="./assets/browser/main.js"></script>\n</body>',
  '<script type="module" src="./assets/browser/main.js"></script>\n  <script type="module" src="./assets/browser/public-capability-ui.js"></script>\n</body>',
));
changes.push(replaceExact(
  "site/pixel/index.html",
  'id="pixel-question-count" type="number" min="1" max="200" value="20"',
  'id="pixel-question-count" type="number" min="1" max="20" value="20" data-capacity-status="fail-closed-pending-pgc-r03"',
));
changes.push(replaceExact(
  "site/pixel/index.html",
  '<script type="module" src="./pixel-ui.js"></script>\n  <script type="module" src="./pixel-live-preview.js"></script>',
  '<script type="module" src="./pixel-ui.js"></script>\n  <script type="module" src="./pixel-public-capability-ui.js"></script>\n  <script type="module" src="./pixel-live-preview.js"></script>',
));
changes.push(replaceExact(
  "site/assets/browser/public-capability-ui.js",
  `for (const panel of [knowledgePointPanel, patternGroupPanel, sourceSelect, section]) {
  if (!panel) continue;
  new MutationObserver(scheduleSync).observe(panel, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-selected", "data-visible", "data-source-id", "disabled"],
  });
}`,
  `for (const panel of [knowledgePointPanel, patternGroupPanel, sourceSelect]) {
  if (!panel) continue;
  new MutationObserver(scheduleSync).observe(panel, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-selected", "data-source-id"],
  });
}`,
));
changes.push(replaceExact(
  "site/pixel/pixel-public-capability-ui.js",
  `for (const panel of [knowledgePointPanel, patternGroupPanel, questionField, depthField, contextField]) {
  if (!panel) continue;
  new MutationObserver(scheduleSync).observe(panel, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-selected", "data-visible", "disabled"],
  });
}`,
  `for (const panel of [knowledgePointPanel, patternGroupPanel]) {
  if (!panel) continue;
  new MutationObserver(scheduleSync).observe(panel, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-selected"],
  });
}`,
));

console.log(`PGC_R02_ENTRY_PATCH_CHANGED=${changes.filter(Boolean).length}`);

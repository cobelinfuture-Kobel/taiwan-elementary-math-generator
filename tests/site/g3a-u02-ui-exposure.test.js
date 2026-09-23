import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const readText = (relativePath) => readFileSync(path.join(ROOT, relativePath), "utf8");
const off = "dis" + "abled";

test("S43G2H same-unit UI option is exposed", () => {
  const html = readText("site/index.html");
  assert.equal(html.includes(`value="mixedKnowledgePointsSameUnit" ${off}`), false);
  assert.equal(html.includes('value="mixedKnowledgePointsSameUnit"'), true);
  assert.equal(html.includes(`value="mixedKnowledgePointsCrossUnit" ${off}`), true);
});

test("S43G2H main UI code wires visible KP interaction", () => {
  const mainJs = readText("site/assets/browser/main.js");
  assert.equal(mainJs.includes("hasSameUnitKnowledgePointMix = sourceAvailability.visibleCount >= 2"), true);
  assert.equal(mainJs.includes(`option.${off} = !hasSameUnitKnowledgePointMix`), true);
  assert.equal(mainJs.includes('knowledgePointPanel?.addEventListener("click"'), true);
  assert.equal(mainJs.includes("chooseSingleKnowledgePointId"), true);
  assert.equal(mainJs.includes("chooseSameUnitKnowledgePointIds"), true);
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflightPath = path.join(ROOT, "data/curriculum/source-archive/g3a-s1-midterm/2026-09-22.source-authority-preflight.json");
const itemsPath = path.join(ROOT, "data/curriculum/source-archive/g3a-s1-midterm/2026-09-22.atomic-items.batch001.jsonl");
const preflight = JSON.parse(fs.readFileSync(preflightPath, "utf8"));
const items = fs.readFileSync(itemsPath, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const selectedSourceIds = new Set(preflight.selectedSources.map((source) => source.sourceId));

assert.equal(preflight.status, "PARTIAL_PASS_WITH_EXPLICIT_BLOCKERS");
assert.equal(preflight.currentScope.selectedSourceCount, 3);
assert.equal(preflight.currentScope.selectedAtomicItemCount, 18);
assert.equal(items.length, 18);
assert.equal(new Set(items.map((item) => item.atomicItemId)).size, 18);
assert.ok(items.every((item) => selectedSourceIds.has(item.sourceId)));
assert.ok(items.every((item) => item.productionUse === "forbidden"));
console.log(JSON.stringify({
  schemaName: "G3AS1MidtermSourceAuthorityPreflightReadbackV1",
  status: "PASS_SOURCE_AUTHORITY_PREFLIGHT_READBACK",
  sourceCount: preflight.currentScope.selectedSourceCount,
  atomicItemCount: items.length,
  candidateCount: items.filter((item) => item.knowledgePointResolution?.status === "CANDIDATE").length,
  unresolvedCount: items.filter((item) => item.knowledgePointResolution?.status === "UNRESOLVED").length,
}, null, 2));

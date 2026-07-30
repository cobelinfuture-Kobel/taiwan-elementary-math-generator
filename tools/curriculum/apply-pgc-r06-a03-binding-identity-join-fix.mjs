import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetPath = path.join(repoRoot, "tools/curriculum/materialize-pgc-r06-a03-capacity-public-runtime-repair-reconciliation.mjs");
const marker = "PGC-R06 A03 canonical case/question-type binding join";

const beforeMap = `  const routesByBinding = new Map();
  for (const route of targetRoutes) {
    for (const bindingId of route.bindingIds ?? []) {
      if (!routesByBinding.has(bindingId)) routesByBinding.set(bindingId, []);
      routesByBinding.get(bindingId).push(route);
    }
  }`;

const afterMap = `  const routesByBindingKey = new Map();
  for (const route of targetRoutes) {
    const key = \`${"${route.caseId}::${route.questionType}"}\`;
    if (!routesByBindingKey.has(key)) routesByBindingKey.set(key, []);
    routesByBindingKey.get(key).push(route);
  }`;

const beforeLookup = `    const routes = routesByBinding.get(binding.bindingId);`;
const afterLookup = `    const routes = routesByBindingKey.get(\`${"${binding.caseId}::${binding.questionType}"}\`);`;

let source = fs.readFileSync(targetPath, "utf8");
if (source.includes(marker)) {
  console.log("PGC_R06_A03_BINDING_JOIN_FIX=ALREADY_APPLIED");
} else {
  if (!source.includes(beforeMap) || !source.includes(beforeLookup)) {
    throw new Error("PGC_R06_A03_BINDING_JOIN_ANCHOR_MISSING");
  }
  source = source.replace(beforeMap, afterMap).replace(beforeLookup, afterLookup);
  fs.writeFileSync(targetPath, `${source.trimEnd()}\n\n// ${marker}\n`);
  console.log("PGC_R06_A03_BINDING_JOIN_FIX=APPLIED");
}

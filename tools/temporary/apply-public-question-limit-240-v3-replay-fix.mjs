import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const materializerPath = path.join(repoRoot, "tools/curriculum/materialize-pgc-r03-capacity-aware-reconciliation.mjs");

function replaceExact(content, from, to, expectedCount = 1) {
  const count = content.split(from).length - 1;
  if (count !== expectedCount) throw new Error(`expected ${expectedCount} occurrence(s), found ${count}: ${from}`);
  return content.replaceAll(from, to);
}

let content = fs.readFileSync(materializerPath, "utf8");
content = replaceExact(
  content,
  `function isIllegalRoute(route) {\n  const codes = observedErrorCodes(route);\n  return route.failedSeedCount === SEED_COUNT\n    && codes.length > 0\n    && codes.every((code) => ILLEGAL_ROUTE_ERROR_CODES.has(code));\n}`,
  `function isIllegalRoute(route) {\n  const codes = observedErrorCodes(route);\n  return route.legalRouteStatus === "ILLEGAL"\n    || route.legalRoute === false\n    || (route.failedSeedCount === SEED_COUNT\n      && codes.length > 0\n      && codes.every((code) => ILLEGAL_ROUTE_ERROR_CODES.has(code)));\n}`,
);
content = replaceExact(
  content,
  "safeArray(prior.bindingEvidence)",
  "safeArray(prior.bindingEvidence ?? prior.historicalBindingEvidence)",
  2,
);
fs.writeFileSync(materializerPath, content);
console.log("PUBLIC_QUESTION_LIMIT_240_V3_REPLAY_FIX_APPLIED");

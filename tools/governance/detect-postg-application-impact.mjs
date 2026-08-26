import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const EXACT_PATHS = new Set([
  "data/project/governance/postg-ci-two-gate-policy.json",
  "tests/governance/postg-ci-two-gate-policy.test.js",
  "site/assets/browser/pipeline/build-worksheet-document.js",
  "site/modules/core/worksheet-formatting.js",
  ".github/workflows/postg-application-pr-gate.yml",
  ".github/workflows/node-test.yml",
  ".github/workflows/milestone-claim-integrity.yml",
]);

const PREFIXES = [
  "data/curriculum/application/",
  "src/curriculum/application/",
  "docs/curriculum/output/postg-app/",
];

const REGEXES = [
  /^data\/curriculum\/knowledge\/units\/[^/]+\.knowledge-operation\.json$/,
  /^data\/project\/milestones\/POSTG-APP-.*\.claim\.json$/,
  /^tools\/curriculum\/[^/]*postg-app[^/]*$/,
  /^tests\/curriculum\/postg-app-.*\.test\.js$/,
  /^docs\/curriculum\/output\/POSTG_APP_.*/,
  /^\.github\/workflows\/postg-app-.*\.ya?ml$/,
];

export function isPostgApplicationPath(file) {
  const normalized = file.replace(/\\/g, "/");
  return EXACT_PATHS.has(normalized)
    || PREFIXES.some((prefix) => normalized.startsWith(prefix))
    || REGEXES.some((regex) => regex.test(normalized));
}

export function detectPostgApplicationImpact(files) {
  const matchedFiles = [...new Set(files.map((file) => file.trim()).filter(Boolean).filter(isPostgApplicationPath))].sort();
  return {
    postgChanged: matchedFiles.length > 0,
    matchedFiles,
  };
}

export function runCli(args = process.argv.slice(2)) {
  const input = args[0];
  const githubOutput = args[1] ?? null;
  if (!input) throw new Error("POSTG_IMPACT_CHANGED_FILES_REQUIRED");
  const files = fs.readFileSync(input, "utf8").split(/\r?\n/).filter(Boolean);
  const result = detectPostgApplicationImpact(files);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (githubOutput) fs.appendFileSync(githubOutput, `postg_changed=${result.postgChanged}\n`);
  return result;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runCli();

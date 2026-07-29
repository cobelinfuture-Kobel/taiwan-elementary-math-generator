import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.g3b-u04-producer-locator.json");

const TOKENS = Object.freeze([
  "g3b_u04_3b04",
  "kp_g3b_u04_add_then_divide",
  "kp_g3b_u04_multiply_then_divide_average_unit_price",
  "kp_g3b_u04_subtract_then_divide",
  "kp_g3b_u04_total_minus_shared_amount",
  "kp_g3b_u04_composite_multiplicative_ratio",
  "kp_g3b_u04_multiplicative_quantity_chain",
  "ps_g3b_u04_add_divide_joint_purchase_equal_share",
  "ps_g3b_u04_mul_div_buy_get_free_average_price",
  "ps_g3b_u04_sub_div_used_amount_then_share",
  "ps_g3b_u04_total_minus_share_wallet_minus_shared_purchase",
  "ps_g3b_u04_ratio_length_ratio_composition",
  "ps_g3b_u04_quantity_chain_personal_quantity_ratio_chain",
]);

const SKIP_DIRS = new Set([".git", "node_modules", ".cache", "coverage", "dist"]);
const TEXT_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".json", ".md", ".csv", ".yml", ".yaml", ".html", ".txt"]);

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function classify(filePath) {
  if (filePath.startsWith("site/modules/") || filePath.startsWith("src/")) return "runtime_or_source";
  if (filePath.startsWith("site/assets/")) return "browser_pipeline";
  if (filePath.startsWith("tests/")) return "test";
  if (filePath.startsWith("tools/")) return "tool";
  if (filePath.startsWith("data/")) return "data_authority";
  if (filePath.startsWith("docs/")) return "documentation";
  if (filePath.startsWith(".github/")) return "workflow";
  return "other";
}

function matchingLines(text, token) {
  return text.split(/\r?\n/).flatMap((line, index) => line.includes(token) ? [{ line: index + 1, excerpt: line.trim().slice(0, 500) }] : []);
}

export function locatePgcR05G3BU04Producers() {
  const matches = [];
  for (const filePath of walk(repoRoot)) {
    const repoPath = relative(filePath);
    let text;
    try { text = fs.readFileSync(filePath, "utf8"); } catch { continue; }
    const tokenMatches = TOKENS.flatMap((token) => {
      const lines = matchingLines(text, token);
      return lines.length ? [{ token, occurrences: lines.length, lines }] : [];
    });
    if (tokenMatches.length === 0) continue;
    matches.push({
      path: repoPath,
      classification: classify(repoPath),
      tokenMatches,
    });
  }

  const runtimeCandidates = matches.filter((entry) => ["runtime_or_source", "browser_pipeline"].includes(entry.classification));
  const report = {
    schemaName: "PgcR05G3BU04ProducerLocatorV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R05_G3B_U04_ApplicationDiversityFullFix_ProducerLocator",
    status: runtimeCandidates.length > 0 ? "PASS_G3B_U04_PRODUCERS_LOCATED" : "FAIL_G3B_U04_PRODUCERS_NOT_LOCATED",
    searchedTokenCount: TOKENS.length,
    matchedFileCount: matches.length,
    runtimeCandidateCount: runtimeCandidates.length,
    runtimeCandidatePaths: runtimeCandidates.map((entry) => entry.path),
    matches,
    boundary: {
      runtimeModified: false,
      generatorAdded: false,
      validatorAdded: false,
      worksheetPipelineAdded: false,
    },
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`PGC_R05_G3B_U04_LOCATOR=${JSON.stringify({ status: report.status, matchedFileCount: report.matchedFileCount, runtimeCandidatePaths: report.runtimeCandidatePaths })}`);
  if (runtimeCandidates.length === 0) process.exitCode = 1;
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) locatePgcR05G3BU04Producers();

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const searchRoots = [
  path.join(repoRoot, "site/modules/curriculum"),
  path.join(repoRoot, "site/assets/browser"),
  path.join(repoRoot, "src"),
  path.join(repoRoot, "data/curriculum"),
];
const outputPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R04.remaining-producer-locator.json");

const patternSpecIds = [
  "ps_g3a_u03_2digit_by_1digit_carry",
  "ps_g3a_u03_10_multiple_by_1digit",
  "ps_g3a_u03_3digit_by_1digit",
  "ps_g3a_u03_consecutive_multiplication_two_step",
  "ps_g3a_u03_3digit_zero_middle_by_1digit",
  "ps_g3b_u04_consecutive_multiplication",
  "ps_g4a_u01_boundary_number_difference",
  "ps_g4b_u04_approx_symbol_reading",
  "ps_g5a_u02_factor_enumeration_trial_division",
  "ps_g5a_u02_factor_pair_enumeration",
  "ps_g5a_u02_factor_list_from_pairs",
  "ps_g5a_u02_problem_type_classification",
  "ps_g5a_u03a_relation_from_product",
  "ps_g5a_u03a_complete_factor_multiple_statement",
  "ps_g5a_u03a1_lcm_direct",
  "ps_g5a_u03a1_first_common_multiples",
  "ps_g5a_u03a1_minimum_common_group_total",
  "ps_g5a_u03a1_possible_common_totals_in_range",
  "ps_g5a_u03a1_construct_number_divisibility",
  "ps_g5a_u03a1_possible_digits_for_divisibility",
  "ps_g6a_u01_lcm_direct",
  "ps_g6a_u01_lcm_from_prime_exponents",
  "ps_g3a_u08_unit_fraction_accumulation_fraction_numeric",
];

function walk(dir, output = []) {
  if (!fs.existsSync(dir)) return output;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else if (/\.(?:js|mjs|json)$/.test(entry.name)) output.push(full);
  }
  return output;
}

function lineMatches(content, id) {
  return content.split(/\r?\n/)
    .map((line, index) => ({ lineNumber: index + 1, line: line.trim() }))
    .filter((row) => row.line.includes(id))
    .slice(0, 20);
}

const files = searchRoots.flatMap((root) => walk(root));
const results = [];
for (const id of patternSpecIds) {
  const matches = [];
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(id)) continue;
    matches.push({
      path: path.relative(repoRoot, file).replaceAll(path.sep, "/"),
      lines: lineMatches(content, id),
      generatorSignals: ["generate", "buildQuestion", "makeQuestion", "FIXTURES", "CASES", "WITNESSES", "questionCount"]
        .filter((signal) => content.includes(signal)),
      validatorSignals: ["validate", "error", "duplicate", "exhaust", "question_count"]
        .filter((signal) => content.toLowerCase().includes(signal)),
    });
  }
  results.push({ patternSpecId: id, matches });
}

const report = {
  schemaName: "PgcR04RemainingProducerLocatorV1",
  schemaVersion: 1,
  taskId: "PGC-R04_NumericGenerationFullFix_RemainingProducerLocator",
  status: results.every((row) => row.matches.length > 0) ? "PASS_ALL_IDS_LOCATED" : "FAIL_MISSING_ID_LOCATION",
  patternSpecCount: patternSpecIds.length,
  locatedPatternSpecCount: results.filter((row) => row.matches.length > 0).length,
  results,
};
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`PGC_R04_REMAINING_PRODUCER_LOCATOR=${JSON.stringify({ status: report.status, patternSpecCount: report.patternSpecCount, locatedPatternSpecCount: report.locatedPatternSpecCount })}`);
for (const row of results) console.log(`${row.patternSpecId}=${row.matches.map((match) => match.path).join("|")}`);
if (report.status !== "PASS_ALL_IDS_LOCATED") process.exitCode = 2;

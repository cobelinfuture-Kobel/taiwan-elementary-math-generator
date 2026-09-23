import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  detectGoldenDiffDrift,
  validateGoldenBatchController,
} from "../../site/modules/curriculum/golden/golden-batch-controller.js";

const ROOT = resolve(import.meta.dirname, "../..");
const REGISTRY_PATH = resolve(ROOT, "data/curriculum/golden/G5AU08_GOLDEN_V1.unit-conformance.json");
const CONTROLLER_PATH = resolve(ROOT, "data/curriculum/golden/G5AU08_GOLDEN_V1.batch-controller.json");
const PROGRAM_PATH = resolve(ROOT, "data/project/programs/G5AU08_GOLDEN_SAMPLE_V1.json");

function argument(name) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? null;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const registry = await readJson(REGISTRY_PATH);
const controller = await readJson(CONTROLLER_PATH);
const program = await readJson(PROGRAM_PATH);
const controllerAudit = validateGoldenBatchController(controller, registry, program);

let diffAudit = {
  ok: true,
  errors: [],
  changedFileCount: 0,
  addedUnitSpecificRuntimeCount: 0,
};
const baseRef = argument("base-ref");
if (baseRef) {
  const nameStatus = execFileSync(
    "git",
    ["diff", "--name-status", `${baseRef}...HEAD`],
    { cwd: ROOT, encoding: "utf8" },
  );
  diffAudit = detectGoldenDiffDrift(nameStatus);
}

const errors = [...controllerAudit.errors, ...diffAudit.errors];
const result = {
  schemaVersion: 1,
  taskId: "GS06_G5AU08_BatchControllerAntiDriftAndGoldenD0Closeout",
  status: errors.length === 0 ? "PASS_GOLDEN_CONTROLLER_VALIDATION" : "FAIL_GOLDEN_CONTROLLER_VALIDATION",
  controllerAudit,
  diffAudit,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length > 0) process.exit(1);

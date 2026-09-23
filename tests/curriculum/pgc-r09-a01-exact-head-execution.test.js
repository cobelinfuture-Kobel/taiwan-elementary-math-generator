import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

test("PGC-R09 A01 consumes the frozen A00 matrix and reuses the canonical R08 full-route runner", () => {
  const a00 = readJson("data/curriculum/public-generation/PGC-R09-A00.d0-closeout-preflight.json");
  const a01 = readJson("data/curriculum/public-generation/PGC-R09-A01.exact-head-execution.json");

  assert.equal(a00.status, "PASS_R09_A00_D0_CLOSEOUT_PREFLIGHT_FROZEN");
  assert.equal(a01.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(a01.taskId, "PGC-R09-A01_ExactHeadRegressionAndCapabilityGateExecution");
  assert.equal(a01.status, "PENDING_EXACT_HEAD_EXECUTION");
  assert.equal(a01.preconditionPath, "data/curriculum/public-generation/PGC-R09-A00.d0-closeout-preflight.json");
  assert.equal(a01.runnerPath, "tools/curriculum/run-pgc-r08-a03-all-legal-routes.mjs");
  assert.equal(a01.workflowPath, ".github/workflows/pgc-r00-public-generation-scope.yml");

  assert.equal(a01.exactHeadGate.fullRepositoryRegression, true);
  assert.equal(a01.exactHeadGate.canonicalPGCR00Contract, true);
  assert.equal(a01.exactHeadGate.all793LegalRouteReplay, true);
  assert.equal(a01.exactHeadGate.questionCountPerRoute, 20);
  assert.equal(a01.exactHeadGate.answerKeyCountPerRoute, 20);
  assert.equal(a01.exactHeadGate.requiredRouteGates, 9);
  assert.equal(a01.exactHeadGate.expectedExecutedRouteCount, 793);
  assert.equal(a01.exactHeadGate.expectedTerminalRouteCount, 793);
  assert.equal(a01.exactHeadGate.expectedPassRouteCount, 793);
  assert.equal(a01.exactHeadGate.expectedFailRouteCount, 0);
  assert.equal(a01.exactHeadGate.expectedBrowserConsoleErrorCount, 0);
  assert.equal(a01.exactHeadGate.expectedBrowserPageErrorCount, 0);

  assert.equal(a01.evidencePolicy.realChromiumRequired, true);
  assert.equal(a01.evidencePolicy.artifactUploadRequired, true);
  assert.equal(a01.evidencePolicy.workflowMustBeReadOnly, true);
  assert.equal(a01.evidencePolicy.productRuntimeMutationAllowed, false);
  assert.equal(a01.evidencePolicy.capacityAuthorityMutationAllowed, false);
  assert.equal(a01.evidencePolicy.knowledgePointMutationAllowed, false);
  assert.equal(a01.evidencePolicy.patternGroupMutationAllowed, false);
  assert.equal(a01.evidencePolicy.patternSpecMutationAllowed, false);
  assert.equal(a01.evidencePolicy.generatorMutationAllowed, false);
  assert.equal(a01.evidencePolicy.validatorMutationAllowed, false);
  assert.equal(a01.evidencePolicy.rendererMutationAllowed, false);
  assert.equal(a01.evidencePolicy.slice014Allowed, false);
  assert.equal(a01.nextTaskOnPass, "PGC-R09-A02_RealArtifactArchiveAndHashManifest");
});

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const DEFAULT_POLICY_PATH = ".github/ci/unit-validation-policy.json";

const SCOPES = new Set(["KP_LEAF", "UNIT_INTEGRATION", "SHARED_RUNTIME", "GLOBAL_RELEASE"]);
const ROUTE_BOUNDS = new Set(["BOUNDED", "UNBOUNDED", "UNKNOWN"]);
const KP_STATUSES = new Set(["FOCUSED_PASS", "PENDING", "BLOCKED"]);

function fail(code, detail) {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
}

function matchesPathRule(file, rule = {}) {
  if ((rule.exact ?? []).includes(file)) return true;
  if ((rule.prefixes ?? []).some((prefix) => file.startsWith(prefix))) return true;
  if ((rule.contains ?? []).some((token) => file.includes(token))) return true;
  return false;
}

function isGovernanceFile(file) {
  return file.startsWith(".github/")
    || file.startsWith("tests/governance/")
    || file.startsWith("tools/governance/")
    || file.startsWith("docs/governance/");
}

function manifestPathCandidates(policy, changedFiles) {
  const directory = `${policy.impactManifest.directory}/`;
  const suffix = policy.impactManifest.suffix;
  return changedFiles.filter((file) => file.startsWith(directory) && file.endsWith(suffix));
}

function requiresImpactManifest(policy, changedFiles) {
  return changedFiles.some((file) =>
    (policy.impactManifest.requiredPathPrefixes ?? []).some((prefix) => file.startsWith(prefix))
    || (policy.impactManifest.requiredExactPaths ?? []).includes(file)
  );
}

function validateManifestShape(policy, manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("UIV_IMPACT_MANIFEST_INVALID", "manifest must be an object");
  }
  if (manifest.schemaVersion !== "1.0.0") fail("UIV_MANIFEST_SCHEMA_VERSION_INVALID", manifest.schemaVersion);
  if (manifest.policyId !== policy.policyId) fail("UIV_MANIFEST_POLICY_ID_MISMATCH", manifest.policyId);
  if (typeof manifest.taskId !== "string" || manifest.taskId.length === 0) fail("UIV_TASK_ID_REQUIRED", manifest.taskId);
  if (!SCOPES.has(manifest.currentScope)) fail("UIV_CURRENT_SCOPE_INVALID", manifest.currentScope);
  if (typeof manifest.expectedDerivedGate !== "string" || manifest.expectedDerivedGate.length === 0) {
    fail("UIV_EXPECTED_DERIVED_GATE_REQUIRED", manifest.expectedDerivedGate);
  }
  if (!manifest.changeImpact || typeof manifest.changeImpact !== "object") {
    fail("UIV_CHANGE_IMPACT_REQUIRED", manifest.changeImpact);
  }
  const impact = manifest.changeImpact;
  for (const key of [
    "sharedExecutableChange",
    "publicAuthorityCutover",
    "legalRouteSemanticsChanged",
    "globalReleaseCheckpoint",
    "currentAuthorityChanged"
  ]) {
    if (typeof impact[key] !== "boolean") fail("UIV_BOOLEAN_IMPACT_FIELD_INVALID", { key, value: impact[key] });
  }
  if (!ROUTE_BOUNDS.has(impact.affectedRoutes)) fail("UIV_AFFECTED_ROUTES_INVALID", impact.affectedRoutes);
}

function validatePathWitness(policy, changedFiles, manifest) {
  const observedShared = changedFiles.some((file) => matchesPathRule(file, policy.knownSharedExecutablePaths));
  const observedPublicAuthority = changedFiles.some((file) => matchesPathRule(file, policy.knownPublicAuthorityCutoverPaths));

  if (observedShared && manifest.changeImpact.sharedExecutableChange !== true) {
    fail("UIV_SHARED_EXECUTABLE_FLAG_MISMATCH", { observedShared, sharedExecutableChange: manifest.changeImpact.sharedExecutableChange });
  }
  if (observedPublicAuthority && manifest.changeImpact.publicAuthorityCutover !== true) {
    fail("UIV_PUBLIC_AUTHORITY_FLAG_MISMATCH", { observedPublicAuthority, publicAuthorityCutover: manifest.changeImpact.publicAuthorityCutover });
  }

  return { observedShared, observedPublicAuthority };
}

function validateUnitKnowledgePoints(manifest, { requireAllPass }) {
  const ids = manifest.unitExpectedKnowledgePointIds;
  const status = manifest.unitKnowledgePointGateStatus;
  if (!Array.isArray(ids) || ids.length === 0 || new Set(ids).size !== ids.length) {
    fail("UIV_UNIT_EXPECTED_KP_IDS_INVALID", ids);
  }
  if (!status || typeof status !== "object" || Array.isArray(status)) {
    fail("UIV_UNIT_KP_GATE_STATUS_INVALID", status);
  }
  for (const id of ids) {
    if (!KP_STATUSES.has(status[id])) fail("UIV_UNIT_KP_STATUS_INVALID", { id, status: status[id] });
    if (requireAllPass && status[id] !== "FOCUSED_PASS") {
      fail("UIV_UNIT_INTEGRATION_NOT_ELIGIBLE", { id, status: status[id] });
    }
  }
  const extra = Object.keys(status).filter((id) => !ids.includes(id));
  if (extra.length > 0) fail("UIV_UNIT_KP_STATUS_HAS_UNKNOWN_IDS", extra);
}

function classifyManifest(policy, changedFiles, manifest) {
  validateManifestShape(policy, manifest);
  const pathWitness = validatePathWitness(policy, changedFiles, manifest);
  const impact = manifest.changeImpact;
  let derivedGate;
  let fullRegression;
  let globalReplay;

  if (manifest.currentScope === "KP_LEAF") {
    validateUnitKnowledgePoints(manifest, { requireAllPass: false });
    if (typeof manifest.currentKnowledgePointId !== "string"
      || !manifest.unitExpectedKnowledgePointIds.includes(manifest.currentKnowledgePointId)) {
      fail("UIV_KP_LEAF_CURRENT_KP_INVALID", manifest.currentKnowledgePointId);
    }
    if (typeof manifest.focusedValidationCheckName !== "string" || manifest.focusedValidationCheckName.length === 0) {
      fail("UIV_KP_LEAF_FOCUSED_CHECK_REQUIRED", manifest.focusedValidationCheckName);
    }
    const forbidden = {
      sharedExecutableChange: impact.sharedExecutableChange,
      publicAuthorityCutover: impact.publicAuthorityCutover,
      legalRouteSemanticsChanged: impact.legalRouteSemanticsChanged,
      currentAuthorityChanged: impact.currentAuthorityChanged,
      globalReleaseCheckpoint: impact.globalReleaseCheckpoint,
      affectedRoutes: impact.affectedRoutes !== "BOUNDED"
    };
    const violated = Object.entries(forbidden).filter(([, value]) => value === true).map(([key]) => key);
    if (violated.length > 0) fail("UIV_SCOPE_INFLATION", violated);
    derivedGate = policy.scopes.KP_LEAF.derivedGate;
    fullRegression = false;
    globalReplay = false;
  } else if (manifest.currentScope === "UNIT_INTEGRATION") {
    validateUnitKnowledgePoints(manifest, { requireAllPass: true });
    const globalEscalation = impact.legalRouteSemanticsChanged
      || impact.globalReleaseCheckpoint
      || policy.globalEscalation.whenAffectedRoutes.includes(impact.affectedRoutes);
    if (impact.sharedExecutableChange && !globalEscalation) {
      fail("UIV_UNIT_INTEGRATION_SHARED_RUNTIME_RECLASSIFY_REQUIRED", impact);
    }
    if (globalEscalation) {
      derivedGate = "GLOBAL_CERTIFICATION";
      fullRegression = true;
      globalReplay = true;
    } else {
      derivedGate = policy.scopes.UNIT_INTEGRATION.derivedGate;
      fullRegression = true;
      globalReplay = false;
    }
  } else if (manifest.currentScope === "SHARED_RUNTIME") {
    if (!impact.sharedExecutableChange) fail("UIV_SHARED_RUNTIME_FLAG_REQUIRED", impact.sharedExecutableChange);
    const globalEscalation = impact.legalRouteSemanticsChanged
      || impact.globalReleaseCheckpoint
      || policy.globalEscalation.whenAffectedRoutes.includes(impact.affectedRoutes);
    derivedGate = globalEscalation
      ? policy.scopes.SHARED_RUNTIME.unboundedDerivedGate
      : policy.scopes.SHARED_RUNTIME.boundedDerivedGate;
    fullRegression = true;
    globalReplay = globalEscalation;
  } else if (manifest.currentScope === "GLOBAL_RELEASE") {
    if (!impact.globalReleaseCheckpoint) fail("UIV_GLOBAL_RELEASE_CHECKPOINT_REQUIRED", impact.globalReleaseCheckpoint);
    derivedGate = policy.scopes.GLOBAL_RELEASE.derivedGate;
    fullRegression = true;
    globalReplay = true;
  }

  if (manifest.expectedDerivedGate !== derivedGate) {
    fail("UIV_DERIVED_GATE_MISMATCH", { expected: manifest.expectedDerivedGate, actual: derivedGate });
  }

  return {
    policyConformance: "PASS",
    manifestRequired: requiresImpactManifest(policy, changedFiles),
    manifestUsed: true,
    currentScope: manifest.currentScope,
    derivedGate,
    runFullRegression: fullRegression,
    runGlobalReplay: globalReplay,
    focusedValidationCheckName: manifest.focusedValidationCheckName ?? null,
    pathWitness
  };
}

export function classifyUnitValidationImpact({ policy, changedFiles, manifest = null } = {}) {
  if (!policy || policy.policyId !== "UNIT_INCREMENTAL_VALIDATION_V1") {
    fail("UIV_POLICY_INVALID", policy?.policyId);
  }
  if (!Array.isArray(changedFiles)) fail("UIV_CHANGED_FILES_INVALID", changedFiles);

  const manifestPaths = manifestPathCandidates(policy, changedFiles);
  const manifestRequired = requiresImpactManifest(policy, changedFiles);
  const governanceChanged = changedFiles.some(isGovernanceFile);

  if (manifestPaths.length > 1) fail("UIV_MULTIPLE_IMPACT_MANIFESTS_CHANGED", manifestPaths);
  if (manifestRequired && manifestPaths.length !== 1) {
    fail("UIV_IMPACT_MANIFEST_REQUIRED", { manifestRequired, manifestPaths });
  }

  let classification;
  if (manifestPaths.length === 1) {
    if (!manifest) fail("UIV_IMPACT_MANIFEST_CONTENT_REQUIRED", manifestPaths[0]);
    classification = classifyManifest(policy, changedFiles, manifest);
  } else if (changedFiles.length > 0 && changedFiles.every(isGovernanceFile)) {
    classification = {
      policyConformance: "PASS",
      manifestRequired: false,
      manifestUsed: false,
      currentScope: null,
      derivedGate: policy.fallbacks.governanceOnly.derivedGate,
      runFullRegression: policy.fallbacks.governanceOnly.fullRegression,
      runGlobalReplay: policy.fallbacks.governanceOnly.globalReplay,
      focusedValidationCheckName: null,
      pathWitness: { observedShared: false, observedPublicAuthority: false }
    };
  } else {
    classification = {
      policyConformance: "PASS",
      manifestRequired: false,
      manifestUsed: false,
      currentScope: null,
      derivedGate: policy.fallbacks.legacyNonCurriculum.derivedGate,
      runFullRegression: policy.fallbacks.legacyNonCurriculum.fullRegression,
      runGlobalReplay: policy.fallbacks.legacyNonCurriculum.globalReplay,
      focusedValidationCheckName: null,
      pathWitness: { observedShared: false, observedPublicAuthority: false }
    };
  }

  return {
    ...classification,
    policyId: policy.policyId,
    governanceChanged,
    changedFileCount: changedFiles.length,
    impactManifestPath: manifestPaths[0] ?? null,
    globalReplayExecutionStatus: classification.runGlobalReplay
      ? policy.uiv01Boundary.globalReplayExecution
      : "NOT_REQUIRED"
  };
}

function parseArgs(args) {
  const out = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!key.startsWith("--")) continue;
    out[key.slice(2)] = args[index + 1];
    index += 1;
  }
  return out;
}

function writeGithubOutput(filePath, result) {
  if (!filePath) return;
  const rows = {
    policy_conformance: result.policyConformance,
    derived_gate: result.derivedGate,
    run_full_regression: String(result.runFullRegression),
    run_global_replay: String(result.runGlobalReplay),
    governance_changed: String(result.governanceChanged),
    impact_manifest_path: result.impactManifestPath ?? "",
    current_scope: result.currentScope ?? "",
    global_replay_execution_status: result.globalReplayExecutionStatus
  };
  fs.appendFileSync(filePath, Object.entries(rows).map(([key, value]) => `${key}=${value}\n`).join(""));
}

export function runCli(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  const policyPath = options.policy ?? DEFAULT_POLICY_PATH;
  const changedFilesPath = options["changed-files"];
  if (!changedFilesPath) fail("UIV_CHANGED_FILES_PATH_REQUIRED", null);

  const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
  const changedFiles = fs.readFileSync(changedFilesPath, "utf8").split(/\r?\n/).filter(Boolean);
  const manifestPaths = manifestPathCandidates(policy, changedFiles);
  const manifest = manifestPaths.length === 1
    ? JSON.parse(fs.readFileSync(manifestPaths[0], "utf8"))
    : null;

  try {
    const result = classifyUnitValidationImpact({ policy, changedFiles, manifest });
    if (options["json-out"]) {
      fs.mkdirSync(path.dirname(options["json-out"]), { recursive: true });
      fs.writeFileSync(options["json-out"], `${JSON.stringify(result, null, 2)}\n`);
    }
    writeGithubOutput(options["github-output"], result);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return result;
  } catch (error) {
    const failure = {
      policyConformance: "FAIL",
      code: error.code ?? "UIV_UNKNOWN_FAILURE",
      detail: error.detail ?? error.message
    };
    if (options["json-out"]) {
      fs.mkdirSync(path.dirname(options["json-out"]), { recursive: true });
      fs.writeFileSync(options["json-out"], `${JSON.stringify(failure, null, 2)}\n`);
    }
    process.stderr.write(`${JSON.stringify(failure, null, 2)}\n`);
    process.exitCode = 1;
    return failure;
  }
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) runCli();

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "../..");
export const MANIFEST_DIR = path.join(ROOT, "data/project/milestones");

export const EVIDENCE_LEVELS = Object.freeze([
  "E0_PLANNING_ONLY",
  "E1_DATA_STRUCTURE_READY",
  "E2_CONTENT_AUTHORED",
  "E3_SHADOW_RUNTIME_INTEGRATED",
  "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  "E5_PRODUCTION_ADMITTED",
  "E6_D0_COMPLETE"
]);

const LEVEL_INDEX = new Map(EVIDENCE_LEVELS.map((level, index) => [level, index]));
const CLAIM_MIN_LEVEL = Object.freeze({
  dataStructureReady: 1,
  contentAuthored: 2,
  runtimeIntegrated: 3,
  productionEquivalentGeneratorUsed: 3,
  productionRendererUsed: 4,
  htmlOutputVerified: 4,
  pdfOutputVerified: 4,
  visibleOutputChanged: 4,
  productionAdmitted: 5,
  d0Complete: 6
});
const CLOSEST_DISTANCE_BY_LEVEL = Object.freeze([4, 3, 2, 1, 1, 1, 0]);
const REVIEW_TYPES = new Set(["none", "draft_content_review", "production_equivalent_output_review"]);
const REQUIRED_CLAIMS = [
  "dataStructureReady",
  "contentAuthored",
  "runtimeIntegrated",
  "productionEquivalentGeneratorUsed",
  "productionRendererUsed",
  "htmlOutputVerified",
  "pdfOutputVerified",
  "visibleOutputChanged",
  "humanReviewReady",
  "productionAdmitted",
  "d0Complete"
];
const EVIDENCE_ARRAYS = [
  "runtimeTestPaths",
  "rendererTestPaths",
  "htmlArtifactPaths",
  "pdfArtifactPaths",
  "beforeAfterEvidencePaths",
  "reviewArtifactPaths",
  "artifactHashes"
];
const FULL_PIPELINE_CLAIMS = Object.freeze([
  "dataStructureReady",
  "contentAuthored",
  "runtimeIntegrated",
  "productionEquivalentGeneratorUsed",
  "productionRendererUsed",
  "htmlOutputVerified",
  "pdfOutputVerified",
  "visibleOutputChanged",
  "productionAdmitted"
]);
const PROGRAM_CONTROLLER_PIPELINE_CLAIMS = Object.freeze(
  FULL_PIPELINE_CLAIMS.filter((claim) => claim !== "visibleOutputChanged")
);
const PROGRAM_CONTROLLER_INHERITED_ROLES = Object.freeze({
  productionOutput: Object.freeze({
    minimumLevel: 5,
    claims: Object.freeze([
      "runtimeIntegrated",
      "productionEquivalentGeneratorUsed",
      "productionRendererUsed",
      "htmlOutputVerified",
      "pdfOutputVerified",
      "productionAdmitted"
    ]),
    evidenceArrays: Object.freeze(["htmlArtifactPaths", "pdfArtifactPaths", "artifactHashes"])
  }),
  content: Object.freeze({
    minimumLevel: 2,
    claims: Object.freeze(["contentAuthored"]),
    evidenceArrays: Object.freeze([])
  }),
  contract: Object.freeze({
    minimumLevel: 1,
    claims: Object.freeze(["dataStructureReady"]),
    evidenceArrays: Object.freeze([])
  }),
  sharedRuntime: Object.freeze({
    minimumLevel: 3,
    claims: Object.freeze(["runtimeIntegrated"]),
    evidenceArrays: Object.freeze([])
  }),
  crossUnitConformance: Object.freeze({
    minimumLevel: 3,
    claims: Object.freeze(["runtimeIntegrated", "productionEquivalentGeneratorUsed"]),
    evidenceArrays: Object.freeze([])
  })
});

const issue = (code, manifestPath, details = {}) => ({ code, manifestPath, ...details });
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const toRepoPath = (filePath) => path.relative(ROOT, filePath).replaceAll("\\", "/");
const resolveRepoPath = (repoPath) => path.resolve(ROOT, repoPath);

function parseDistance(value) {
  const match = /^D([0-5])$/.exec(String(value ?? ""));
  return match ? Number(match[1]) : null;
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function findManifestFiles(directory = MANIFEST_DIR) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...findManifestFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".claim.json")) files.push(fullPath);
  }
  return files.sort();
}

function validateEvidence(manifest, manifestPath, errors, checkPaths) {
  if (!isObject(manifest.evidence)) {
    errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "evidence" }));
    return;
  }

  for (const key of EVIDENCE_ARRAYS) {
    if (!Array.isArray(manifest.evidence[key])) {
      errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: `evidence.${key}` }));
    }
  }
  if (!checkPaths) return;

  for (const key of EVIDENCE_ARRAYS.filter((key) => key !== "artifactHashes")) {
    for (const repoPath of manifest.evidence[key] ?? []) {
      if (typeof repoPath !== "string" || !repoPath || !fs.existsSync(resolveRepoPath(repoPath))) {
        errors.push(issue("MCI_EVIDENCE_PATH_MISSING", manifestPath, { path: repoPath, evidenceKind: key }));
      }
    }
  }

  for (const row of manifest.evidence.artifactHashes ?? []) {
    if (!isObject(row) || typeof row.path !== "string" || !/^[a-f0-9]{64}$/.test(String(row.sha256 ?? ""))) {
      errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "evidence.artifactHashes" }));
      continue;
    }
    const artifactPath = resolveRepoPath(row.path);
    if (!fs.existsSync(artifactPath)) {
      errors.push(issue("MCI_HUMAN_REVIEW_ARTIFACT_MISSING", manifestPath, { path: row.path }));
      continue;
    }
    const actual = sha256File(artifactPath);
    if (actual !== row.sha256) {
      errors.push(issue("MCI_ARTIFACT_HASH_MISMATCH", manifestPath, { path: row.path, expected: row.sha256, actual }));
    }
  }
}

function artifactHashKey(row) {
  return `${row?.path ?? ""}:${row?.sha256 ?? ""}`;
}

function validateProgramControllerCloseout(manifest, manifestPath, errors, checkPaths) {
  const closeout = manifest.d0Closeout;
  const claims = manifest.claims;
  if (!isObject(closeout) || closeout.mode !== "program_controller_closeout") {
    errors.push(issue("MCI_D0_CLOSEOUT_MODE_INVALID", manifestPath));
    return;
  }
  if (manifest.taskClass !== "release"
    || typeof closeout.programId !== "string"
    || closeout.programId.length < 3
    || closeout.currentTaskVisibleOutputChanged !== false) {
    errors.push(issue("MCI_PROGRAM_CLOSEOUT_SCHEMA_INVALID", manifestPath));
  }
  if (claims.visibleOutputChanged !== false || claims.humanReviewReady !== false || manifest.humanReview?.type !== "none") {
    errors.push(issue("MCI_PROGRAM_CLOSEOUT_CURRENT_TASK_VISIBLE_OUTPUT_INVALID", manifestPath));
  }
  if (PROGRAM_CONTROLLER_PIPELINE_CLAIMS.some((claim) => claims[claim] !== true)) {
    errors.push(issue("MCI_PROGRAM_CLOSEOUT_WITHOUT_INHERITED_PIPELINE", manifestPath));
  }

  const inherited = closeout.inheritedMilestoneClaims;
  if (!isObject(inherited)) {
    errors.push(issue("MCI_PROGRAM_CLOSEOUT_SCHEMA_INVALID", manifestPath, { path: "d0Closeout.inheritedMilestoneClaims" }));
    return;
  }

  const expectedRoles = Object.keys(PROGRAM_CONTROLLER_INHERITED_ROLES);
  const suppliedRoles = Object.keys(inherited);
  for (const role of expectedRoles) {
    if (typeof inherited[role] !== "string" || !inherited[role]) {
      errors.push(issue("MCI_PROGRAM_CLOSEOUT_INHERITED_ROLE_MISSING", manifestPath, { role }));
    }
  }
  for (const role of suppliedRoles) {
    if (!expectedRoles.includes(role)) {
      errors.push(issue("MCI_PROGRAM_CLOSEOUT_SCHEMA_INVALID", manifestPath, { path: `d0Closeout.inheritedMilestoneClaims.${role}` }));
    }
  }

  const paths = expectedRoles.map((role) => inherited[role]).filter((repoPath) => typeof repoPath === "string" && repoPath);
  if (new Set(paths).size !== paths.length) {
    errors.push(issue("MCI_PROGRAM_CLOSEOUT_INHERITED_CLAIM_DUPLICATED", manifestPath));
  }

  const linkedPaths = new Set(manifest.evidence?.beforeAfterEvidencePaths ?? []);
  const currentHtmlPaths = new Set(manifest.evidence?.htmlArtifactPaths ?? []);
  const currentPdfPaths = new Set(manifest.evidence?.pdfArtifactPaths ?? []);
  const currentHashKeys = new Set((manifest.evidence?.artifactHashes ?? []).map(artifactHashKey));

  for (const role of expectedRoles) {
    const repoPath = inherited[role];
    if (typeof repoPath !== "string" || !repoPath) continue;
    if (!/^data\/project\/milestones\/.*\.claim\.json$/.test(repoPath) || repoPath === manifestPath) {
      errors.push(issue("MCI_PROGRAM_CLOSEOUT_INHERITED_CLAIM_INVALID", manifestPath, { role, path: repoPath }));
      continue;
    }
    if (!linkedPaths.has(repoPath)) {
      errors.push(issue("MCI_PROGRAM_CLOSEOUT_INHERITED_EVIDENCE_NOT_LINKED", manifestPath, { role, path: repoPath }));
    }

    const absolutePath = resolveRepoPath(repoPath);
    if (!fs.existsSync(absolutePath)) {
      if (checkPaths) errors.push(issue("MCI_PROGRAM_CLOSEOUT_INHERITED_CLAIM_MISSING", manifestPath, { role, path: repoPath }));
      continue;
    }

    let inheritedManifest;
    try {
      inheritedManifest = readJson(absolutePath);
    } catch (error) {
      errors.push(issue("MCI_PROGRAM_CLOSEOUT_INHERITED_CLAIM_INVALID", manifestPath, { role, path: repoPath, message: error.message }));
      continue;
    }

    const requirement = PROGRAM_CONTROLLER_INHERITED_ROLES[role];
    const inheritedLevel = LEVEL_INDEX.get(inheritedManifest.actualEvidenceLevel);
    const capabilityMissing = inheritedLevel === undefined
      || inheritedLevel < requirement.minimumLevel
      || requirement.claims.some((claim) => inheritedManifest.claims?.[claim] !== true);
    if (capabilityMissing) {
      errors.push(issue("MCI_PROGRAM_CLOSEOUT_INHERITED_CAPABILITY_MISSING", manifestPath, {
        role,
        path: repoPath,
        actualEvidenceLevel: inheritedManifest.actualEvidenceLevel,
        requiredMinimumLevel: EVIDENCE_LEVELS[requirement.minimumLevel],
        requiredClaims: requirement.claims
      }));
    }

    if (role === "productionOutput") {
      const inheritedHtml = inheritedManifest.evidence?.htmlArtifactPaths ?? [];
      const inheritedPdf = inheritedManifest.evidence?.pdfArtifactPaths ?? [];
      const inheritedHashes = inheritedManifest.evidence?.artifactHashes ?? [];
      const evidencePresent = inheritedHtml.length > 0
        && inheritedPdf.length > 0
        && inheritedHashes.length > 0
        && inheritedHtml.every((artifactPath) => currentHtmlPaths.has(artifactPath))
        && inheritedPdf.every((artifactPath) => currentPdfPaths.has(artifactPath))
        && inheritedHashes.every((row) => currentHashKeys.has(artifactHashKey(row)));
      if (!evidencePresent) {
        errors.push(issue("MCI_PROGRAM_CLOSEOUT_PRODUCTION_EVIDENCE_NOT_INHERITED", manifestPath, { role, path: repoPath }));
      }
    }
  }
}

export function validateManifest(manifest, options = {}) {
  const manifestPath = options.manifestPath ?? "<memory>";
  const checkPaths = options.checkPaths ?? true;
  const errors = [];

  if (!isObject(manifest)) {
    return { ok: false, errors: [issue("MCI_SCHEMA_INVALID", manifestPath, { message: "Manifest must be an object." })] };
  }

  if (manifest.schemaVersion !== 1) errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "schemaVersion" }));
  if (typeof manifest.taskId !== "string" || manifest.taskId.length < 3) errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "taskId" }));
  if (typeof manifest.claimedStatus !== "string" || manifest.claimedStatus.length < 3) errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "claimedStatus" }));

  const actualLevel = LEVEL_INDEX.get(manifest.actualEvidenceLevel);
  const targetLevel = LEVEL_INDEX.get(manifest.targetEvidenceLevel);
  if (actualLevel === undefined) errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "actualEvidenceLevel" }));
  if (targetLevel === undefined) errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "targetEvidenceLevel" }));
  if (actualLevel !== undefined && targetLevel !== undefined && actualLevel > targetLevel) {
    errors.push(issue("MCI_ACTUAL_EXCEEDS_TARGET", manifestPath));
  }

  const claims = manifest.claims;
  if (!isObject(claims)) {
    errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "claims" }));
  } else {
    for (const claim of REQUIRED_CLAIMS) {
      if (typeof claims[claim] !== "boolean") errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: `claims.${claim}` }));
    }

    if (actualLevel !== undefined) {
      for (const [claim, minimum] of Object.entries(CLAIM_MIN_LEVEL)) {
        if (claims[claim] === true && actualLevel < minimum) {
          errors.push(issue("MCI_CLAIM_EXCEEDS_EVIDENCE", manifestPath, {
            claim,
            actualEvidenceLevel: manifest.actualEvidenceLevel,
            minimumEvidenceLevel: EVIDENCE_LEVELS[minimum]
          }));
        }
      }
    }

    const outputClaimed = claims.productionRendererUsed || claims.htmlOutputVerified || claims.pdfOutputVerified || claims.visibleOutputChanged;
    if (outputClaimed && (!claims.runtimeIntegrated || !claims.productionEquivalentGeneratorUsed)) {
      errors.push(issue("MCI_RUNTIME_FALSE_BUT_OUTPUT_CLAIMED", manifestPath));
    }
    if ((claims.pdfOutputVerified || claims.visibleOutputChanged) && !claims.productionRendererUsed) {
      errors.push(issue("MCI_RENDERER_FALSE_BUT_PDF_CLAIMED", manifestPath));
    }
    if (claims.visibleOutputChanged && (!manifest.evidence?.beforeAfterEvidencePaths?.length || !manifest.evidence?.htmlArtifactPaths?.length || !manifest.evidence?.pdfArtifactPaths?.length)) {
      errors.push(issue("MCI_VISIBLE_DIFF_EVIDENCE_MISSING", manifestPath));
    }
    if (claims.d0Complete) {
      const closeoutMode = manifest.d0Closeout?.mode ?? "full_pipeline";
      if (closeoutMode === "full_pipeline") {
        if (FULL_PIPELINE_CLAIMS.some((claim) => claims[claim] !== true)) {
          errors.push(issue("MCI_D0_WITHOUT_FULL_PIPELINE", manifestPath));
        }
      } else if (closeoutMode === "program_controller_closeout") {
        validateProgramControllerCloseout(manifest, manifestPath, errors, checkPaths);
      } else {
        errors.push(issue("MCI_D0_CLOSEOUT_MODE_INVALID", manifestPath, { actual: closeoutMode }));
      }
    }
  }

  validateEvidence(manifest, manifestPath, errors, checkPaths);

  const review = manifest.humanReview;
  if (!isObject(review) || !REVIEW_TYPES.has(review.type)) {
    errors.push(issue("MCI_HUMAN_REVIEW_TYPE_AMBIGUOUS", manifestPath));
  } else if (isObject(claims)) {
    if (claims.humanReviewReady && review.type === "none") {
      errors.push(issue("MCI_HUMAN_REVIEW_TYPE_AMBIGUOUS", manifestPath));
    }
    if (review.type === "draft_content_review") {
      if (review.canUnlockProduction !== false) errors.push(issue("MCI_DRAFT_REVIEW_CANNOT_UNLOCK_PRODUCTION", manifestPath));
      if (claims.humanReviewReady && (actualLevel === undefined || actualLevel < 2)) errors.push(issue("MCI_CLAIM_EXCEEDS_EVIDENCE", manifestPath, { claim: "humanReviewReady" }));
      if (claims.humanReviewReady && !manifest.evidence?.reviewArtifactPaths?.length) errors.push(issue("MCI_HUMAN_REVIEW_ARTIFACT_MISSING", manifestPath));
    }
    if (review.type === "production_equivalent_output_review") {
      const atE4 = actualLevel !== undefined && actualLevel >= 4;
      const pipelineReady = claims.runtimeIntegrated
        && claims.productionEquivalentGeneratorUsed
        && claims.productionRendererUsed
        && claims.htmlOutputVerified
        && claims.pdfOutputVerified
        && claims.visibleOutputChanged;
      if (claims.humanReviewReady && (!atE4 || !pipelineReady)) errors.push(issue("MCI_PRODUCTION_REVIEW_BEFORE_E4", manifestPath));
      if (claims.humanReviewReady && (!manifest.evidence?.reviewArtifactPaths?.length || !manifest.evidence?.artifactHashes?.length)) {
        errors.push(issue("MCI_HUMAN_REVIEW_ARTIFACT_MISSING", manifestPath));
      }
      const usesPreview = [...(manifest.evidence?.reviewArtifactPaths ?? []), ...(manifest.evidence?.htmlArtifactPaths ?? [])]
        .some((repoPath) => /preview/i.test(repoPath));
      if (claims.humanReviewReady && usesPreview) errors.push(issue("MCI_PREVIEW_USED_AS_PRODUCTION_EVIDENCE", manifestPath));
      if (claims.humanReviewReady && !claims.visibleOutputChanged) errors.push(issue("MCI_LEGACY_OUTPUT_UNCHANGED", manifestPath));
    }
  }

  const beforeDistance = parseDistance(manifest.distance?.before);
  const afterDistance = parseDistance(manifest.distance?.after);
  if (beforeDistance === null || afterDistance === null || typeof manifest.distance?.distanceReduced !== "string") {
    errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "distance" }));
  } else if (actualLevel !== undefined && afterDistance < CLOSEST_DISTANCE_BY_LEVEL[actualLevel]) {
    errors.push(issue("MCI_DISTANCE_REDUCTION_UNSUPPORTED", manifestPath, {
      after: manifest.distance.after,
      closestAllowed: `D${CLOSEST_DISTANCE_BY_LEVEL[actualLevel]}`
    }));
  }

  const nextRequired = LEVEL_INDEX.get(manifest.nextStep?.requiredEvidenceLevelBeforeStart);
  if (typeof manifest.nextStep?.taskId !== "string" || nextRequired === undefined) {
    errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "nextStep" }));
  } else if (actualLevel !== undefined && nextRequired > actualLevel) {
    errors.push(issue("MCI_NEXT_STEP_SKIPS_REQUIRED_LEVEL", manifestPath, {
      nextTask: manifest.nextStep.taskId,
      currentLevel: manifest.actualEvidenceLevel,
      requiredLevel: manifest.nextStep.requiredEvidenceLevelBeforeStart
    }));
  }

  return { ok: errors.length === 0, errors };
}

export function validateAllManifests(options = {}) {
  const files = findManifestFiles(options.directory ?? MANIFEST_DIR);
  const results = files.map((filePath) => {
    try {
      const manifest = readJson(filePath);
      return {
        filePath,
        manifest,
        ...validateManifest(manifest, {
          manifestPath: toRepoPath(filePath),
          checkPaths: options.checkPaths ?? true
        })
      };
    } catch (error) {
      return {
        filePath,
        manifest: null,
        ok: false,
        errors: [issue("MCI_SCHEMA_INVALID", toRepoPath(filePath), { message: error.message })]
      };
    }
  });
  return {
    ok: results.every((result) => result.ok),
    manifestCount: results.length,
    results,
    errors: results.flatMap((result) => result.errors)
  };
}

export function parsePrBodyFields(body = "") {
  const field = (name) => {
    const pattern = "^" + name + ":\\s*`?([^`\\r\\n]+)`?\\s*$";
    return new RegExp(pattern, "mi").exec(body)?.[1]?.trim() ?? null;
  };
  return {
    manifestPath: field("Milestone Claim Manifest"),
    actualEvidenceLevel: field("Actual Evidence Level"),
    maximumClaim: field("Maximum Claim"),
    visibleOutputChanged: field("Visible Output Changed"),
    humanReviewType: field("Human Review Type"),
    humanReviewReady: field("Human Review Ready"),
    d0CloseoutMode: field("D0 Closeout Mode")
  };
}

function changedFilesForPullRequest(baseRef) {
  return execFileSync("git", ["diff", "--name-only", `origin/${baseRef}...HEAD`], {
    cwd: ROOT,
    encoding: "utf8"
  }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function validatePullRequestManifest(options = {}) {
  const eventPath = options.eventPath ?? process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) return { ok: true, errors: [], skipped: true };
  const event = readJson(eventPath);
  if (!event.pull_request) return { ok: true, errors: [], skipped: true };

  const changedFiles = options.changedFiles ?? changedFilesForPullRequest(event.pull_request.base.ref);
  const changedManifestPaths = changedFiles.filter((file) => /^data\/project\/milestones\/.*\.claim\.json$/.test(file));
  const errors = [];
  if (changedManifestPaths.length === 0) {
    errors.push(issue("MCI_CLAIM_MANIFEST_MISSING", "<pull_request>", { changedFileCount: changedFiles.length }));
    return { ok: false, errors, changedFiles, changedManifestPaths };
  }

  const fields = parsePrBodyFields(event.pull_request.body ?? "");
  if (!fields.manifestPath || !changedManifestPaths.includes(fields.manifestPath)) {
    errors.push(issue("MCI_PR_BODY_MANIFEST_MISMATCH", "<pull_request>", {
      field: "Milestone Claim Manifest",
      actual: fields.manifestPath,
      changedManifestPaths
    }));
    return { ok: false, errors, changedFiles, changedManifestPaths, fields };
  }

  const manifest = readJson(resolveRepoPath(fields.manifestPath));
  const expected = {
    actualEvidenceLevel: manifest.actualEvidenceLevel,
    maximumClaim: manifest.actualEvidenceLevel,
    visibleOutputChanged: String(manifest.claims.visibleOutputChanged),
    humanReviewType: manifest.humanReview.type,
    humanReviewReady: String(manifest.claims.humanReviewReady)
  };
  if (manifest.d0Closeout?.mode) expected.d0CloseoutMode = manifest.d0Closeout.mode;
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (fields[key] !== expectedValue) {
      errors.push(issue("MCI_PR_BODY_MANIFEST_MISMATCH", "<pull_request>", {
        field: key,
        expected: expectedValue,
        actual: fields[key]
      }));
    }
  }
  return { ok: errors.length === 0, errors, changedFiles, changedManifestPaths, fields };
}

export function runIntegrityChecks(options = {}) {
  const all = validateAllManifests(options);
  const pr = options.requirePrManifest ? validatePullRequestManifest(options) : { ok: true, errors: [], skipped: true };
  const errors = [...all.errors, ...pr.errors];
  return {
    ok: errors.length === 0,
    manifestCount: all.manifestCount,
    pullRequestCheckSkipped: pr.skipped === true,
    errors
  };
}

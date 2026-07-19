import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

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
const REVIEW_TYPES = new Set([
  "none",
  "draft_content_review",
  "production_equivalent_output_review"
]);
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
const REQUIRED_EVIDENCE_ARRAYS = [
  "runtimeTestPaths",
  "rendererTestPaths",
  "htmlArtifactPaths",
  "pdfArtifactPaths",
  "beforeAfterEvidencePaths",
  "reviewArtifactPaths",
  "artifactHashes"
];

function issue(code, manifestPath, details = {}) {
  return { code, manifestPath, ...details };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function relativeToRoot(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function resolveEvidencePath(relativePath) {
  return path.resolve(ROOT, relativePath);
}

function parseDistance(value) {
  const match = /^D([0-5])$/.exec(String(value ?? ""));
  return match ? Number(match[1]) : null;
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function findManifestFiles(directory = MANIFEST_DIR) {
  if (!fs.existsSync(directory)) return [];
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...findManifestFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".claim.json")) output.push(fullPath);
  }
  return output.sort();
}

function validateEvidencePaths(manifest, manifestPath, errors) {
  const evidence = manifest.evidence;
  if (!isObject(evidence)) return;

  for (const key of REQUIRED_EVIDENCE_ARRAYS) {
    if (!Array.isArray(evidence[key])) {
      errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: `evidence.${key}`, message: "Expected an array." }));
    }
  }

  for (const key of REQUIRED_EVIDENCE_ARRAYS.filter((key) => key !== "artifactHashes")) {
    if (!Array.isArray(evidence[key])) continue;
    for (const evidencePath of evidence[key]) {
      if (typeof evidencePath !== "string" || evidencePath.length === 0) {
        errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: `evidence.${key}`, message: "Evidence paths must be non-empty strings." }));
        continue;
      }
      if (!fs.existsSync(resolveEvidencePath(evidencePath))) {
        errors.push(issue("MCI_EVIDENCE_PATH_MISSING", manifestPath, { path: evidencePath, evidenceKind: key }));
      }
    }
  }

  if (!Array.isArray(evidence.artifactHashes)) return;
  for (const row of evidence.artifactHashes) {
    if (!isObject(row) || typeof row.path !== "string" || !/^[a-f0-9]{64}$/.test(String(row.sha256 ?? ""))) {
      errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "evidence.artifactHashes", message: "Expected {path, sha256}." }));
      continue;
    }
    const artifactPath = resolveEvidencePath(row.path);
    if (!fs.existsSync(artifactPath)) {
      errors.push(issue("MCI_HUMAN_REVIEW_ARTIFACT_MISSING", manifestPath, { path: row.path }));
      continue;
    }
    const actualHash = sha256File(artifactPath);
    if (actualHash !== row.sha256) {
      errors.push(issue("MCI_ARTIFACT_HASH_MISMATCH", manifestPath, { path: row.path, expected: row.sha256, actual: actualHash }));
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
    errors.push(issue("MCI_ACTUAL_EXCEEDS_TARGET", manifestPath, { actual: manifest.actualEvidenceLevel, target: manifest.targetEvidenceLevel }));
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

    const anyOutputClaim = claims.productionRendererUsed || claims.htmlOutputVerified || claims.pdfOutputVerified || claims.visibleOutputChanged;
    if (anyOutputClaim && (!claims.runtimeIntegrated || !claims.productionEquivalentGeneratorUsed)) {
      errors.push(issue("MCI_RUNTIME_FALSE_BUT_OUTPUT_CLAIMED", manifestPath));
    }
    if ((claims.pdfOutputVerified || claims.visibleOutputChanged) && !claims.productionRendererUsed) {
      errors.push(issue("MCI_RENDERER_FALSE_BUT_PDF_CLAIMED", manifestPath));
    }
    if (claims.visibleOutputChanged && (!manifest.evidence?.beforeAfterEvidencePaths?.length || !manifest.evidence?.htmlArtifactPaths?.length || !manifest.evidence?.pdfArtifactPaths?.length)) {
      errors.push(issue("MCI_VISIBLE_DIFF_EVIDENCE_MISSING", manifestPath));
    }
    if (claims.d0Complete) {
      const requiredForD0 = [
        "dataStructureReady",
        "contentAuthored",
        "runtimeIntegrated",
        "productionEquivalentGeneratorUsed",
        "productionRendererUsed",
        "htmlOutputVerified",
        "pdfOutputVerified",
        "visibleOutputChanged",
        "productionAdmitted"
      ];
      if (requiredForD0.some((claim) => claims[claim] !== true)) errors.push(issue("MCI_D0_WITHOUT_FULL_PIPELINE", manifestPath));
    }
  }

  const humanReview = manifest.humanReview;
  if (!isObject(humanReview) || !REVIEW_TYPES.has(humanReview?.type)) {
    errors.push(issue("MCI_HUMAN_REVIEW_TYPE_AMBIGUOUS", manifestPath));
  } else if (isObject(claims)) {
    if (claims.humanReviewReady && humanReview.type === "none") {
      errors.push(issue("MCI_HUMAN_REVIEW_TYPE_AMBIGUOUS", manifestPath));
    }
    if (humanReview.type === "draft_content_review") {
      if (humanReview.canUnlockProduction !== false) errors.push(issue("MCI_DRAFT_REVIEW_CANNOT_UNLOCK_PRODUCTION", manifestPath));
      if (claims.humanReviewReady && (actualLevel === undefined || actualLevel < 2)) errors.push(issue("MCI_CLAIM_EXCEEDS_EVIDENCE", manifestPath, { claim: "humanReviewReady" }));
      if (claims.humanReviewReady && !manifest.evidence?.reviewArtifactPaths?.length) errors.push(issue("MCI_HUMAN_REVIEW_ARTIFACT_MISSING", manifestPath));
    }
    if (humanReview.type === "production_equivalent_output_review") {
      const productionReviewReady = actualLevel !== undefined
        && actualLevel >= 4
        && claims.runtimeIntegrated
        && claims.productionEquivalentGeneratorUsed
        && claims.productionRendererUsed
        && claims.htmlOutputVerified
        && claims.pdfOutputVerified
        && claims.visibleOutputChanged;
      if (claims.humanReviewReady && !productionReviewReady) errors.push(issue("MCI_PRODUCTION_REVIEW_BEFORE_E4", manifestPath));
      if (claims.humanReviewReady && (!manifest.evidence?.reviewArtifactPaths?.length || !manifest.evidence?.artifactHashes?.length)) {
        errors.push(issue("MCI_HUMAN_REVIEW_ARTIFACT_MISSING", manifestPath));
      }
      const previewEvidence = [...(manifest.evidence?.reviewArtifactPaths ?? []), ...(manifest.evidence?.htmlArtifactPaths ?? [])]
        .some((entry) => /preview/i.test(entry));
      if (claims.humanReviewReady && previewEvidence) errors.push(issue("MCI_PREVIEW_USED_AS_PRODUCTION_EVIDENCE", manifestPath));
      if (claims.humanReviewReady && !claims.visibleOutputChanged) errors.push(issue("MCI_LEGACY_OUTPUT_UNCHANGED", manifestPath));
    }
  }

  const beforeDistance = parseDistance(manifest.distance?.before);
  const afterDistance = parseDistance(manifest.distance?.after);
  if (beforeDistance === null || afterDistance === null || typeof manifest.distance?.distanceReduced !== "string") {
    errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "distance" }));
  } else if (actualLevel !== undefined && afterDistance < CLOSEST_DISTANCE_BY_LEVEL[actualLevel]) {
    errors.push(issue("MCI_DISTANCE_REDUCTION_UNSUPPORTED", manifestPath, {
      actualEvidenceLevel: manifest.actualEvidenceLevel,
      after: manifest.distance.after,
      closestAllowed: `D${CLOSEST_DISTANCE_BY_LEVEL[actualLevel]}`
    }));
  }

  const nextRequiredLevel = LEVEL_INDEX.get(manifest.nextStep?.requiredEvidenceLevelBeforeStart);
  if (typeof manifest.nextStep?.taskId !== "string" || nextRequiredLevel === undefined) {
    errors.push(issue("MCI_SCHEMA_INVALID", manifestPath, { path: "nextStep" }));
  } else if (actualLevel !== undefined && nextRequiredLevel > actualLevel) {
    errors.push(issue("MCI_NEXT_STEP_SKIPS_REQUIRED_LEVEL", manifestPath, {
      nextTask: manifest.nextStep.taskId,
      currentLevel: manifest.actualEvidenceLevel,
      requiredLevel: manifest.nextStep.requiredEvidenceLevelBeforeStart
    }));
  }

  if (checkPaths) validateEvidencePaths(manifest, manifestPath, errors);
  return { ok: errors.length === 0, errors };
}

export function validateAllManifests(options = {}) {
  const files = findManifestFiles(options.directory ?? MANIFEST_DIR);
  const results = files.map((filePath) => {
    try {
      const manifest = readJson(filePath);
      return { filePath, manifest, ...validateManifest(manifest, { manifestPath: relativeToRoot(filePath), checkPaths: options.checkPaths ?? true }) };
    } catch (error) {
      return { filePath, manifest: null, ok: false, errors: [issue("MCI_SCHEMA_INVALID", relativeToRoot(filePath), { message: error.message })] };
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
    const match = new RegExp(`^${name}:\\s*\\`?([^\\`\\r\\n]+)\\`?\\s*$`, "mi").exec(body);
    return match?.[1]?.trim() ?? null;
  };
  return {
    manifestPath: field("Milestone Claim Manifest"),
    actualEvidenceLevel: field("Actual Evidence Level"),
    maximumClaim: field("Maximum Claim"),
    visibleOutputChanged: field("Visible Output Changed"),
    humanReviewType: field("Human Review Type"),
    humanReviewReady: field("Human Review Ready")
  };
}

function changedFilesForPullRequest(baseRef) {
  return execFileSync("git", ["diff", "--name-only", `origin/${baseRef}...HEAD`], { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
    errors.push(issue("MCI_PR_BODY_MANIFEST_MISMATCH", "<pull_request>", { field: "Milestone Claim Manifest", actual: fields.manifestPath, changedManifestPaths }));
    return { ok: false, errors, changedFiles, changedManifestPaths, fields };
  }

  const manifest = readJson(resolveEvidencePath(fields.manifestPath));
  const expected = {
    actualEvidenceLevel: manifest.actualEvidenceLevel,
    maximumClaim: manifest.actualEvidenceLevel,
    visibleOutputChanged: String(manifest.claims.visibleOutputChanged),
    humanReviewType: manifest.humanReview.type,
    humanReviewReady: String(manifest.claims.humanReviewReady)
  };
  for (const [key, value] of Object.entries(expected)) {
    if (fields[key] !== value) errors.push(issue("MCI_PR_BODY_MANIFEST_MISMATCH", "<pull_request>", { field: key, expected: value, actual: fields[key] }));
  }
  return { ok: errors.length === 0, errors, changedFiles, changedManifestPaths, fields };
}

export function runCli(args = process.argv.slice(2)) {
  const all = validateAllManifests();
  const pr = args.includes("--require-pr-manifest") ? validatePullRequestManifest() : { ok: true, errors: [], skipped: true };
  const errors = [...all.errors, ...pr.errors];
  const output = {
    ok: errors.length === 0,
    manifestCount: all.manifestCount,
    pullRequestCheckSkipped: pr.skipped === true,
    errors
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (!output.ok) process.exitCode = 1;
  return output;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runCli();

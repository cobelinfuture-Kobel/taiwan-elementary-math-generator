import fs from 'node:fs';
import path from 'node:path';

import { buildW02Source13PdfEvidenceReadback } from './w02-source13-pdf-evidence-runtime.mjs';

const BASELINE_PATH = 'data/curriculum/application/assessment/w02-source13-source-authority-baseline.json';
const INVENTORY_PATH = 'data/curriculum/application/evidence/w02-source13-pdf-evidence-inventory.json';
const CANDIDATE_SCHEMA_PATH = 'data/curriculum/application/schema/w02-knowledge-operation-candidate.schema.json';
const TASK_ID = 'POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification';
const SCHEMA_NAME = 'POSTGAPPW02KnowledgeOperationCandidateUnitV1';
const CANDIDATE_STATE = 'PAGE_EVIDENCED_KP_CANDIDATES_CLASSIFIED_CANONICAL_MODEL_PENDING';
const CLASSIFICATIONS = new Set([
  'APPLICATION_REQUIRED',
  'APPLICATION_COMPATIBLE',
  'APPLICATION_NOT_APPLICABLE'
]);

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));

function range(count) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

function classificationCounts(knowledgePoints) {
  const count = (value) => knowledgePoints.filter((row) => row.applicationClassification === value).length;
  return {
    knowledgePointCandidateCount: knowledgePoints.length,
    applicationRequiredCount: count('APPLICATION_REQUIRED'),
    applicationCompatibleCount: count('APPLICATION_COMPATIBLE'),
    applicationNotApplicableCount: count('APPLICATION_NOT_APPLICABLE')
  };
}

export function materializeW02PageKnowledgeOperationCandidates({ root = process.cwd() } = {}) {
  const baseline = readJson(root, BASELINE_PATH);
  const inventory = readJson(root, INVENTORY_PATH);
  const records = baseline.records.map((row) => ({
    baseline: row,
    inventory: inventory.records.find((candidate) => candidate.sourceNodeId === row.sourceNodeId),
    candidatePath: row.knowledgeOperationExpectedPath,
    candidate: readJson(root, row.knowledgeOperationExpectedPath)
  }));
  return {
    root,
    baseline,
    inventory,
    candidateSchema: readJson(root, CANDIDATE_SCHEMA_PATH),
    a01aReadback: buildW02Source13PdfEvidenceReadback({ root }),
    records
  };
}

export function validateW02PageKnowledgeOperationCandidates(materialized) {
  const issues = [];
  const { candidateSchema, a01aReadback, records } = materialized;
  if (!a01aReadback.ok) {
    issues.push(issue('POSTG_APP_W02_A01B_A01A_EVIDENCE_INVALID', 'a01aReadback', { issues: a01aReadback.issues }));
  }
  if (candidateSchema?.properties?.candidateState?.const !== CANDIDATE_STATE
      || candidateSchema?.properties?.productionBoundary?.properties?.productionAdmissionAllowed?.const !== false) {
    issues.push(issue('POSTG_APP_W02_A01B_SCHEMA_BOUNDARY_INVALID', CANDIDATE_SCHEMA_PATH));
  }
  if (records.length !== 13) issues.push(issue('POSTG_APP_W02_A01B_SOURCE_COUNT_INVALID', 'records'));

  const allCandidateIds = [];
  for (const { baseline, inventory, candidate, candidatePath } of records) {
    const recordPath = `records.${baseline.sourceNodeId}`;
    if (!inventory
        || candidate.schemaName !== SCHEMA_NAME
        || candidate.schemaVersion !== 1
        || candidate.taskId !== TASK_ID
        || candidate.sourceNodeId !== baseline.sourceNodeId
        || candidate.queueOrdinal !== baseline.queueOrdinal
        || candidate.sourceCode !== baseline.sourceCode
        || candidate.sourceTitle !== baseline.sourceTitle
        || candidate.domainFamily !== baseline.domainFamily
        || candidate.candidateState !== CANDIDATE_STATE) {
      issues.push(issue('POSTG_APP_W02_A01B_CANDIDATE_IDENTITY_INVALID', recordPath, { candidatePath }));
      continue;
    }
    const evidence = candidate.sourceEvidence;
    if (evidence.inventoryPath !== INVENTORY_PATH
        || evidence.sha256 !== inventory.sha256
        || evidence.contentIdentityGroup !== inventory.contentIdentityGroup
        || evidence.pageCount !== inventory.pageCount
        || evidence.reviewMethod !== 'FULL_PAGE_VISUAL_READBACK'
        || JSON.stringify(evidence.reviewedPages) !== JSON.stringify(range(inventory.pageCount))) {
      issues.push(issue('POSTG_APP_W02_A01B_PAGE_EVIDENCE_INVALID', recordPath));
    }
    const knowledgePoints = candidate.knowledgePoints ?? [];
    const localIds = knowledgePoints.map((row) => row.candidateId);
    allCandidateIds.push(...localIds);
    if (knowledgePoints.length === 0 || !unique(localIds)) {
      issues.push(issue('POSTG_APP_W02_A01B_KP_IDENTITY_INVALID', recordPath));
    }
    const coveredPages = new Set();
    for (const kp of knowledgePoints) {
      const kpPath = `${recordPath}.${kp.candidateId}`;
      if (!kp.name || !kp.scope || !CLASSIFICATIONS.has(kp.applicationClassification)
          || typeof kp.classificationRationale !== 'string' || kp.classificationRationale.length < 8
          || !Array.isArray(kp.evidencePages) || kp.evidencePages.length === 0
          || kp.evidencePages.some((page) => !Number.isInteger(page) || page < 1 || page > inventory.pageCount)) {
        issues.push(issue('POSTG_APP_W02_A01B_KP_CLASSIFICATION_INVALID', kpPath));
      }
      for (const page of kp.evidencePages ?? []) coveredPages.add(page);
    }
    if (JSON.stringify([...coveredPages].sort((a, b) => a - b)) !== JSON.stringify(range(inventory.pageCount))) {
      issues.push(issue('POSTG_APP_W02_A01B_PAGE_COVERAGE_INCOMPLETE', recordPath));
    }
    if (JSON.stringify(candidate.counts) !== JSON.stringify(classificationCounts(knowledgePoints))) {
      issues.push(issue('POSTG_APP_W02_A01B_COUNT_MISMATCH', recordPath));
    }
    const boundary = candidate.productionBoundary;
    if (!boundary
        || boundary.canonicalOperationModelsComplete !== false
        || boundary.patternSpecsAuthored !== false
        || boundary.storyTemplatesAuthored !== false
        || boundary.runtimeConsumerEnabled !== false
        || boundary.worksheetOutputAllowed !== false
        || boundary.productionAdmissionAllowed !== false
        || candidate.nextRequiredGate !== 'CANONICAL_OPERATION_MODEL_MATERIALIZATION') {
      issues.push(issue('POSTG_APP_W02_A01B_PREMATURE_PRODUCTION_CLAIM', recordPath));
    }
  }
  if (!unique(allCandidateIds)) issues.push(issue('POSTG_APP_W02_A01B_GLOBAL_KP_IDENTITY_DUPLICATED', 'records'));

  const duplicateRows = records.filter((row) => row.inventory.contentIdentityGroup === 'pdf_5ba57aff6a97');
  if (duplicateRows.length !== 2) {
    issues.push(issue('POSTG_APP_W02_A01B_DUPLICATE_PROJECTION_INVALID', 'records.pdf_5ba57aff6a97'));
  } else {
    const normalized = duplicateRows.map(({ candidate }) => candidate.knowledgePoints.map((kp) => ({
      ...kp,
      candidateId: kp.candidateId.replace(/^kp_g4[ab]_u0[36]_/, 'kp_duplicate_')
    })));
    if (JSON.stringify(normalized[0]) !== JSON.stringify(normalized[1])) {
      issues.push(issue('POSTG_APP_W02_A01B_DUPLICATE_PROJECTION_INVALID', 'records.pdf_5ba57aff6a97'));
    }
  }

  const nodeCounts = records.reduce((sum, row) => {
    const counts = classificationCounts(row.candidate.knowledgePoints ?? []);
    for (const [key, value] of Object.entries(counts)) sum[key] = (sum[key] ?? 0) + value;
    return sum;
  }, {});
  const uniqueContentRows = [...new Map(records.map((row) => [row.inventory.contentIdentityGroup, row])).values()];
  const uniqueContentKnowledgePointCount = uniqueContentRows.reduce((sum, row) => sum + row.candidate.knowledgePoints.length, 0);
  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0
      ? 'PASS_POSTG_APP_W02_A01B_PAGE_EVIDENCED_KP_CANDIDATES_CLASSIFIED'
      : 'FAIL_POSTG_APP_W02_A01B_PAGE_EVIDENCED_KP_CANDIDATES',
    counts: {
      sourceNodeCount: records.length,
      uniquePdfContentCount: new Set(records.map((row) => row.inventory.contentIdentityGroup)).size,
      sourceNodePageCount: records.reduce((sum, row) => sum + row.inventory.pageCount, 0),
      ...nodeCounts,
      uniqueContentKnowledgePointCandidateCount: uniqueContentKnowledgePointCount
    },
    classificationSet: [...CLASSIFICATIONS],
    canonicalOperationModelsComplete: false,
    productionAdmissionAllowed: false,
    nextShortestStep: 'POSTG-APP-W02-A01C_CanonicalOperationModelMaterialization'
  };
}

export function buildW02PageKnowledgeOperationCandidateReadback({ root = process.cwd() } = {}) {
  return validateW02PageKnowledgeOperationCandidates(materializeW02PageKnowledgeOperationCandidates({ root }));
}

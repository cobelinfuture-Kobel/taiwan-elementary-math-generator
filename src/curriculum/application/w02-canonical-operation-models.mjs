import fs from 'node:fs';
import path from 'node:path';

import { buildW02PageKnowledgeOperationCandidateReadback, materializeW02PageKnowledgeOperationCandidates } from './w02-page-knowledge-operation-candidates.mjs';
import { runMaterialization } from '../../../tools/curriculum/materialize-postg-app-w02-a01c-canonical-operation-models.mjs';

const OUTPUT_DIR = 'data/curriculum/application/operations/w02';
const SCHEMA_PATH = 'data/curriculum/application/schema/w02-canonical-operation-unit.schema.json';
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const unique = (values) => new Set(values).size === values.length;

export function materializeW02CanonicalOperationModels({ root = process.cwd() } = {}) {
  const candidates = materializeW02PageKnowledgeOperationCandidates({ root });
  const expected = runMaterialization({ root, write: false });
  const records = expected.outputs.map((row) => ({
    outputPath: row.outputPath,
    expected: row.registry,
    actual: readJson(root, row.outputPath)
  }));
  return { root, candidates, candidateReadback: buildW02PageKnowledgeOperationCandidateReadback({ root }), schema: readJson(root, SCHEMA_PATH), records };
}

function normalizeDuplicate(registry) {
  return registry.knowledgePoints.map((kp) => ({
    ...kp,
    knowledgePointId: kp.knowledgePointId.replace(/^kp_g4[ab]_u0[36]_/, 'kp_duplicate_'),
    operationModels: kp.operationModels.map((model) => ({ ...model, modelId: model.modelId.replace(/^op_g4[ab]_u0[36]_/, 'op_duplicate_') }))
  }));
}

export function validateW02CanonicalOperationModels(materialized) {
  const issues = [];
  const { candidateReadback, schema, records } = materialized;
  if (!candidateReadback.ok) issues.push(issue('POSTG_APP_W02_A01C_A01B_INVALID', 'candidateReadback', { issues: candidateReadback.issues }));
  if (schema?.properties?.canonicalState?.const !== 'PAGE_EVIDENCED_CANONICAL_OPERATION_MODELS_COMPLETE_PATTERNSPEC_PENDING'
      || schema?.properties?.productionBoundary?.properties?.productionAdmissionAllowed?.const !== false) {
    issues.push(issue('POSTG_APP_W02_A01C_SCHEMA_BOUNDARY_INVALID', SCHEMA_PATH));
  }
  if (records.length !== 13) issues.push(issue('POSTG_APP_W02_A01C_SOURCE_COUNT_INVALID', OUTPUT_DIR));

  const allKpIds = [];
  const allModelIds = [];
  for (const { outputPath, expected, actual } of records) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      issues.push(issue('POSTG_APP_W02_A01C_MATERIALIZATION_DRIFT', outputPath));
    }
    if (actual.schemaName !== 'POSTGAPPW02CanonicalOperationUnitV1'
        || actual.taskId !== 'POSTG-APP-W02-A01C_CanonicalOperationModelMaterialization'
        || actual.canonicalState !== 'PAGE_EVIDENCED_CANONICAL_OPERATION_MODELS_COMPLETE_PATTERNSPEC_PENDING') {
      issues.push(issue('POSTG_APP_W02_A01C_IDENTITY_INVALID', outputPath));
    }
    const kpIds = actual.knowledgePoints.map((kp) => kp.knowledgePointId);
    const modelIds = actual.knowledgePoints.flatMap((kp) => kp.operationModels.map((model) => model.modelId));
    allKpIds.push(...kpIds);
    allModelIds.push(...modelIds);
    if (!unique(kpIds) || !unique(modelIds) || kpIds.length !== modelIds.length
        || actual.counts.knowledgePointCount !== kpIds.length
        || actual.counts.canonicalOperationModelCount !== modelIds.length) {
      issues.push(issue('POSTG_APP_W02_A01C_COUNT_OR_IDENTITY_INVALID', outputPath));
    }
    for (const kp of actual.knowledgePoints) {
      const model = kp.operationModels[0];
      if (kp.operationModels.length !== 1
          || model.modelId !== kp.knowledgePointId.replace(/^kp_/, 'op_')
          || !model.operationFamilyId
          || !Array.isArray(model.canonicalExpressions) || model.canonicalExpressions.length === 0
          || !model.operandRoles || Object.keys(model.operandRoles).length === 0
          || !Array.isArray(model.unknownRoles) || model.unknownRoles.length === 0
          || !model.unknownRoles.every((role) => Object.hasOwn(model.operandRoles, role))
          || !Array.isArray(model.numberConstraints) || model.numberConstraints.length === 0
          || !Array.isArray(model.equivalentForms) || model.equivalentForms.length === 0
          || !model.answerType
          || !Array.isArray(model.validationInvariants) || model.validationInvariants.length === 0) {
        issues.push(issue('POSTG_APP_W02_A01C_OPERATION_MODEL_INVALID', `${outputPath}.${kp.knowledgePointId}`));
      }
    }
    const boundary = actual.productionBoundary;
    if (Object.values(boundary).some((value) => value !== false)
        || actual.nextRequiredGate !== 'PATTERNSPEC_CONTRACT_AND_HIDDEN_MATERIALIZATION') {
      issues.push(issue('POSTG_APP_W02_A01C_PREMATURE_RUNTIME_OR_PRODUCTION_CLAIM', outputPath));
    }
  }
  if (!unique(allKpIds)) issues.push(issue('POSTG_APP_W02_A01C_GLOBAL_KP_ID_DUPLICATED', OUTPUT_DIR));
  if (!unique(allModelIds)) issues.push(issue('POSTG_APP_W02_A01C_GLOBAL_MODEL_ID_DUPLICATED', OUTPUT_DIR));

  const duplicate = records.filter((row) => row.actual.sourceEvidence.contentIdentityGroup === 'pdf_5ba57aff6a97');
  if (duplicate.length !== 2 || JSON.stringify(normalizeDuplicate(duplicate[0].actual)) !== JSON.stringify(normalizeDuplicate(duplicate[1].actual))) {
    issues.push(issue('POSTG_APP_W02_A01C_DUPLICATE_PROJECTION_INVALID', 'pdf_5ba57aff6a97'));
  }
  const uniqueContent = [...new Map(records.map((row) => [row.actual.sourceEvidence.contentIdentityGroup, row.actual])).values()];
  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0 ? 'PASS_POSTG_APP_W02_A01C_CANONICAL_OPERATION_MODELS_MATERIALIZED' : 'FAIL_POSTG_APP_W02_A01C_CANONICAL_OPERATION_MODELS',
    counts: {
      sourceNodeCount: records.length,
      uniquePdfContentCount: uniqueContent.length,
      knowledgePointCount: allKpIds.length,
      uniqueContentKnowledgePointCount: uniqueContent.reduce((sum, registry) => sum + registry.counts.knowledgePointCount, 0),
      canonicalOperationModelCount: allModelIds.length,
      uniqueContentCanonicalOperationModelCount: uniqueContent.reduce((sum, registry) => sum + registry.counts.canonicalOperationModelCount, 0)
    },
    patternSpecsAuthored: false,
    runtimeConsumerEnabled: false,
    productionAdmissionAllowed: false,
    nextShortestStep: 'POSTG-APP-W02-A01D_PatternSpecContractAndHiddenMaterialization'
  };
}

export function buildW02CanonicalOperationModelReadback({ root = process.cwd() } = {}) {
  return validateW02CanonicalOperationModels(materializeW02CanonicalOperationModels({ root }));
}

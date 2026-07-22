import fs from 'node:fs';
import path from 'node:path';

import { buildW02CanonicalOperationModelReadback } from './w02-canonical-operation-models.mjs';
import { runA01DMaterialization } from '../../../tools/curriculum/materialize-postg-app-w02-a01d-hidden-pattern-specs.mjs';

const SCHEMA_PATH = 'data/curriculum/application/schema/w02-hidden-pattern-spec-unit.schema.json';
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const unique = (values) => new Set(values).size === values.length;

export function materializeW02HiddenPatternSpecs({ root = process.cwd() } = {}) {
  const expected = runA01DMaterialization({ root, write: false });
  return {
    root,
    canonicalReadback: buildW02CanonicalOperationModelReadback({ root }),
    schema: readJson(root, SCHEMA_PATH),
    records: expected.outputs.map((row) => ({ outputPath: row.outputPath, expected: row.registry, actual: readJson(root, row.outputPath) }))
  };
}

function normalizedDuplicate(registry) {
  const normalized = structuredClone(registry.knowledgePoints);
  return normalized.map((kp) => ({
    ...kp,
    knowledgePointId: kp.knowledgePointId.replace(/^kp_g4[ab]_u0[36]_/, 'kp_duplicate_'),
    operationModelId: kp.operationModelId.replace(/^op_g4[ab]_u0[36]_/, 'op_duplicate_'),
    patternSpecs: kp.patternSpecs.map((spec) => ({
      ...spec,
      patternSpecId: spec.patternSpecId.replace(/^ps_g4[ab]_u0[36]_/, 'ps_duplicate_'),
      patternGroupId: spec.patternGroupId.replace(/^pg_g4[ab]_u0[36]_/, 'pg_duplicate_'),
      knowledgePointId: spec.knowledgePointId.replace(/^kp_g4[ab]_u0[36]_/, 'kp_duplicate_'),
      operationModelId: spec.operationModelId.replace(/^op_g4[ab]_u0[36]_/, 'op_duplicate_')
    }))
  }));
}

export function validateW02HiddenPatternSpecs(materialized) {
  const issues = [];
  const { canonicalReadback, schema, records } = materialized;
  if (!canonicalReadback.ok) issues.push(issue('POSTG_APP_W02_A01D_A01C_INVALID', 'canonicalReadback', { issues: canonicalReadback.issues }));
  if (schema?.properties?.patternSpecState?.const !== 'HIDDEN_PATTERNSPECS_MATERIALIZED_RUNTIME_PENDING'
      || schema?.properties?.productionBoundary?.properties?.productionAdmissionAllowed?.const !== false) {
    issues.push(issue('POSTG_APP_W02_A01D_SCHEMA_BOUNDARY_INVALID', SCHEMA_PATH));
  }
  if (records.length !== 13) issues.push(issue('POSTG_APP_W02_A01D_SOURCE_COUNT_INVALID', 'pattern-specs/w02'));

  const allKpIds = [];
  const allSpecIds = [];
  let numericCount = 0;
  let applicationCount = 0;
  for (const { outputPath, expected, actual } of records) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) issues.push(issue('POSTG_APP_W02_A01D_MATERIALIZATION_DRIFT', outputPath));
    if (actual.schemaName !== 'POSTGAPPW02HiddenPatternSpecUnitV1'
        || actual.taskId !== 'POSTG-APP-W02-A01D_PatternSpecContractAndHiddenMaterialization'
        || actual.patternSpecState !== 'HIDDEN_PATTERNSPECS_MATERIALIZED_RUNTIME_PENDING') {
      issues.push(issue('POSTG_APP_W02_A01D_IDENTITY_INVALID', outputPath));
    }
    const kpIds = actual.knowledgePoints.map((kp) => kp.knowledgePointId);
    const specs = actual.knowledgePoints.flatMap((kp) => kp.patternSpecs);
    const specIds = specs.map((spec) => spec.patternSpecId);
    allKpIds.push(...kpIds);
    allSpecIds.push(...specIds);
    numericCount += specs.filter((spec) => spec.mode === 'NUMERIC').length;
    applicationCount += specs.filter((spec) => spec.mode === 'APPLICATION').length;
    if (!unique(kpIds) || !unique(specIds) || actual.counts.knowledgePointCount !== kpIds.length
        || actual.counts.hiddenPatternSpecCount !== specs.length || actual.counts.visiblePatternSpecCount !== 0) {
      issues.push(issue('POSTG_APP_W02_A01D_COUNT_OR_IDENTITY_INVALID', outputPath));
    }
    for (const kp of actual.knowledgePoints) {
      const numeric = kp.patternSpecs.filter((spec) => spec.mode === 'NUMERIC');
      const application = kp.patternSpecs.filter((spec) => spec.mode === 'APPLICATION');
      const expectedUnknownRoles = expected.knowledgePoints.find((row) => row.knowledgePointId === kp.knowledgePointId).patternSpecs
        .filter((spec) => spec.mode === 'NUMERIC').map((spec) => spec.requestedUnknownRole);
      if (numeric.length !== expectedUnknownRoles.length
          || !expectedUnknownRoles.every((role) => numeric.some((spec) => spec.requestedUnknownRole === role))) {
        issues.push(issue('POSTG_APP_W02_A01D_NUMERIC_COVERAGE_INVALID', `${outputPath}.${kp.knowledgePointId}`));
      }
      const applicable = kp.applicationClassification !== 'APPLICATION_NOT_APPLICABLE';
      if ((applicable && application.length !== expectedUnknownRoles.length) || (!applicable && application.length !== 0)) {
        issues.push(issue('POSTG_APP_W02_A01D_APPLICATION_CLASSIFICATION_VIOLATION', `${outputPath}.${kp.knowledgePointId}`));
      }
      for (const spec of kp.patternSpecs) {
        const p = spec.presentationContract;
        const l = spec.lifecycle;
        if (spec.knowledgePointId !== kp.knowledgePointId || spec.operationModelId !== kp.operationModelId
            || !spec.requestedUnknownRole || spec.givenRoles.includes(spec.requestedUnknownRole)
            || p.numericAndApplicationSeparated !== true
            || JSON.stringify(p.forbiddenWorksheetLabels) !== JSON.stringify(['算式', '_____', '答'])
            || (spec.mode === 'APPLICATION') !== p.contextRequired
            || l.selectorVisibility !== 'hidden' || l.generatorStatus !== 'not_implemented'
            || l.validatorStatus !== 'contract_only_not_runtime' || l.rendererStatus !== 'not_connected'
            || l.canonicalRouting !== 'disabled' || l.productionUse !== 'forbidden') {
          issues.push(issue('POSTG_APP_W02_A01D_PATTERN_SPEC_INVALID', `${outputPath}.${spec.patternSpecId}`));
        }
      }
    }
    if (Object.values(actual.productionBoundary).some((value) => value !== false)
        || actual.nextRequiredGate !== 'ATOMIC_CONTEXT_BINDING_AND_SINGLE_APPLICATION_CANDIDATE_MATERIALIZATION') {
      issues.push(issue('POSTG_APP_W02_A01D_PREMATURE_RUNTIME_OR_PRODUCTION_CLAIM', outputPath));
    }
  }
  if (!unique(allKpIds)) issues.push(issue('POSTG_APP_W02_A01D_GLOBAL_KP_ID_DUPLICATED', 'pattern-specs/w02'));
  if (!unique(allSpecIds)) issues.push(issue('POSTG_APP_W02_A01D_GLOBAL_PATTERN_SPEC_ID_DUPLICATED', 'pattern-specs/w02'));
  const duplicate = records.filter((row) => row.actual.canonicalOperationAuthority.path.includes('/g4a_u06_4a06.') || row.actual.canonicalOperationAuthority.path.includes('/g4b_u03_4b03.'));
  if (duplicate.length !== 2 || JSON.stringify(normalizedDuplicate(duplicate[0].actual)) !== JSON.stringify(normalizedDuplicate(duplicate[1].actual))) {
    issues.push(issue('POSTG_APP_W02_A01D_DUPLICATE_PROJECTION_INVALID', 'pdf_5ba57aff6a97'));
  }
  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0 ? 'PASS_POSTG_APP_W02_A01D_HIDDEN_PATTERNSPECS_MATERIALIZED' : 'FAIL_POSTG_APP_W02_A01D_HIDDEN_PATTERNSPECS',
    counts: {
      sourceNodeCount: records.length,
      uniquePdfContentCount: 12,
      knowledgePointCount: allKpIds.length,
      uniqueContentKnowledgePointCount: 84,
      numericPatternSpecCount: numericCount,
      applicationPatternSpecCount: applicationCount,
      hiddenPatternSpecCount: allSpecIds.length,
      visiblePatternSpecCount: 0
    },
    generatorConnected: false,
    runtimeValidatorConnected: false,
    rendererConnected: false,
    productionAdmissionAllowed: false,
    nextShortestStep: 'POSTG-APP-W02-A02_AtomicContextBindingAndSingleApplicationCandidateMaterialization'
  };
}

export function buildW02HiddenPatternSpecReadback({ root = process.cwd() } = {}) {
  return validateW02HiddenPatternSpecs(materializeW02HiddenPatternSpecs({ root }));
}

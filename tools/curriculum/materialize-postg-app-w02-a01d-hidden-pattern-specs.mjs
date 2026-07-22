import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OPERATION_DIR = 'data/curriculum/application/operations/w02';
const OUTPUT_DIR = 'data/curriculum/application/pattern-specs/w02';
const TASK_ID = 'POSTG-APP-W02-A01D_PatternSpecContractAndHiddenMaterialization';

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const slug = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase();

function buildSpec(kp, model, requestedUnknownRole, mode) {
  const stem = kp.knowledgePointId.replace(/^kp_/, '');
  const modeSlug = mode.toLowerCase();
  const contextRequired = mode === 'APPLICATION';
  return {
    patternSpecId: `ps_${stem}_${slug(requestedUnknownRole)}_${modeSlug}`,
    patternGroupId: `pg_${stem}_${modeSlug}`,
    knowledgePointId: kp.knowledgePointId,
    operationModelId: model.modelId,
    operationFamilyId: model.operationFamilyId,
    mode,
    requestedUnknownRole,
    givenRoles: Object.keys(model.operandRoles).filter((role) => role !== requestedUnknownRole),
    answerType: model.answerType,
    operationContract: {
      canonicalExpressions: model.canonicalExpressions,
      numberConstraints: model.numberConstraints,
      equivalentForms: model.equivalentForms,
      validationInvariants: model.validationInvariants
    },
    presentationContract: {
      numericAndApplicationSeparated: true,
      contextRequired,
      contextBindingState: contextRequired ? 'PENDING_GLOBAL_ATOMIC_EPISODE_BINDING' : 'NOT_APPLICABLE',
      surfaceMode: contextRequired ? 'LIFE_CONTEXT_QUANTITY_RELATION' : 'DIRECT_NUMERIC_OR_STRUCTURAL',
      forbiddenWorksheetLabels: ['算式', '_____', '答']
    },
    lifecycle: {
      selectorVisibility: 'hidden',
      generatorStatus: 'not_implemented',
      validatorStatus: 'contract_only_not_runtime',
      rendererStatus: 'not_connected',
      canonicalRouting: 'disabled',
      productionUse: 'forbidden'
    }
  };
}

function materializeUnit(root, operationPath, operation) {
  const knowledgePoints = operation.knowledgePoints.map((kp) => {
    const model = kp.operationModels[0];
    const modes = kp.applicationClassification === 'APPLICATION_NOT_APPLICABLE'
      ? ['NUMERIC']
      : ['NUMERIC', 'APPLICATION'];
    const patternSpecs = modes.flatMap((mode) => model.unknownRoles.map((role) => buildSpec(kp, model, role, mode)));
    return {
      knowledgePointId: kp.knowledgePointId,
      knowledgePointName: kp.knowledgePointName,
      applicationClassification: kp.applicationClassification,
      operationModelId: model.modelId,
      patternSpecs
    };
  });
  const patternSpecs = knowledgePoints.flatMap((kp) => kp.patternSpecs);
  return {
    schemaName: 'POSTGAPPW02HiddenPatternSpecUnitV1',
    schemaVersion: 1,
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: TASK_ID,
    sourceNodeId: operation.sourceNodeId,
    queueOrdinal: operation.queueOrdinal,
    sourceCode: operation.sourceCode,
    sourceTitle: operation.sourceTitle,
    domainFamily: operation.domainFamily,
    patternSpecState: 'HIDDEN_PATTERNSPECS_MATERIALIZED_RUNTIME_PENDING',
    canonicalOperationAuthority: {
      path: operationPath,
      sha256: sha256(fs.readFileSync(path.join(root, operationPath))),
      taskId: operation.taskId,
      canonicalState: operation.canonicalState
    },
    knowledgePoints,
    counts: {
      knowledgePointCount: knowledgePoints.length,
      numericPatternSpecCount: patternSpecs.filter((spec) => spec.mode === 'NUMERIC').length,
      applicationPatternSpecCount: patternSpecs.filter((spec) => spec.mode === 'APPLICATION').length,
      hiddenPatternSpecCount: patternSpecs.length,
      visiblePatternSpecCount: 0
    },
    productionBoundary: {
      storyTemplatesAuthored: false,
      contextBindingsAuthored: false,
      generatorConnected: false,
      runtimeValidatorConnected: false,
      rendererConnected: false,
      worksheetOutputAllowed: false,
      publicSelectionEnabled: false,
      productionAdmissionAllowed: false
    },
    nextRequiredGate: 'ATOMIC_CONTEXT_BINDING_AND_SINGLE_APPLICATION_CANDIDATE_MATERIALIZATION'
  };
}

export function runA01DMaterialization({ root = ROOT, write = true } = {}) {
  const operationFiles = fs.readdirSync(path.join(root, OPERATION_DIR)).filter((file) => file.endsWith('.canonical-operation.json')).sort();
  const outputs = operationFiles.map((file) => {
    const operationPath = `${OPERATION_DIR}/${file}`;
    const operation = JSON.parse(fs.readFileSync(path.join(root, operationPath), 'utf8'));
    const registry = materializeUnit(root, operationPath, operation);
    const outputPath = `${OUTPUT_DIR}/${operation.sourceNodeId}.hidden-pattern-spec.json`;
    if (write) {
      fs.mkdirSync(path.join(root, OUTPUT_DIR), { recursive: true });
      fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(registry, null, 2)}\n`);
    }
    return { outputPath, registry };
  });
  const specs = outputs.flatMap((row) => row.registry.knowledgePoints.flatMap((kp) => kp.patternSpecs));
  return {
    sourceNodeCount: outputs.length,
    knowledgePointCount: outputs.reduce((sum, row) => sum + row.registry.counts.knowledgePointCount, 0),
    numericPatternSpecCount: specs.filter((spec) => spec.mode === 'NUMERIC').length,
    applicationPatternSpecCount: specs.filter((spec) => spec.mode === 'APPLICATION').length,
    hiddenPatternSpecCount: specs.length,
    outputs
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runA01DMaterialization();
  process.stdout.write(`${JSON.stringify({
    sourceNodeCount: result.sourceNodeCount,
    knowledgePointCount: result.knowledgePointCount,
    numericPatternSpecCount: result.numericPatternSpecCount,
    applicationPatternSpecCount: result.applicationPatternSpecCount,
    hiddenPatternSpecCount: result.hiddenPatternSpecCount,
    outputPaths: result.outputs.map((row) => row.outputPath)
  }, null, 2)}\n`);
}

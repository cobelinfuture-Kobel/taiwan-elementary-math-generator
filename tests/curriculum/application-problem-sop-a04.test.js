import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const bindingSchema = JSON.parse(readFileSync('data/curriculum/application/schema/application-context-binding.schema.json', 'utf8'));
const admissionSchema = JSON.parse(readFileSync('data/curriculum/application/schema/application-admission-record.schema.json', 'utf8'));
const bindingRegistry = JSON.parse(readFileSync('data/curriculum/application/registry/application-context-bindings.json', 'utf8'));
const admissionRegistry = JSON.parse(readFileSync('data/curriculum/application/registry/application-admission-registry.json', 'utf8'));
const contract = JSON.parse(readFileSync('data/curriculum/application/contracts/APP-SOP-A04_GlobalContextBindingAndAdmissionRegistries.json', 'utf8'));
const claim = JSON.parse(readFileSync('data/project/milestones/APP-SOP-A04.claim.json', 'utf8'));
const document = readFileSync('docs/curriculum/contracts/Application_Global_Context_Binding_SOP_V1.md', 'utf8');

const DIRECT_BINDING = {
  schemaVersion: 1,
  bindingId: 'appctx_g3b_u01_quotative_food_001',
  sourceId: 'g3b_u01_3b01',
  knowledgePointId: 'kp_g3b_u01_wp_quotative_division',
  canonicalOperationModelId: 'op_g3b_u01_quotative_division',
  applicationModes: ['SINGLE_DIRECT'],
  contextFamilyId: 'gctx_family_food_distribution',
  requiredContextAffordances: ['fixed group size', 'all groups use equal amount'],
  providedContextAffordances: ['fixed group size', 'all groups use equal amount'],
  roleBindings: [
    {
      mathRoleId: 'totalAmount',
      contextRoleId: 'totalFoodItems',
      semanticMeaning: '食品總數',
      quantityType: 'COUNT',
      unit: '個',
      cardinality: 'ONE',
      isAnswerRole: false
    },
    {
      mathRoleId: 'amountPerGroup',
      contextRoleId: 'itemsPerBox',
      semanticMeaning: '每箱數量',
      quantityType: 'RATE',
      unit: '個/箱',
      cardinality: 'ONE',
      isAnswerRole: false
    },
    {
      mathRoleId: 'groupCount',
      contextRoleId: 'boxCount',
      semanticMeaning: '箱數',
      quantityType: 'COUNT',
      unit: '箱',
      cardinality: 'ONE',
      isAnswerRole: true
    }
  ],
  unitFlow: {
    inputUnits: ['個', '個/箱'],
    transformationRule: 'totalAmount / amountPerGroup = groupCount',
    answerUnit: '箱',
    validated: true
  },
  semanticConstraints: [
    {
      constraintId: 'equal_box_size',
      statement: '每箱裝入相同數量',
      decisionRelevant: false,
      requiredInPrompt: true
    }
  ],
  forbiddenCombinations: [],
  admittedSurfaceTemplateIds: [],
  answerWitnessContract: {
    answerRole: 'groupCount',
    answerUnit: '箱',
    interpretationStatementPattern: '可以裝成{answer}箱。',
    allowedWitnessTypes: ['SHORT_ANSWER_MEANING'],
    misconceptionCompatibility: true,
    counterfactualCompatibility: true
  },
  admissionStatus: 'DRAFT',
  lineage: {
    knowledgeOperationAuthorityPath: 'data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json',
    globalContextAuthorityPath: 'data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json'
  }
};

function validateBinding(binding) {
  const errors = [];
  for (const field of bindingSchema.required) if (!(field in binding)) errors.push(`missing:${field}`);
  const required = new Set(binding.requiredContextAffordances ?? []);
  const provided = new Set(binding.providedContextAffordances ?? []);
  for (const affordance of required) if (!provided.has(affordance)) errors.push(`missingAffordance:${affordance}`);
  if (!(binding.roleBindings ?? []).some((row) => row.isAnswerRole)) errors.push('missing:answerRoleBinding');
  if (binding.unitFlow?.validated !== true) errors.push('invalid:unitFlow');
  if (binding.applicationModes?.includes('SINGLE_N_PLUS_1') && !binding.nPlusOneProofRef) errors.push('missing:nPlusOneProofRef');
  if (binding.applicationModes?.includes('PBL_TASK_SET')) {
    if (!binding.pblContractRef) errors.push('missing:pblContractRef');
    if ((binding.allowedPBLGraphTypes?.length ?? 0) < 1) errors.push('missing:allowedPBLGraphTypes');
    if ((binding.allowedPBLFinalProductTypes?.length ?? 0) < 1) errors.push('missing:allowedPBLFinalProductTypes');
  }
  return errors;
}

test('A04 binding schema separates math authority from global context authority', () => {
  assert.equal(bindingSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(bindingSchema.additionalProperties, false);
  assert.equal(bindingSchema.required.includes('roleBindings'), true);
  assert.equal(bindingSchema.required.includes('unitFlow'), true);
  assert.equal(bindingSchema.required.includes('semanticConstraints'), true);
  assert.equal(contract.bindingInvariants.mathematicsOwnedByContext, false);
});

test('valid direct binding satisfies structural affordance, role, and unit-flow checks', () => {
  assert.deepEqual(validateBinding(DIRECT_BINDING), []);
});

test('N+1 and PBL modes require their mode-specific proof references', () => {
  const n1 = structuredClone(DIRECT_BINDING);
  n1.applicationModes = ['SINGLE_N_PLUS_1'];
  assert.equal(validateBinding(n1).includes('missing:nPlusOneProofRef'), true);
  n1.nPlusOneProofRef = 'n1proof_g3b_u01_min_container_001';
  assert.deepEqual(validateBinding(n1), []);

  const pbl = structuredClone(DIRECT_BINDING);
  pbl.applicationModes = ['PBL_TASK_SET'];
  assert.equal(validateBinding(pbl).includes('missing:pblContractRef'), true);
  assert.equal(validateBinding(pbl).includes('missing:allowedPBLGraphTypes'), true);
  assert.equal(validateBinding(pbl).includes('missing:allowedPBLFinalProductTypes'), true);
});

test('missing context affordance and answer role fail closed', () => {
  const missingAffordance = structuredClone(DIRECT_BINDING);
  missingAffordance.providedContextAffordances = ['fixed group size'];
  assert.equal(validateBinding(missingAffordance).some((error) => error.startsWith('missingAffordance:')), true);

  const missingAnswerRole = structuredClone(DIRECT_BINDING);
  missingAnswerRole.roleBindings = missingAnswerRole.roleBindings.map((row) => ({ ...row, isAnswerRole: false }));
  assert.equal(validateBinding(missingAnswerRole).includes('missing:answerRoleBinding'), true);
});

test('A04 bootstrap registries are intentionally empty and admit nothing', () => {
  assert.deepEqual(bindingRegistry.bindings, []);
  assert.deepEqual(admissionRegistry.admissionRecords, []);
  assert.equal(bindingRegistry.status, 'BOOTSTRAP_EMPTY_NO_PRODUCTION_ADMISSIONS');
  assert.equal(admissionRegistry.status, 'BOOTSTRAP_EMPTY_NO_PRODUCTION_ADMISSIONS');
  assert.equal(contract.registryBootstrap.bindingCount, 0);
  assert.equal(contract.registryBootstrap.admissionRecordCount, 0);
  assert.equal(contract.registryBootstrap.productionAdmissionCount, 0);
});

test('admission schema requires evidence and review before production admission', () => {
  const productionCondition = admissionSchema.allOf[0];
  assert.equal(productionCondition.if.properties.decision.const, 'PRODUCTION_ADMITTED');
  assert.equal(productionCondition.then.properties.currentStage.const, 'PRODUCTION_ADMITTED');
  assert.equal(productionCondition.then.properties.productionAdmissionAllowed.const, true);
  assert.equal(productionCondition.then.properties.evidenceRefs.minItems, 3);
  assert.equal(productionCondition.then.properties.blockingReasons.maxItems, 0);
  assert.equal(productionCondition.else.properties.productionAdmissionAllowed.const, false);
});

test('A04 remains E1 contract-only and points to A05', () => {
  for (const [key, value] of Object.entries(contract.scope)) {
    if (key === 'primaryPRLimit') assert.equal(value, 1);
    else assert.equal(value, false, `${key} must remain false in A04`);
  }
  assert.equal(claim.actualEvidenceLevel, 'E1_DATA_STRUCTURE_READY');
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.productionAdmitted, false);
  assert.equal(claim.nextStep.taskId, 'APP-SOP-A05_ValidatorCIGatesAndG3BU01PilotFixtures');
});

test('normative document contains authority, binding, admission, and empty-bootstrap gates', () => {
  for (const section of [
    '# Application Global Context Binding SOP V1',
    '## 2. Mandatory binding order',
    '## 3. Authority separation',
    '## 5. Required context affordances',
    '## 6. Role binding',
    '## 7. Unit flow',
    '## 12. Application-mode eligibility',
    '## 13. Admission registry',
    '## 17. Bootstrap registry policy',
    '## 18. A04 scope boundary'
  ]) assert.equal(document.includes(section), true, `missing section: ${section}`);
});

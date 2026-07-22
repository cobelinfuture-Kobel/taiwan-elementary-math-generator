import fs from 'node:fs';

const controllerPath = 'src/curriculum/application/postg-app-master-controller.mjs';

function replaceExactlyOnce(source, oldText, newText, code) {
  if (source.includes(newText)) return { source, changed: false };
  const first = source.indexOf(oldText);
  const second = first < 0 ? -1 : source.indexOf(oldText, first + oldText.length);
  if (first < 0 || second >= 0) throw new Error(JSON.stringify({ code, first, second }));
  return { source: source.replace(oldText, newText), changed: true };
}

let source = fs.readFileSync(controllerPath, 'utf8');
let changed = false;

const patches = [
  [
    `const W02_A00_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A00.claim.json';\nconst GOLDEN_UNIT_DIR`,
    `const W02_A00_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A00.claim.json';\nconst W02_A01A_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01A.claim.json';\nconst GOLDEN_UNIT_DIR`,
    'POSTG_APP_W02_A01A_CONSTANT_ANCHOR_INVALID'
  ],
  [
    `  const w02A00Claim = readJsonIfExists(root, W02_A00_CLAIM_PATH);\n  const goldenRegistries`,
    `  const w02A00Claim = readJsonIfExists(root, W02_A00_CLAIM_PATH);\n  const w02A01AClaim = readJsonIfExists(root, W02_A01A_CLAIM_PATH);\n  const goldenRegistries`,
    'POSTG_APP_W02_A01A_LOAD_ANCHOR_INVALID'
  ],
  [
    `    approvalDecision,\n    w01Claim,\n    w02A00Claim\n  };`,
    `    approvalDecision,\n    w01Claim,\n    w02A00Claim,\n    w02A01AClaim\n  };`,
    'POSTG_APP_W02_A01A_RETURN_ANCHOR_INVALID'
  ],
  [
    `    approvalDecision,\n    w01Claim,\n    w02A00Claim\n  } = controller;`,
    `    approvalDecision,\n    w01Claim,\n    w02A00Claim,\n    w02A01AClaim\n  } = controller;`,
    'POSTG_APP_W02_A01A_DESTRUCTURE_ANCHOR_INVALID'
  ],
  [
    `      || w02State.sourceLevelApplicationPotential !== 'MIXED_KP_SPLIT_REQUIRED'\n      || w02State.kpApplicationClassificationComplete !== false\n      || w02State.forcedStoryAuthoringAllowed !== false) {`,
    `      || w02State.sourceLevelApplicationPotential !== 'MIXED_KP_SPLIT_REQUIRED'\n      || w02State.sourcePdfEvidenceState !== 'HASH_LOCKED_RENDERABLE'\n      || w02State.sourcePdfEvidenceTaskId !== 'POSTG-APP-W02-A01A_13SourceNodePdfEvidenceInventoryAndRenderabilityVerification'\n      || w02State.sourcePdfReferenceCount !== 13\n      || w02State.uniquePdfContentCount !== 12\n      || w02State.totalSourcePdfPageCount !== 31\n      || w02State.sourcePdfTextLayerAvailableCount !== 13\n      || w02State.sourcePdfRenderAvailableCount !== 13\n      || w02State.duplicateSourcePdfContentGroupCount !== 1\n      || w02State.kpApplicationClassificationComplete !== false\n      || w02State.forcedStoryAuthoringAllowed !== false) {`,
    'POSTG_APP_W02_A01A_WAVE_STATE_ANCHOR_INVALID'
  ],
  [
    `      || controllerState.currentCapability !== 'W02_SOURCE13_AUTHORITY_AND_READINESS_BASELINE_READY'\n      || controllerState.currentMainlineBlocker !== 'W02_KNOWLEDGE_OPERATION_MATERIALIZATION_PENDING'\n      || controllerState.nextShortestStep !== 'POSTG-APP-W02-A01_13SourceNodeKnowledgeOperationCandidateMaterializationAndKPClassification') {`,
    `      || controllerState.currentCapability !== 'W02_SOURCE13_PDF_EVIDENCE_HASH_LOCKED_RENDERABLE'\n      || controllerState.currentMainlineBlocker !== 'W02_PAGE_LEVEL_KNOWLEDGE_OPERATION_EXTRACTION_PENDING'\n      || controllerState.nextShortestStep !== 'POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification') {`,
    'POSTG_APP_W02_A01A_CONTROLLER_TRANSITION_ANCHOR_INVALID'
  ],
  [
    `  if (!w02A00Claim\n      || w02A00Claim.actualEvidenceLevel !== 'E3_SHADOW_RUNTIME_INTEGRATED'\n      || w02A00Claim.claimedStatus !== 'W02_SOURCE13_AUTHORITY_AND_READINESS_BASELINE_READY'\n      || w02A00Claim.claims?.runtimeIntegrated !== true\n      || w02A00Claim.claims?.productionAdmitted !== false\n      || w02A00Claim.claims?.d0Complete !== false\n      || w02A00Claim.nextStep?.taskId !== 'POSTG-APP-W02-A01_13SourceNodeKnowledgeOperationCandidateMaterializationAndKPClassification') {\n    issues.push(issue('POSTG_APP_W02_A00_CLAIM_INVALID', W02_A00_CLAIM_PATH));\n  }`,
    `  if (!w02A00Claim\n      || w02A00Claim.actualEvidenceLevel !== 'E3_SHADOW_RUNTIME_INTEGRATED'\n      || w02A00Claim.claimedStatus !== 'W02_SOURCE13_AUTHORITY_AND_READINESS_BASELINE_READY'\n      || w02A00Claim.claims?.runtimeIntegrated !== true\n      || w02A00Claim.claims?.productionAdmitted !== false\n      || w02A00Claim.claims?.d0Complete !== false\n      || w02A00Claim.nextStep?.taskId !== 'POSTG-APP-W02-A01_13SourceNodeKnowledgeOperationCandidateMaterializationAndKPClassification') {\n    issues.push(issue('POSTG_APP_W02_A00_CLAIM_INVALID', W02_A00_CLAIM_PATH));\n  }\n  if (!w02A01AClaim\n      || w02A01AClaim.actualEvidenceLevel !== 'E3_SHADOW_RUNTIME_INTEGRATED'\n      || w02A01AClaim.claimedStatus !== 'W02_SOURCE13_PDF_EVIDENCE_HASH_LOCKED_RENDERABLE'\n      || w02A01AClaim.claims?.runtimeIntegrated !== true\n      || w02A01AClaim.claims?.productionAdmitted !== false\n      || w02A01AClaim.claims?.d0Complete !== false\n      || w02A01AClaim.nextStep?.taskId !== 'POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification') {\n    issues.push(issue('POSTG_APP_W02_A01A_CLAIM_INVALID', W02_A01A_CLAIM_PATH));\n  }`,
    'POSTG_APP_W02_A01A_CLAIM_ANCHOR_INVALID'
  ],
  [
    `      ? 'W02_SOURCE_ASSESSMENT_BASELINE_READY'`,
    `      ? 'W02_SOURCE_PDF_EVIDENCE_READY'`,
    'POSTG_APP_W02_A01A_STATUS_ANCHOR_INVALID'
  ]
];

for (const [oldText, newText, code] of patches) {
  const result = replaceExactlyOnce(source, oldText, newText, code);
  source = result.source;
  changed ||= result.changed;
}

if (changed) fs.writeFileSync(controllerPath, source, 'utf8');

console.log(JSON.stringify({
  status: changed ? 'POSTG_APP_W02_A01A_CONTROLLER_PATCHED' : 'POSTG_APP_W02_A01A_CONTROLLER_ALREADY_ALIGNED',
  changed,
  claimLoaded: source.includes('w02A01AClaim'),
  currentCapabilityAligned: source.includes('W02_SOURCE13_PDF_EVIDENCE_HASH_LOCKED_RENDERABLE'),
  nextStepAligned: source.includes('POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification')
}, null, 2));

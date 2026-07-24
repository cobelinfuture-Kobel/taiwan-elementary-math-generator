#!/usr/bin/env node
import fs from 'node:fs';

const targetPath = 'src/curriculum/application/postg-app-master-controller.mjs';
const original = fs.readFileSync(targetPath, 'utf8');
let next = original;

const duplicated = `import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_STATUS,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';
import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_CLAIM_PATH,
  W02_A08R4_DECISION_PATH,
  W02_A08R4_EVIDENCE_PATH,
  W02_A08R4_STATUS,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';`;
const normalized = `import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_CLAIM_PATH,
  W02_A08R4_DECISION_PATH,
  W02_A08R4_EVIDENCE_PATH,
  W02_A08R4_STATUS,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';`;
if (next.includes(duplicated)) next = next.replace(duplicated, normalized);

const incompleteA09AImport = `import {
  W02_A09A_NEXT_TASK,
  W02_A09A_STATUS,
  W02_A09A_TASK
} from './w02-a09a-authority-reconciliation-freeze.mjs';`;
const completeA09AImport = `import {
  W02_A09A_NEXT_TASK,
  W02_A09A_POLICY_PATH,
  W02_A09A_STATUS,
  W02_A09A_TASK
} from './w02-a09a-authority-reconciliation-freeze.mjs';`;
if (next.includes(incompleteA09AImport)) next = next.replace(incompleteA09AImport, completeA09AImport);

if (next !== original) {
  fs.writeFileSync(targetPath, next);
  console.log(JSON.stringify({ changed: true, targetPath }));
} else if (next.includes(normalized) && next.includes(completeA09AImport)) {
  console.log(JSON.stringify({ changed: false, targetPath, status: 'already_normalized' }));
} else {
  console.error(JSON.stringify({ changed: false, targetPath, status: 'unexpected_import_shape' }));
  process.exitCode = 1;
}

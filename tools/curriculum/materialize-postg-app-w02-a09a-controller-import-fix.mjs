#!/usr/bin/env node
import fs from 'node:fs';

const targetPath = 'src/curriculum/application/postg-app-master-controller.mjs';
const original = fs.readFileSync(targetPath, 'utf8');
let next = original;

const duplicatedA08R4 = `import {
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
const normalizedA08R4 = `import {
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
if (next.includes(duplicatedA08R4)) next = next.replace(duplicatedA08R4, normalizedA08R4);

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
const mixedDuplicateA09A = `${incompleteA09AImport}\n${completeA09AImport}`;
const completeDuplicateA09A = `${completeA09AImport}\n${completeA09AImport}`;
if (next.includes(mixedDuplicateA09A)) next = next.replace(mixedDuplicateA09A, completeA09AImport);
if (next.includes(completeDuplicateA09A)) next = next.replace(completeDuplicateA09A, completeA09AImport);
if (next.includes(incompleteA09AImport)) next = next.replace(incompleteA09AImport, completeA09AImport);

const completeImportCount = next.split(completeA09AImport).length - 1;
if (completeImportCount > 1) {
  const first = next.indexOf(completeA09AImport);
  const before = next.slice(0, first + completeA09AImport.length);
  const after = next.slice(first + completeA09AImport.length).split(completeA09AImport).join('');
  next = before + after;
}

if (next !== original) {
  fs.writeFileSync(targetPath, next);
  console.log(JSON.stringify({ changed: true, targetPath }));
} else if (next.includes(normalizedA08R4) && completeImportCount === 1) {
  console.log(JSON.stringify({ changed: false, targetPath, status: 'already_normalized' }));
} else {
  console.error(JSON.stringify({ changed: false, targetPath, status: 'unexpected_import_shape', completeImportCount }));
  process.exitCode = 1;
}

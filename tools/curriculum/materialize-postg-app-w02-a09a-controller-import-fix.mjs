#!/usr/bin/env node
import fs from 'node:fs';

const controllerPath = 'src/curriculum/application/postg-app-master-controller.mjs';
const authoritativeMaterializerPath = 'tools/curriculum/materialize-postg-app-w02-a09a-authoritative-mainline-freeze.mjs';
const changedFiles = [];

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

function normalizeController() {
  const original = fs.readFileSync(controllerPath, 'utf8');
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

  const mixedDuplicate = `${incompleteA09AImport}\n${completeA09AImport}`;
  const reverseMixedDuplicate = `${completeA09AImport}\n${incompleteA09AImport}`;
  const completeDuplicate = `${completeA09AImport}\n${completeA09AImport}`;
  next = next.split(mixedDuplicate).join(completeA09AImport);
  next = next.split(reverseMixedDuplicate).join(completeA09AImport);
  next = next.split(completeDuplicate).join(completeA09AImport);
  next = next.split(incompleteA09AImport).join(completeA09AImport);

  const importCount = next.split(completeA09AImport).length - 1;
  if (importCount > 1) {
    const first = next.indexOf(completeA09AImport);
    next = next.slice(0, first + completeA09AImport.length)
      + next.slice(first + completeA09AImport.length).split(completeA09AImport).join('');
  }
  if ((next.split(completeA09AImport).length - 1) !== 1) {
    throw new Error('A09A controller import must occur exactly once');
  }
  if (next !== original) {
    fs.writeFileSync(controllerPath, next);
    changedFiles.push(controllerPath);
  }
}

function normalizeAuthoritativeMaterializer() {
  const original = fs.readFileSync(authoritativeMaterializerPath, 'utf8');
  const next = original.split(incompleteA09AImport).join(completeA09AImport);
  if (!next.includes(completeA09AImport)) {
    throw new Error('A09A authoritative materializer does not emit the complete import');
  }
  if (next !== original) {
    fs.writeFileSync(authoritativeMaterializerPath, next);
    changedFiles.push(authoritativeMaterializerPath);
  }
}

normalizeController();
normalizeAuthoritativeMaterializer();
console.log(JSON.stringify({ changed: changedFiles.length > 0, changedFiles }));

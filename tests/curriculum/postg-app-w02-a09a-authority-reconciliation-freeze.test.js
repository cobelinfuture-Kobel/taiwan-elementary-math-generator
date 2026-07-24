import test from 'node:test';
import assert from 'node:assert/strict';

import {
  W02_A09A_NEXT_TASK,
  W02_A09A_STATUS,
  buildW02A09AAuthorityFreezeReadback
} from '../../src/curriculum/application/w02-a09a-authority-reconciliation-freeze.mjs';

test('A09A freezes W03 until canonical Batch B authority exists', () => {
  const readback = buildW02A09AAuthorityFreezeReadback();
  assert.equal(readback.ok, true, JSON.stringify(readback.issues, null, 2));
  assert.equal(readback.status, W02_A09A_STATUS);
  assert.equal(readback.counts.sourceNodeCount, 13);
  assert.equal(readback.counts.knowledgePointCandidateCount, 90);
  assert.equal(readback.canonicalRegistryPresent, false);
  assert.equal(readback.w03ExecutionAllowed, false);
  assert.equal(readback.globalContextSingleApplicationAuthorityRequired, true);
  assert.equal(readback.nextShortestStep, W02_A09A_NEXT_TASK);
});

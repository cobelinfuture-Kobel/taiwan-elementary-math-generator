import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNextPath1LearningBlock,
  getPath1Frontier,
  loadPath1CurriculumMatrix,
} from '../../src/curriculum/learning-paths/path1-learning-path-controller.mjs';

const matrix = loadPath1CurriculumMatrix();

function blockIdsThrough(lastInclusive) {
  return Array.from(
    { length: lastInclusive + 1 },
    (_, i) => `P1-${String(i).padStart(2, '0')}`,
  );
}

test('Path1 targeted replay: empty learner state routes to P1-00 diagnostic', () => {
  const frontier = getPath1Frontier({}, matrix);
  assert.equal(frontier.status, 'DIAGNOSTIC_REQUIRED');
  assert.equal(frontier.nextBlock?.blockId, 'P1-00');
});

test('Path1 targeted replay: completed diagnostic routes to P1-01', () => {
  const frontier = getPath1Frontier({ masteredBlockIds: ['P1-00'] }, matrix);
  assert.equal(frontier.status, 'READY_FOR_N_PLUS_1');
  assert.equal(frontier.nextBlock?.blockId, 'P1-01');
});

test('Path1 targeted replay: mastered blocks contribute their primary KPs to prerequisite readiness', () => {
  const state = { masteredBlockIds: blockIdsThrough(22) };
  assert.equal(getNextPath1LearningBlock(state, matrix)?.blockId, 'P1-23');
});

test('Path1 targeted replay: terminal integration is reached only after P1-26', () => {
  assert.equal(
    getNextPath1LearningBlock({ masteredBlockIds: blockIdsThrough(26) }, matrix)?.blockId,
    'P1-27',
  );
  assert.equal(
    getNextPath1LearningBlock({ masteredBlockIds: blockIdsThrough(27) }, matrix),
    null,
  );
});

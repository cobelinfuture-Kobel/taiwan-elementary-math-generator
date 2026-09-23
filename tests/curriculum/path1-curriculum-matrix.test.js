import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getNextPath1LearningBlock,
  getPath1Frontier,
  loadPath1CurriculumMatrix,
} from '../../src/curriculum/learning-paths/path1-learning-path-controller.mjs';

const matrix = loadPath1CurriculumMatrix();
const root = process.cwd();

function jsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(dir, name));
}

function collectCanonicalKnowledgePointIds() {
  const ids = new Set();

  for (const file of jsonFiles(path.join(root, 'data/curriculum/knowledge/units'))) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const kp of data.knowledgePoints ?? []) {
      const id = kp.knowledgePointId ?? kp.candidateId;
      if (id) ids.add(id);
    }
  }

  const chunkDir = path.join(root, 'data/curriculum/global/candidates/r02/chunks');
  for (const file of jsonFiles(chunkDir)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const source of data.sourceRecords ?? []) {
      for (const kp of source.candidates ?? []) if (kp.knowledgePointId) ids.add(kp.knowledgePointId);
    }
  }

  return ids;
}

function collectExistingPatternRefs() {
  const ids = new Set();
  for (const file of jsonFiles(path.join(root, 'data/curriculum/knowledge/units'))) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const binding of data.existingQuestionBindings ?? []) {
      if (binding.questionId) ids.add(binding.questionId);
    }
  }
  return ids;
}

function allKpRefs(block) {
  return [
    ...(block.primaryKnowledgePointIds ?? []),
    ...(block.requiredPrerequisites?.knowledgePointIds ?? []),
    ...(block.optionalSupportingKnowledgePointIds ?? []),
    ...(block.masteryGate?.requiredKnowledgePointIds ?? []),
    ...(block.fusionGate?.requiredKnowledgePointIds ?? []),
  ];
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must not contain duplicates`);
}

test('Path1 matrix has the exact P1-00..P1-27 block sequence and no duplicate IDs', () => {
  assert.equal(matrix.blocks.length, 28);
  const expected = Array.from({ length: 28 }, (_, i) => `P1-${String(i).padStart(2, '0')}`);
  assert.deepEqual(matrix.blocks.map((block) => block.blockId), expected);
  assertUnique(matrix.blocks.map((block) => block.blockId), 'blockIds');
});

test('Path1 references only R02/R03 canonical KnowledgePoint identities already present in repository authority', () => {
  const canonicalIds = collectCanonicalKnowledgePointIds();
  assert.ok(canonicalIds.size > 400, `expected broad G3-G6 authority set, got ${canonicalIds.size}`);

  for (const block of matrix.blocks) {
    assertUnique(block.primaryKnowledgePointIds ?? [], `${block.blockId}.primaryKnowledgePointIds`);
    assertUnique(block.requiredPrerequisites?.knowledgePointIds ?? [], `${block.blockId}.requiredPrerequisites.knowledgePointIds`);
    assertUnique(block.optionalSupportingKnowledgePointIds ?? [], `${block.blockId}.optionalSupportingKnowledgePointIds`);
    assertUnique(block.masteryGate?.requiredKnowledgePointIds ?? [], `${block.blockId}.masteryGate.requiredKnowledgePointIds`);
    assertUnique(block.fusionGate?.requiredKnowledgePointIds ?? [], `${block.blockId}.fusionGate.requiredKnowledgePointIds`);

    for (const kpId of allKpRefs(block)) {
      assert.ok(canonicalIds.has(kpId), `${block.blockId} references unknown canonical KP ${kpId}`);
    }
  }
});

test('EXISTING_PATTERN_REF entries resolve to existing repository question/pattern bindings', () => {
  const patternRefs = collectExistingPatternRefs();
  for (const block of matrix.blocks) {
    for (const pattern of block.patternExpansion ?? []) {
      if (pattern.kind !== 'EXISTING_PATTERN_REF') continue;
      assert.ok(patternRefs.has(pattern.id), `${block.blockId} references unknown existing pattern ${pattern.id}`);
    }
  }
});

test('Path1 governance keeps diagnostic, difficulty expansion and integration outside new canonical KP creation', () => {
  const byId = new Map(matrix.blocks.map((block) => [block.blockId, block]));
  assert.equal(byId.get('P1-00').blockType, 'DIAGNOSTIC');
  assert.deepEqual(byId.get('P1-00').primaryKnowledgePointIds, []);

  for (const block of matrix.blocks.filter((row) => row.blockType === 'INTEGRATION')) {
    assert.deepEqual(block.primaryKnowledgePointIds, [], `${block.blockId} integration must not mint a primary KP`);
    assert.ok((block.fusionGate?.requiredBlockIds ?? []).length >= 2, `${block.blockId} must fuse at least two learned blocks`);
    assert.ok((block.fusionGate?.requiredKnowledgePointIds ?? []).length >= 2, `${block.blockId} must reuse at least two canonical KPs`);
  }

  for (const block of matrix.blocks.filter((row) => row.blockType === 'DIFFICULTY_EXPANSION')) {
    assert.ok((block.patternExpansion ?? []).some((pattern) => pattern.kind === 'DESCRIPTIVE_DIFFICULTY_EXPANSION'));
  }
});

test('Path1 block prerequisite graph is acyclic and references earlier blocks only', () => {
  const index = new Map(matrix.blocks.map((block, i) => [block.blockId, i]));
  for (const block of matrix.blocks) {
    for (const requiredId of block.requiredPrerequisites?.blockIds ?? []) {
      assert.ok(index.has(requiredId), `${block.blockId} requires unknown block ${requiredId}`);
      assert.ok(index.get(requiredId) < index.get(block.blockId), `${block.blockId} prerequisite ${requiredId} must be earlier`);
    }
    for (const requiredId of block.fusionGate?.requiredBlockIds ?? []) {
      assert.ok(index.has(requiredId), `${block.blockId} fusion requires unknown block ${requiredId}`);
      assert.ok(index.get(requiredId) < index.get(block.blockId), `${block.blockId} fusion prerequisite ${requiredId} must be earlier`);
    }
  }
});

test('N-to-N+1 controller starts with diagnostic and advances to the first unlocked unmastered block', () => {
  assert.equal(getNextPath1LearningBlock({}, matrix)?.blockId, 'P1-00');
  assert.equal(getPath1Frontier({}, matrix).status, 'DIAGNOSTIC_REQUIRED');

  assert.equal(getNextPath1LearningBlock({ masteredBlockIds: ['P1-00'] }, matrix)?.blockId, 'P1-01');

  const masteredThroughP103 = ['P1-00', 'P1-01', 'P1-02', 'P1-03'];
  assert.equal(getNextPath1LearningBlock({ masteredBlockIds: masteredThroughP103 }, matrix)?.blockId, 'P1-04');
});

test('N-to-N+1 controller reaches cross-KP application only after all previous blocks are mastered', () => {
  const throughP126 = Array.from({ length: 27 }, (_, i) => `P1-${String(i).padStart(2, '0')}`);
  assert.equal(getNextPath1LearningBlock({ masteredBlockIds: throughP126 }, matrix)?.blockId, 'P1-27');

  const all = Array.from({ length: 28 }, (_, i) => `P1-${String(i).padStart(2, '0')}`);
  assert.equal(getNextPath1LearningBlock({ masteredBlockIds: all }, matrix), null);
});

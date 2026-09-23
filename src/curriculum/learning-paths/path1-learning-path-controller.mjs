import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PATH1_MATRIX_PATH = path.resolve(
  MODULE_DIR,
  '../../../data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json',
);

export function loadPath1CurriculumMatrix(matrixPath = DEFAULT_PATH1_MATRIX_PATH) {
  return JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
}

function asSet(values = []) {
  return new Set(Array.isArray(values) ? values : []);
}

export function derivePath1EffectiveKnowledgePointMastery(
  matrix,
  { masteredBlockIds = [], masteredKnowledgePointIds = [] } = {},
) {
  const masteredBlocks = asSet(masteredBlockIds);
  const masteredKps = asSet(masteredKnowledgePointIds);

  for (const block of matrix.blocks) {
    if (!masteredBlocks.has(block.blockId)) continue;
    for (const kpId of block.primaryKnowledgePointIds ?? []) masteredKps.add(kpId);
  }

  return masteredKps;
}

export function isPath1BlockUnlocked(
  block,
  matrix,
  { masteredBlockIds = [], masteredKnowledgePointIds = [] } = {},
) {
  const masteredBlocks = asSet(masteredBlockIds);
  const masteredKps = derivePath1EffectiveKnowledgePointMastery(matrix, {
    masteredBlockIds,
    masteredKnowledgePointIds,
  });

  const required = block.requiredPrerequisites ?? { blockIds: [], knowledgePointIds: [] };
  return (required.blockIds ?? []).every((id) => masteredBlocks.has(id))
    && (required.knowledgePointIds ?? []).every((id) => masteredKps.has(id));
}

export function getNextPath1LearningBlock(
  state = {},
  matrix = loadPath1CurriculumMatrix(),
) {
  const masteredBlocks = asSet(state.masteredBlockIds);

  for (const block of matrix.blocks) {
    if (masteredBlocks.has(block.blockId)) continue;
    if (isPath1BlockUnlocked(block, matrix, state)) return block;
  }

  return null;
}

export function getPath1Frontier(state = {}, matrix = loadPath1CurriculumMatrix()) {
  const nextBlock = getNextPath1LearningBlock(state, matrix);
  if (!nextBlock) {
    return {
      pathId: matrix.pathId,
      status: 'COMPLETE_OR_BLOCKED',
      nextBlock: null,
    };
  }

  return {
    pathId: matrix.pathId,
    status: nextBlock.blockType === 'DIAGNOSTIC' ? 'DIAGNOSTIC_REQUIRED' : 'READY_FOR_N_PLUS_1',
    nextBlock: {
      blockId: nextBlock.blockId,
      title: nextBlock.title,
      blockType: nextBlock.blockType,
      primaryKnowledgePointIds: nextBlock.primaryKnowledgePointIds,
      masteryGate: nextBlock.masteryGate,
      fusionGate: nextBlock.fusionGate,
    },
  };
}

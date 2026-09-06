import {
  buildPath1ManualWorksheet as buildArithmeticPath1ManualWorksheet,
  listPath1ManualWorksheetBlocks,
} from "./build-path1-manual-worksheet-p1-03-extension.js";
import {
  buildPath1ManualWorksheet as buildBasePath1ManualWorksheet,
} from "./build-path1-manual-worksheet.js";
import {
  buildPath1P103MultiplicativeModelingWorksheet,
} from "./build-path1-p1-03-multiplicative-modeling-worksheet.js";
import {
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
} from "../../../modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";
import {
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} from "../../../modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js";

export const PATH1_MANUAL_ARITHMETIC_PRACTICE_MODE = "arithmetic";
export const PATH1_EQUAL_GROUPS_MODELING_TRANSFER_GATE_ID =
  "PATH1_EQUAL_GROUPS_MODELING_TRANSFER_CHECKPOINT_V1";
export const PATH1_EQUAL_GROUPS_MODELING_TRANSFER_MASTERY_CREDIT =
  "NONE_GENERATION_ONLY";
export const PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID =
  "PATH1_P103_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1";

function failed(blockId, practiceMode, code) {
  return Object.freeze({
    ok: false,
    blockId,
    practiceMode,
    errors: Object.freeze([{ code, blockId, practiceMode }]),
    warnings: Object.freeze([]),
    worksheetDocument: null,
  });
}

function attachPracticeMetadata(result, { blockId, practiceMode }) {
  if (!result?.ok || !result.worksheetDocument) return result;
  const worksheetDocument = result.worksheetDocument;
  const configSnapshot = worksheetDocument.configSnapshot ?? {};
  const currentMetadata = configSnapshot.metadata ?? {};
  const metadata = Object.freeze({
    ...currentMetadata,
    path1BlockId: blockId,
    practiceMode,
    ...(practiceMode === PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE ? {
      modelingTransferGateId: PATH1_EQUAL_GROUPS_MODELING_TRANSFER_GATE_ID,
      modelingTransferMasteryCredit: PATH1_EQUAL_GROUPS_MODELING_TRANSFER_MASTERY_CREDIT,
    } : {}),
    ...(practiceMode === PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE ? {
      publicCutoverApplied: true,
      publicRoute: "path1-manual",
      publicCutoverGateId: PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
    } : {}),
  });
  const projectedDocument = Object.freeze({
    ...worksheetDocument,
    configSnapshot: Object.freeze({
      ...configSnapshot,
      metadata,
    }),
  });
  return Object.freeze({ ...result, worksheetDocument: projectedDocument });
}

export { listPath1ManualWorksheetBlocks };

export function buildPath1ManualWorksheet(options = {}) {
  const {
    blockId,
    practiceMode = PATH1_MANUAL_ARITHMETIC_PRACTICE_MODE,
    ...rest
  } = options;

  if (practiceMode === PATH1_MANUAL_ARITHMETIC_PRACTICE_MODE) {
    const result = buildArithmeticPath1ManualWorksheet({ blockId, ...rest });
    return attachPracticeMetadata(result, { blockId, practiceMode });
  }

  if (practiceMode === PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE) {
    const result = buildBasePath1ManualWorksheet({
      blockId,
      ...rest,
      practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
    });
    return attachPracticeMetadata(result, { blockId, practiceMode });
  }

  if (practiceMode === PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    if (blockId !== "P1-03") {
      return failed(blockId, practiceMode, "PATH1_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED");
    }
    const result = buildPath1P103MultiplicativeModelingWorksheet({
      blockId,
      ...rest,
      practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    });
    return attachPracticeMetadata(result, { blockId, practiceMode });
  }

  return failed(blockId, practiceMode, "PATH1_PRACTICE_MODE_NOT_SUPPORTED");
}

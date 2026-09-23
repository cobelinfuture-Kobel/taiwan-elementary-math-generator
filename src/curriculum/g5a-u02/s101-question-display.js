import { isG5AU02S101Pattern } from "./s101-representation-runtime.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

export function isG5AU02S101DisplayModel(model) {
  return [
    "partition_count_length_pairs",
    "rectangle_square_partition_diagram",
    "square_tile_side_area_chain",
  ].includes(model?.kind);
}

export function buildG5AU02S101QuestionDisplayModel(item) {
  if (!isG5AU02S101Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  const base = {
    schemaName: "G5AU02QuestionDisplayModel",
    schemaVersion: 3,
    representationTask: "G5AU02-S101_P0PartitionAndGeometryRepresentationFullFix",
  };

  switch (item.patternSpecId) {
    case "ps_g5a_u02_equal_partition_all_segment_counts":
      return deepFreeze({
        ...base,
        kind: "partition_count_length_pairs",
        totalLength: data.totalLength,
        lengthUnit: data.lengthUnit,
        pairs: clone(data.pairs),
      });
    case "ps_g5a_u02_rectangle_square_side_lengths":
      return deepFreeze({
        ...base,
        kind: "rectangle_square_partition_diagram",
        length: data.length,
        width: data.width,
        lengthUnit: data.lengthUnit,
        candidateSideLengths: clone(data.candidateSideLengths),
        diagramScale: clone(data.diagramScale),
      });
    case "ps_g5a_u02_square_tile_area_possibilities":
      return deepFreeze({
        ...base,
        kind: "square_tile_side_area_chain",
        length: data.length,
        width: data.width,
        lengthUnit: data.lengthUnit,
        areaUnit: data.areaUnit,
        sideAreaPairs: clone(data.sideAreaPairs),
        diagramScale: clone(data.diagramScale),
      });
    default:
      return null;
  }
}

export function serializeG5AU02S101QuestionDisplayModel(model) {
  switch (model.kind) {
    case "partition_count_length_pairs":
      return `一條長 ${model.totalLength} ${model.lengthUnit}的緞帶要等分，每段長度都是整數${model.lengthUnit}。請列出所有「段數｜每段長度」配對。`;
    case "rectangle_square_partition_diagram":
      return `長 ${model.length} ${model.lengthUnit}、寬 ${model.width} ${model.lengthUnit}的長方形，要裁成大小相同、邊長為整數${model.lengthUnit}的正方形。圖形只示意其中一種分割，請找出所有可能的邊長。`;
    case "square_tile_side_area_chain":
      return `長 ${model.length} ${model.lengthUnit}、寬 ${model.width} ${model.lengthUnit}的地面要鋪滿相同的正方形磁磚。請找出所有可能的整數邊長，並完成「邊長｜磁磚面積」配對。`;
    default:
      throw new Error(`G5AU02_S101_DISPLAY_KIND_UNSUPPORTED:${model?.kind ?? "missing"}`);
  }
}

function validateDiagram(model, data, dimensionCode, errors) {
  if (
    model.length !== data.length
    || model.width !== data.width
    || model.lengthUnit !== data.lengthUnit
    || !same(model.diagramScale, data.diagramScale)
    || !Number.isInteger(model.diagramScale?.columns)
    || !Number.isInteger(model.diagramScale?.rows)
    || model.diagramScale.columns * model.diagramScale.rows > 81
  ) {
    errors.push(dimensionCode);
  }
}

export function validateG5AU02S101QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S101Pattern(item?.patternSpecId)) return deepFreeze({ ok: true, errors });
  if (!model || model.schemaName !== "G5AU02QuestionDisplayModel") {
    return deepFreeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  }

  const data = item.data ?? {};
  if (item.patternSpecId === "ps_g5a_u02_equal_partition_all_segment_counts") {
    if (model.kind !== "partition_count_length_pairs" || !same(model.pairs, data.pairs)) {
      errors.push("G5AU02_P0_PARTITION_PAIR_INCOMPLETE");
    }
    if (model.totalLength !== data.totalLength) errors.push("G5AU02_P0_PARTITION_PAIR_PRODUCT_INVALID");
    if (model.lengthUnit !== data.lengthUnit || !model.lengthUnit) errors.push("G5AU02_P0_PARTITION_UNIT_MISSING");
  }

  if (item.patternSpecId === "ps_g5a_u02_rectangle_square_side_lengths") {
    if (model.kind !== "rectangle_square_partition_diagram") {
      errors.push("G5AU02_P0_RECTANGLE_DIAGRAM_DIMENSION_MISMATCH");
    }
    validateDiagram(model, data, "G5AU02_P0_RECTANGLE_DIAGRAM_DIMENSION_MISMATCH", errors);
    if (!same(model.candidateSideLengths, data.candidateSideLengths)) {
      errors.push("G5AU02_P0_RECTANGLE_SIDE_SET_MISMATCH");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_square_tile_area_possibilities") {
    if (model.kind !== "square_tile_side_area_chain") {
      errors.push("G5AU02_P0_TILE_DIAGRAM_DIMENSION_MISMATCH");
    }
    validateDiagram(model, data, "G5AU02_P0_TILE_DIAGRAM_DIMENSION_MISMATCH", errors);
    if (!same(model.sideAreaPairs, data.sideAreaPairs)) {
      errors.push("G5AU02_P0_TILE_SIDE_AREA_PAIR_INCOMPLETE");
    }
    if ((model.sideAreaPairs ?? []).some((pair) => pair.tileArea !== pair.sideLength * pair.sideLength)) {
      errors.push("G5AU02_P0_TILE_AREA_NOT_SIDE_SQUARED");
    }
  }

  const expectedPrompt = isG5AU02S101DisplayModel(model)
    ? serializeG5AU02S101QuestionDisplayModel(model)
    : "";
  if (typeof promptText !== "string" || promptText.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  if (promptText !== expectedPrompt) errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

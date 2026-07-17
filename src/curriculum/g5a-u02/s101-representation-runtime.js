const S101_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_equal_partition_all_segment_counts",
  "ps_g5a_u02_rectangle_square_side_lengths",
  "ps_g5a_u02_square_tile_area_possibilities",
]);

const S101_PATTERN_SET = new Set(S101_PATTERN_IDS);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function factorsOf(value) {
  const result = [];
  for (let candidate = 1; candidate <= value; candidate += 1) {
    if (value % candidate === 0) result.push(candidate);
  }
  return result;
}

function gcd(a, b) {
  let left = a;
  let right = b;
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

function commonFactorsOf(a, b) {
  return factorsOf(gcd(a, b));
}

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function partitionPairs(totalLength) {
  return factorsOf(totalLength).map((segmentCount) => ({
    segmentCount,
    lengthPerSegment: totalLength / segmentCount,
  }));
}

function sideAreaPairs(length, width) {
  return commonFactorsOf(length, width).map((sideLength) => ({
    sideLength,
    tileArea: sideLength * sideLength,
  }));
}

function diagramScale(length, width) {
  const previewSideLength = gcd(length, width);
  const columns = length / previewSideLength;
  const rows = width / previewSideLength;
  return deepFreeze({
    previewSideLength,
    columns,
    rows,
    cellCount: columns * rows,
    maxCellCount: 81,
    proportional: true,
  });
}

function pairedDimensions(rng) {
  const common = rng.int(2, 10);
  let lengthMultiplier = rng.int(3, 9);
  let widthMultiplier = rng.int(2, 8);
  if (lengthMultiplier === widthMultiplier) {
    widthMultiplier = widthMultiplier === 8 ? 7 : widthMultiplier + 1;
  }
  const length = common * Math.max(lengthMultiplier, widthMultiplier);
  const width = common * Math.min(lengthMultiplier, widthMultiplier);
  return { length, width };
}

export function isG5AU02S101Pattern(patternSpecId) {
  return S101_PATTERN_SET.has(patternSpecId);
}

export function getG5AU02S101PatternIds() {
  return [...S101_PATTERN_IDS];
}

export function generateG5AU02S101Pattern(patternSpecId, rng) {
  if (!isG5AU02S101Pattern(patternSpecId)) return null;

  if (patternSpecId === "ps_g5a_u02_equal_partition_all_segment_counts") {
    const totalLength = rng.int(4, 12) * rng.int(2, 8);
    const pairs = partitionPairs(totalLength);
    return deepFreeze({
      prompt: `一條長 ${totalLength} 公尺的緞帶要等分，每段長度都是整數公尺。請列出所有「段數｜每段長度」配對。`,
      data: {
        totalLength,
        lengthUnit: "公尺",
        pairs: clone(pairs),
        semanticRole: "equal_partition_count_length_pairs",
      },
      answer: {
        pairs: clone(pairs),
        lengthUnit: "公尺",
      },
    });
  }

  const { length, width } = pairedDimensions(rng);
  const candidateSideLengths = commonFactorsOf(length, width);
  const scale = diagramScale(length, width);

  if (patternSpecId === "ps_g5a_u02_rectangle_square_side_lengths") {
    return deepFreeze({
      prompt: `長 ${length} 公分、寬 ${width} 公分的長方形，要裁成大小相同、邊長為整數公分的正方形。下圖只示意其中一種分割，請找出所有可能的正方形邊長。`,
      data: {
        length,
        width,
        lengthUnit: "公分",
        candidateSideLengths: clone(candidateSideLengths),
        diagramScale: clone(scale),
        semanticRole: "rectangle_square_partition_diagram",
      },
      answer: {
        values: clone(candidateSideLengths),
        unitLabel: "公分",
      },
    });
  }

  const pairs = sideAreaPairs(length, width);
  return deepFreeze({
    prompt: `長 ${length} 公分、寬 ${width} 公分的地面要鋪滿相同的正方形磁磚。請先找出所有可能的整數邊長，再完成「邊長｜磁磚面積」配對。`,
    data: {
      length,
      width,
      lengthUnit: "公分",
      areaUnit: "平方公分",
      sideAreaPairs: clone(pairs),
      diagramScale: clone(scale),
      semanticRole: "square_tile_side_area_chain",
    },
    answer: {
      pairs: clone(pairs),
      sideUnit: "公分",
      areaUnit: "平方公分",
    },
  });
}

export function expectedG5AU02S101Answer(item) {
  const data = item?.data ?? {};
  switch (item?.patternSpecId) {
    case "ps_g5a_u02_equal_partition_all_segment_counts":
      return deepFreeze({
        pairs: partitionPairs(data.totalLength),
        lengthUnit: data.lengthUnit,
      });
    case "ps_g5a_u02_rectangle_square_side_lengths":
      return deepFreeze({
        values: commonFactorsOf(data.length, data.width),
        unitLabel: data.lengthUnit,
      });
    case "ps_g5a_u02_square_tile_area_possibilities":
      return deepFreeze({
        pairs: sideAreaPairs(data.length, data.width),
        sideUnit: data.lengthUnit,
        areaUnit: data.areaUnit,
      });
    default:
      throw new Error(`G5AU02_S101_PATTERN_NOT_IMPLEMENTED:${item?.patternSpecId ?? "missing"}`);
  }
}

function diagramMatches(data) {
  const expected = diagramScale(data.length, data.width);
  return same(data.diagramScale, expected)
    && expected.columns * expected.previewSideLength === data.length
    && expected.rows * expected.previewSideLength === data.width
    && expected.cellCount <= expected.maxCellCount;
}

export function validateG5AU02S101Pattern(item) {
  const errors = [];
  if (!isG5AU02S101Pattern(item?.patternSpecId)) {
    return deepFreeze({ ok: true, errors });
  }

  const data = item.data ?? {};
  if (item.patternSpecId === "ps_g5a_u02_equal_partition_all_segment_counts") {
    const expectedPairs = partitionPairs(data.totalLength);
    if (!Array.isArray(data.pairs) || data.pairs.length !== expectedPairs.length || !same(data.pairs, expectedPairs)) {
      errors.push("G5AU02_P0_PARTITION_PAIR_INCOMPLETE");
    }
    if ((data.pairs ?? []).some((pair) => (
      !Number.isInteger(pair.segmentCount)
      || !Number.isInteger(pair.lengthPerSegment)
      || pair.segmentCount <= 0
      || pair.lengthPerSegment <= 0
      || pair.segmentCount * pair.lengthPerSegment !== data.totalLength
    ))) {
      errors.push("G5AU02_P0_PARTITION_PAIR_PRODUCT_INVALID");
    }
    if (typeof data.lengthUnit !== "string" || data.lengthUnit.length === 0) {
      errors.push("G5AU02_P0_PARTITION_UNIT_MISSING");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_rectangle_square_side_lengths") {
    if (!diagramMatches(data)) errors.push("G5AU02_P0_RECTANGLE_DIAGRAM_DIMENSION_MISMATCH");
    const expectedSides = commonFactorsOf(data.length, data.width);
    if (!same(data.candidateSideLengths, expectedSides)) {
      errors.push("G5AU02_P0_RECTANGLE_SIDE_SET_MISMATCH");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_square_tile_area_possibilities") {
    if (!diagramMatches(data)) errors.push("G5AU02_P0_TILE_DIAGRAM_DIMENSION_MISMATCH");
    const expectedPairs = sideAreaPairs(data.length, data.width);
    if (!Array.isArray(data.sideAreaPairs) || data.sideAreaPairs.length !== expectedPairs.length || !same(data.sideAreaPairs, expectedPairs)) {
      errors.push("G5AU02_P0_TILE_SIDE_AREA_PAIR_INCOMPLETE");
    }
    if ((data.sideAreaPairs ?? []).some((pair) => pair.tileArea !== pair.sideLength * pair.sideLength)) {
      errors.push("G5AU02_P0_TILE_AREA_NOT_SIDE_SQUARED");
    }
  }

  try {
    if (!same(item.answer, expectedG5AU02S101Answer(item))) {
      if (item.patternSpecId === "ps_g5a_u02_equal_partition_all_segment_counts") {
        errors.push("G5AU02_P0_PARTITION_PAIR_INCOMPLETE");
      } else if (item.patternSpecId === "ps_g5a_u02_rectangle_square_side_lengths") {
        errors.push("G5AU02_P0_RECTANGLE_SIDE_SET_MISMATCH");
      } else {
        errors.push("G5AU02_P0_TILE_SIDE_AREA_PAIR_INCOMPLETE");
      }
    }
  } catch {
    errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
  }

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export const G5A_U02_S101_REPRESENTATION_LIFECYCLE = deepFreeze({
  task: "G5AU02-S101_P0PartitionAndGeometryRepresentationFullFix",
  status: "partition_pairs_and_bounded_geometry_runtime",
  genericFallback: "forbidden",
  freeFormAI: "forbidden",
});

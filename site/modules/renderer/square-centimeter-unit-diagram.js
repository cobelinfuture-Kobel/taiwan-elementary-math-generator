const ALLOWED_SIDE_SIZES = new Set([32,34,36,38,40,42,44,46,48,50]);
const ALLOWED_X_SHIFTS = new Set([-21,-15,-9,-3,3,9,15,21]);
const ALLOWED_Y_SHIFTS = new Set([-8,0,8]);
const ALLOWED_MARKERS = new Set(["UNIT_SQUARE","SHADED_UNIT_SQUARE","AREA_UNIT_BADGE","CM2_SYMBOL"]);

function validModel(model) {
  return Boolean(model)
    && model.kind === "square_centimeter_unit_diagram"
    && ALLOWED_SIDE_SIZES.has(model.sidePx)
    && ALLOWED_X_SHIFTS.has(model.shiftX)
    && ALLOWED_Y_SHIFTS.has(model.shiftY)
    && ALLOWED_MARKERS.has(model.markerMode)
    && model.sideLengthCm === 1;
}
function fixed(value) { return Number(value).toFixed(2); }

export function renderSquareCentimeterUnitDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Square-centimeter unit diagram representation is invalid.");
    error.code = "square_centimeter_unit_diagram_invalid";
    throw error;
  }
  const centerX = 110 + model.shiftX;
  const centerY = 65 + model.shiftY;
  const half = model.sidePx / 2;
  const x = centerX - half;
  const y = centerY - half;
  const marker = [];
  const showSideLabels = model.markerMode !== "CM2_SYMBOL";

  if (model.markerMode === "SHADED_UNIT_SQUARE") {
    marker.push(`<rect class="square-centimeter-unit-diagram__shade" x="${fixed(x)}" y="${fixed(y)}" width="${model.sidePx}" height="${model.sidePx}" fill="currentColor" opacity="0.08" />`);
  }
  if (model.markerMode === "AREA_UNIT_BADGE") {
    marker.push(`<text class="square-centimeter-unit-diagram__area-badge" x="${fixed(centerX)}" y="${fixed(centerY + 5)}" text-anchor="middle" font-size="15" font-weight="700">面積</text>`);
  }
  if (model.markerMode === "CM2_SYMBOL") {
    marker.push(`<text class="square-centimeter-unit-diagram__cm2-symbol" x="${fixed(centerX)}" y="${fixed(centerY + 6)}" text-anchor="middle" font-size="22" font-weight="700">cm²</text>`);
  }

  const sideLabels = showSideLabels ? [
    `<text class="square-centimeter-unit-diagram__side-label unit-square-side-label--top" x="${fixed(centerX)}" y="${fixed(y - 7)}" text-anchor="middle" font-size="12">1 公分</text>`,
    `<text class="square-centimeter-unit-diagram__side-label unit-square-side-label--left" x="${fixed(x - 8)}" y="${fixed(centerY + 4)}" text-anchor="end" font-size="12">1 公分</text>`,
  ] : [];

  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--square-centimeter-unit" data-representation="square-centimeter-unit-diagram" data-marker-mode="${model.markerMode}">`,
    '<svg class="worksheet-square-centimeter-unit-diagram" viewBox="0 0 220 130" width="100%" height="110" role="img" aria-label="邊長一公分的正方形與平方公分面積單位圖示" preserveAspectRatio="xMidYMid meet">',
    `<rect class="square-centimeter-unit-diagram__square" x="${fixed(x)}" y="${fixed(y)}" width="${model.sidePx}" height="${model.sidePx}" fill="none" stroke="currentColor" stroke-width="3" />`,
    ...marker,
    ...sideLabels,
    "</svg>",
    "</div>",
  ].join("");
}

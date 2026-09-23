const ALLOWED_ROTATIONS = new Set([0,30,60,90,120,150,180,210,240,270,300,330]);
const ALLOWED_OPENINGS = new Set([28,36,44,52,60,68,76,104,116,128]);
const ALLOWED_LENGTHS = new Set([44,52]);
const ALLOWED_PARTS = new Set(["VERTEX","SIDE","ANGLE"]);
const ALLOWED_MARKERS = new Set(["DOT","HIGHLIGHT","ARC","LABEL"]);
const ALLOWED_LABELS = new Set(["A","B","C","D"]);

function validModel(model) {
  if (!model || model.kind !== "angle_parts_diagram") return false;
  if (!ALLOWED_ROTATIONS.has(model.rotationDeg) || !ALLOWED_OPENINGS.has(model.openingDeg) || !ALLOWED_LENGTHS.has(model.sideLength)) return false;
  if (!ALLOWED_PARTS.has(model.targetPart) || !ALLOWED_MARKERS.has(model.markerMode)) return false;
  if (model.targetPart === "SIDE" && ![1,2].includes(model.targetSideIndex)) return false;
  if (model.targetPart !== "SIDE" && model.targetSideIndex !== null) return false;
  if (model.markerMode === "LABEL" && !ALLOWED_LABELS.has(model.markerLabel)) return false;
  if (model.markerMode !== "LABEL" && model.markerLabel !== null) return false;
  return true;
}
function point(cx, cy, angleDeg, radius) {
  const radians = angleDeg * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy - radius * Math.sin(radians) };
}
function fixed(value) { return Number(value).toFixed(2); }
function labelPoint(model, cx, cy) {
  if (model.targetPart === "VERTEX") return { x: cx + 10, y: cy - 9 };
  if (model.targetPart === "SIDE") {
    const angle = model.targetSideIndex === 1 ? model.rotationDeg : model.rotationDeg + model.openingDeg;
    return point(cx, cy, angle, model.sideLength * 0.62);
  }
  return point(cx, cy, model.rotationDeg + model.openingDeg / 2, 30);
}

export function renderAnglePartsDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Angle-parts diagram representation is invalid.");
    error.code = "angle_parts_diagram_invalid";
    throw error;
  }
  const cx = 110;
  const cy = 65;
  const p1 = point(cx, cy, model.rotationDeg, model.sideLength);
  const p2 = point(cx, cy, model.rotationDeg + model.openingDeg, model.sideLength);
  const side1Width = model.markerMode === "HIGHLIGHT" && model.targetSideIndex === 1 ? 7 : 3;
  const side2Width = model.markerMode === "HIGHLIGHT" && model.targetSideIndex === 2 ? 7 : 3;
  const marker = [];
  if (model.markerMode === "DOT") {
    marker.push(`<circle class="angle-parts-diagram__marker angle-parts-diagram__marker--vertex" cx="${cx}" cy="${cy}" r="6" fill="currentColor" />`);
  } else if (model.markerMode === "ARC") {
    const radius = 24;
    const a = point(cx, cy, model.rotationDeg, radius);
    const b = point(cx, cy, model.rotationDeg + model.openingDeg, radius);
    marker.push(`<path class="angle-parts-diagram__marker angle-parts-diagram__marker--arc" d="M ${fixed(a.x)} ${fixed(a.y)} A ${radius} ${radius} 0 0 0 ${fixed(b.x)} ${fixed(b.y)}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />`);
  } else if (model.markerMode === "LABEL") {
    const p = labelPoint(model, cx, cy);
    marker.push(`<circle class="angle-parts-diagram__marker angle-parts-diagram__marker--label-point" cx="${fixed(p.x)}" cy="${fixed(p.y)}" r="3.5" fill="currentColor" />`);
    marker.push(`<text class="angle-parts-diagram__marker-label" x="${fixed(p.x + 8)}" y="${fixed(p.y - 7)}" font-size="16" font-weight="700">${model.markerLabel}</text>`);
  }
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--angle-parts" data-representation="angle-parts-diagram" data-marker-mode="${model.markerMode}">`,
    '<svg class="worksheet-angle-parts-diagram" viewBox="0 0 220 130" width="100%" height="110" role="img" aria-label="角的組成圖，請依題目辨認標示部分" preserveAspectRatio="xMidYMid meet">',
    `<line class="angle-parts-diagram__side angle-parts-diagram__side--1" x1="${cx}" y1="${cy}" x2="${fixed(p1.x)}" y2="${fixed(p1.y)}" stroke="currentColor" stroke-width="${side1Width}" stroke-linecap="round" />`,
    `<line class="angle-parts-diagram__side angle-parts-diagram__side--2" x1="${cx}" y1="${cy}" x2="${fixed(p2.x)}" y2="${fixed(p2.y)}" stroke="currentColor" stroke-width="${side2Width}" stroke-linecap="round" />`,
    ...marker,
    "</svg>",
    "</div>",
  ].join("");
}

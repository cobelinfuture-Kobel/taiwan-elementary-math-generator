const ALLOWED_ROTATIONS = new Set(Array.from({ length: 24 }, (_, index) => index * 15));
const ALLOWED_RADII = new Set([32,34,36,38,40,42,44,46,48,50]);
const ALLOWED_PARTS = new Set(["CENTER","RADIUS","DIAMETER","DIAMETER_TEST"]);
const ALLOWED_MARKERS = new Set(["DOT","HIGHLIGHT_RADIUS","HIGHLIGHT_DIAMETER","LABEL","HIGHLIGHT_SEGMENT"]);
const ALLOWED_LABELS = new Set(["A","B","C","D"]);

function validModel(model) {
  if (!model || model.kind !== "circle_parts_diagram") return false;
  if (!ALLOWED_RADII.has(model.radius) || !ALLOWED_ROTATIONS.has(model.rotationDeg)) return false;
  if (!ALLOWED_PARTS.has(model.targetPart) || !ALLOWED_MARKERS.has(model.markerMode)) return false;
  if (model.markerMode === "LABEL" && !ALLOWED_LABELS.has(model.markerLabel)) return false;
  if (model.markerMode !== "LABEL" && model.markerLabel !== null) return false;
  if (model.targetPart === "DIAMETER_TEST" && typeof model.isDiameter !== "boolean") return false;
  if (model.targetPart !== "DIAMETER_TEST" && model.isDiameter !== null) return false;
  return true;
}
function fixed(value) { return Number(value).toFixed(2); }
function unit(angleDeg) {
  const radians = angleDeg * Math.PI / 180;
  return { x: Math.cos(radians), y: -Math.sin(radians) };
}
function point(cx, cy, direction, distance) {
  return { x: cx + direction.x * distance, y: cy + direction.y * distance };
}
function diameterEndpoints(cx, cy, radius, direction) {
  return [point(cx, cy, direction, -radius), point(cx, cy, direction, radius)];
}
function nonCenterChordEndpoints(cx, cy, radius, direction) {
  const perpendicular = { x: -direction.y, y: direction.x };
  const offset = radius * 0.42;
  const halfLength = Math.sqrt(radius * radius - offset * offset);
  const chordCenter = point(cx, cy, perpendicular, offset);
  return [point(chordCenter.x, chordCenter.y, direction, -halfLength), point(chordCenter.x, chordCenter.y, direction, halfLength)];
}
function segmentMarkup(className, a, b, width = 7) {
  return `<line class="circle-parts-diagram__segment ${className}" x1="${fixed(a.x)}" y1="${fixed(a.y)}" x2="${fixed(b.x)}" y2="${fixed(b.y)}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" />`;
}

export function renderCirclePartsDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Circle-parts diagram representation is invalid.");
    error.code = "circle_parts_diagram_invalid";
    throw error;
  }
  const cx = 110;
  const cy = 65;
  const direction = unit(model.rotationDeg);
  const radiusEnd = point(cx, cy, direction, model.radius);
  const [diameterA, diameterB] = diameterEndpoints(cx, cy, model.radius, direction);
  const marker = [];

  if (model.markerMode === "DOT") {
    marker.push(`<circle class="circle-parts-diagram__target-center" cx="${cx}" cy="${cy}" r="6" fill="currentColor" />`);
  } else if (model.markerMode === "HIGHLIGHT_RADIUS") {
    marker.push(segmentMarkup("circle-parts-diagram__segment--radius", { x: cx, y: cy }, radiusEnd));
  } else if (model.markerMode === "HIGHLIGHT_DIAMETER") {
    marker.push(segmentMarkup("circle-parts-diagram__segment--diameter", diameterA, diameterB));
  } else if (model.markerMode === "LABEL") {
    let labelTarget;
    if (model.targetPart === "CENTER") {
      labelTarget = { x: cx, y: cy };
    } else if (model.targetPart === "RADIUS") {
      marker.push(segmentMarkup("circle-parts-diagram__segment--radius-reference", { x: cx, y: cy }, radiusEnd, 3));
      labelTarget = point(cx, cy, direction, model.radius * 0.58);
    } else {
      marker.push(segmentMarkup("circle-parts-diagram__segment--diameter-reference", diameterA, diameterB, 3));
      labelTarget = point(cx, cy, direction, model.radius * 0.24);
    }
    marker.push(`<circle class="circle-parts-diagram__label-point" cx="${fixed(labelTarget.x)}" cy="${fixed(labelTarget.y)}" r="3.5" fill="currentColor" />`);
    marker.push(`<text class="circle-parts-diagram__marker-label" x="${fixed(labelTarget.x + 8)}" y="${fixed(labelTarget.y - 7)}" font-size="16" font-weight="700">${model.markerLabel}</text>`);
  } else if (model.markerMode === "HIGHLIGHT_SEGMENT") {
    const [a, b] = model.isDiameter
      ? [diameterA, diameterB]
      : nonCenterChordEndpoints(cx, cy, model.radius, direction);
    marker.push(segmentMarkup("circle-parts-diagram__segment--diameter-test", a, b));
  }

  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--circle-parts" data-representation="circle-parts-diagram" data-marker-mode="${model.markerMode}" data-target-part="${model.targetPart}"${model.isDiameter===null?"":` data-is-diameter="${model.isDiameter}"`}>`,
    '<svg class="worksheet-circle-parts-diagram" viewBox="0 0 220 130" width="100%" height="110" role="img" aria-label="圓的圖形，請依題目辨認標示部分" preserveAspectRatio="xMidYMid meet">',
    `<circle class="circle-parts-diagram__circle" cx="${cx}" cy="${cy}" r="${model.radius}" fill="none" stroke="currentColor" stroke-width="3" />`,
    `<circle class="circle-parts-diagram__center-reference" cx="${cx}" cy="${cy}" r="3" fill="currentColor" />`,
    ...marker,
    "</svg>",
    "</div>",
  ].join("");
}

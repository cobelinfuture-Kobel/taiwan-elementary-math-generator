const ALLOWED_PROFILE_INDEXES = new Set([0,1,2,3,4,5,6,7,8,9]);
const ALLOWED_SCALES = new Set([0.82,0.86,0.90,0.94,0.98,1.02,1.06,1.10]);
const ALLOWED_X_SHIFTS = new Set([-12,0,12]);
const ALLOWED_MODES = new Set(["CLASSIFY_BY_FEATURES","COLUMN_CONE_SPHERE_CHOICE","DEFINING_FEATURES"]);
const ALLOWED_FAMILIES = new Set(["COLUMN","CONE","SPHERE"]);
const WIDTHS = Object.freeze([60,64,68,72,76,62,66,70,74,78]);
const HEIGHTS = Object.freeze([84,88,92,96,100,86,90,94,98,102]);
const DEPTHS = Object.freeze([18,20,22,24,26,19,21,23,25,27]);

function expectedFeatures(family) {
  if (family === "COLUMN") return {hasTwoCongruentParallelBases:true,convergesToSingleApex:false,hasPlaneBase:true};
  if (family === "CONE") return {hasTwoCongruentParallelBases:false,convergesToSingleApex:true,hasPlaneBase:true};
  return {hasTwoCongruentParallelBases:false,convergesToSingleApex:false,hasPlaneBase:false};
}
function validModel(model) {
  if (!model || model.kind !== "solid_shape_classification_diagram" || !ALLOWED_PROFILE_INDEXES.has(model.profileIndex) || !ALLOWED_SCALES.has(model.scale) || !ALLOWED_X_SHIFTS.has(model.shiftX) || !ALLOWED_MODES.has(model.diagramMode) || !ALLOWED_FAMILIES.has(model.solidFamily)) return false;
  const expected=expectedFeatures(model.solidFamily);
  return model.hasTwoCongruentParallelBases===expected.hasTwoCongruentParallelBases && model.convergesToSingleApex===expected.convergesToSingleApex && model.hasPlaneBase===expected.hasPlaneBase;
}
function fixed(value) { return Number(value).toFixed(2); }
function geometry(model) {
  const index=model.profileIndex;
  return {cx:120+model.shiftX,cy:72,width:WIDTHS[index]*model.scale,height:HEIGHTS[index]*model.scale,depth:DEPTHS[index]*model.scale};
}
function renderColumn(model) {
  const {cx,cy,width,height,depth}=geometry(model);
  const left=cx-width/2,right=cx+width/2,top=cy-height/2,bottom=cy+height/2;
  const backLeft=left+depth,backRight=right+depth,backTop=top-depth/2,backBottom=bottom-depth/2;
  return [
    `<g class="solid-shape-classification-diagram__shape solid-shape-classification-diagram__column">`,
    `<polygon points="${fixed(left)},${fixed(top)} ${fixed(right)},${fixed(top)} ${fixed(right)},${fixed(bottom)} ${fixed(left)},${fixed(bottom)}" fill="none" stroke="currentColor" stroke-width="2.5" />`,
    `<polygon points="${fixed(backLeft)},${fixed(backTop)} ${fixed(backRight)},${fixed(backTop)} ${fixed(backRight)},${fixed(backBottom)} ${fixed(backLeft)},${fixed(backBottom)}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4" />`,
    `<line x1="${fixed(left)}" y1="${fixed(top)}" x2="${fixed(backLeft)}" y2="${fixed(backTop)}" stroke="currentColor" stroke-width="2" />`,
    `<line x1="${fixed(right)}" y1="${fixed(top)}" x2="${fixed(backRight)}" y2="${fixed(backTop)}" stroke="currentColor" stroke-width="2" />`,
    `<line x1="${fixed(right)}" y1="${fixed(bottom)}" x2="${fixed(backRight)}" y2="${fixed(backBottom)}" stroke="currentColor" stroke-width="2" />`,
    `<line x1="${fixed(left)}" y1="${fixed(bottom)}" x2="${fixed(backLeft)}" y2="${fixed(backBottom)}" stroke="currentColor" stroke-width="2" />`,
    `</g>`,
  ].join("");
}
function renderCone(model) {
  const {cx,cy,width,height}=geometry(model);
  const baseY=cy+height/2-8,apexY=cy-height/2,rx=width/2,ry=Math.max(8,width*0.16);
  return [
    `<g class="solid-shape-classification-diagram__shape solid-shape-classification-diagram__cone">`,
    `<ellipse cx="${fixed(cx)}" cy="${fixed(baseY)}" rx="${fixed(rx)}" ry="${fixed(ry)}" fill="none" stroke="currentColor" stroke-width="2.5" />`,
    `<line x1="${fixed(cx)}" y1="${fixed(apexY)}" x2="${fixed(cx-rx)}" y2="${fixed(baseY)}" stroke="currentColor" stroke-width="2.5" />`,
    `<line x1="${fixed(cx)}" y1="${fixed(apexY)}" x2="${fixed(cx+rx)}" y2="${fixed(baseY)}" stroke="currentColor" stroke-width="2.5" />`,
    `<circle cx="${fixed(cx)}" cy="${fixed(apexY)}" r="2.5" fill="currentColor" />`,
    `</g>`,
  ].join("");
}
function renderSphere(model) {
  const {cx,cy,width,height}=geometry(model);
  const r=Math.min(width,height)*0.48;
  return [
    `<g class="solid-shape-classification-diagram__shape solid-shape-classification-diagram__sphere">`,
    `<circle cx="${fixed(cx)}" cy="${fixed(cy)}" r="${fixed(r)}" fill="none" stroke="currentColor" stroke-width="2.5" />`,
    `<ellipse cx="${fixed(cx)}" cy="${fixed(cy)}" rx="${fixed(r)}" ry="${fixed(r*0.34)}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="5 4" />`,
    `<path d="M ${fixed(cx-r*0.65)} ${fixed(cy-r*0.76)} C ${fixed(cx-r*0.22)} ${fixed(cy-r*0.12)}, ${fixed(cx-r*0.22)} ${fixed(cy+r*0.12)}, ${fixed(cx-r*0.65)} ${fixed(cy+r*0.76)}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" />`,
    `</g>`,
  ].join("");
}

export function renderSolidShapeClassificationDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Solid-shape classification diagram representation is invalid.");
    error.code = "solid_shape_classification_diagram_invalid";
    throw error;
  }
  const shape=model.solidFamily==="COLUMN"?renderColumn(model):model.solidFamily==="CONE"?renderCone(model):renderSphere(model);
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--solid-shape-classification" data-representation="solid-shape-classification-diagram" data-diagram-mode="${model.diagramMode}" data-solid-family="${model.solidFamily}">`,
    `<svg class="worksheet-solid-shape-classification-diagram" viewBox="0 0 260 150" width="100%" height="118" role="img" aria-label="柱體錐體與球分類圖示" preserveAspectRatio="xMidYMid meet">`,
    shape,
    `</svg>`,
    `</div>`,
  ].join("");
}

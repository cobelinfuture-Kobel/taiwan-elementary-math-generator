const ALLOWED_EDGE_SIZES = new Set([34,36,38,40,42,44,46,48,50,52]);
const ALLOWED_DEPTHS = new Set([10,12,14,16,18,20,22,24]);
const ALLOWED_X_SHIFTS = new Set([-12,0,12]);
const ALLOWED_MODES = new Set(["UNIT_CUBE_VOLUME","EDGE_LABELS","CM3_UNIT","DIMENSION_CUE"]);

function validModel(model) {
  return Boolean(model)
    && model.kind === "cubic_centimeter_unit_diagram"
    && ALLOWED_EDGE_SIZES.has(model.edgePx)
    && ALLOWED_DEPTHS.has(model.depthPx)
    && ALLOWED_X_SHIFTS.has(model.shiftX)
    && ALLOWED_MODES.has(model.diagramMode)
    && model.cubeCount === 1
    && model.edgeCentimeters === 1
    && model.volumeCubicCentimeters === 1;
}
function points(values){return values.map(([x,y])=>`${x.toFixed(2)},${y.toFixed(2)}`).join(" ");}

export function renderCubicCentimeterUnitDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Cubic-centimeter unit diagram representation is invalid.");
    error.code = "cubic_centimeter_unit_diagram_invalid";
    throw error;
  }
  const e=model.edgePx,d=model.depthPx,cx=120+model.shiftX,cy=74;
  const x0=cx-e/2,x1=cx+e/2,y0=cy-e/2,y1=cy+e/2;
  const dx=d,dy=-Math.round(d*0.62);
  const front=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  const top=[[x0,y0],[x0+dx,y0+dy],[x1+dx,y0+dy],[x1,y0]];
  const side=[[x1,y0],[x1+dx,y0+dy],[x1+dx,y1+dy],[x1,y1]];
  const labels=[];
  labels.push(`<text class="cubic-centimeter-unit-diagram__edge-label" x="${cx.toFixed(2)}" y="${(y1+16).toFixed(2)}" text-anchor="middle" font-size="12">1 cm</text>`);
  if(model.diagramMode==="EDGE_LABELS"||model.diagramMode==="DIMENSION_CUE"){
    labels.push(`<text class="cubic-centimeter-unit-diagram__edge-label" x="${(x0-10).toFixed(2)}" y="${cy.toFixed(2)}" text-anchor="middle" font-size="12">1 cm</text>`);
    labels.push(`<text class="cubic-centimeter-unit-diagram__edge-label" x="${(x1+dx+12).toFixed(2)}" y="${(y0+dy+e/2).toFixed(2)}" text-anchor="middle" font-size="12">1 cm</text>`);
  }
  if(model.diagramMode==="CM3_UNIT")labels.push(`<text class="cubic-centimeter-unit-diagram__cm3-label" x="${cx.toFixed(2)}" y="${(cy+4).toFixed(2)}" text-anchor="middle" font-size="13" font-weight="700">1 cm³</text>`);
  if(model.diagramMode==="DIMENSION_CUE")labels.push(`<text class="cubic-centimeter-unit-diagram__dimension-cue" x="${cx.toFixed(2)}" y="22" text-anchor="middle" font-size="11">長、寬、高各 1 cm</text>`);
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--cubic-centimeter-unit" data-representation="cubic-centimeter-unit-diagram" data-diagram-mode="${model.diagramMode}">`,
    '<svg class="worksheet-cubic-centimeter-unit-diagram" viewBox="0 0 240 150" width="100%" height="118" role="img" aria-label="邊長一公分的正方體圖示" preserveAspectRatio="xMidYMid meet">',
    `<polygon class="cubic-centimeter-unit-diagram__face cubic-centimeter-unit-diagram__face--top" points="${points(top)}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    `<polygon class="cubic-centimeter-unit-diagram__face cubic-centimeter-unit-diagram__face--side" points="${points(side)}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    `<polygon class="cubic-centimeter-unit-diagram__face cubic-centimeter-unit-diagram__face--front" points="${points(front)}" fill="none" stroke="currentColor" stroke-width="2.4"/>`,
    ...labels,
    "</svg>",
    "</div>",
  ].join("");
}

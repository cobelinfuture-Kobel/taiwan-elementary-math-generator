const ALLOWED_PROFILE_INDEXES = new Set([0,1,2,3,4,5,6,7,8,9]);
const ALLOWED_SCALES = new Set([0.82,0.86,0.90,0.94,0.98,1.02,1.06,1.10]);
const ALLOWED_X_SHIFTS = new Set([-12,0,12]);
const ALLOWED_MODES = new Set(["IDENTIFY_ELEMENT","FIXED_ELEMENT_COUNTS","DISTINGUISH_CUBE_CUBOID"]);
const ALLOWED_SOLIDS = new Set(["CUBE","CUBOID"]);
const ALLOWED_ELEMENTS = new Set(["FACE","EDGE","VERTEX"]);
const CUBE_SIZES = Object.freeze([62,64,66,68,70,72,74,76,78,80]);
const CUBOID_WIDTHS = Object.freeze([82,86,90,94,98,84,88,92,96,100]);
const CUBOID_HEIGHTS = Object.freeze([54,58,62,66,70,56,60,64,68,72]);
const DEPTHS = Object.freeze([18,20,22,24,26,19,21,23,25,27]);

function validModel(model) {
  if (!model || model.kind !== "cube_cuboid_elements_diagram" || !ALLOWED_PROFILE_INDEXES.has(model.profileIndex) || !ALLOWED_SCALES.has(model.scale) || !ALLOWED_X_SHIFTS.has(model.shiftX) || !ALLOWED_MODES.has(model.diagramMode) || !ALLOWED_SOLIDS.has(model.solidType) || !ALLOWED_ELEMENTS.has(model.targetElement)) return false;
  if (!Number.isInteger(model.highlightIndex) || model.highlightIndex < 0 || model.highlightIndex > 7) return false;
  if (model.faceCount !== 6 || model.edgeCount !== 12 || model.vertexCount !== 8) return false;
  return model.allEdgesEqual === (model.solidType === "CUBE") && model.allFacesSquares === (model.solidType === "CUBE");
}
function fixed(value) { return Number(value).toFixed(2); }
function geometry(model) {
  const index=model.profileIndex;
  const width=(model.solidType==="CUBE"?CUBE_SIZES[index]:CUBOID_WIDTHS[index])*model.scale;
  const height=(model.solidType==="CUBE"?CUBE_SIZES[index]:CUBOID_HEIGHTS[index])*model.scale;
  const depth=DEPTHS[index]*model.scale;
  const cx=120+model.shiftX,cy=74;
  const left=cx-width/2,right=cx+width/2,top=cy-height/2,bottom=cy+height/2;
  const dx=depth,dy=-depth*0.55;
  return {
    front:[{x:left,y:top},{x:right,y:top},{x:right,y:bottom},{x:left,y:bottom}],
    back:[{x:left+dx,y:top+dy},{x:right+dx,y:top+dy},{x:right+dx,y:bottom+dy},{x:left+dx,y:bottom+dy}],
  };
}
function point(p) { return `${fixed(p.x)},${fixed(p.y)}`; }
function line(a,b,width=2.2,dash="") { return `<line x1="${fixed(a.x)}" y1="${fixed(a.y)}" x2="${fixed(b.x)}" y2="${fixed(b.y)}" stroke="currentColor" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:""} />`; }
function highlightMarkup(model,g) {
  if (model.diagramMode!=="IDENTIFY_ELEMENT") return "";
  const index=model.highlightIndex%4;
  if (model.targetElement==="FACE") return `<polygon class="cube-cuboid-elements-diagram__highlight cube-cuboid-elements-diagram__highlight--face" points="${g.front.map(point).join(" ")}" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-width="4.5" />`;
  if (model.targetElement==="EDGE") {
    const a=g.front[index],b=g.front[(index+1)%4];
    return `<g class="cube-cuboid-elements-diagram__highlight cube-cuboid-elements-diagram__highlight--edge">${line(a,b,5)}</g>`;
  }
  const p=model.highlightIndex<4?g.front[index]:g.back[index];
  return `<circle class="cube-cuboid-elements-diagram__highlight cube-cuboid-elements-diagram__highlight--vertex" cx="${fixed(p.x)}" cy="${fixed(p.y)}" r="5" fill="currentColor" />`;
}
function solidMarkup(model) {
  const g=geometry(model);
  const front=`<polygon points="${g.front.map(point).join(" ")}" fill="none" stroke="currentColor" stroke-width="2.5" />`;
  const back=`<polygon points="${g.back.map(point).join(" ")}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4" />`;
  const joins=g.front.map((p,index)=>line(p,g.back[index],2,index===2||index===3?"5 4":"")).join("");
  return `<g class="cube-cuboid-elements-diagram__shape cube-cuboid-elements-diagram__shape--${model.solidType.toLowerCase()}">${back}${joins}${front}${highlightMarkup(model,g)}</g>`;
}

export function renderCubeCuboidElementsDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Cube/cuboid elements diagram representation is invalid.");
    error.code = "cube_cuboid_elements_diagram_invalid";
    throw error;
  }
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--cube-cuboid-elements" data-representation="cube-cuboid-elements-diagram" data-diagram-mode="${model.diagramMode}" data-solid-type="${model.solidType}" data-target-element="${model.targetElement}">`,
    `<svg class="worksheet-cube-cuboid-elements-diagram" viewBox="0 0 260 150" width="100%" height="118" role="img" aria-label="正方體與長方體面稜頂點圖示" preserveAspectRatio="xMidYMid meet">`,
    solidMarkup(model),
    `</svg>`,
    `</div>`,
  ].join("");
}

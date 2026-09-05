const ALLOWED_ORIENTATIONS = new Set([-45,-30,-15,0,15,30,45,60,75,90]);
const ALLOWED_GAPS = new Set([22,26,30,34,38,42,46,50]);
const ALLOWED_X_SHIFTS = new Set([-12,0,12]);
const ALLOWED_MODES = new Set(["PLAIN_PAIR","NONINTERSECTING_PAIR","EXTENSION_GUIDES","DIRECTION_ARROWS"]);

function validModel(model) {
  return Boolean(model)
    && model.kind === "parallel_lines_recognition_diagram"
    && ALLOWED_ORIENTATIONS.has(model.orientationDeg)
    && ALLOWED_GAPS.has(model.gapPx)
    && ALLOWED_X_SHIFTS.has(model.shiftX)
    && ALLOWED_MODES.has(model.diagramMode);
}
function fixed(value) { return Number(value).toFixed(2); }
function geometry(model) {
  const radians=model.orientationDeg*Math.PI/180;
  const ux=Math.cos(radians),uy=Math.sin(radians);
  const nx=-uy,ny=ux;
  const centerX=120+model.shiftX,centerY=70;
  const halfGap=model.gapPx/2;
  const point=(sign,along)=>({x:centerX+nx*sign*halfGap+ux*along,y:centerY+ny*sign*halfGap+uy*along});
  return {point,centerX,centerY};
}
function lineMarkup(point,sign,from,to,className,extra="") {
  const a=point(sign,from),b=point(sign,to);
  return `<line class="${className}" x1="${fixed(a.x)}" y1="${fixed(a.y)}" x2="${fixed(b.x)}" y2="${fixed(b.y)}" ${extra}/>`;
}

export function renderParallelLinesRecognitionDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Parallel-lines recognition diagram representation is invalid.");
    error.code = "parallel_lines_recognition_diagram_invalid";
    throw error;
  }
  const {point}=geometry(model);
  const main=[-1,1].map((sign)=>lineMarkup(point,sign,-52,52,"parallel-lines-recognition-diagram__line",'stroke="currentColor" stroke-width="3" stroke-linecap="round" '));
  const extensions=[];
  if(model.diagramMode==="EXTENSION_GUIDES"){
    for(const sign of [-1,1]){
      extensions.push(lineMarkup(point,sign,-72,-54,"parallel-lines-recognition-diagram__extension",'stroke="currentColor" stroke-width="2" stroke-dasharray="5 4" '));
      extensions.push(lineMarkup(point,sign,54,72,"parallel-lines-recognition-diagram__extension",'stroke="currentColor" stroke-width="2" stroke-dasharray="5 4" '));
    }
  }
  const arrows=[];
  if(model.diagramMode==="DIRECTION_ARROWS"){
    for(const sign of [-1,1]){
      const p=point(sign,-6);
      arrows.push(`<text class="parallel-lines-recognition-diagram__direction-arrow" x="${fixed(p.x)}" y="${fixed(p.y+4)}" text-anchor="middle" font-size="18" font-weight="700" transform="rotate(${model.orientationDeg} ${fixed(p.x)} ${fixed(p.y)})">→</text>`);
    }
  }
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--parallel-lines-recognition" data-representation="parallel-lines-recognition-diagram" data-diagram-mode="${model.diagramMode}">`,
    '<svg class="worksheet-parallel-lines-recognition-diagram" viewBox="0 0 240 140" width="100%" height="112" role="img" aria-label="兩條互相平行的直線圖示" preserveAspectRatio="xMidYMid meet">',
    ...extensions,
    ...main,
    ...arrows,
    "</svg>",
    "</div>",
  ].join("");
}

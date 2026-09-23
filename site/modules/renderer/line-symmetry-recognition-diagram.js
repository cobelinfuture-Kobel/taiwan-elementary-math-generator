const ALLOWED_PROFILE_INDEXES = new Set([0,1,2,3,4,5,6,7,8,9]);
const ALLOWED_SCALES = new Set([0.82,0.86,0.90,0.94,0.98,1.02,1.06,1.10]);
const ALLOWED_X_SHIFTS = new Set([-12,0,12]);
const ALLOWED_MODES = new Set(["SYMMETRIC_CLASSIFICATION","NON_SYMMETRIC_CLASSIFICATION","FOLD_OVERLAP_CUE"]);
const PROFILE_WIDTHS = Object.freeze([
  Object.freeze([8,28,42,34,48,30,10]),
  Object.freeze([12,36,30,46,38,26,8]),
  Object.freeze([10,26,46,32,44,34,12]),
  Object.freeze([8,34,40,28,50,30,10]),
  Object.freeze([14,30,36,48,34,24,8]),
  Object.freeze([10,40,28,44,32,36,12]),
  Object.freeze([12,32,48,30,40,28,10]),
  Object.freeze([8,24,38,50,36,30,12]),
  Object.freeze([10,34,26,42,50,32,8]),
  Object.freeze([12,28,44,36,30,46,10]),
]);
const Y_LEVELS = Object.freeze([14,32,50,68,86,104,122]);

function validModel(model) {
  return Boolean(model)
    && model.kind === "line_symmetry_recognition_diagram"
    && ALLOWED_PROFILE_INDEXES.has(model.profileIndex)
    && ALLOWED_SCALES.has(model.scale)
    && ALLOWED_X_SHIFTS.has(model.shiftX)
    && ALLOWED_MODES.has(model.diagramMode)
    && typeof model.isLineSymmetric === "boolean"
    && (model.diagramMode === "NON_SYMMETRIC_CLASSIFICATION" ? model.isLineSymmetric === false : model.isLineSymmetric === true);
}
function fixed(value) { return Number(value).toFixed(2); }
function pointsFor(model) {
  const centerX = 120 + model.shiftX;
  const widths = PROFILE_WIDTHS[model.profileIndex].map((width) => width * model.scale);
  const left = Y_LEVELS.map((y,index) => ({x:centerX-widths[index],y}));
  const right = [...Y_LEVELS].reverse().map((y,reversedIndex) => {
    const index=Y_LEVELS.length-1-reversedIndex;
    let x=centerX+widths[index];
    if (!model.isLineSymmetric && index===3) x += 10 + (model.profileIndex%3)*2;
    return {x,y};
  });
  return [...left,...right].map((point)=>`${fixed(point.x)},${fixed(point.y)}`).join(" ");
}

export function renderLineSymmetryRecognitionDiagram(model) {
  if (!validModel(model)) {
    const error = new Error("Line-symmetry recognition diagram representation is invalid.");
    error.code = "line_symmetry_recognition_diagram_invalid";
    throw error;
  }
  const centerX=120+model.shiftX;
  const foldGuide=model.diagramMode==="FOLD_OVERLAP_CUE"
    ? `<line class="line-symmetry-recognition-diagram__fold-guide" x1="${fixed(centerX)}" y1="8" x2="${fixed(centerX)}" y2="132" stroke="currentColor" stroke-width="2" stroke-dasharray="6 5" />`
    : "";
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--line-symmetry-recognition" data-representation="line-symmetry-recognition-diagram" data-diagram-mode="${model.diagramMode}">`,
    '<svg class="worksheet-line-symmetry-recognition-diagram" viewBox="0 0 240 140" width="100%" height="112" role="img" aria-label="線對稱圖形判斷圖示" preserveAspectRatio="xMidYMid meet">',
    `<polygon class="line-symmetry-recognition-diagram__shape" points="${pointsFor(model)}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />`,
    foldGuide,
    "</svg>",
    "</div>",
  ].join("");
}

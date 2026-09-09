const ALLOWED_SOLID_KINDS=new Set(["PRISM","PYRAMID"]);
const ALLOWED_BASE_SIDES=new Set([3,4,5,6,7,8,9,10]);
const ALLOWED_DEPTHS=new Set([20,22,24,26,28]);
const ALLOWED_X_SHIFTS=new Set([-10,0,10]);
const ALLOWED_TASK_MODES=new Set(["IDENTIFY_BASE","IDENTIFY_SIDE_FACE","IDENTIFY_EDGE","IDENTIFY_VERTEX","COUNT_FACES","COUNT_EDGES","COUNT_VERTICES"]);
const EXPECTED_FOCUS=Object.freeze({IDENTIFY_BASE:"BASE_FACE",IDENTIFY_SIDE_FACE:"SIDE_FACE",IDENTIFY_EDGE:"EDGE",IDENTIFY_VERTEX:"VERTEX",COUNT_FACES:"NONE",COUNT_EDGES:"NONE",COUNT_VERTICES:"NONE"});

function expectedCounts(solidKind,n){return solidKind==="PRISM"?{faceCount:n+2,edgeCount:n*3,vertexCount:n*2}:{faceCount:n+1,edgeCount:n*2,vertexCount:n+1};}
export function validatePrismPyramidElementsDiagramModel(model){
  const errors=[];
  if(!model||model.kind!=="prism_pyramid_elements_diagram")return Object.freeze({ok:false,errors:Object.freeze(["P05F17_DIAGRAM_KIND_INVALID"])});
  if(!Number.isInteger(model.variant)||model.variant<0||model.variant>=240)errors.push("P05F17_DIAGRAM_VARIANT_INVALID");
  if(!ALLOWED_SOLID_KINDS.has(model.solidKind)||!ALLOWED_BASE_SIDES.has(model.baseSides))errors.push("P05F17_DIAGRAM_SOLID_INVALID");
  if(!Number.isFinite(model.rotationDeg)||model.rotationDeg<0||model.rotationDeg>=360||!ALLOWED_DEPTHS.has(model.depth)||!ALLOWED_X_SHIFTS.has(model.shiftX))errors.push("P05F17_DIAGRAM_GEOMETRY_INVALID");
  if(!ALLOWED_TASK_MODES.has(model.taskMode)||EXPECTED_FOCUS[model.taskMode]!==model.focusElement)errors.push("P05F17_DIAGRAM_FOCUS_INVALID");
  if(ALLOWED_SOLID_KINDS.has(model.solidKind)&&ALLOWED_BASE_SIDES.has(model.baseSides)){const expected=expectedCounts(model.solidKind,model.baseSides);if(model.faceCount!==expected.faceCount||model.edgeCount!==expected.edgeCount||model.vertexCount!==expected.vertexCount)errors.push("P05F17_DIAGRAM_COUNT_INVALID");}
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
const fixed=value=>Number(value).toFixed(2);
function polygonPoints(cx,cy,rx,ry,n,rotationDeg){const rotation=rotationDeg*Math.PI/180;return Array.from({length:n},(_,i)=>{const a=rotation-Math.PI/2+(i*2*Math.PI)/n;return{x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry};});}
const pointsAttr=points=>points.map(p=>`${fixed(p.x)},${fixed(p.y)}`).join(" ");
function line(a,b,attrs=""){return `<line x1="${fixed(a.x)}" y1="${fixed(a.y)}" x2="${fixed(b.x)}" y2="${fixed(b.y)}" ${attrs}/>`;}
function baseStroke(points,dashed=false){return `<polygon points="${pointsAttr(points)}" fill="none" stroke="currentColor" stroke-width="2.2"${dashed?' stroke-dasharray="5 4"':""} />`;}
function highlightPolygon(points){return `<polygon points="${pointsAttr(points)}" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="3.4" />`;}
function renderPrism(model){
  const cx=122+model.shiftX,front=polygonPoints(cx-16,92,46,25,model.baseSides,model.rotationDeg),back=polygonPoints(cx+model.depth-16,52,46,25,model.baseSides,model.rotationDeg);
  const connectors=front.map((p,i)=>line(p,back[i],`stroke="currentColor" stroke-width="1.8"${i>Math.floor(model.baseSides/2)?' stroke-dasharray="5 4"':""}`)).join("");
  let highlight="";
  if(model.taskMode==="IDENTIFY_BASE")highlight=highlightPolygon(front);
  else if(model.taskMode==="IDENTIFY_SIDE_FACE")highlight=highlightPolygon([front[0],front[1],back[1],back[0]]);
  else if(model.taskMode==="IDENTIFY_EDGE")highlight=line(front[0],front[1],'stroke="currentColor" stroke-width="5" stroke-linecap="round"');
  else if(model.taskMode==="IDENTIFY_VERTEX")highlight=`<circle cx="${fixed(front[0].x)}" cy="${fixed(front[0].y)}" r="5" fill="currentColor" />`;
  return `<g class="prism-pyramid-elements-diagram__solid">${baseStroke(back,true)}${connectors}${baseStroke(front)}${highlight}</g>`;
}
function renderPyramid(model){
  const cx=126+model.shiftX,base=polygonPoints(cx,100,50,25,model.baseSides,model.rotationDeg),apex={x:cx+model.depth*0.15,y:27+model.depth*0.15};
  const sides=base.map((p,i)=>line(apex,p,`stroke="currentColor" stroke-width="1.9"${i>Math.floor(model.baseSides/2)?' stroke-dasharray="5 4"':""}`)).join("");
  let highlight="";
  if(model.taskMode==="IDENTIFY_BASE")highlight=highlightPolygon(base);
  else if(model.taskMode==="IDENTIFY_SIDE_FACE")highlight=highlightPolygon([apex,base[0],base[1]]);
  else if(model.taskMode==="IDENTIFY_EDGE")highlight=line(apex,base[0],'stroke="currentColor" stroke-width="5" stroke-linecap="round"');
  else if(model.taskMode==="IDENTIFY_VERTEX")highlight=`<circle cx="${fixed(apex.x)}" cy="${fixed(apex.y)}" r="5" fill="currentColor" />`;
  return `<g class="prism-pyramid-elements-diagram__solid">${baseStroke(base)}${sides}${highlight}</g>`;
}
export function renderPrismPyramidElementsDiagram(model){
  const validation=validatePrismPyramidElementsDiagramModel(model);
  if(!validation.ok){const error=new Error(`Prism/pyramid elements diagram representation is invalid: ${validation.errors.join(",")}`);error.code="prism_pyramid_elements_diagram_invalid";throw error;}
  const shape=model.solidKind==="PRISM"?renderPrism(model):renderPyramid(model);
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--prism-pyramid-elements" data-representation="prism-pyramid-elements-diagram" data-solid-kind="${model.solidKind}" data-base-sides="${model.baseSides}">`,
    `<svg class="worksheet-prism-pyramid-elements-diagram" viewBox="0 0 270 145" width="100%" height="118" role="img" aria-label="角柱角錐構成要素圖示" preserveAspectRatio="xMidYMid meet">`,
    shape,
    `</svg>`,
    `</div>`,
  ].join("");
}

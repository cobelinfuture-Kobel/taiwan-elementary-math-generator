const ROTATIONS=new Set(Array.from({length:24},(_,index)=>index*15));
const MODES=new Set(["SIDE_HIGHLIGHT","ANGLE_ARC","VERTEX_DOT","NAMING_ORDER","CLOSED_STRUCTURE"]);
const LABELS=["A","B","C"];
function valid(model){
  if(!model||model.kind!=="triangle_elements_naming_diagram"||model.diagramMode!=="TRIANGLE_ELEMENTS_NAMING")return false;
  if(!Number.isInteger(model.variant)||model.variant<0||model.variant>=240||!Number.isInteger(model.templateIndex)||model.templateIndex<0||model.templateIndex>=10||!ROTATIONS.has(model.rotationDeg)||!MODES.has(model.markerMode))return false;
  if(!Array.isArray(model.vertices)||model.vertices.length!==3||model.vertices.map(v=>v.label).join(",")!=="A,B,C"||!model.vertices.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
  if(!Array.isArray(model.segments)||model.segments.length!==3||model.segmentCount!==3||model.closed!==true)return false;
  if(model.segments.map(s=>`${s.name}:${s.from}${s.to}`).join("|")!=="AB:AB|BC:BC|CA:CA")return false;
  if(!Number.isInteger(model.targetIndex)||model.targetIndex<0||model.targetIndex>2||model.targetLabel!==LABELS[model.targetIndex])return false;
  const expectedSide=["AB","BC","CA"][model.targetIndex];
  if(model.targetSideName!==expectedSide)return false;
  if(!Array.isArray(model.namingOrder)||model.namingOrder.length!==3||new Set(model.namingOrder).size!==3||!model.namingOrder.every(label=>LABELS.includes(label)))return false;
  const [a,b,c]=model.vertices,area2=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
  return area2>500;
}
function p(model,index){const v=model.vertices[index];return{x:120+v.x,y:67+v.y};}
function fixed(n){return Number(n).toFixed(2);}
function angleMarker(model,index){
  const current=p(model,index),left=p(model,(index+2)%3),right=p(model,(index+1)%3);
  const toward=(from,to,length)=>{const dx=to.x-from.x,dy=to.y-from.y,n=Math.hypot(dx,dy)||1;return{x:from.x+dx/n*length,y:from.y+dy/n*length};};
  const a=toward(current,left,21),b=toward(current,right,21);
  const mid={x:current.x+(a.x+b.x-2*current.x)*0.7,y:current.y+(a.y+b.y-2*current.y)*0.7};
  return `<path class="triangle-elements-naming-diagram__angle-marker" d="M ${fixed(a.x)} ${fixed(a.y)} Q ${fixed(mid.x)} ${fixed(mid.y)} ${fixed(b.x)} ${fixed(b.y)}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`;
}
export function validateTriangleElementsNamingDiagramModel(model){return Object.freeze({ok:valid(model),errors:Object.freeze(valid(model)?[]:["TRIANGLE_ELEMENTS_NAMING_DIAGRAM_INVALID"])});}
export function renderTriangleElementsNamingDiagram(model){
  if(!valid(model)){const error=new Error("Triangle-elements naming diagram representation is invalid.");error.code="triangle_elements_naming_diagram_invalid";throw error;}
  const points=model.vertices.map((_,index)=>p(model,index));
  const lines=model.segments.map((segment,index)=>{
    const a=points[index],b=points[(index+1)%3];
    const highlighted=model.markerMode==="SIDE_HIGHLIGHT"&&index===model.targetIndex;
    return `<line class="triangle-elements-naming-diagram__side triangle-elements-naming-diagram__side--${index+1}${highlighted?" triangle-elements-naming-diagram__side--target":""}" x1="${fixed(a.x)}" y1="${fixed(a.y)}" x2="${fixed(b.x)}" y2="${fixed(b.y)}" stroke="currentColor" stroke-width="${highlighted?7:3}" stroke-linecap="round"/>`;
  }).join("");
  const labels=points.map((pt,index)=>`<text class="triangle-elements-naming-diagram__vertex-label" x="${fixed(pt.x+(pt.x<120?-13:8))}" y="${fixed(pt.y+(pt.y<67?-8:17))}" font-size="14" font-weight="700">${LABELS[index]}</text>`).join("");
  const vertices=points.map((pt,index)=>{
    const target=model.markerMode==="VERTEX_DOT"&&index===model.targetIndex;
    return `<circle class="triangle-elements-naming-diagram__vertex${target?" triangle-elements-naming-diagram__vertex--target":""}" cx="${fixed(pt.x)}" cy="${fixed(pt.y)}" r="${target?7:3.5}" fill="currentColor"/>`;
  }).join("");
  const angle=model.markerMode==="ANGLE_ARC"?angleMarker(model,model.targetIndex):"";
  const naming=model.markerMode==="NAMING_ORDER"?`<text class="triangle-elements-naming-diagram__naming-order" x="120" y="126" text-anchor="middle" font-size="12">順序：${model.namingOrder.join(" → ")}</text>`:"";
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--triangle-elements-naming" data-representation="triangle-elements-naming-diagram" data-marker-mode="${model.markerMode}" data-target-index="${model.targetIndex}">`,
    '<svg class="worksheet-triangle-elements-naming-diagram" viewBox="0 0 240 140" width="100%" height="118" role="img" aria-label="三角形邊、角與頂點命名圖" preserveAspectRatio="xMidYMid meet">',
    lines,vertices,labels,angle,naming,
    "</svg>","</div>",
  ].join("");
}

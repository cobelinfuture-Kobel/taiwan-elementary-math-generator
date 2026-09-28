const MOTIONS=new Set(["TRANSLATION","ROTATION","REFLECTION"]);
const TASKS=new Set(["IDENTIFY_PAIR","MATCH_VERTEX_SIDE_OR_ANGLE","TRANSFER_CORRESPONDING_SIDE_MEASURE"]);
const fixed=n=>Number(n).toFixed(2);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function sameLengths(left,right){return [[0,1],[1,2],[2,0]].every(([a,b])=>Math.abs(dist(left[a],left[b])-dist(right[a],right[b]))<0.15);}
function valid(m){
 if(!m||m.kind!=="congruent_triangle_correspondence_diagram"||m.representationVariant!=="CONGRUENT_TRIANGLE_CORRESPONDENCE"||!TASKS.has(m.diagramMode)||!MOTIONS.has(m.transformMode)||!Number.isInteger(m.variant)||m.variant<0||m.variant>=240||!Array.isArray(m.leftVertices)||m.leftVertices.length!==3||!Array.isArray(m.rightVertices)||m.rightVertices.length!==3)return false;
 if(m.leftVertices.map(v=>v.label).join(",")!=="A,B,C"||m.rightVertices.map(v=>v.label).join(",")!=="D,E,F"||!m.leftVertices.concat(m.rightVertices).every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
 if(!sameLengths(m.leftVertices,m.rightVertices)||m.sameShape!==true||m.sameSize!==true||m.correspondingSidesEqual!==true||m.correspondingAnglesEqual!==true||m.vertexCorrespondenceConsistent!==true)return false;
 if(m.vertexCorrespondence?.A!=="D"||m.vertexCorrespondence?.B!=="E"||m.vertexCorrespondence?.C!=="F")return false;
 if(m.sideCorrespondence?.AB!=="DE"||m.sideCorrespondence?.BC!=="EF"||m.sideCorrespondence?.CA!=="FD")return false;
 if(m.angleCorrespondence?.["∠A"]!=="∠D"||m.angleCorrespondence?.["∠B"]!=="∠E"||m.angleCorrespondence?.["∠C"]!=="∠F")return false;
 if(m.diagramMode==="TRANSFER_CORRESPONDING_SIDE_MEASURE"&&(!Number.isInteger(m.knownMeasureCm)||m.knownMeasureCm<=0))return false;
 return true;
}
function polygon(vertices,cls){return `<polygon class="${cls}" points="${vertices.map(v=>`${fixed(v.x)},${fixed(v.y)}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`;}
function verticesMarkup(vertices,cls){return vertices.map(v=>{const dx=v.x<180?-11:8,dy=v.y<96?-8:16;return `<circle cx="${fixed(v.x)}" cy="${fixed(v.y)}" r="3.2" fill="currentColor"/><text class="${cls}" x="${fixed(v.x+dx)}" y="${fixed(v.y+dy)}" font-size="11" font-weight="700">${v.label}</text>`;}).join("");}
function sidePair(token,left=true){
 const map=left?{AB:[0,1],BC:[1,2],CA:[2,0]}:{DE:[0,1],EF:[1,2],FD:[2,0]};
 return map[token]??null;
}
function sideLabel(vertices,pair,text,dy=-8){
 if(!pair)return "";
 const a=vertices[pair[0]],b=vertices[pair[1]],x=(a.x+b.x)/2,y=(a.y+b.y)/2;
 return `<text x="${fixed(x)}" y="${fixed(y+dy)}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" stroke="white" stroke-width="4" paint-order="stroke">${text}</text>`;
}
export function validateCongruentTriangleCorrespondenceDiagramModel(model){const ok=valid(model);return Object.freeze({ok,errors:Object.freeze(ok?[]:["CONGRUENT_TRIANGLE_CORRESPONDENCE_DIAGRAM_INVALID"])});}
export function renderCongruentTriangleCorrespondenceDiagram(m){
 if(!valid(m)){const e=new Error("Congruent-triangle correspondence diagram is invalid.");e.code="congruent_triangle_correspondence_diagram_invalid";throw e;}
 const left=m.leftVertices,right=m.rightVertices;
 const measure=m.diagramMode==="TRANSFER_CORRESPONDING_SIDE_MEASURE"
  ? sideLabel(left,sidePair(m.sourceToken,true),`${m.knownMeasureCm} 公分`)+sideLabel(right,sidePair(m.targetToken,false),"?")
  : "";
 return [`<div class="worksheet-cell__representation worksheet-cell__representation--congruent-triangle-correspondence" data-representation="congruent-triangle-correspondence-diagram" data-diagram-mode="${m.diagramMode}" data-transform-mode="${m.transformMode}" data-relation="${m.relation}">`,
 '<svg class="worksheet-congruent-triangle-correspondence-diagram" viewBox="0 0 360 190" width="100%" height="165" role="img" aria-label="全等三角形對應關係圖" preserveAspectRatio="xMidYMid meet">',
 '<g class="p08f09-diagram-content">',
 polygon(left,"p08f09-left-triangle"),polygon(right,"p08f09-right-triangle"),
 verticesMarkup(left,"p08f09-left-label"),verticesMarkup(right,"p08f09-right-label"),
 '<line x1="164" y1="96" x2="196" y2="96" stroke="currentColor" stroke-width="1.8" stroke-dasharray="4 3"/>',
 '<path d="M 191 91 L 198 96 L 191 101" fill="none" stroke="currentColor" stroke-width="1.8"/>',
 measure,
 "</g></svg></div>"
 ].join("");
}

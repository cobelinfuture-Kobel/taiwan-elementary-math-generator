const MODES=new Set(["ACUTE_TRIANGLE","RIGHT_TRIANGLE","OBTUSE_TRIANGLE"]);
const ROTATIONS=new Set(Array.from({length:24},(_,i)=>i*15));
const fixed=n=>Number(n).toFixed(2);
function valid(m){
 if(!m||m.kind!=="triangle_angle_classification_diagram"||m.representationVariant!=="TRIANGLE_ANGLE_CLASSIFICATION"||!MODES.has(m.diagramMode)||!Number.isInteger(m.variant)||m.variant<0||m.variant>=240||!ROTATIONS.has(m.rotationDeg)||!Array.isArray(m.vertices)||m.vertices.length!==3||m.vertices.map(v=>v.label).join(",")!=="A,B,C"||!m.vertices.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
 const a=m.interiorAnglesDeg,arr=[a?.A,a?.B,a?.C];if(!arr.every(Number.isInteger)||arr.some(x=>x<=0)||arr.reduce((x,y)=>x+y,0)!==180)return false;
 const max=Math.max(...arr),cat=max<90?"ACUTE_TRIANGLE":max===90?"RIGHT_TRIANGLE":"OBTUSE_TRIANGLE";
 if(cat!==m.diagramMode||m.triangleClass!==cat||m.classificationBasis!=="MAXIMUM_INTERIOR_ANGLE"||m.angleSumDegrees!==180||m.exactlyOneCategory!==true||m.rotationInvariant!==true)return false;
 const [p,q,r]=m.vertices,area2=Math.abs((q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));return area2>1500;
}
function point(m,i){const v=m.vertices[i];return{x:160+v.x,y:90+v.y};}
function labelPoint(p){return{x:p.x+(160-p.x)*0.28,y:p.y+(90-p.y)*0.28};}
export function validateTriangleAngleClassificationDiagramModel(model){const ok=valid(model);return Object.freeze({ok,errors:Object.freeze(ok?[]:["TRIANGLE_ANGLE_CLASSIFICATION_DIAGRAM_INVALID"])});}
export function renderTriangleAngleClassificationDiagram(m){
 if(!valid(m)){const e=new Error("Triangle angle-classification diagram is invalid.");e.code="triangle_angle_classification_diagram_invalid";throw e;}
 const pts=[0,1,2].map(i=>point(m,i)),polygon=pts.map(p=>`${fixed(p.x)},${fixed(p.y)}`).join(" ");
 const angleValues=[m.interiorAnglesDeg.A,m.interiorAnglesDeg.B,m.interiorAnglesDeg.C];
 const angleLabels=pts.map((p,i)=>{const q=labelPoint(p);return `<text class="triangle-angle-classification-diagram__angle-label" x="${fixed(q.x)}" y="${fixed(q.y)}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="700" stroke="white" stroke-width="3" paint-order="stroke">${angleValues[i]}°</text>`;}).join("");
 const vertexLabels=pts.map((p,i)=>{const dx=p.x<160?-11:8,dy=p.y<90?-8:16;return `<text class="triangle-angle-classification-diagram__vertex-label" x="${fixed(p.x+dx)}" y="${fixed(p.y+dy)}" font-size="11" font-weight="700">${["A","B","C"][i]}</text>`;}).join("");
 const rightIndex=angleValues.findIndex(x=>x===90),rightBadge=rightIndex>=0?(()=>{const p=labelPoint(pts[rightIndex]);return `<rect class="triangle-angle-classification-diagram__right-marker" x="${fixed(p.x-8)}" y="${fixed(p.y-8)}" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.45"/>`;})():"";
 return [`<div class="worksheet-cell__representation worksheet-cell__representation--triangle-angle-classification" data-representation="triangle-angle-classification-diagram" data-diagram-mode="${m.diagramMode}" data-relation="${m.relation}">`,
 '<svg class="worksheet-triangle-angle-classification-diagram" viewBox="0 0 320 180" width="100%" height="165" role="img" aria-label="依三角形內角分類圖" preserveAspectRatio="xMidYMid meet">',
 `<g class="p08f08-diagram-content"><polygon points="${polygon}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`,
 pts.map(p=>`<circle cx="${fixed(p.x)}" cy="${fixed(p.y)}" r="3.2" fill="currentColor"/>`).join(""),
 rightBadge,angleLabels,vertexLabels,"</g></svg></div>"].join("");
}

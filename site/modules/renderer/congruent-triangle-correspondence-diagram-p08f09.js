const MOTIONS=new Set(["TRANSLATION","ROTATION","REFLECTION"]);
const TASKS=new Set(["IDENTIFY_PAIR","MATCH_VERTEX_SIDE_OR_ANGLE","TRANSFER_CORRESPONDING_SIDE_MEASURE"]);
const LEFT_SIDES=Object.freeze([{token:"AB",pair:[0,1],lengthIndex:0},{token:"BC",pair:[1,2],lengthIndex:1},{token:"CA",pair:[2,0],lengthIndex:2}]);
const RIGHT_SIDES=Object.freeze([{token:"DE",pair:[0,1],lengthIndex:0},{token:"EF",pair:[1,2],lengthIndex:1},{token:"FD",pair:[2,0],lengthIndex:2}]);
const fixed=n=>Number(n).toFixed(2);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function sameLengths(left,right){return [[0,1],[1,2],[2,0]].every(([a,b])=>Math.abs(dist(left[a],left[b])-dist(right[a],right[b]))<0.15);}
function valid(m){
 if(!m||m.kind!=="congruent_triangle_correspondence_diagram"||m.representationVariant!=="CONGRUENT_TRIANGLE_CORRESPONDENCE"||!TASKS.has(m.diagramMode)||!MOTIONS.has(m.transformMode)||!Number.isInteger(m.variant)||m.variant<0||m.variant>=240||!Array.isArray(m.leftVertices)||m.leftVertices.length!==3||!Array.isArray(m.rightVertices)||m.rightVertices.length!==3)return false;
 if(m.leftVertices.map(v=>v.label).join(",")!=="A,B,C"||m.rightVertices.map(v=>v.label).join(",")!=="D,E,F"||!m.leftVertices.concat(m.rightVertices).every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)))return false;
 if(!Array.isArray(m.sideLengthsCm)||m.sideLengthsCm.length!==3||m.sideLengthsCm.some(x=>!Number.isInteger(x)||x<=0))return false;
 if(m.sideTickCounts?.AB!==1||m.sideTickCounts?.BC!==2||m.sideTickCounts?.CA!==3||m.sideTickCounts?.DE!==1||m.sideTickCounts?.EF!==2||m.sideTickCounts?.FD!==3)return false;
 if(m.sideMeasurementEvidence!=="EXPLICIT_NUMERIC_LABELS_PLUS_MATCHED_TICK_MARKS"||m.rulerMeasurementRequired!==false||m.printScaleIsAnswerAuthority!==false)return false;
 if(!sameLengths(m.leftVertices,m.rightVertices)||m.sameShape!==true||m.sameSize!==true||m.correspondingSidesEqual!==true||m.correspondingAnglesEqual!==true||m.vertexCorrespondenceConsistent!==true)return false;
 if(m.vertexCorrespondence?.A!=="D"||m.vertexCorrespondence?.B!=="E"||m.vertexCorrespondence?.C!=="F")return false;
 if(m.sideCorrespondence?.AB!=="DE"||m.sideCorrespondence?.BC!=="EF"||m.sideCorrespondence?.CA!=="FD")return false;
 if(m.angleCorrespondence?.["∠A"]!=="∠D"||m.angleCorrespondence?.["∠B"]!=="∠E"||m.angleCorrespondence?.["∠C"]!=="∠F")return false;
 if(m.diagramMode==="TRANSFER_CORRESPONDING_SIDE_MEASURE"&&(!Number.isInteger(m.knownMeasureCm)||m.knownMeasureCm<=0))return false;
 return true;
}
function polygon(vertices,cls){return `<polygon class="${cls}" points="${vertices.map(v=>`${fixed(v.x)},${fixed(v.y)}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`;}
function verticesMarkup(vertices,cls){return vertices.map(v=>{const dx=v.x<180?-11:8,dy=v.y<96?-8:16;return `<circle cx="${fixed(v.x)}" cy="${fixed(v.y)}" r="3.2" fill="currentColor"/><text class="${cls}" x="${fixed(v.x+dx)}" y="${fixed(v.y+dy)}" font-size="11" font-weight="700">${v.label}</text>`;}).join("");}
function centroid(vertices){return{x:vertices.reduce((s,v)=>s+v.x,0)/vertices.length,y:vertices.reduce((s,v)=>s+v.y,0)/vertices.length};}
function sideGeometry(vertices,pair){
 const a=vertices[pair[0]],b=vertices[pair[1]],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy)),tx=dx/len,ty=dy/len;
 let nx=-ty,ny=tx;const ctr=centroid(vertices),towardCenter=(ctr.x-mx)*nx+(ctr.y-my)*ny;if(towardCenter>0){nx=-nx;ny=-ny;}
 return{mx,my,tx,ty,nx,ny};
}
function sideTicks(vertices,pair,count,token){
 const g=sideGeometry(vertices,pair),offsets=count===1?[0]:count===2?[-5,5]:[-7,0,7];
 return offsets.map(o=>{const cx=g.mx+g.tx*o,cy=g.my+g.ty*o,x1=cx-g.nx*5,y1=cy-g.ny*5,x2=cx+g.nx*5,y2=cy+g.ny*5;return `<line class="p08f09-side-tick" data-side-token="${token}" data-tick-count="${count}" x1="${fixed(x1)}" y1="${fixed(y1)}" x2="${fixed(x2)}" y2="${fixed(y2)}" stroke="currentColor" stroke-width="2"/>`;}).join("");
}
function sideLengthLabel(vertices,pair,text,token){
 const g=sideGeometry(vertices,pair),x=g.mx+g.nx*16,y=g.my+g.ny*16;
 return `<text class="p08f09-side-length-label" data-side-token="${token}" x="${fixed(x)}" y="${fixed(y)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" stroke="white" stroke-width="4" paint-order="stroke">${text}</text>`;
}
function evidenceForSide(m,side,isRight){
 const value=m.sideLengthsCm[side.lengthIndex],isHiddenTarget=m.diagramMode==="TRANSFER_CORRESPONDING_SIDE_MEASURE"&&isRight&&side.token===m.targetToken;
 return sideLengthLabel(isRight?m.rightVertices:m.leftVertices,side.pair,isHiddenTarget?"?":String(value),side.token)+sideTicks(isRight?m.rightVertices:m.leftVertices,side.pair,m.sideTickCounts[side.token],side.token);
}
function evidenceMarkup(m){
 return LEFT_SIDES.map(s=>evidenceForSide(m,s,false)).join("")+RIGHT_SIDES.map(s=>evidenceForSide(m,s,true)).join("")+`<text class="p08f09-side-evidence-legend" x="180" y="188" text-anchor="middle" font-size="10">相同刻痕表示等長；邊長單位：公分</text>`;
}
export function validateCongruentTriangleCorrespondenceDiagramModel(model){const ok=valid(model);return Object.freeze({ok,errors:Object.freeze(ok?[]:["CONGRUENT_TRIANGLE_CORRESPONDENCE_DIAGRAM_INVALID"])});}
export function renderCongruentTriangleCorrespondenceDiagram(m){
 if(!valid(m)){const e=new Error("Congruent-triangle correspondence diagram is invalid.");e.code="congruent_triangle_correspondence_diagram_invalid";throw e;}
 const left=m.leftVertices,right=m.rightVertices;
 return [`<div class="worksheet-cell__representation worksheet-cell__representation--congruent-triangle-correspondence" data-representation="congruent-triangle-correspondence-diagram" data-diagram-mode="${m.diagramMode}" data-transform-mode="${m.transformMode}" data-relation="${m.relation}" data-side-evidence="numeric-plus-ticks" data-ruler-required="false">`,
 '<svg class="worksheet-congruent-triangle-correspondence-diagram" viewBox="0 0 360 200" width="100%" height="175" role="img" aria-label="全等三角形對應關係圖，圖上標示邊長與相同刻痕" preserveAspectRatio="xMidYMid meet">',
 '<g class="p08f09-diagram-content">',
 polygon(left,"p08f09-left-triangle"),polygon(right,"p08f09-right-triangle"),
 verticesMarkup(left,"p08f09-left-label"),verticesMarkup(right,"p08f09-right-label"),
 '<line x1="164" y1="96" x2="196" y2="96" stroke="currentColor" stroke-width="1.8" stroke-dasharray="4 3"/>',
 '<path d="M 191 91 L 198 96 L 191 101" fill="none" stroke="currentColor" stroke-width="1.8"/>',
 evidenceMarkup(m),
 "</g></svg></div>"
 ].join("");
}

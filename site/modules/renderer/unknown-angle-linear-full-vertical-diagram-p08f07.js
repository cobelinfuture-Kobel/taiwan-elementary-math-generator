const MODES=new Set(["LINEAR_PAIR_REMAINDER","FULL_TURN_REMAINDER","VERTICAL_OPPOSITE_EQUAL"]);
const ROTATIONS=new Set(Array.from({length:20},(_,i)=>i*18)),RADII=new Set([52,56,60,64]);
const fix=n=>Number(n).toFixed(2),point=(cx,cy,r,deg)=>{const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy-r*Math.sin(a)};};
function arc(cx,cy,r,start,delta){const a=point(cx,cy,r,start),b=point(cx,cy,r,start+delta),large=delta>180?1:0;return `M ${fix(a.x)} ${fix(a.y)} A ${r} ${r} 0 ${large} 0 ${fix(b.x)} ${fix(b.y)}`;}
function textAt(cx,cy,r,deg,text,cls=""){const p=point(cx,cy,r,deg);return `<text class="${cls}" x="${fix(p.x)}" y="${fix(p.y)}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" stroke="white" stroke-width="3" paint-order="stroke">${text}</text>`;}
function valid(m){
 if(!m||m.kind!=="unknown_angle_linear_full_vertical_diagram"||m.representationVariant!=="UNKNOWN_ANGLE_LINEAR_FULL_VERTICAL"||!MODES.has(m.diagramMode)||!Number.isInteger(m.variant)||m.variant<0||m.variant>959||!ROTATIONS.has(m.rotationDeg)||!RADII.has(m.radius)||m.center?.label!=="O"||m.linearAdjacentAngleSumDegrees!==180||m.fullTurnAngleSumDegrees!==360||m.verticalAnglesEqual!==true||m.unknownAngleFromExplicitRelation!==true)return false;
 if(m.diagramMode==="LINEAR_PAIR_REMAINDER")return Number.isInteger(m.knownAngleDeg)&&Number.isInteger(m.unknownAngleDeg)&&m.knownAngleDeg>0&&m.knownAngleDeg<180&&m.knownAngleDeg+m.unknownAngleDeg===180;
 if(m.diagramMode==="FULL_TURN_REMAINDER")return Array.isArray(m.knownAngles)&&m.knownAngles.length===3&&m.knownAngles.every(x=>Number.isInteger(x)&&x>0)&&Number.isInteger(m.unknownAngleDeg)&&m.unknownAngleDeg>0&&m.knownAngles.reduce((a,b)=>a+b,0)+m.unknownAngleDeg===360;
 return Number.isInteger(m.knownAngleDeg)&&m.knownAngleDeg>0&&m.knownAngleDeg<180&&Number.isInteger(m.unknownAngleDeg)&&m.unknownAngleDeg===m.knownAngleDeg;
}
function line(cx,cy,r,a,cls=""){const p1=point(cx,cy,r,a),p2=point(cx,cy,r,a+180);return `<line class="${cls}" x1="${fix(p1.x)}" y1="${fix(p1.y)}" x2="${fix(p2.x)}" y2="${fix(p2.y)}" stroke="currentColor" stroke-width="3"/>`;}
function ray(cx,cy,r,a,cls=""){const p=point(cx,cy,r,a);return `<line class="${cls}" x1="${fix(cx)}" y1="${fix(cy)}" x2="${fix(p.x)}" y2="${fix(p.y)}" stroke="currentColor" stroke-width="3"/>`;}
function linearBody(m){
 const {x:cx,y:cy}=m.center,r=m.radius,a=m.rotationDeg,b=a+m.knownAngleDeg,parts=[line(cx,cy,r,a,"p08f07-linear-base"),ray(cx,cy,r,b,"p08f07-linear-ray")];
 parts.push(`<path d="${arc(cx,cy,27,a,m.knownAngleDeg)}" fill="none" stroke="currentColor" stroke-width="2.2"/>`,`<path d="${arc(cx,cy,39,b,m.unknownAngleDeg)}" fill="none" stroke="currentColor" stroke-width="2.2"/>`);
 parts.push(textAt(cx,cy,38,a+m.knownAngleDeg/2,`${m.knownAngleDeg}°`,"p08f07-known-label"),textAt(cx,cy,50,b+m.unknownAngleDeg/2,"?","p08f07-unknown-label"));
 return parts.join("");
}
function fullTurnBody(m){
 const {x:cx,y:cy}=m.center,r=m.radius,angles=[...m.knownAngles,m.unknownAngleDeg],parts=[];let start=m.rotationDeg;
 for(let i=0;i<angles.length;i++){const deg=angles[i];parts.push(ray(cx,cy,r,start,`p08f07-full-ray-${i}`),`<path d="${arc(cx,cy,30+i*2,start,deg)}" fill="none" stroke="currentColor" stroke-width="1.8"/>`,textAt(cx,cy,43,start+deg/2,i===angles.length-1?"?":`${deg}°`,i===angles.length-1?"p08f07-unknown-label":"p08f07-known-label"));start+=deg;}
 return parts.join("");
}
function verticalBody(m){
 const {x:cx,y:cy}=m.center,r=m.radius,a=m.rotationDeg,b=a+m.knownAngleDeg,parts=[line(cx,cy,r,a,"p08f07-vertical-line-a"),line(cx,cy,r,b,"p08f07-vertical-line-b")];
 parts.push(`<path d="${arc(cx,cy,30,a,m.knownAngleDeg)}" fill="none" stroke="currentColor" stroke-width="2.2"/>`,`<path d="${arc(cx,cy,30,a+180,m.knownAngleDeg)}" fill="none" stroke="currentColor" stroke-width="2.2"/>`);
 parts.push(textAt(cx,cy,43,a+m.knownAngleDeg/2,`${m.knownAngleDeg}°`,"p08f07-known-label"),textAt(cx,cy,43,a+180+m.knownAngleDeg/2,"?","p08f07-unknown-label"));
 return parts.join("");
}
export function validateUnknownAngleLinearFullVerticalDiagramModel(model){const ok=valid(model);return Object.freeze({ok,errors:Object.freeze(ok?[]:["UNKNOWN_ANGLE_LINEAR_FULL_VERTICAL_DIAGRAM_INVALID"])});}
export function renderUnknownAngleLinearFullVerticalDiagram(m){
 if(!valid(m)){const e=new Error("Unknown-angle linear/full/vertical diagram is invalid.");e.code="unknown_angle_linear_full_vertical_diagram_invalid";throw e;}
 const body=m.diagramMode==="LINEAR_PAIR_REMAINDER"?linearBody(m):m.diagramMode==="FULL_TURN_REMAINDER"?fullTurnBody(m):verticalBody(m);
 return [`<div class="worksheet-cell__representation worksheet-cell__representation--unknown-angle-linear-full-vertical" data-representation="unknown-angle-linear-full-vertical-diagram" data-diagram-mode="${m.diagramMode}" data-relation="${m.relation}">`,`<svg class="worksheet-unknown-angle-linear-full-vertical-diagram" viewBox="0 0 320 185" width="100%" height="165" role="img" aria-label="平角周角對頂角未知角圖" preserveAspectRatio="xMidYMid meet"><g class="p08f07-diagram-content">`,body,`<circle cx="${fix(m.center.x)}" cy="${fix(m.center.y)}" r="3.6" fill="currentColor"/><text x="${fix(m.center.x+8)}" y="${fix(m.center.y+16)}" font-size="12" font-weight="700">O</text>`,"</g></svg></div>"].join("");
}

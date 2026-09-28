const MODES=new Set(["ESTIMATE_REFERENCE_90","CLASSIFY_SINGLE","ARM_LENGTH_INVARIANT_PAIR"]);
const num=n=>Number.isFinite(n),fix=n=>Number(n).toFixed(2);
function category(deg){if(deg>0&&deg<90)return "銳角";if(deg===90)return "直角";if(deg>90&&deg<180)return "鈍角";if(deg===180)return "平角";if(deg===360)return "周角";return null;}
function valid(m){
 if(!m||m.kind!=="angle_estimation_classification_diagram"||!MODES.has(m.diagramMode)||!Number.isInteger(m.variant)||m.variant<0||!Number.isInteger(m.angleDeg)||!Number.isInteger(m.rotationDeg)||m.rotationDeg<0||m.rotationDeg>=360||m.rotationDeg%30!==0||m.protractorShown!==false||m.exactDegreeLabelShown!==false)return false;
 if(m.diagramMode==="ESTIMATE_REFERENCE_90")return m.referenceAngleDeg===90&&num(m.armLength)&&m.armLength>=40&&m.armLength<=80&&m.angleDeg>0&&m.angleDeg<180&&m.angleDeg!==90;
 if(m.diagramMode==="CLASSIFY_SINGLE")return category(m.angleDeg)===m.classification&&num(m.armLength)&&m.armLength>=40&&m.armLength<=80;
 return category(m.angleDeg)===m.classification&&m.classificationIndependentOfArmLength===true&&num(m.armLengthA)&&num(m.armLengthB)&&m.armLengthA!==m.armLengthB&&m.armLengthA>=35&&m.armLengthB<=80;
}
function point(cx,cy,r,deg){const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy-r*Math.sin(a)};}
function arc(cx,cy,r,start,end,sweep=0,large=null){const a=point(cx,cy,r,start),b=point(cx,cy,r,end),delta=((end-start)%360+360)%360,lf=large==null?(delta>180?1:0):large;return `M ${fix(a.x)} ${fix(a.y)} A ${r} ${r} 0 ${lf} ${sweep} ${fix(b.x)} ${fix(b.y)}`;}
function rays(cx,cy,len,rotation,angle,options={}){
 const parts=[],p0=point(cx,cy,len,rotation);
 if(angle===360){
  parts.push(`<line x1="${cx}" y1="${cy}" x2="${fix(p0.x)}" y2="${fix(p0.y)}" stroke="currentColor" stroke-width="3"/>`,`<circle cx="${cx}" cy="${cy}" r="33" fill="none" stroke="currentColor" stroke-width="2.3" marker-end="url(#p08f05-arrow)"/>`);
  return parts.join("");
 }
 const p1=point(cx,cy,len,rotation+angle);
 parts.push(`<line x1="${cx}" y1="${cy}" x2="${fix(p0.x)}" y2="${fix(p0.y)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,`<line x1="${cx}" y1="${cy}" x2="${fix(p1.x)}" y2="${fix(p1.y)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,`<circle cx="${cx}" cy="${cy}" r="3.6" fill="currentColor"/>`);
 parts.push(`<path d="${arc(cx,cy,28,rotation,rotation+angle,0,angle>180?1:0)}" fill="none" stroke="currentColor" stroke-width="2"/>`);
 if(options.reference90){
  const pr=point(cx,cy,len*.92,rotation+90);parts.push(`<line x1="${cx}" y1="${cy}" x2="${fix(pr.x)}" y2="${fix(pr.y)}" stroke="currentColor" stroke-width="1.8" stroke-dasharray="5 4"/>`);
  const lab=point(cx,cy,48,rotation+90);parts.push(`<text x="${fix(lab.x)}" y="${fix(lab.y)}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" stroke="white" stroke-width="3" paint-order="stroke">90°基準</text>`);
 }
 return parts.join("");
}
function singleBody(m){
 const cx=160,cy=92,body=rays(cx,cy,m.armLength,m.rotationDeg,m.angleDeg,{reference90:m.diagramMode==="ESTIMATE_REFERENCE_90"});
 const caption=m.diagramMode==="ESTIMATE_REFERENCE_90"?"以虛線直角作為估測基準":"觀察角的張開程度";
 return body+`<text x="160" y="169" text-anchor="middle" font-size="11">${caption}</text>`;
}
function pairBody(m){
 const left=88,right=232,cy=92;
 return [
  rays(left,cy,m.armLengthA,m.rotationDeg,m.angleDeg),
  rays(right,cy,m.armLengthB,m.rotationDeg,m.angleDeg),
  `<text x="${left}" y="169" text-anchor="middle" font-size="12" font-weight="700">甲</text>`,
  `<text x="${right}" y="169" text-anchor="middle" font-size="12" font-weight="700">乙</text>`
 ].join("");
}
export function renderAngleEstimationClassificationDiagram(m){
 if(!valid(m)){const e=new Error("Angle estimation / classification diagram is invalid.");e.code="angle_estimation_classification_diagram_invalid";throw e;}
 const body=m.diagramMode==="ARM_LENGTH_INVARIANT_PAIR"?pairBody(m):singleBody(m);
 return [
  `<div class="worksheet-cell__representation worksheet-cell__representation--p08f05-angle-estimation" data-representation="angle-estimation-classification-diagram" data-diagram-mode="${m.diagramMode}" data-relation="${m.relation}">`,
  `<svg class="worksheet-angle-estimation-classification-diagram" viewBox="0 0 320 185" width="100%" height="165" role="img" aria-label="角度估測與分類圖" preserveAspectRatio="xMidYMid meet"><defs><marker id="p08f05-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor"/></marker></defs><g class="p08f05-diagram-content">`,
  body,
  "</g></svg></div>"
 ].join("");
}

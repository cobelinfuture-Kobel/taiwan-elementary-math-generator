const ANGLES=new Set(Array.from({length:81},(_,i)=>10+i*2)),RAY_LENGTHS=new Set([122,128,134]),ROTATIONS=new Set([0]),SIDES=new Set(["LEFT","RIGHT"]);
function valid(m){return m?.kind==="protractor_angle_measurement_diagram"&&ANGLES.has(m.targetDegrees)&&RAY_LENGTHS.has(m.targetRayLength)&&ROTATIONS.has(m.rotationDeg)&&SIDES.has(m.baselineSide)&&m.dualScale===true&&m.instrumentFixedHorizontal===true&&m.baselineRayExplicit===true&&typeof m.centerAligned==="boolean"&&typeof m.zeroBaselineAligned==="boolean"&&m.centerAligned===(m.centerOffsetPx===0)&&m.zeroBaselineAligned===(m.scaleRotationOffsetDeg===0);}
const pt=(cx,cy,r,a)=>{const rad=a*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy-r*Math.sin(rad)};};
const f=n=>Number(n).toFixed(2);
export function renderProtractorAngleMeasurementDiagram(m){
 if(!valid(m)){const e=new Error("Protractor angle measurement diagram is invalid.");e.code="protractor_angle_measurement_diagram_invalid";throw e;}
 const cx=160,cy=158,r=116,vertexX=cx,vertexY=cy+m.centerOffsetPx,baseAngle=(m.baselineSide==="RIGHT"?0:180)+m.scaleRotationOffsetDeg;
 const theta=m.baselineSide==="RIGHT"?baseAngle+m.targetDegrees:baseAngle-m.targetDegrees,target=pt(vertexX,vertexY,m.targetRayLength,theta),base=pt(vertexX,vertexY,136,baseAngle);
 const ticks=[];
 for(let deg=0;deg<=180;deg++){
  const outer=pt(cx,cy,r,deg),len=deg%10===0?14:deg%5===0?9:5,inner=pt(cx,cy,r-len,deg);
  ticks.push(`<line class="protractor-tick protractor-tick--${deg%10===0?"major":deg%5===0?"medium":"minor"}" x1="${f(inner.x)}" y1="${f(inner.y)}" x2="${f(outer.x)}" y2="${f(outer.y)}" stroke="currentColor" stroke-width="${deg%10===0?1.5:deg%5===0?1:0.55}"/>`);
  if(deg%20===0){
    const outerLabel=pt(cx,cy,r-21,deg),innerLabel=pt(cx,cy,r-48,deg),leftValue=180-deg,rightValue=deg;
    const common='text-anchor="middle" dominant-baseline="middle" font-size="9.6" font-weight="650" stroke="white" stroke-width="2.8" paint-order="stroke"';
    ticks.push(`<text class="protractor-scale-label protractor-scale-label--outer" data-scale-origin="LEFT" data-scale-value="${leftValue}" x="${f(outerLabel.x)}" y="${f(outerLabel.y)}" ${common}>${leftValue}</text>`);
    ticks.push(`<text class="protractor-scale-label protractor-scale-label--inner" data-scale-origin="RIGHT" data-scale-value="${rightValue}" x="${f(innerLabel.x)}" y="${f(innerLabel.y)}" ${common}>${rightValue}</text>`);
  }else if(deg===90){
    const shared=pt(cx,cy,r-34,deg);
    ticks.push(`<text class="protractor-scale-label protractor-scale-label--shared" data-scale-origin="BOTH" data-scale-value="90" x="${f(shared.x)}" y="${f(shared.y)}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" stroke="white" stroke-width="3" paint-order="stroke">90</text>`);
  }
 }
 return [
  `<div class="worksheet-cell__representation worksheet-cell__representation--protractor" data-representation="protractor-angle-measurement-diagram" data-baseline-side="${m.baselineSide}" data-center-aligned="${m.centerAligned}" data-zero-aligned="${m.zeroBaselineAligned}" data-dual-scale="true" data-instrument-horizontal="true" data-baseline-ray-explicit="true">`,
  `<svg class="worksheet-protractor-angle-measurement-diagram" viewBox="0 0 320 205" width="100%" height="165" role="img" aria-label="完整雙刻度量角器量角圖" preserveAspectRatio="xMidYMid meet"><g class="protractor-content" data-protractor-content="true"><line class="angle-ray angle-ray--baseline" x1="${vertexX}" y1="${vertexY}" x2="${f(base.x)}" y2="${f(base.y)}" stroke="currentColor" stroke-width="4.2" stroke-linecap="round"/><circle class="angle-ray-baseline-endpoint" cx="${f(base.x)}" cy="${f(base.y)}" r="4.2" fill="currentColor"/><line class="angle-ray angle-ray--target" x1="${vertexX}" y1="${vertexY}" x2="${f(target.x)}" y2="${f(target.y)}" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/><path d="M 44 158 A 116 116 0 0 1 276 158" fill="none" stroke="currentColor" stroke-width="1.35"/><line x1="44" y1="158" x2="276" y2="158" stroke="currentColor" stroke-width="1.25"/>${ticks.join("")}<circle class="protractor-center-mark" cx="${cx}" cy="${cy}" r="4" fill="white" stroke="currentColor" stroke-width="1.4"/><circle class="angle-vertex-mark" cx="${vertexX}" cy="${vertexY}" r="4.2" fill="currentColor"/></g></svg></div>`
 ].join("");
}

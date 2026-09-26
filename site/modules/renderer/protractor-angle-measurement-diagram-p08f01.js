const ANGLES=new Set(Array.from({length:16},(_,i)=>(i+1)*10)),ROTATIONS=new Set(Array.from({length:15},(_,i)=>i*12)),SIDES=new Set(["LEFT","RIGHT"]);
function valid(m){return m?.kind==="protractor_angle_measurement_diagram"&&ANGLES.has(m.targetDegrees)&&ROTATIONS.has(m.rotationDeg)&&SIDES.has(m.baselineSide)&&m.dualScale===true&&typeof m.centerAligned==="boolean"&&typeof m.zeroBaselineAligned==="boolean"&&m.centerAligned===(m.centerOffsetPx===0)&&m.zeroBaselineAligned===(m.scaleRotationOffsetDeg===0);}
const pt=(cx,cy,r,a)=>{const rad=a*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy-r*Math.sin(rad)};};
const f=n=>Number(n).toFixed(2);
export function renderProtractorAngleMeasurementDiagram(m){
 if(!valid(m)){const e=new Error("Protractor angle measurement diagram is invalid.");e.code="protractor_angle_measurement_diagram_invalid";throw e;}
 const cx=130,cy=112,r=90,theta=m.baselineSide==="RIGHT"?m.targetDegrees:180-m.targetDegrees,target=pt(cx,cy,76,theta),baseX=m.baselineSide==="RIGHT"?220:40;
 const ticks=[],labelCounterRotation=-(m.rotationDeg+m.scaleRotationOffsetDeg);
 for(let deg=0;deg<=180;deg+=10){
  const outer=pt(cx,cy,r,deg),inner=pt(cx,cy,deg%30===0?r-13:r-7,deg);
  ticks.push(`<line x1="${f(inner.x)}" y1="${f(inner.y)}" x2="${f(outer.x)}" y2="${f(outer.y)}" stroke="currentColor" stroke-width="${deg%30===0?1.8:1}"/>`);
  if(deg%30===0){
    const outerLabel=pt(cx,cy,r-21,deg),innerLabel=pt(cx,cy,r-34,deg),leftValue=180-deg,rightValue=deg;
    ticks.push(`<text class="protractor-scale-label protractor-scale-label--outer" data-scale-origin="LEFT" data-scale-value="${leftValue}" x="${f(outerLabel.x)}" y="${f(outerLabel.y+3)}" text-anchor="middle" font-size="9" transform="rotate(${labelCounterRotation} ${f(outerLabel.x)} ${f(outerLabel.y)})">${leftValue}</text>`);
    ticks.push(`<text class="protractor-scale-label protractor-scale-label--inner" data-scale-origin="RIGHT" data-scale-value="${rightValue}" x="${f(innerLabel.x)}" y="${f(innerLabel.y+3)}" text-anchor="middle" font-size="9" transform="rotate(${labelCounterRotation} ${f(innerLabel.x)} ${f(innerLabel.y)})">${rightValue}</text>`);
  }
 }
 const protractorTransform=`translate(${m.centerOffsetPx} 0) rotate(${m.scaleRotationOffsetDeg} ${cx} ${cy})`;
 return [
  `<div class="worksheet-cell__representation worksheet-cell__representation--protractor" data-representation="protractor-angle-measurement-diagram" data-baseline-side="${m.baselineSide}" data-center-aligned="${m.centerAligned}" data-zero-aligned="${m.zeroBaselineAligned}" data-dual-scale="true">`,
  `<svg class="worksheet-protractor-angle-measurement-diagram" viewBox="0 0 260 145" width="100%" height="120" role="img" aria-label="雙刻度量角器量角圖" preserveAspectRatio="xMidYMid meet"><g transform="rotate(${m.rotationDeg} ${cx} ${cy})"><line x1="${cx}" y1="${cy}" x2="${baseX}" y2="${cy}" stroke="currentColor" stroke-width="3"/><line x1="${cx}" y1="${cy}" x2="${f(target.x)}" y2="${f(target.y)}" stroke="currentColor" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="currentColor"/><g transform="${protractorTransform}"><path d="M 40 112 A 90 90 0 0 1 220 112" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="40" y1="112" x2="220" y2="112" stroke="currentColor" stroke-width="1.5"/>${ticks.join("")}<circle cx="${cx}" cy="${cy}" r="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/></g></g></svg></div>`
 ].join("");
}

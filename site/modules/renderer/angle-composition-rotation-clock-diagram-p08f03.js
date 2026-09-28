const MODES=new Set(["ADJACENT_COMPOSITION","WHOLE_PART_DECOMPOSITION","NAMED_RAY_MISSING_PART","ROTATION_TURN","CLOCK_STEP","CLOCK_HANDS"]),DIRECTIONS=new Set(["CLOCKWISE","COUNTERCLOCKWISE"]);
const num=n=>Number.isFinite(n),fix=n=>Number(n).toFixed(2);
function valid(m){
 if(!m||m.kind!=="angle_composition_rotation_clock_diagram"||!MODES.has(m.diagramMode)||!Number.isInteger(m.variant)||m.variant<0||m.variant>767)return false;
 if(["ADJACENT_COMPOSITION","WHOLE_PART_DECOMPOSITION","NAMED_RAY_MISSING_PART"].includes(m.diagramMode))return Number.isInteger(m.rotationDeg)&&m.rotationDeg%30===0&&m.rotationDeg>=0&&m.rotationDeg<360&&Number.isInteger(m.partA)&&Number.isInteger(m.partB)&&m.partA>=10&&m.partA<=80&&m.partB>=10&&m.partB<=80&&m.totalDeg===m.partA+m.partB&&m.totalDeg<180&&m.adjacentNonOverlapping===true&&m.wholeEqualsParts===true;
 if(m.fullTurnDegrees!==360||m.clockDivisionCount!==12||m.clockDegreesPerDivision!==30)return false;
 if(m.diagramMode==="ROTATION_TURN")return Number.isInteger(m.startHour)&&m.startHour>=1&&m.startHour<=12&&Number.isInteger(m.endHour)&&m.endHour>=1&&m.endHour<=12&&DIRECTIONS.has(m.direction)&&Number.isInteger(m.turnDegrees)&&m.turnDegrees>=30&&m.turnDegrees<=360&&m.turnDegrees%30===0&&Number.isInteger(m.clockSteps)&&m.clockSteps>=1&&m.clockSteps<=12&&m.turnDegrees===m.clockSteps*30;
 if(m.diagramMode==="CLOCK_STEP")return Number.isInteger(m.startHour)&&m.startHour>=1&&m.startHour<=12&&Number.isInteger(m.endHour)&&m.endHour>=1&&m.endHour<=12&&DIRECTIONS.has(m.direction)&&Number.isInteger(m.clockSteps)&&m.clockSteps>=1&&m.clockSteps<=11;
 return Number.isInteger(m.hourA)&&m.hourA>=1&&m.hourA<=12&&Number.isInteger(m.hourB)&&m.hourB>=1&&m.hourB<=12&&m.hourA!==m.hourB&&Number.isInteger(m.clockSteps)&&m.clockSteps>=1&&m.clockSteps<=6&&["SMALLER","LARGER"].includes(m.angleChoice)&&(m.angleChoice!=="LARGER"||m.clockSteps<6);
}
function point(cx,cy,r,deg){const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy-r*Math.sin(a)};}
function arc(cx,cy,r,start,end,sweep=0,large=null){const a=point(cx,cy,r,start),b=point(cx,cy,r,end),delta=((end-start)%360+360)%360,lf=large==null?(delta>180?1:0):large;return `M ${fix(a.x)} ${fix(a.y)} A ${r} ${r} 0 ${lf} ${sweep} ${fix(b.x)} ${fix(b.y)}`;}
function textAt(cx,cy,r,deg,text,cls=""){const p=point(cx,cy,r,deg);return `<text class="${cls}" x="${fix(p.x)}" y="${fix(p.y)}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" stroke="white" stroke-width="3" paint-order="stroke">${text}</text>`;}
function angleBody(m){
 const cx=160,cy=92,r=66,a0=m.rotationDeg,a1=a0+m.partA,a2=a1+m.partB,p0=point(cx,cy,r,a0),p1=point(cx,cy,r,a1),p2=point(cx,cy,r,a2),parts=[];
 parts.push(`<line x1="${cx}" y1="${cy}" x2="${fix(p0.x)}" y2="${fix(p0.y)}" stroke="currentColor" stroke-width="3.2"/><line x1="${cx}" y1="${cy}" x2="${fix(p1.x)}" y2="${fix(p1.y)}" stroke="currentColor" stroke-width="2.8"/><line x1="${cx}" y1="${cy}" x2="${fix(p2.x)}" y2="${fix(p2.y)}" stroke="currentColor" stroke-width="3.2"/><circle cx="${cx}" cy="${cy}" r="3.8" fill="currentColor"/>`);
 parts.push(`<path d="${arc(cx,cy,27,a0,a1,0,0)}" fill="none" stroke="currentColor" stroke-width="2"/><path d="${arc(cx,cy,39,a1,a2,0,0)}" fill="none" stroke="currentColor" stroke-width="2"/>`);
 if(m.diagramMode==="ADJACENT_COMPOSITION"){parts.push(textAt(cx,cy,38,a0+m.partA/2,`${m.partA}°`,"p08f03-angle-label"),textAt(cx,cy,52,a1+m.partB/2,`${m.partB}°`,"p08f03-angle-label"));}
 if(m.diagramMode==="WHOLE_PART_DECOMPOSITION"){const known=m.knownPartIndex===0?m.partA:m.partB,knownMid=m.knownPartIndex===0?a0+m.partA/2:a1+m.partB/2,unknownMid=m.knownPartIndex===0?a1+m.partB/2:a0+m.partA/2;parts.push(`<path d="${arc(cx,cy,57,a0,a2,0,0)}" fill="none" stroke="currentColor" stroke-width="2.3"/>`,textAt(cx,cy,72,a0+m.totalDeg/2,`${m.totalDeg}°`,"p08f03-whole-label"),textAt(cx,cy,39,knownMid,`${known}°`,"p08f03-known-label"),textAt(cx,cy,49,unknownMid,"?","p08f03-unknown-label"));}
 if(m.diagramMode==="NAMED_RAY_MISSING_PART"){parts.push(`<path d="${arc(cx,cy,57,a0,a2,0,0)}" fill="none" stroke="currentColor" stroke-width="2.3"/>`,textAt(cx,cy,73,a0+m.totalDeg/2,`${m.totalDeg}°`,"p08f03-whole-label"),textAt(cx,cy,37,a0+m.partA/2,`${m.partA}°`,"p08f03-known-label"),textAt(cx,cy,48,a1+m.partB/2,"?","p08f03-unknown-label"));const labels=m.rayLabels??["A","C","B"];parts.push(textAt(cx,cy,82,a0,labels[0],"p08f03-ray-label"),textAt(cx,cy,82,a1,labels[1],"p08f03-ray-label"),textAt(cx,cy,82,a2,labels[2],"p08f03-ray-label"),`<text x="${cx+5}" y="${cy+17}" font-size="12" font-weight="700">O</text>`);}
 return parts.join("");
}
function hourAngle(hour){return 90-(hour%12)*30;}
function clockBase(cx=160,cy=86,r=62){
 const parts=[`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="2.2"/>`];
 for(let h=1;h<=12;h++){const a=hourAngle(h),p1=point(cx,cy,r-7,a),p2=point(cx,cy,r,a),pt=point(cx,cy,r-17,a);parts.push(`<line x1="${fix(p1.x)}" y1="${fix(p1.y)}" x2="${fix(p2.x)}" y2="${fix(p2.y)}" stroke="currentColor" stroke-width="1.5"/><text x="${fix(pt.x)}" y="${fix(pt.y)}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="650">${h}</text>`);}
 parts.push(`<circle cx="${cx}" cy="${cy}" r="3.2" fill="currentColor"/>`);return parts.join("");
}
function hand(cx,cy,hour,r=46,cls=""){const p=point(cx,cy,r,hourAngle(hour));return `<line class="${cls}" x1="${cx}" y1="${cy}" x2="${fix(p.x)}" y2="${fix(p.y)}" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`;}
function clockBody(m){
 const cx=160,cy=84,r=62,parts=[clockBase(cx,cy,r)];
 if(m.diagramMode==="CLOCK_HANDS"){
  parts.push(hand(cx,cy,m.hourA,47,"p08f03-clock-hand-a"),hand(cx,cy,m.hourB,40,"p08f03-clock-hand-b"));
  const cw=((m.hourB-m.hourA)%12+12)%12,smallSweep=cw<=6?1:0,startAngle=hourAngle(m.hourA),endAngle=hourAngle(m.hourB),largeChoice=m.angleChoice==="LARGER",sweep=largeChoice?(smallSweep?0:1):smallSweep,large=largeChoice?1:0;
  parts.push(`<path d="${arc(cx,cy,29,startAngle,endAngle,sweep,large)}" fill="none" stroke="currentColor" stroke-width="2.2"/>`,`<text x="160" y="166" text-anchor="middle" font-size="11">${largeChoice?"較大夾角":"較小夾角"}</text>`);
  return parts.join("");
 }
 parts.push(hand(cx,cy,m.startHour,47,"p08f03-clock-start"),hand(cx,cy,m.endHour,41,"p08f03-clock-end"));
 const start=hourAngle(m.startHour),end=hourAngle(m.endHour),sweep=m.direction==="CLOCKWISE"?1:0;
 if(m.clockSteps===12){parts.push(`<circle cx="${cx}" cy="${cy}" r="50" fill="none" stroke="currentColor" stroke-width="2.2" marker-end="url(#p08f03-arrow)"/>`);}
 else parts.push(`<path d="${arc(cx,cy,50,start,end,sweep,m.clockSteps>6?1:0)}" fill="none" stroke="currentColor" stroke-width="2.2" marker-end="url(#p08f03-arrow)"/>`);
 if(m.diagramMode==="ROTATION_TURN")parts.push(`<text x="160" y="166" text-anchor="middle" font-size="11" font-weight="700">${m.direction==="CLOCKWISE"?"順時針":"逆時針"} ${m.turnText} 圈</text>`);
 else parts.push(`<text x="160" y="166" text-anchor="middle" font-size="11" font-weight="700">${m.direction==="CLOCKWISE"?"順時針":"逆時針"}方向</text>`);
 return parts.join("");
}
export function renderAngleCompositionRotationClockDiagram(m){
 if(!valid(m)){const e=new Error("Angle composition / rotation clock diagram is invalid.");e.code="angle_composition_rotation_clock_diagram_invalid";throw e;}
 const angleMode=["ADJACENT_COMPOSITION","WHOLE_PART_DECOMPOSITION","NAMED_RAY_MISSING_PART"].includes(m.diagramMode),body=angleMode?angleBody(m):clockBody(m);
 return [`<div class="worksheet-cell__representation worksheet-cell__representation--p08f03-angle-clock" data-representation="angle-composition-rotation-clock-diagram" data-diagram-mode="${m.diagramMode}" data-relation="${m.relation}"${m.direction?` data-turn-direction="${m.direction}"`:""}>`,`<svg class="worksheet-angle-composition-rotation-clock-diagram" viewBox="0 0 320 185" width="100%" height="165" role="img" aria-label="${angleMode?"角的合成與分解圖":"旋轉角與鐘面角圖"}" preserveAspectRatio="xMidYMid meet"><defs><marker id="p08f03-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor"/></marker></defs><g class="p08f03-diagram-content">`,body,"</g></svg></div>"].join("");
}

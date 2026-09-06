const DIAGRAM_MODES=new Set(["COMPASS_CONSTRUCTION","POINT_POSITION","TWO_CIRCLE_RELATION","RADIUS_DIAMETER_MEASURE"]);
const POINT_CLASSES=new Set(["INSIDE","ON","OUTSIDE"]);
const RELATION_CLASSES=new Set(["INTERSECTION","TANGENCY","SEPARATION"]);
const TANGENT_MODES=new Set(["EXTERNAL","INTERNAL"]);
const SEGMENT_MODES=new Set(["RADIUS","DIAMETER","DIAMETER_TEST"]);
const SWEEPS=new Set([90,180,270,360]);

function finite(value){return Number.isFinite(value);}
function escapeHtml(value){return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
function invalid(message){const error=new Error(message);error.code="circle_geometry_property_diagram_invalid";return error;}

export function validateCircleGeometryPropertyDiagramModel(model){
  const errors=[];
  if(!model||model.kind!=="circle_geometry_property_diagram")errors.push("KIND_INVALID");
  if(!DIAGRAM_MODES.has(model?.diagramMode))errors.push("MODE_INVALID");
  if(!Number.isInteger(model?.radiusCm)||model.radiusCm<2||model.radiusCm>10)errors.push("RADIUS_CM_INVALID");
  if(!Number.isInteger(model?.radiusPx)||model.radiusPx<30||model.radiusPx>42)errors.push("RADIUS_PX_INVALID");
  if(!Number.isInteger(model?.rotationDeg)||model.rotationDeg<0||model.rotationDeg>=360||model.rotationDeg%15!==0)errors.push("ROTATION_INVALID");
  if(!Number.isInteger(model?.variant)||model.variant<0||model.variant>=240)errors.push("VARIANT_INVALID");
  if(typeof model?.relation!=="string"||!model.relation)errors.push("RELATION_INVALID");
  if(model?.diagramMode==="COMPASS_CONSTRUCTION"){
    if(!finite(model.centerX)||!finite(model.centerY))errors.push("CENTER_INVALID");
    if(model.constructionStep!==model.relation)errors.push("CONSTRUCTION_STEP_INVALID");
    if(!SWEEPS.has(model.sweepDeg))errors.push("SWEEP_INVALID");
  }
  if(model?.diagramMode==="POINT_POSITION"){
    if(!POINT_CLASSES.has(model.positionClass))errors.push("POSITION_CLASS_INVALID");
    if(!Number.isInteger(model.distanceCm)||model.distanceCm<1)errors.push("DISTANCE_INVALID");
    if(model.positionClass==="INSIDE"&&!(model.distanceCm<model.radiusCm))errors.push("INSIDE_DISTANCE_INVALID");
    if(model.positionClass==="ON"&&model.distanceCm!==model.radiusCm)errors.push("ON_DISTANCE_INVALID");
    if(model.positionClass==="OUTSIDE"&&!(model.distanceCm>model.radiusCm))errors.push("OUTSIDE_DISTANCE_INVALID");
  }
  if(model?.diagramMode==="TWO_CIRCLE_RELATION"){
    if(!RELATION_CLASSES.has(model.relationClass))errors.push("RELATION_CLASS_INVALID");
    if(!Number.isInteger(model.secondRadiusCm)||model.secondRadiusCm<2||model.secondRadiusCm>9)errors.push("SECOND_RADIUS_CM_INVALID");
    if(!Number.isInteger(model.secondRadiusPx)||model.secondRadiusPx<28||model.secondRadiusPx>44)errors.push("SECOND_RADIUS_PX_INVALID");
    if(model.relationClass==="TANGENCY"&&!TANGENT_MODES.has(model.tangentMode))errors.push("TANGENT_MODE_INVALID");
    if(model.relationClass!=="TANGENCY"&&model.tangentMode!==null)errors.push("NON_TANGENCY_MODE_INVALID");
    if(model.relationClass==="TANGENCY"&&model.tangentMode==="INTERNAL"&&model.radiusPx===model.secondRadiusPx)errors.push("INTERNAL_EQUAL_RADII_INVALID");
  }
  if(model?.diagramMode==="RADIUS_DIAMETER_MEASURE"){
    if(!SEGMENT_MODES.has(model.segmentMode))errors.push("SEGMENT_MODE_INVALID");
    if(model.diameterCm!==model.radiusCm*2)errors.push("DIAMETER_VALUE_INVALID");
    if(model.segmentMode==="DIAMETER_TEST"&&typeof model.isDiameter!=="boolean")errors.push("DIAMETER_TEST_INVALID");
    if(model.segmentMode!=="DIAMETER_TEST"&&model.isDiameter!==null)errors.push("NON_TEST_DIAMETER_FLAG_INVALID");
  }
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

function renderCompass(model){
  const cx=120,cy=70,r=model.radiusPx;
  const theta=(model.rotationDeg-55)*Math.PI/180;
  const pencilX=cx+Math.cos(theta)*r,pencilY=cy+Math.sin(theta)*r;
  const hingeX=(cx+pencilX)/2,hingeY=Math.min(cy,pencilY)-42;
  const sweep=Math.min(359.8,model.sweepDeg);
  const endTheta=(model.rotationDeg+sweep)*Math.PI/180;
  const endX=cx+Math.cos(endTheta)*r,endY=cy+Math.sin(endTheta)*r;
  const largeArc=sweep>180?1:0;
  return [
    `<circle class="circle-geometry-property-diagram__circle" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    `<circle class="circle-geometry-property-diagram__center" cx="${cx}" cy="${cy}" r="3" fill="currentColor"/><text x="${cx-10}" y="${cy+15}" font-size="12">O</text>`,
    `<line class="circle-geometry-property-diagram__radius" x1="${cx}" y1="${cy}" x2="${pencilX.toFixed(2)}" y2="${pencilY.toFixed(2)}" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>`,
    `<g class="circle-geometry-property-diagram__compass"><line x1="${hingeX.toFixed(2)}" y1="${hingeY.toFixed(2)}" x2="${cx}" y2="${cy}" stroke="currentColor" stroke-width="2.5"/><line x1="${hingeX.toFixed(2)}" y1="${hingeY.toFixed(2)}" x2="${pencilX.toFixed(2)}" y2="${pencilY.toFixed(2)}" stroke="currentColor" stroke-width="2.5"/><circle cx="${hingeX.toFixed(2)}" cy="${hingeY.toFixed(2)}" r="3" fill="currentColor"/></g>`,
    model.sweepDeg===360?"":`<path class="circle-geometry-property-diagram__sweep" d="M ${(cx+r).toFixed(2)} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    `<text x="12" y="132" font-size="11">圓規張開距離＝半徑</text>`
  ].join("");
}

function renderPointPosition(model){
  const cx=120,cy=68,r=model.radiusPx;
  const distancePx=model.positionClass==="INSIDE"?r*0.62:model.positionClass==="ON"?r:r+24;
  const angle=model.rotationDeg*Math.PI/180;
  const px=cx+Math.cos(angle)*distancePx,py=cy+Math.sin(angle)*distancePx;
  return [
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    `<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/><text x="${cx-11}" y="${cy+15}" font-size="12">O</text>`,
    `<line x1="${cx}" y1="${cy}" x2="${px.toFixed(2)}" y2="${py.toFixed(2)}" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/>`,
    `<circle class="circle-geometry-property-diagram__point" cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="4" fill="currentColor"/><text x="${(px+7).toFixed(2)}" y="${(py-5).toFixed(2)}" font-size="12">P</text>`
  ].join("");
}

function renderTwoCircle(model){
  const r1=model.radiusPx,r2=model.secondRadiusPx,cx1=88,cy=70;
  let distance;
  if(model.relationClass==="INTERSECTION")distance=(Math.abs(r1-r2)+r1+r2)/2;
  else if(model.relationClass==="TANGENCY")distance=model.tangentMode==="INTERNAL"?Math.abs(r1-r2):r1+r2;
  else distance=r1+r2+18;
  const cx2=cx1+distance;
  return [
    `<circle class="circle-geometry-property-diagram__circle circle-geometry-property-diagram__circle--1" cx="${cx1}" cy="${cy}" r="${r1}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    `<circle class="circle-geometry-property-diagram__circle circle-geometry-property-diagram__circle--2" cx="${cx2.toFixed(2)}" cy="${cy}" r="${r2}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    `<circle cx="${cx1}" cy="${cy}" r="2.5" fill="currentColor"/><text x="${cx1-17}" y="${cy+15}" font-size="11">O1</text>`,
    `<circle cx="${cx2.toFixed(2)}" cy="${cy}" r="2.5" fill="currentColor"/><text x="${(cx2+5).toFixed(2)}" y="${cy+15}" font-size="11">O2</text>`
  ].join("");
}

function renderRadiusDiameter(model){
  const cx=140,cy=72,r=model.radiusCm*10;
  const left=cx-r,right=cx+r;
  const reference='<g class="circle-geometry-property-diagram__reference"><line x1="18" y1="132" x2="28" y2="132" stroke="currentColor" stroke-width="2"/><line x1="18" y1="127" x2="18" y2="137" stroke="currentColor"/><line x1="28" y1="127" x2="28" y2="137" stroke="currentColor"/><text x="34" y="136" font-size="11">1 公分</text></g>';
  let segment="";
  if(model.segmentMode==="RADIUS")segment=`<line class="circle-geometry-property-diagram__measured-segment" x1="${cx}" y1="${cy}" x2="${right}" y2="${cy}" stroke="currentColor" stroke-width="3"/>`;
  else if(model.segmentMode==="DIAMETER")segment=`<line class="circle-geometry-property-diagram__measured-segment" x1="${left}" y1="${cy}" x2="${right}" y2="${cy}" stroke="currentColor" stroke-width="3"/>`;
  else if(model.isDiameter)segment=`<line class="circle-geometry-property-diagram__measured-segment" x1="${left}" y1="${cy}" x2="${right}" y2="${cy}" stroke="currentColor" stroke-width="4"/>`;
  else{const offset=Math.max(12,r*0.35),halfChord=Math.sqrt(Math.max(0,r*r-offset*offset));segment=`<line class="circle-geometry-property-diagram__measured-segment" x1="${(cx-halfChord).toFixed(2)}" y1="${(cy-offset).toFixed(2)}" x2="${(cx+halfChord).toFixed(2)}" y2="${(cy-offset).toFixed(2)}" stroke="currentColor" stroke-width="4"/>`;}
  return [`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="2"/>`,`<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/><text x="${cx-12}" y="${cy+16}" font-size="12">O</text>`,segment,reference].join("");
}

export function renderCircleGeometryPropertyDiagram(model){
  const validation=validateCircleGeometryPropertyDiagramModel(model);
  if(!validation.ok)throw invalid(`Circle geometry-property diagram representation is invalid: ${validation.errors.join(",")}`);
  const body=model.diagramMode==="COMPASS_CONSTRUCTION"?renderCompass(model):model.diagramMode==="POINT_POSITION"?renderPointPosition(model):model.diagramMode==="TWO_CIRCLE_RELATION"?renderTwoCircle(model):renderRadiusDiameter(model);
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--circle-geometry-property" data-representation="circle-geometry-property-diagram" data-diagram-mode="${escapeHtml(model.diagramMode)}" data-relation="${escapeHtml(model.relation)}" data-position-class="${escapeHtml(model.positionClass??"")}" data-relation-class="${escapeHtml(model.relationClass??"")}" data-tangent-mode="${escapeHtml(model.tangentMode??"")}" data-segment-mode="${escapeHtml(model.segmentMode??"")}" data-is-diameter="${escapeHtml(model.isDiameter??"")}">`,
    `<svg class="worksheet-circle-geometry-property-diagram" viewBox="0 0 280 145" width="100%" height="128" role="img" aria-label="圓的性質與圓規作圖" preserveAspectRatio="xMidYMid meet">`,
    body,
    "</svg>",
    "</div>"
  ].join("");
}

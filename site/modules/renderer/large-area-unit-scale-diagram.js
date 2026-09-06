const ALLOWED_PROFILES=new Set([0,1,2,3,4,5,6,7,8,9]);
const ALLOWED_SCALES=new Set([0.78,0.82,0.86,0.90,0.94,0.98,1.02,1.06]);
const ALLOWED_SHIFTS=new Set([-12,0,12]);
const ALLOWED_MODES=new Set(["RECOGNIZE_AREA_UNIT","SELECT_UNIT_BY_SCALE","DISTINGUISH_AREA_LENGTH_UNIT"]);
const ALLOWED_AREA_UNITS=new Set(["公畝","公頃","平方公里"]);
const ALLOWED_LENGTH_UNITS=new Set(["公尺","公里","公分"]);
const ALLOWED_SCALE_CLASSES=new Set(["SMALL_LAND","LARGE_LAND","REGION"]);
const SCALE_LABELS={SMALL_LAND:"較小土地尺度",LARGE_LAND:"大片土地尺度",REGION:"地區範圍尺度"};
function escapeHtml(value){return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
function valid(model){return Boolean(model)&&model.kind==="large_area_unit_scale_diagram"&&ALLOWED_PROFILES.has(model.profileIndex)&&ALLOWED_SCALES.has(model.scale)&&ALLOWED_SHIFTS.has(model.shiftX)&&ALLOWED_MODES.has(model.diagramMode)&&ALLOWED_AREA_UNITS.has(model.targetUnit)&&ALLOWED_LENGTH_UNITS.has(model.distractorUnit)&&ALLOWED_SCALE_CLASSES.has(model.scaleClass)&&model.scaleLabel===SCALE_LABELS[model.scaleClass]&&[0,1].includes(model.badgeOrder);}
function rect(x,y,w,h,klass){return `<rect class="${klass}" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>`;}
export function renderLargeAreaUnitScaleDiagram(model){
  if(!valid(model)){const error=new Error("Large-area-unit scale diagram representation is invalid.");error.code="large_area_unit_scale_diagram_invalid";throw error;}
  const dx=model.shiftX,scale=model.scale,baseW=Math.round(84*scale),baseH=Math.round(42*scale),x=120-baseW/2+dx,y=50-baseH/2;
  const body=[];
  body.push(rect(x.toFixed(1),y.toFixed(1),baseW,baseH,"large-area-unit-diagram__area-shape"));
  if(model.diagramMode==="RECOGNIZE_AREA_UNIT"){
    body.push(`<text class="large-area-unit-diagram__unit-token" x="${120+dx}" y="55" text-anchor="middle" font-size="18" font-weight="700">${escapeHtml(model.targetUnit)}</text>`);
  }else if(model.diagramMode==="SELECT_UNIT_BY_SCALE"){
    const levels=model.scaleClass==="SMALL_LAND"?1:model.scaleClass==="LARGE_LAND"?2:3;
    for(let i=0;i<levels;i+=1)body.push(rect((36+dx+i*62).toFixed(1),(77-i*4).toFixed(1),48+i*4,26+i*2,"large-area-unit-diagram__scale-step"));
    body.push(`<text class="large-area-unit-diagram__scale-label" x="${120+dx}" y="118" text-anchor="middle" font-size="13">${escapeHtml(model.scaleLabel)}</text>`);
  }else{
    const pair=model.badgeOrder===0?[model.targetUnit,model.distractorUnit]:[model.distractorUnit,model.targetUnit];
    body.push(`<g class="large-area-unit-diagram__badge-pair"><text class="large-area-unit-diagram__badge" x="${82+dx}" y="99" text-anchor="middle" font-size="16" font-weight="700">${escapeHtml(pair[0])}</text><text class="large-area-unit-diagram__badge" x="${158+dx}" y="99" text-anchor="middle" font-size="16" font-weight="700">${escapeHtml(pair[1])}</text></g>`);
  }
  return [`<div class="worksheet-cell__representation worksheet-cell__representation--large-area-unit" data-representation="large-area-unit-scale-diagram" data-diagram-mode="${model.diagramMode}" data-target-unit="${escapeHtml(model.targetUnit)}" data-scale-class="${model.scaleClass}">`,`<svg class="worksheet-large-area-unit-scale-diagram" viewBox="0 0 240 130" width="100%" height="110" role="img" aria-label="大面積單位與面積尺度圖示" preserveAspectRatio="xMidYMid meet">`,...body,"</svg>","</div>"].join("");
}

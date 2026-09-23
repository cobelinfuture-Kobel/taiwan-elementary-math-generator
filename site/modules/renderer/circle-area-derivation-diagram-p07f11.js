const TARGETS=new Set(["HALF_CIRCUMFERENCE_LENGTH","RADIUS_WIDTH","AREA_CONSERVATION","FINER_SECTOR_APPROXIMATION","PI_R_SQUARED_CONCLUSION"]);
function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
function invalid(message){const e=new Error(message);e.code="circle_area_derivation_diagram_invalid";return e;}
export function validateCircleAreaDerivationDiagramModel(model){
  const e=[];if(!model||model.kind!=="circle_area_derivation_diagram")e.push("KIND_INVALID");if(!["SINGLE_REARRANGEMENT","APPROXIMATION_COMPARE"].includes(model?.diagramMode))e.push("MODE_INVALID");if(!TARGETS.has(model?.targetKind))e.push("TARGET_INVALID");
  if(!Number.isInteger(model?.variant)||model.variant<0||model.variant>=240)e.push("VARIANT_INVALID");if(!Number.isInteger(model?.sectorCount)||model.sectorCount<8||model.sectorCount>32)e.push("SECTOR_COUNT_INVALID");if(!Number.isInteger(model?.rotationDeg)||model.rotationDeg<0||model.rotationDeg>=360||model.rotationDeg%15!==0)e.push("ROTATION_INVALID");
  if(model?.semanticCore!=="CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE"||model.cutIntoEqualSectors!==true||model.alternatingRearrangement!==true||model.areaConserved!==true||model.halfCircumferenceBecomesLength!==true||model.radiusBecomesWidth!==true||model.finerSectorsApproachRectangle!==true)e.push("SEMANTIC_INVALID");
  if(model?.diagramMode==="APPROXIMATION_COMPARE"){if(!Number.isInteger(model.coarseSectorCount)||!Number.isInteger(model.fineSectorCount)||model.coarseSectorCount>=model.fineSectorCount||typeof model.fineOnLeft!=="boolean")e.push("COMPARE_INVALID");}
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
function radialLines(m,cx,cy,r){
  const lines=[];for(let i=0;i<m.sectorCount;i++){const a=(m.rotationDeg+i*360/m.sectorCount)*Math.PI/180;const x=(cx+r*Math.cos(a)).toFixed(2),y=(cy-r*Math.sin(a)).toFixed(2);lines.push('<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="currentColor" stroke-width="0.7" opacity="0.55"/>');}return lines.join("");
}
function strip(x,y,w,h,count,label,phase=0){
  const amp=Math.max(2,Math.min(12,18-count/2)),left=x+amp,right=x+w-amp,shown=Math.max(4,Math.min(count,28)),step=(right-left)/shown,parts=[];
  parts.push('<path d="M '+x+' '+(y+amp)+' L '+right+' '+y+' L '+(x+w)+' '+(y+h-amp)+' L '+left+' '+(y+h)+' Z" fill="none" stroke="currentColor" stroke-width="1.5"/>');
  for(let i=0;i<=shown;i++){const xx=(left+i*step).toFixed(2),top=(y+(i+phase)%2*amp).toFixed(2),bottom=(y+h-((i+phase)%2)*amp).toFixed(2);parts.push('<line x1="'+xx+'" y1="'+top+'" x2="'+xx+'" y2="'+bottom+'" stroke="currentColor" stroke-width="0.55" opacity="0.5"/>');}
  if(label)parts.push('<text x="'+(x+w/2)+'" y="'+(y-7)+'" text-anchor="middle" font-size="11" font-weight="700">'+esc(label)+'</text>');
  return parts.join("");
}
function renderSingle(m){
  const cx=72,cy=78,r=48,parts=[];
  parts.push('<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="currentColor" stroke-width="1.6"/>',radialLines(m,cx,cy,r));
  const a=m.rotationDeg*Math.PI/180,x=(cx+r*Math.cos(a)).toFixed(2),y=(cy-r*Math.sin(a)).toFixed(2);
  parts.push('<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="currentColor" stroke-width="1.4"/>','<text x="'+(cx+10)+'" y="'+(cy-10)+'" font-size="11">r</text>');
  parts.push('<text x="151" y="82" text-anchor="middle" font-size="22">→</text>');
  parts.push(strip(190,48,190,62,m.sectorCount,null,Math.floor(m.rotationDeg/15)%2));
  parts.push('<text x="285" y="35" text-anchor="middle" font-size="12" font-weight="700">長：'+esc(m.lengthLabel)+'</text>');
  parts.push('<text x="395" y="82" text-anchor="middle" font-size="12" font-weight="700">寬：'+esc(m.widthLabel)+'</text>');
  if(m.areaLabel)parts.push('<text x="285" y="132" text-anchor="middle" font-size="12" font-weight="700">面積：'+esc(m.areaLabel)+'</text>');
  parts.push('<text x="72" y="143" text-anchor="middle" font-size="10">'+m.sectorCount+' 等分</text>');
  return parts.join("");
}
function renderCompare(m){
  const leftFine=m.fineOnLeft,leftCount=leftFine?m.fineSectorCount:m.coarseSectorCount,rightCount=leftFine?m.coarseSectorCount:m.fineSectorCount,parts=[];
  parts.push(strip(25,54,165,58,leftCount,"A｜"+leftCount+" 等分",m.rotationDeg/15%2));
  parts.push(strip(230,54,165,58,rightCount,"B｜"+rightCount+" 等分",(m.rotationDeg/15+1)%2));
  parts.push('<text x="210" y="137" text-anchor="middle" font-size="10">等分愈細，重組外形愈接近長方形</text>');
  return parts.join("");
}
export function renderCircleAreaDerivationDiagram(model){
  const v=validateCircleAreaDerivationDiagramModel(model);if(!v.ok)throw invalid(v.errors.join(","));
  const body=model.diagramMode==="APPROXIMATION_COMPARE"?renderCompare(model):renderSingle(model);
  return ['<div class="worksheet-cell__representation worksheet-cell__representation--geometry" data-representation="circle-area-derivation-diagram">',
    '<svg class="worksheet-circle-area-derivation-diagram" viewBox="0 0 420 150" role="img" aria-label="圓切成扇形後交錯重組成近似長方形的面積推導圖" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block">',body,"</svg>","</div>"].join("");
}

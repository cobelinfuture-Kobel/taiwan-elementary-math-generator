function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
function invalid(message){const e=new Error(message);e.code="scale_area_change_diagram_invalid";return e;}
export function validateScaleAreaChangeDiagramModel(model){
  const e=[];
  if(!model||model.kind!=="scale_area_change_diagram")e.push("KIND_INVALID");
  if(!["SCALE_PAIR","SOURCE_SCALE_APPLICATION"].includes(model?.diagramMode))e.push("MODE_INVALID");
  if(!["AREA_FACTOR","SCALED_AREA","AREA_COMPARISON","SOURCE_RECTANGLE_APPLICATION"].includes(model?.targetKind))e.push("TARGET_INVALID");
  if(!Number.isInteger(model?.variant)||model.variant<0||model.variant>=240)e.push("VARIANT_INVALID");
  if(model?.semanticCore!=="LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED")e.push("SEMANTIC_INVALID");
  if(model?.diagramMode==="SCALE_PAIR"){
    for(const key of ["originalLength","originalWidth","scaledLength","scaledWidth"])if(!(Number(model?.[key])>0))e.push("DIMENSION_INVALID:"+key);
    if(typeof model?.linearScaleFactorText!=="string"||typeof model?.areaScaleFactorText!=="string"||model?.areaScaleFactorHidden!==true)e.push("SCALE_LABEL_INVALID");
  }
  if(model?.diagramMode==="SOURCE_SCALE_APPLICATION"){
    if(!(Number(model?.actualLengthMeters)>0)||!(Number(model?.actualWidthMeters)>0)||!(Number(model?.scaleDenominator)>0)||!(Number(model?.paperLengthCm)>0)||!(Number(model?.paperWidthCm)>0)||!(Number(model?.paperAreaCm2)>0))e.push("APPLICATION_DIMENSION_INVALID");
    if(typeof model?.scaleLabel!=="string"||typeof model?.paperLengthLabel!=="string"||typeof model?.paperWidthLabel!=="string")e.push("APPLICATION_LABEL_INVALID");
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e)});
}
function rect(x,y,w,h,labelTop,labelSide,fillOpacity){
  return [
    '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="currentColor" fill-opacity="'+fillOpacity+'" stroke="currentColor" stroke-width="1.6"/>',
    '<text x="'+(x+w/2)+'" y="'+(y-7)+'" text-anchor="middle" font-size="11" font-weight="700">'+esc(labelTop)+'</text>',
    '<text x="'+(x+w+8)+'" y="'+(y+h/2)+'" font-size="11" font-weight="700" dominant-baseline="middle">'+esc(labelSide)+'</text>'
  ].join("");
}
function renderPair(m){
  const maxLen=Math.max(m.originalLength,m.scaledLength),maxWid=Math.max(m.originalWidth,m.scaledWidth);
  const ow=80+70*m.originalLength/maxLen,oh=44+34*m.originalWidth/maxWid,sw=80+70*m.scaledLength/maxLen,sh=44+34*m.scaledWidth/maxWid;
  return [
    rect(25,70-oh/2,ow,oh,m.originalLengthLabel,m.originalWidthLabel,"0.08"),
    '<text x="115" y="25" text-anchor="middle" font-size="11">原圖</text>',
    '<text x="210" y="72" text-anchor="middle" font-size="21">→</text>',
    '<text x="210" y="45" text-anchor="middle" font-size="11" font-weight="700">邊長 × '+esc(m.linearScaleFactorText)+'</text>',
    rect(255,70-sh/2,sw,sh,m.scaledLengthLabel,m.scaledWidthLabel,"0.16"),
    '<text x="325" y="25" text-anchor="middle" font-size="11">新圖</text>',
    '<text x="210" y="135" text-anchor="middle" font-size="10">面積倍率 = 邊長倍率 × 邊長倍率</text>'
  ].join("");
}
function renderApplication(m){
  return [
    rect(28,48,135,70,m.actualLengthLabel,m.actualWidthLabel,"0.08"),
    '<text x="95" y="28" text-anchor="middle" font-size="11">實際長方形場地</text>',
    '<text x="210" y="70" text-anchor="middle" font-size="21">→</text>',
    '<text x="210" y="46" text-anchor="middle" font-size="11" font-weight="700">比例尺 '+esc(m.scaleLabel)+'</text>',
    rect(265,62,100,52,m.paperLengthLabel,m.paperWidthLabel,"0.16"),
    '<text x="315" y="42" text-anchor="middle" font-size="11">紙上圖形</text>',
    '<text x="210" y="137" text-anchor="middle" font-size="10">先縮放長與寬，再求紙上面積</text>'
  ].join("");
}
export function renderScaleAreaChangeDiagram(model){
  const v=validateScaleAreaChangeDiagramModel(model);if(!v.ok)throw invalid(v.errors.join(","));
  const body=model.diagramMode==="SOURCE_SCALE_APPLICATION"?renderApplication(model):renderPair(model);
  return ['<div class="worksheet-cell__representation worksheet-cell__representation--geometry" data-representation="scale-area-change-diagram">',
    '<svg class="worksheet-scale-area-change-diagram" viewBox="0 0 420 150" role="img" aria-label="比例縮放與面積平方變化圖" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block">',
    body,"</svg>","</div>"].join("");
}

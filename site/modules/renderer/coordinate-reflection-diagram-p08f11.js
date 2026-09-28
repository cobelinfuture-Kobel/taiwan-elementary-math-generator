const MODES=new Set(["VERTICAL_AXIS","HORIZONTAL_AXIS","SHIFTED_AXIS"]);
const fix=n=>Number(n).toFixed(2);
function validPoint(p){return p&&typeof p.label==="string"&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=-7&&p.x<=7&&p.y>=-7&&p.y<=7;}
function valid(m){
 if(!m||m.kind!=="coordinate_reflection_diagram"||m.representationVariant!=="COORDINATE_REFLECTION_ACROSS_AXIS"||!MODES.has(m.diagramMode)||!Number.isInteger(m.variant)||m.variant<0||m.variant>=624||!["VERTICAL","HORIZONTAL"].includes(m.axis?.orientation)||!Number.isInteger(m.axis?.value)||!validPoint(m.sourcePoint)||!validPoint(m.reflectedPoint)||typeof m.reflectedPointVisible!=="boolean"||m.reflectionAxisRequired!==true||m.perpendicularDistanceToAxisPreserved!==true||m.segmentLengthsPreserved!==true||m.angleMeasuresPreserved!==true||m.orientationMayReverse!==true||m.pointsOnAxisRemainFixed!==true||m.coordinateOrGridRepresentationRequired!==true||m.rulerMeasurementRequired!==false||m.printScaleIsAnswerAuthority!==false)return false;
 if(m.axis.orientation==="VERTICAL"){if(m.sourcePoint.y!==m.reflectedPoint.y||m.sourcePoint.x+m.reflectedPoint.x!==2*m.axis.value)return false;}else if(m.sourcePoint.x!==m.reflectedPoint.x||m.sourcePoint.y+m.reflectedPoint.y!==2*m.axis.value)return false;
 return true;
}
export function validateCoordinateReflectionDiagramP08F11(model){const ok=valid(model);return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F11_COORDINATE_REFLECTION_DIAGRAM_INVALID"])});}
const PX=18,OX=160,OY=105;
const sx=x=>OX+x*PX,sy=y=>OY-y*PX;
function grid(){
 let s="";for(let i=-7;i<=7;i++){const x=sx(i),y=sy(i);s+=`<line x1="${fix(x)}" y1="${fix(sy(-7))}" x2="${fix(x)}" y2="${fix(sy(7))}" stroke="currentColor" stroke-opacity="${i===0?0.28:0.09}" stroke-width="${i===0?1.2:0.6}"/>`;s+=`<line x1="${fix(sx(-7))}" y1="${fix(y)}" x2="${fix(sx(7))}" y2="${fix(y)}" stroke="currentColor" stroke-opacity="${i===0?0.28:0.09}" stroke-width="${i===0?1.2:0.6}"/>`;}return s;
}
function pointMarkup(p,cls){return `<g class="${cls}"><circle cx="${fix(sx(p.x))}" cy="${fix(sy(p.y))}" r="4" fill="currentColor"/><text x="${fix(sx(p.x)+7)}" y="${fix(sy(p.y)-7)}" font-size="11" font-weight="700">${p.label}</text></g>`;}
export function renderCoordinateReflectionDiagramP08F11(m){
 if(!valid(m)){const e=new Error("Coordinate-reflection diagram is invalid.");e.code="coordinate_reflection_diagram_invalid";throw e;}
 const axis=m.axis.orientation==="VERTICAL"
  ?`<line class="p08f11-reflection-axis" x1="${fix(sx(m.axis.value))}" y1="${fix(sy(-7))}" x2="${fix(sx(m.axis.value))}" y2="${fix(sy(7))}" stroke="currentColor" stroke-width="2.4" stroke-dasharray="6 4"/>`
  :`<line class="p08f11-reflection-axis" x1="${fix(sx(-7))}" y1="${fix(sy(m.axis.value))}" x2="${fix(sx(7))}" y2="${fix(sy(m.axis.value))}" stroke="currentColor" stroke-width="2.4" stroke-dasharray="6 4"/>`;
 const connector=m.reflectedPointVisible?`<line class="p08f11-corresponding-connector" x1="${fix(sx(m.sourcePoint.x))}" y1="${fix(sy(m.sourcePoint.y))}" x2="${fix(sx(m.reflectedPoint.x))}" y2="${fix(sy(m.reflectedPoint.y))}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>`:"";
 const reflected=m.reflectedPointVisible?pointMarkup(m.reflectedPoint,"p08f11-reflected-point"):"";
 return [
  `<div class="worksheet-cell__representation worksheet-cell__representation--coordinate-reflection" data-representation="coordinate-reflection-diagram" data-diagram-mode="${m.diagramMode}" data-axis-orientation="${m.axis.orientation}" data-axis-value="${m.axis.value}" data-ruler-required="false">`,
  '<svg class="worksheet-coordinate-reflection-diagram" viewBox="0 0 320 225" width="100%" height="165" role="img" aria-label="方格座標鏡射圖" preserveAspectRatio="xMidYMid meet">',
  '<g class="p08f11-diagram-content">',grid(),axis,connector,pointMarkup(m.sourcePoint,"p08f11-source-point"),reflected,
  `<text class="p08f11-axis-label" x="160" y="218" text-anchor="middle" font-size="10">對稱軸：${m.axis.label}；每格代表 1 單位</text>`,
  '</g></svg></div>'
 ].join("");
}

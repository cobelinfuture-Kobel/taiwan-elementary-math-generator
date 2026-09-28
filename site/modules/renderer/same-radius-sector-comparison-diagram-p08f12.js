const MODES=new Set(["TWO_SECTORS_COMPARE","THREE_SECTORS_ORDER","EQUAL_ANGLE_EQUAL_SIZE"]);
const ANGLES=new Set([30,45,60,72,90,120,135,150,180]);
const ROTATIONS=new Set(Array.from({length:12},(_,i)=>i*30));
const RADII=new Set([40,42,44,46]);
const fix=n=>Number(n).toFixed(2);
const point=(cx,cy,r,deg)=>{const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy-r*Math.sin(a)};};
function wedge(cx,cy,r,start,delta){const a=point(cx,cy,r,start),b=point(cx,cy,r,start+delta),large=delta>180?1:0;return `M ${fix(cx)} ${fix(cy)} L ${fix(a.x)} ${fix(a.y)} A ${r} ${r} 0 ${large} 0 ${fix(b.x)} ${fix(b.y)} Z`;}
function valid(m){
 if(!m||m.kind!=="same_radius_sector_comparison_diagram"||m.representationVariant!=="SAME_RADIUS_SECTOR_COMPARISON"||!MODES.has(m.diagramMode)||!Number.isInteger(m.variant)||m.variant<0||!Array.isArray(m.sectors)||![2,3].includes(m.sectors.length)||m.sameCircleOrEqualRadiusRequired!==true||m.equalRadius!==true||m.comparedSectorCentralAnglesRequired!==true||m.centralAnglesVisible!==true||m.compareByCentralAngle!==true||m.largerCentralAngleImpliesLargerArc!==true||m.largerCentralAngleImpliesLargerSector!==true||m.equalCentralAnglesImplyEqualSectorSize!==true||m.noAreaFormulaRequired!==true||m.noArcLengthFormulaRequired!==true||m.rulerMeasurementRequired!==false||m.printScaleIsAnswerAuthority!==false)return false;
 if(!m.sectors.every(s=>["A","B","C"].includes(s.label)&&ANGLES.has(s.centralAngleDeg)&&ROTATIONS.has(s.rotationDeg)&&RADII.has(s.radius)))return false;
 if(new Set(m.sectors.map(s=>s.radius)).size!==1)return false;
 if(m.diagramMode==="TWO_SECTORS_COMPARE"&&(m.sectors.length!==2||m.sectors[0].centralAngleDeg===m.sectors[1].centralAngleDeg))return false;
 if(m.diagramMode==="THREE_SECTORS_ORDER"&&(m.sectors.length!==3||new Set(m.sectors.map(s=>s.centralAngleDeg)).size!==3))return false;
 if(m.diagramMode==="EQUAL_ANGLE_EQUAL_SIZE"&&(m.sectors.length!==2||m.sectors[0].centralAngleDeg!==m.sectors[1].centralAngleDeg))return false;
 return true;
}
export function validateSameRadiusSectorComparisonDiagramP08F12(model){const ok=valid(model);return Object.freeze({ok,errors:Object.freeze(ok?[]:["P08F12_SAME_RADIUS_SECTOR_COMPARISON_DIAGRAM_INVALID"])});}
function sectorMarkup(s,cx,cy){
 const d=wedge(cx,cy,s.radius,s.rotationDeg,s.centralAngleDeg),mid=s.rotationDeg+s.centralAngleDeg/2,p=point(cx,cy,Math.max(17,s.radius*0.48),mid);
 return [
   `<path class="p08f12-sector-shape" d="${d}" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-width="1.8"/>`,
   `<circle cx="${fix(cx)}" cy="${fix(cy)}" r="2.6" fill="currentColor"/>`,
   `<text class="p08f12-sector-angle" x="${fix(p.x)}" y="${fix(p.y+3)}" text-anchor="middle" font-size="11" font-weight="700">${s.centralAngleDeg}°</text>`,
   `<text class="p08f12-sector-label" x="${fix(cx)}" y="${fix(cy+s.radius+18)}" text-anchor="middle" font-size="13" font-weight="700">扇形 ${s.label}</text>`
 ].join("");
}
export function renderSameRadiusSectorComparisonDiagramP08F12(m){
 if(!valid(m)){const e=new Error("Same-radius sector comparison diagram is invalid.");e.code="same_radius_sector_comparison_diagram_invalid";throw e;}
 const centers=m.sectors.length===3?[[65,91],[180,91],[295,91]]:[[100,91],[260,91]];
 const sectors=m.sectors.map((s,i)=>sectorMarkup(s,centers[i][0],centers[i][1])).join("");
 return [
  `<div class="worksheet-cell__representation worksheet-cell__representation--same-radius-sector-comparison" data-representation="same-radius-sector-comparison-diagram" data-diagram-mode="${m.diagramMode}" data-ruler-required="false">`,
  `<svg class="worksheet-same-radius-sector-comparison-diagram" viewBox="0 0 360 180" width="100%" height="${m.answerKeyCompact?132:155}" role="img" aria-label="同半徑扇形大小比較圖" preserveAspectRatio="xMidYMid meet">`,
  '<g class="p08f12-diagram-content">',sectors,
  '<text class="p08f12-comparison-hint" x="180" y="171" text-anchor="middle" font-size="10">半徑相同｜比較圓心角，不需要量尺</text>',
  '</g></svg></div>'
 ].join("");
}

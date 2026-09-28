const MODES=new Set(["ANGLE_TO_FRACTION","REDUCE_ANGLE_OVER_360","ROTATED_SECTOR_FRACTION"]);
const ANGLES=new Set([30,45,60,72,90,120,135,144,150,180,210,216,225,240,270,288,300,315,330]);
const ROTATIONS=new Set(Array.from({length:20},(_,i)=>i*18));
const RADII=new Set([54,58,62,66]);
const fix=n=>Number(n).toFixed(2);
const point=(cx,cy,r,deg)=>{const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy-r*Math.sin(a)};};
function gcd(a,b){let x=Math.abs(a),y=Math.abs(b);while(y){[x,y]=[y,x%y];}return x||1;}
function reduced(angle){const g=gcd(angle,360);return{numerator:angle/g,denominator:360/g};}
function arc(cx,cy,r,start,delta){const a=point(cx,cy,r,start),b=point(cx,cy,r,start+delta),large=delta>180?1:0;return `M ${fix(a.x)} ${fix(a.y)} A ${r} ${r} 0 ${large} 0 ${fix(b.x)} ${fix(b.y)}`;}
function wedge(cx,cy,r,start,delta){const a=point(cx,cy,r,start),b=point(cx,cy,r,start+delta),large=delta>180?1:0;return `M ${fix(cx)} ${fix(cy)} L ${fix(a.x)} ${fix(a.y)} A ${r} ${r} 0 ${large} 0 ${fix(b.x)} ${fix(b.y)} Z`;}
function valid(m){if(!m||m.kind!=="sector_fraction_of_circle_diagram"||m.representationVariant!=="SECTOR_FRACTION_OF_FULL_CIRCLE"||!MODES.has(m.diagramMode)||!Number.isInteger(m.variant)||m.variant<0||!ANGLES.has(m.centralAngleDeg)||!ROTATIONS.has(m.rotationDeg)||!RADII.has(m.radius)||m.center?.label!=="O"||m.fullTurnInvariantDegrees!==360||m.targetSectorCentralAngleRequired!==true||m.sectorFractionEqualsCentralAngleOver360!==true||m.reducedFractionRequired!==true||m.fractionRepresentsPartOfSameFullCircle!==true||m.centralAngleAndFractionValueConsistent!==true||m.targetIsFractionOfCircleNotAreaOrArcLength!==true||m.rulerMeasurementRequired!==false||m.printScaleIsAnswerAuthority!==false)return false;const f=reduced(m.centralAngleDeg);return m.fractionNumerator===f.numerator&&m.fractionDenominator===f.denominator;}
export function validateSectorFractionOfCircleDiagramModel(model){const ok=valid(model);return Object.freeze({ok,errors:Object.freeze(ok?[]:["SECTOR_FRACTION_OF_CIRCLE_DIAGRAM_INVALID"])});}
export function renderSectorFractionOfCircleDiagram(m){if(!valid(m)){const e=new Error("Sector-fraction-of-circle diagram representation is invalid.");e.code="sector_fraction_of_circle_diagram_invalid";throw e;}const cx=m.center.x,cy=m.center.y,start=m.rotationDeg,end=start+m.centralAngleDeg,a=point(cx,cy,m.radius,start),b=point(cx,cy,m.radius,end),mid=point(cx,cy,Math.min(39,m.radius*0.62),start+m.centralAngleDeg/2),arcRadius=Math.min(29,m.radius*0.46);return [
 `<div class="worksheet-cell__representation worksheet-cell__representation--sector-fraction-of-circle" data-representation="sector-fraction-of-circle-diagram" data-diagram-mode="${m.diagramMode}" data-relation="${m.relation}" data-ruler-required="false">`,
 '<svg class="worksheet-sector-fraction-of-circle-diagram" viewBox="0 0 320 185" width="100%" height="165" role="img" aria-label="扇形占全圓比例圖，標示圓心角" preserveAspectRatio="xMidYMid meet">',
 '<g class="p08f10-diagram-content">',
 `<circle cx="${fix(cx)}" cy="${fix(cy)}" r="${m.radius}" fill="none" stroke="currentColor" stroke-width="2.5"/>`,
 `<path class="p08f10-target-sector" d="${wedge(cx,cy,m.radius,start,m.centralAngleDeg)}" fill="currentColor" fill-opacity="0.12" stroke="none"/>`,
 `<line x1="${fix(cx)}" y1="${fix(cy)}" x2="${fix(a.x)}" y2="${fix(a.y)}" stroke="currentColor" stroke-width="2.5"/>`,
 `<line x1="${fix(cx)}" y1="${fix(cy)}" x2="${fix(b.x)}" y2="${fix(b.y)}" stroke="currentColor" stroke-width="2.5"/>`,
 `<path class="p08f10-central-angle-arc" d="${arc(cx,cy,arcRadius,start,m.centralAngleDeg)}" fill="none" stroke="currentColor" stroke-width="3"/>`,
 `<text class="p08f10-central-angle-label" x="${fix(mid.x)}" y="${fix(mid.y)}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" stroke="white" stroke-width="3.5" paint-order="stroke">${m.centralAngleDeg}°</text>`,
 `<circle cx="${fix(cx)}" cy="${fix(cy)}" r="3.6" fill="currentColor"/><text x="${fix(cx+8)}" y="${fix(cy+16)}" font-size="12" font-weight="700">O</text>`,
 '<text class="p08f10-full-turn-label" x="160" y="174" text-anchor="middle" font-size="10">全圓 = 360°；陰影是題目的扇形</text>',
 '</g></svg></div>'
 ].join("");}

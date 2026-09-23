function finitePositive(v){return Number.isFinite(v)&&v>0;}
export function validateCylinderVolumeDiagramModel(model){
  const errors=[];
  if(!model||model.kind!=="cylinder_volume_diagram")return Object.freeze({ok:false,errors:Object.freeze(["P07F18_DIAGRAM_KIND_INVALID"])});
  if(!["UPRIGHT","HORIZONTAL"].includes(model.orientation))errors.push("P07F18_DIAGRAM_ORIENTATION_INVALID");
  if(!["RADIUS_HEIGHT","DIAMETER_HEIGHT"].includes(model.measurementMode))errors.push("P07F18_DIAGRAM_MEASUREMENT_INVALID");
  if(!finitePositive(model.radiusPx)||model.radiusPx<20||model.radiusPx>38||!finitePositive(model.lengthPx)||model.lengthPx<70||model.lengthPx>118)errors.push("P07F18_DIAGRAM_GEOMETRY_INVALID");
  if(!Number.isInteger(model.variant)||model.variant<0||model.variant>=240)errors.push("P07F18_DIAGRAM_VARIANT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
const f=v=>Number(v).toFixed(2);
function renderHorizontal(model){
  const cy=70,frontX=52,backX=52+model.lengthPx,rx=12,ry=model.radiusPx;
  const measure=model.measurementMode==="DIAMETER_HEIGHT"
    ? '<line x1="'+frontX+'" y1="'+f(cy-ry)+'" x2="'+frontX+'" y2="'+f(cy+ry)+'" stroke="currentColor" stroke-width="2.4"/><text x="'+(frontX-10)+'" y="'+(cy+4)+'" font-size="12">d</text>'
    : '<line x1="'+frontX+'" y1="'+cy+'" x2="'+frontX+'" y2="'+f(cy-ry)+'" stroke="currentColor" stroke-width="2.4"/><text x="'+(frontX-10)+'" y="'+f(cy-ry/2)+'" font-size="12">r</text>';
  return [
    '<ellipse cx="'+frontX+'" cy="'+cy+'" rx="'+rx+'" ry="'+f(ry)+'" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    '<ellipse cx="'+backX+'" cy="'+cy+'" rx="'+rx+'" ry="'+f(ry)+'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="5 4"/>',
    '<line x1="'+frontX+'" y1="'+f(cy-ry)+'" x2="'+backX+'" y2="'+f(cy-ry)+'" stroke="currentColor" stroke-width="2.2"/>',
    '<line x1="'+frontX+'" y1="'+f(cy+ry)+'" x2="'+backX+'" y2="'+f(cy+ry)+'" stroke="currentColor" stroke-width="2.2"/>',
    measure,
    '<line x1="'+(frontX+8)+'" y1="'+f(cy-ry-10)+'" x2="'+(backX-8)+'" y2="'+f(cy-ry-10)+'" stroke="currentColor" stroke-width="2"/>',
    '<text x="'+f((frontX+backX)/2)+'" y="'+f(cy-ry-15)+'" text-anchor="middle" font-size="12">h</text>'
  ].join("");
}
function renderUpright(model){
  const cx=110,topY=34,bottomY=34+model.lengthPx,rx=model.radiusPx,ry=11;
  const measure=model.measurementMode==="DIAMETER_HEIGHT"
    ? '<line x1="'+f(cx-rx)+'" y1="'+topY+'" x2="'+f(cx+rx)+'" y2="'+topY+'" stroke="currentColor" stroke-width="2.4"/><text x="'+cx+'" y="'+(topY-8)+'" text-anchor="middle" font-size="12">d</text>'
    : '<line x1="'+cx+'" y1="'+topY+'" x2="'+f(cx+rx)+'" y2="'+topY+'" stroke="currentColor" stroke-width="2.4"/><text x="'+f(cx+rx/2)+'" y="'+(topY-8)+'" text-anchor="middle" font-size="12">r</text>';
  return [
    '<ellipse cx="'+cx+'" cy="'+topY+'" rx="'+f(rx)+'" ry="'+ry+'" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    '<ellipse cx="'+cx+'" cy="'+bottomY+'" rx="'+f(rx)+'" ry="'+ry+'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="5 4"/>',
    '<line x1="'+f(cx-rx)+'" y1="'+topY+'" x2="'+f(cx-rx)+'" y2="'+bottomY+'" stroke="currentColor" stroke-width="2.2"/>',
    '<line x1="'+f(cx+rx)+'" y1="'+topY+'" x2="'+f(cx+rx)+'" y2="'+bottomY+'" stroke="currentColor" stroke-width="2.2"/>',
    measure,
    '<line x1="'+f(cx+rx+14)+'" y1="'+(topY+5)+'" x2="'+f(cx+rx+14)+'" y2="'+(bottomY-5)+'" stroke="currentColor" stroke-width="2"/>',
    '<text x="'+f(cx+rx+21)+'" y="'+f((topY+bottomY)/2)+'" font-size="12">h</text>'
  ].join("");
}
export function renderCylinderVolumeDiagram(model){
  const v=validateCylinderVolumeDiagramModel(model);
  if(!v.ok){const e=new Error("Cylinder-volume diagram representation is invalid: "+v.errors.join(","));e.code="cylinder_volume_diagram_invalid";throw e;}
  const shape=model.orientation==="HORIZONTAL"?renderHorizontal(model):renderUpright(model);
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--cylinder-volume" data-representation="cylinder-volume-diagram" data-orientation="'+model.orientation.toLowerCase()+'" data-measurement-mode="'+model.measurementMode+'">',
    '<svg class="worksheet-cylinder-volume-diagram" viewBox="0 0 220 170" width="100%" height="120" role="img" aria-label="圓柱體積圖示" preserveAspectRatio="xMidYMid meet">',
    shape,
    '</svg></div>'
  ].join("");
}

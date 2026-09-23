function finitePositive(v){return Number.isFinite(v)&&v>0;}
function valid(model){
  if(!model||model.kind!=="annulus_area_diagram")return false;
  if(!finitePositive(model.innerRadiusPx)||!finitePositive(model.outerRadiusPx)||model.outerRadiusPx<=model.innerRadiusPx)return false;
  if(model.outerRadiusPx>52||model.innerRadiusPx<12)return false;
  if(!["OUTER_INNER_RADII","INNER_DIAMETER_THICKNESS","INNER_RADIUS_THICKNESS"].includes(model.measurementMode))return false;
  if(!Number.isFinite(model.rotationDeg)||model.rotationDeg<0||model.rotationDeg>=360)return false;
  return true;
}
const f=v=>Number(v).toFixed(2);
function unit(deg){const r=deg*Math.PI/180;return{x:Math.cos(r),y:-Math.sin(r)};}
function point(cx,cy,d,dist){return{x:cx+d.x*dist,y:cy+d.y*dist};}
function line(a,b,cls=""){return '<line class="annulus-area-diagram__measure '+cls+'" x1="'+f(a.x)+'" y1="'+f(a.y)+'" x2="'+f(b.x)+'" y2="'+f(b.y)+'" stroke="currentColor" stroke-width="3" stroke-linecap="round" />';}
export function renderAnnulusAreaDiagram(model){
  if(!valid(model)){const e=new Error("Annulus-area diagram representation is invalid.");e.code="annulus_area_diagram_invalid";throw e;}
  const cx=110,cy=65,d=unit(model.rotationDeg),inner=point(cx,cy,d,model.innerRadiusPx),outer=point(cx,cy,d,model.outerRadiusPx),oppInner=point(cx,cy,d,-model.innerRadiusPx);
  const marks=[];
  if(model.measurementMode==="OUTER_INNER_RADII"){marks.push(line({x:cx,y:cy},inner,"annulus-area-diagram__inner-radius"));marks.push(line({x:cx,y:cy},outer,"annulus-area-diagram__outer-radius"));}
  if(model.measurementMode==="INNER_DIAMETER_THICKNESS"){marks.push(line(oppInner,inner,"annulus-area-diagram__inner-diameter"));marks.push(line(inner,outer,"annulus-area-diagram__thickness"));}
  if(model.measurementMode==="INNER_RADIUS_THICKNESS"){marks.push(line({x:cx,y:cy},inner,"annulus-area-diagram__inner-radius"));marks.push(line(inner,outer,"annulus-area-diagram__thickness"));}
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--annulus-area" data-representation="annulus-area-diagram" data-measurement-mode="'+model.measurementMode+'">',
    '<svg class="worksheet-annulus-area-diagram" viewBox="0 0 220 130" width="100%" height="110" role="img" aria-label="同心圓形成的圓環圖" preserveAspectRatio="xMidYMid meet">',
    '<circle class="annulus-area-diagram__outer" cx="'+cx+'" cy="'+cy+'" r="'+f(model.outerRadiusPx)+'" fill="none" stroke="currentColor" stroke-width="3" />',
    '<circle class="annulus-area-diagram__inner" cx="'+cx+'" cy="'+cy+'" r="'+f(model.innerRadiusPx)+'" fill="none" stroke="currentColor" stroke-width="3" />',
    '<circle class="annulus-area-diagram__center" cx="'+cx+'" cy="'+cy+'" r="3" fill="currentColor" />',
    ...marks,
    '</svg></div>'
  ].join("");
}

const esc=value=>String(value??"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;");

function attrs(meta={}){
  return Object.entries(meta).map(([k,v])=>' data-'+k+'="'+esc(v)+'"').join("");
}
function wrap(body,label,meta={}){
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--geometry" data-representation="composite-arc-perimeter-diagram">',
    '<svg class="worksheet-composite-arc-perimeter-diagram" viewBox="0 0 360 190" role="img" aria-label="'+esc(label)+'" preserveAspectRatio="xMidYMid meet"'+attrs(meta)+'>',
    '<rect x="1" y="1" width="358" height="188" rx="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>',
    body,
    "</svg>",
    "</div>"
  ].join("");
}
const line=(x1,y1,x2,y2,w=3,dash="",className="")=>'<line'+(className?' class="'+className+'"':"")+' x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="currentColor" stroke-width="'+w+'" fill="none"'+(dash?' stroke-dasharray="'+dash+'"':"")+'/>';
const text=(x,y,t,size=12,anchor="middle",weight="400",className="")=>'<text'+(className?' class="'+className+'"':"")+' x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" fill="currentColor">'+esc(t)+'</text>';
const path=(d,className="",w=3,dash="")=>'<path'+(className?' class="'+className+'"':"")+' d="'+d+'" stroke="currentColor" stroke-width="'+w+'" fill="none" stroke-linecap="round" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':"")+'/>';
const dot=(x,y,r=2)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="currentColor"/>';
function point(cx,cy,r,deg){const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};}
function dimLine(x1,y1,x2,y2,label,offset=-8){
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,t=4,mx=(x1+x2)/2+nx*offset,my=(y1+y2)/2+ny*offset;
  return [
    line(x1,y1,x2,y2,1.2,"","q017-dimension-line"),
    line(x1-nx*t,y1-ny*t,x1+nx*t,y1+ny*t,1.2,"","q017-dimension-tick"),
    line(x2-nx*t,y2-ny*t,x2+nx*t,y2+ny*t,1.2,"","q017-dimension-tick"),
    text(mx,my,label,11)
  ].join("");
}
function verticalDimLine(x,y1,y2,label){
  const t=4,tx=x-12,ty=(y1+y2)/2;
  return [
    line(x,y1,x,y2,1.2,"","q017-height-dimension-line"),
    line(x-t,y1,x+t,y1,1.2,"","q017-height-dimension-tick"),
    line(x-t,y2,x+t,y2,1.2,"","q017-height-dimension-tick"),
    '<text class="q017-height-dimension-label" x="'+tx+'" y="'+ty+'" text-anchor="middle" font-size="10" fill="currentColor" transform="rotate(-90 '+tx+' '+ty+')">'+esc(label)+'</text>'
  ].join("");
}

function renderSector(m){
  const angle=Number(m.centralAngleDeg??90),r=56,cx=180,cy=132,startDeg=-90-angle/2,endDeg=-90+angle/2,p1=point(cx,cy,r,startDeg),p2=point(cx,cy,r,endDeg),large=angle>180?1:0;
  const outer="M "+p1.x.toFixed(2)+" "+p1.y.toFixed(2)+" A "+r+" "+r+" 0 "+large+" 1 "+p2.x.toFixed(2)+" "+p2.y.toFixed(2)+" L "+cx+" "+cy+" Z";
  const rr=20,a1=point(cx,cy,rr,startDeg),a2=point(cx,cy,rr,endDeg);
  const angleArc="M "+a1.x.toFixed(2)+" "+a1.y.toFixed(2)+" A "+rr+" "+rr+" 0 0 1 "+a2.x.toFixed(2)+" "+a2.y.toFixed(2);
  const am=point(cx,cy,r+12,startDeg),bm=point(cx,cy,r+12,endDeg),mid={x:(p1.x+cx)/2,y:(p1.y+cy)/2};
  return wrap([
    text(180,20,"實線外框＝弧 AB＋OA＋OB",13,"middle","700"),
    path(outer,"q017-external-boundary"),
    path(angleArc,"q017-angle-marker",1.4),
    dot(cx,cy,2.2),
    text(cx+7,cy+6,"O",11,"start"),
    text(am.x.toFixed(1),am.y.toFixed(1),"A",11),
    text(bm.x.toFixed(1),bm.y.toFixed(1),"B",11),
    text(mid.x-8,mid.y+2,"半徑 "+m.radius+" 公分",10,"end"),
    text(cx,cy-25,angle+"°",11),
    text(180,180,"圓周率取 3.14；只算實線外框",11)
  ].join(""),"扇形外部邊界圖",{
    "shape-mode":"SECTOR",
    "visual-contract-version":"P08F17_R2",
    "external-arc-count":"1",
    "shared-diameter-count":"0",
    "central-angle-deg":angle,
    "proportional-geometry":"not-applicable"
  });
}

function renderStadium(m){
  const radius=Number(m.radius),straight=Number(m.straightLength),unitsW=straight+2*radius,unitsH=2*radius,maxW=236,maxH=88,scale=Math.min(maxW/unitsW,maxH/unitsH),rp=radius*scale,sp=straight*scale,totalW=sp+2*rp,cx=180,cy=103,x=cx-totalW/2,y=cy-rp,lx=x+rp,rx=lx+sp,h=2*rp;
  const d="M "+lx+" "+y+" H "+rx+" A "+rp+" "+rp+" 0 0 1 "+rx+" "+(y+h)+" H "+lx+" A "+rp+" "+rp+" 0 0 1 "+lx+" "+y+" Z";
  return wrap([
    text(180,18,"實線外框＝兩段直線＋兩段半圓弧",13,"middle","700"),
    path(d,"q017-external-boundary"),
    dimLine(lx,y-10,rx,y-10,"直線 "+straight+" 公分",-7),
    dot(lx,cy,2),
    line(lx,cy,x,cy,1.2,"","q017-radius-guide"),
    text((lx+x)/2,cy-7,"半徑 "+radius,10),
    text(180,177,"兩個半圓弧合起來＝一個整圓",11)
  ].join(""),"跑道形複合弧周長圖",{
    "shape-mode":"STADIUM",
    "visual-contract-version":"P08F17_R2",
    "external-arc-count":"2",
    "shared-diameter-count":"0",
    "proportional-geometry":"true",
    "source-width-units":unitsW,
    "source-height-units":unitsH
  });
}

function renderRectSemicircle(m){
  const radius=Number(m.radius),height=Number(m.height),unitsW=2*radius,unitsH=radius+height,maxW=218,maxH=112,scale=Math.min(maxW/unitsW,maxH/unitsH),rp=radius*scale,hp=height*scale,w=2*rp,x=180-w/2,top=55,baseY=top+rp,bottom=baseY+hp;
  const outer="M "+x+" "+baseY+" A "+rp+" "+rp+" 0 0 1 "+(x+w)+" "+baseY+" L "+(x+w)+" "+bottom+" L "+x+" "+bottom+" Z";
  return wrap([
    text(180,18,"實線才算周長；虛線是共用直徑",13,"middle","700"),
    text(180,36,"虛線＝共用直徑 "+m.diameter+" 公分",10,"middle","400","q017-shared-diameter-label"),
    path(outer,"q017-external-boundary"),
    line(x,baseY,x+w,baseY,1.5,"5 4","q017-shared-diameter"),
    verticalDimLine(x-12,baseY,bottom,"高 "+height+" 公分"),
    text(180,183,"外部邊界＝半圓弧＋底邊＋左右兩邊",11)
  ].join(""),"長方形接半圓的外部邊界圖",{
    "shape-mode":"RECT_SEMICIRCLE",
    "visual-contract-version":"P08F17_R2",
    "external-arc-count":"1",
    "shared-diameter-count":"1",
    "proportional-geometry":"true",
    "annotation-layout":"external",
    "source-width-units":unitsW,
    "source-height-units":unitsH
  });
}

function bumpSides(q){
  return [["TOP","RIGHT"],["RIGHT","BOTTOM"],["BOTTOM","LEFT"],["LEFT","TOP"]][((Number(q)||0)%4+4)%4];
}
function sideLine(side,x,y,s,className="q017-external-straight",dash=""){
  if(side==="TOP")return line(x,y,x+s,y,dash?1.5:3,dash,className);
  if(side==="RIGHT")return line(x+s,y,x+s,y+s,dash?1.5:3,dash,className);
  if(side==="BOTTOM")return line(x,y+s,x+s,y+s,dash?1.5:3,dash,className);
  return line(x,y,x,y+s,dash?1.5:3,dash,className);
}
function semicirclePath(side,x,y,s){
  const r=s/2,k=.5522847498,cx=x+r,cy=y+r;
  if(side==="TOP")return "M "+x+" "+y+" C "+x+" "+(y-k*r)+" "+(cx-k*r)+" "+(y-r)+" "+cx+" "+(y-r)+" C "+(cx+k*r)+" "+(y-r)+" "+(x+s)+" "+(y-k*r)+" "+(x+s)+" "+y;
  if(side==="BOTTOM")return "M "+x+" "+(y+s)+" C "+x+" "+(y+s+k*r)+" "+(cx-k*r)+" "+(y+s+r)+" "+cx+" "+(y+s+r)+" C "+(cx+k*r)+" "+(y+s+r)+" "+(x+s)+" "+(y+s+k*r)+" "+(x+s)+" "+(y+s);
  if(side==="LEFT")return "M "+x+" "+y+" C "+(x-k*r)+" "+y+" "+(x-r)+" "+(cy-k*r)+" "+(x-r)+" "+cy+" C "+(x-r)+" "+(cy+k*r)+" "+(x-k*r)+" "+(y+s)+" "+x+" "+(y+s);
  return "M "+(x+s)+" "+y+" C "+(x+s+k*r)+" "+y+" "+(x+s+r)+" "+(cy-k*r)+" "+(x+s+r)+" "+cy+" C "+(x+s+r)+" "+(cy+k*r)+" "+(x+s+k*r)+" "+(y+s)+" "+(x+s)+" "+(y+s);
}
function renderDoubleBump(m){
  const x=146,y=61,s=68,sides=bumpSides(m.orientationQuarterTurns),all=["TOP","RIGHT","BOTTOM","LEFT"],solid=all.filter(side=>!sides.includes(side));
  const bumpHtml=sides.map(side=>path(semicirclePath(side,x,y,s),"q017-bump-arc",3)).join("");
  const solidHtml=solid.map(side=>sideLine(side,x,y,s)).join("");
  const sharedHtml=sides.map(side=>sideLine(side,x,y,s,"q017-shared-diameter","5 4")).join("");
  return wrap([
    text(180,17,"實線＝外部邊界；虛線＝半圓直徑（不計）",12,"middle","700"),
    bumpHtml,
    solidHtml,
    sharedHtml,
    text(180,98,"邊長 "+m.sideLength+" 公分",11),
    text(180,181,"外接半圓："+(m.orientationLabel??""),11)
  ].join(""),"正方形兩邊外接半圓的複合周長圖",{
    "shape-mode":"DOUBLE_BUMP",
    "visual-contract-version":"P08F17_R2",
    "external-arc-count":"2",
    "shared-diameter-count":"2",
    "proportional-geometry":"true",
    "bump-sides":sides.join(",")
  });
}

export function renderCompositeArcPerimeterDiagramP08F17(model){
  if(!model||model.kind!=="composite_arc_perimeter_diagram")throw new Error("P08F17_COMPOSITE_ARC_DIAGRAM_INVALID");
  if(model.externalBoundaryOnly!==true||model.internalSharedEdgesExcluded!==true||model.visualContractVersion!=="P08F17_R2")throw new Error("P08F17_COMPOSITE_ARC_BOUNDARY_FLAGS_INVALID");
  if(model.representationVariant==="SECTOR")return renderSector(model);
  if(model.representationVariant==="STADIUM")return renderStadium(model);
  if(model.representationVariant==="RECT_SEMICIRCLE")return renderRectSemicircle(model);
  if(model.representationVariant==="DOUBLE_BUMP")return renderDoubleBump(model);
  throw new Error("P08F17_COMPOSITE_ARC_VARIANT_INVALID:"+String(model.representationVariant));
}

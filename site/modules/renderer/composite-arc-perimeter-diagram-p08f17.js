const esc=value=>String(value??"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;");

function wrap(body,label){
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--geometry" data-representation="composite-arc-perimeter-diagram">',
    '<svg class="worksheet-composite-arc-perimeter-diagram" viewBox="0 0 360 190" role="img" aria-label="'+esc(label)+'" preserveAspectRatio="xMidYMid meet">',
    '<rect x="1" y="1" width="358" height="188" rx="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>',
    body,
    "</svg>",
    "</div>"
  ].join("");
}
const line=(x1,y1,x2,y2,w=3,dash="")=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="currentColor" stroke-width="'+w+'" fill="none"'+(dash?' stroke-dasharray="'+dash+'"':"")+'/>';
const text=(x,y,t,size=12,anchor="middle",weight="400")=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" fill="currentColor">'+esc(t)+'</text>';
const path=d=>'<path d="'+d+'" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';

function renderSector(m){
  const angle=Number(m.centralAngleDeg??90),r=58,cx=180,cy=105;
  const a1=-90,a2=a1+angle,to=(deg)=>{const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};},p1=to(a1),p2=to(a2),large=angle>180?1:0;
  const d="M "+p1.x.toFixed(2)+" "+p1.y.toFixed(2)+" A "+r+" "+r+" 0 "+large+" 1 "+p2.x.toFixed(2)+" "+p2.y.toFixed(2)+" L "+cx+" "+cy+" Z";
  return wrap([
    path(d),
    '<path d="M '+cx+' '+(cy-22)+' A 22 22 0 0 1 '+(cx+22*Math.sin(angle*Math.PI/180)).toFixed(2)+' '+(cy-22*Math.cos(angle*Math.PI/180)).toFixed(2)+'" stroke="currentColor" stroke-width="1.5" fill="none"/>',
    text(cx,cy+6,"O",11),
    text(180,25,"外部邊界＝弧＋兩條半徑",13,"middle","700"),
    text(40,172,"半徑 "+m.radius+" 公分",12,"start"),
    text(250,172,"圓心角 "+angle+"°",12,"start")
  ].join(""),"扇形外部邊界圖");
}
function renderStadium(m){
  const x=92,y=58,w=176,h=74,r=h/2;
  const d="M "+(x+r)+" "+y+" H "+(x+w-r)+" A "+r+" "+r+" 0 0 1 "+(x+w-r)+" "+(y+h)+" H "+(x+r)+" A "+r+" "+r+" 0 0 1 "+(x+r)+" "+y+" Z";
  return wrap([
    path(d),
    line(x+r,y,x+w-r,y,1.5,"5 4"),
    line(x+r,y+h,x+w-r,y+h,1.5,"5 4"),
    text(180,28,"只計跑道形外框",13,"middle","700"),
    text(180,52,"直線 "+m.straightLength+" 公分",11),
    text(55,102,"r="+m.radius,11),
    text(305,102,"r="+m.radius,11),
    text(180,160,"兩個半圓弧合起來＝一個整圓",12)
  ].join(""),"跑道形複合弧周長圖");
}
function renderRectSemicircle(m){
  const x=112,y=78,w=136,h=78,r=w/2;
  const arc="M "+x+" "+y+" A "+r+" "+r+" 0 0 1 "+(x+w)+" "+y;
  return wrap([
    path(arc+" L "+(x+w)+" "+(y+h)+" L "+x+" "+(y+h)+" Z"),
    line(x,y,x+w,y,1.5,"5 4"),
    text(180,24,"虛線是共用邊，不算外部周長",13,"middle","700"),
    text(180,72,"直徑 "+m.diameter+" 公分",11),
    text(90,120,"高 "+m.height,11),
    text(180,174,"外部邊界＝半圓弧＋底邊＋左右兩邊",12)
  ].join(""),"長方形接半圓的外部邊界圖");
}
function renderDoubleBump(m){
  const x=125,y=55,s=110,r=s/2,rot=Number(m.orientationQuarterTurns??0)*90,cx=x+s/2,cy=y+s/2;
  const base=[
    '<g transform="rotate('+rot+' '+cx+' '+cy+')">',
    path("M "+x+" "+(y+s)+" L "+x+" "+y+" A "+r+" "+r+" 0 0 1 "+(x+s)+" "+y+" A "+r+" "+r+" 0 0 1 "+(x+s)+" "+(y+s)+" L "+x+" "+(y+s)),
    line(x,y,x+s,y,1.5,"5 4"),
    line(x+s,y,x+s,y+s,1.5,"5 4"),
    "</g>"
  ].join("");
  return wrap([
    base,
    text(180,24,"兩條虛線是半圓直徑共用邊，不計入外部邊界",12,"middle","700"),
    text(180,180,"邊長 "+m.sideLength+" 公分；外接半圓位置："+(m.orientationLabel??""),11)
  ].join(""),"正方形兩邊外接半圓的複合周長圖");
}

export function renderCompositeArcPerimeterDiagramP08F17(model){
  if(!model||model.kind!=="composite_arc_perimeter_diagram")throw new Error("P08F17_COMPOSITE_ARC_DIAGRAM_INVALID");
  if(model.externalBoundaryOnly!==true||model.internalSharedEdgesExcluded!==true)throw new Error("P08F17_COMPOSITE_ARC_BOUNDARY_FLAGS_INVALID");
  if(model.representationVariant==="SECTOR")return renderSector(model);
  if(model.representationVariant==="STADIUM")return renderStadium(model);
  if(model.representationVariant==="RECT_SEMICIRCLE")return renderRectSemicircle(model);
  if(model.representationVariant==="DOUBLE_BUMP")return renderDoubleBump(model);
  throw new Error("P08F17_COMPOSITE_ARC_VARIANT_INVALID:"+String(model.representationVariant));
}

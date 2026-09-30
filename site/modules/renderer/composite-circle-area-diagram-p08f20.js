const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const f=v=>Number(v).toFixed(2);
const point=(cx,cy,r,deg)=>{const a=deg*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};};
function valid(m){
  return Boolean(m)&&m.kind==="composite_circle_area_diagram_p08f20"&&m.visualContractVersion==="P08F20_R1"&&
    ["SEMICIRCLE_PLUS_SECTOR","SQUARE_MINUS_CIRCLE"].includes(m.compositionMode)&&Number.isFinite(m.radiusValue)&&m.radiusValue>0&&
    m.piValue===3.14&&m.shadedTarget==="COMPOSITE_AREA"&&m.showRadiusMeasure===true&&m.showComponentLabels===true&&
    m.externalBoundaryTeaching===false&&m.arcLengthTeaching===false&&m.perimeterTeaching===false&&
    (m.compositionMode==="SEMICIRCLE_PLUS_SECTOR"
      ? Number.isFinite(m.sectorAngleDeg)&&m.sectorAngleDeg>0&&m.sectorAngleDeg<180&&m.showPartitionBoundary===true&&m.showSubtractionBoundary===false
      : Number.isFinite(m.squareSideValue)&&m.squareSideValue>=2*m.radiusValue&&m.showPartitionBoundary===false&&m.showSubtractionBoundary===true&&m.showSquareSideMeasure===true);
}
function line(x1,y1,x2,y2,cls="",dash=""){
  return '<line'+(cls?' class="'+cls+'"':"")+' x1="'+f(x1)+'" y1="'+f(y1)+'" x2="'+f(x2)+'" y2="'+f(y2)+'" stroke="currentColor" stroke-width="2"'+(dash?' stroke-dasharray="'+dash+'"':"")+' stroke-linecap="round" />';
}
function text(x,y,t,size=11,anchor="middle",weight="400",cls="",attrs=""){
  return '<text'+(cls?' class="'+cls+'"':"")+(attrs?' '+attrs:"")+' x="'+f(x)+'" y="'+f(y)+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" fill="currentColor">'+esc(t)+'</text>';
}
function arcPath(cx,cy,r,start,end){
  const a=point(cx,cy,r,start),b=point(cx,cy,r,end),delta=((end-start)%360+360)%360,large=delta>180?1:0;
  return "M "+f(cx)+" "+f(cy)+" L "+f(a.x)+" "+f(a.y)+" A "+f(r)+" "+f(r)+" 0 "+large+" 1 "+f(b.x)+" "+f(b.y)+" Z";
}
function renderSemiSector(m){
  const cx=130,cy=84,r=48,start=-90,mid=90,end=90+m.sectorAngleDeg;
  const semi=arcPath(cx,cy,r,start,mid),sector=arcPath(cx,cy,r,mid,end);
  const sectorEnd=point(cx,cy,r,end),radiusEnd=point(cx,cy,r,0);
  const sectorAnchor=point(cx,cy,r*0.58,90+m.sectorAngleDeg/2);
  const semiLabel={x:160,y:54},sectorLabel={x:70,y:126},sectorLeaderStart={x:96,y:117};
  return [
    text(cx,16,"陰影＝甲＋乙",12,"middle","700","composite-circle-area__title"),
    '<circle class="composite-circle-area__whole-circle" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="currentColor" stroke-width="2" />',
    '<path class="composite-circle-area__component composite-circle-area__semicircle" d="'+semi+'" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-width="2" />',
    '<path class="composite-circle-area__component composite-circle-area__sector" d="'+sector+'" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="2" />',
    line(cx,cy,sectorEnd.x,sectorEnd.y,"composite-circle-area__partition","5 3"),
    line(cx,cy,radiusEnd.x,radiusEnd.y,"composite-circle-area__radius","4 3"),
    text(cx+r/2,cy-7,"半徑 "+m.radiusValue+" 公分",10),
    text(semiLabel.x,semiLabel.y,"甲：半圓",10,"middle","700","composite-circle-area__component-label composite-circle-area__component-label--semicircle",'data-component-role="semicircle"'),
    line(sectorLeaderStart.x,sectorLeaderStart.y,sectorAnchor.x,sectorAnchor.y,"composite-circle-area__sector-label-leader","3 2"),
    text(sectorLabel.x,sectorLabel.y,"乙："+m.sectorAngleDeg+"° 扇形",10,"middle","700","composite-circle-area__component-label composite-circle-area__component-label--sector",'data-component-role="sector"'),
    text(cx,176,"陰影面積＝半圓面積＋扇形面積",10,"middle","400","composite-circle-area__formula-label")
  ].join("");
}
function renderSquareMinusCircle(m){
  const cx=130,cy=82,half=54,ratio=(2*m.radiusValue)/m.squareSideValue,cr=Math.max(28,Math.min(52,half*ratio));
  const x=cx-half,y=cy-half,side=half*2;
  const outer="M "+f(x)+" "+f(y)+" H "+f(x+side)+" V "+f(y+side)+" H "+f(x)+" Z";
  const circle="M "+f(cx-cr)+" "+f(cy)+" a "+f(cr)+" "+f(cr)+" 0 1 0 "+f(2*cr)+" 0 a "+f(cr)+" "+f(cr)+" 0 1 0 "+f(-2*cr)+" 0";
  return [
    text(cx,16,"陰影＝正方形內、圓外",12,"middle","700","composite-circle-area__title"),
    '<path class="composite-circle-area__difference-fill" d="'+outer+" "+circle+'" fill="currentColor" fill-opacity="0.14" fill-rule="evenodd" />',
    '<rect class="composite-circle-area__square" x="'+f(x)+'" y="'+f(y)+'" width="'+f(side)+'" height="'+f(side)+'" fill="none" stroke="currentColor" stroke-width="2.4" />',
    '<circle class="composite-circle-area__circle" cx="'+f(cx)+'" cy="'+f(cy)+'" r="'+f(cr)+'" fill="none" stroke="currentColor" stroke-width="2.4" />',
    line(cx,cy,cx+cr,cy,"composite-circle-area__radius","4 3"),
    text(cx+cr/2,cy-8,"半徑 "+m.radiusValue+" 公分",10),
    line(x,y-7,x+side,y-7,"composite-circle-area__square-side",""),
    text(cx,y-12,"正方形邊長 "+m.squareSideValue+" 公分",10),
    text(cx,176,"陰影面積＝正方形面積－圓面積",10,"middle","400","composite-circle-area__formula-label")
  ].join("");
}
export function renderCompositeCircleAreaDiagramP08F20(model){
  if(!valid(model)){const e=new Error("Composite-circle-area diagram representation is invalid.");e.code="composite_circle_area_diagram_p08f20_invalid";throw e;}
  const body=model.compositionMode==="SEMICIRCLE_PLUS_SECTOR"?renderSemiSector(model):renderSquareMinusCircle(model);
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--composite-circle-area" data-representation="composite-circle-area-diagram-p08f20" data-composition-mode="'+model.compositionMode+'" data-visual-contract-version="P08F20_R1">',
    '<svg class="worksheet-composite-circle-area-diagram-p08f20" viewBox="0 0 260 190" width="100%" height="150" role="img" aria-label="複合圓形面積圖" preserveAspectRatio="xMidYMid meet">',
    body,"</svg></div>"
  ].join("");
}

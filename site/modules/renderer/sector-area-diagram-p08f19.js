const esc=value=>String(value??"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;");
const f=v=>Number(v).toFixed(2);
const point=(cx,cy,r,deg)=>{
  const a=deg*Math.PI/180;
  return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};
};
function valid(m){
  return Boolean(m)&&m.kind==="sector_area_diagram_p08f19"&&m.visualContractVersion==="P08F19_R1"&&
    ["RADIUS","DIAMETER"].includes(m.measurementMode)&&Number.isFinite(m.radiusValue)&&m.radiusValue>0&&
    Number.isFinite(m.diameterValue)&&m.diameterValue===2*m.radiusValue&&Number.isFinite(m.centralAngleDeg)&&
    m.centralAngleDeg>0&&m.centralAngleDeg<=360&&m.fullCircleDegrees===360&&m.sectorHighlighted===true&&
    m.showWholeCircleReference===true&&m.showCentralAngleMarker===true&&m.externalBoundaryTeaching===false&&
    m.arcLengthTeaching===false&&m.proportionalAngleRequired===true&&m.centerLabel==="O"&&
    Array.isArray(m.endpointLabels)&&m.endpointLabels.join("|")==="A|B";
}
function line(x1,y1,x2,y2,cls="",dash=""){
  return '<line'+(cls?' class="'+cls+'"':"")+' x1="'+f(x1)+'" y1="'+f(y1)+'" x2="'+f(x2)+'" y2="'+f(y2)+'" stroke="currentColor" stroke-width="2"'+(dash?' stroke-dasharray="'+dash+'"':"")+' stroke-linecap="round" />';
}
function text(x,y,t,size=11,anchor="middle",weight="400",cls=""){
  return '<text'+(cls?' class="'+cls+'"':"")+' x="'+f(x)+'" y="'+f(y)+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" fill="currentColor">'+esc(t)+'</text>';
}
export function renderSectorAreaDiagramP08F19(model){
  if(!valid(model)){
    const e=new Error("Sector-area diagram representation is invalid.");
    e.code="sector_area_diagram_p08f19_invalid";
    throw e;
  }
  const cx=120,cy=78,r=50,start=-90,end=start+model.centralAngleDeg;
  const a=point(cx,cy,r,start),b=point(cx,cy,r,end),large=model.centralAngleDeg>180?1:0;
  const sectorPath="M "+f(cx)+" "+f(cy)+" L "+f(a.x)+" "+f(a.y)+" A "+r+" "+r+" 0 "+large+" 1 "+f(b.x)+" "+f(b.y)+" Z";
  const markerR=20,ma=point(cx,cy,markerR,start),mb=point(cx,cy,markerR,end);
  const marker="M "+f(ma.x)+" "+f(ma.y)+" A "+markerR+" "+markerR+" 0 "+large+" 1 "+f(mb.x)+" "+f(mb.y);
  const mid=point(cx,cy,30,start+model.centralAngleDeg/2);
  const labelA=point(cx,cy,r+12,start),labelB=point(cx,cy,r+12,end);
  const measure=model.measurementMode==="RADIUS"
    ? [
        line(cx,cy,cx-r,cy,"sector-area-diagram__measure sector-area-diagram__radius","4 3"),
        text(cx,158,"半徑 "+model.radiusValue+" 公分",10,"middle","600","sector-area-diagram__measure-label")
      ].join("")
    : [
        line(cx-r,cy,cx+r,cy,"sector-area-diagram__measure sector-area-diagram__diameter","4 3"),
        text(cx,158,"直徑 "+model.diameterValue+" 公分",10,"middle","600","sector-area-diagram__measure-label")
      ].join("");
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--sector-area" data-representation="sector-area-diagram-p08f19" data-measurement-mode="'+model.measurementMode+'" data-visual-contract-version="P08F19_R1" data-central-angle-deg="'+esc(model.centralAngleDeg)+'">',
    '<svg class="worksheet-sector-area-diagram-p08f19" viewBox="0 0 240 190" width="100%" height="160" role="img" aria-label="陰影扇形面積圖" preserveAspectRatio="xMidYMid meet">',
    text(cx,16,"陰影部分＝要計算的扇形",12,"middle","700"),
    '<circle class="sector-area-diagram__whole-circle" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="currentColor" stroke-width="2.5" />',
    '<path class="sector-area-diagram__sector-fill" d="'+sectorPath+'" fill="currentColor" fill-opacity="0.12" stroke="none" />',
    '<path class="sector-area-diagram__sector-boundary" d="'+sectorPath+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />',
    '<path class="sector-area-diagram__angle-marker" d="'+marker+'" fill="none" stroke="currentColor" stroke-width="1.4" />',
    measure,
    '<circle class="sector-area-diagram__center" cx="'+cx+'" cy="'+cy+'" r="2.5" fill="currentColor" />',
    text(cx+7,cy+5,"O",10,"start","700","sector-area-diagram__center-label"),
    text(labelA.x,labelA.y,"A",10,"middle","700","sector-area-diagram__endpoint-label"),
    text(labelB.x,labelB.y,"B",10,"middle","700","sector-area-diagram__endpoint-label"),
    text(mid.x,mid.y+4,String(model.centralAngleDeg)+"°",10,"middle","700","sector-area-diagram__angle-label"),
    text(cx,180,"整圓＝360°；扇形面積＝圓面積×圓心角÷360",10,"middle","400","sector-area-diagram__formula-label"),
    "</svg></div>"
  ].join("");
}

function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
function point(cx,cy,r,deg){const a=(deg-90)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];}
function wedge(cx,cy,r,start,end){const [x1,y1]=point(cx,cy,r,start),[x2,y2]=point(cx,cy,r,end),large=end-start>180?1:0;return "M "+cx+" "+cy+" L "+x1.toFixed(2)+" "+y1.toFixed(2)+" A "+r+" "+r+" 0 "+large+" 1 "+x2.toFixed(2)+" "+y2.toFixed(2)+" Z";}
export function validatePieChartConstructionDataP08F21(m){
  if(!m||m.kind!=="pie_chart_construction_data_p08f21"||m.semanticCore!=="CONSTRUCT_PIE_CHART_FROM_CLASSIFIED_DATA_BY_PERCENT_AND_CENTRAL_ANGLE_ALLOCATION"||
    !["question","answer"].includes(m.phase)||!["COUNTS","PERCENTS"].includes(m.inputMode)||m.wholePercent!==100||m.wholeAngleDegrees!==360||
    m.startDirection!=="TWELVE_OCLOCK"||m.clockwise!==true||!Array.isArray(m.sectors)||m.sectors.length!==4)return false;
  return m.sectors.reduce((n,s)=>n+s.percent,0)===100&&Math.abs(m.sectors.reduce((n,s)=>n+s.centralAngleDegrees,0)-360)<1e-9&&
    m.sectors.every(s=>typeof s.label==="string"&&Number.isInteger(s.percent)&&s.percent>=10&&Number.isInteger(s.centralAngleDegrees)&&s.centralAngleDegrees===s.percent*3.6);
}
export function renderPieChartConstructionDataP08F21(m){
  if(!validatePieChartConstructionDataP08F21(m)){const e=new Error("Pie chart construction representation is invalid.");e.code="pie_chart_construction_data_p08f21_invalid";throw e;}
  const width=360,height=205,cx=92,cy=105,r=68,answer=m.phase==="answer";
  let start=0;
  const sectorMarkup=answer?m.sectors.map((s,i)=>{
    const end=start+s.centralAngleDegrees,mid=start+s.centralAngleDegrees/2,[tx,ty]=point(cx,cy,43,mid),opacity=[.18,.32,.46,.60][i];
    const out='<g class="worksheet-pie-construction__sector" data-sector-index="'+i+'"><path d="'+wedge(cx,cy,r,start,end)+'" fill="currentColor" fill-opacity="'+opacity+'" stroke="currentColor" stroke-width="1.4"/><text x="'+tx.toFixed(2)+'" y="'+(ty+3).toFixed(2)+'" text-anchor="middle" font-size="10" font-weight="700">'+esc(s.label)+'</text></g>';
    start=end;return out;
  }).join(""):[
    '<circle class="worksheet-pie-construction__blank-circle" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    '<line class="worksheet-pie-construction__start-radius" x1="'+cx+'" y1="'+cy+'" x2="'+cx+'" y2="'+(cy-r)+'" stroke="currentColor" stroke-width="1.6"/>',
    '<text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" font-size="10">作圖區</text>'
  ].join("");
  const legend=m.sectors.map((s,i)=>{
    const y=64+i*28;
    return answer
      ? '<text class="worksheet-pie-construction__legend-answer" x="190" y="'+y+'" font-size="10">'+esc(s.label)+'：'+s.percent+'% ｜ '+s.centralAngleDegrees+'°</text>'
      : '<text class="worksheet-pie-construction__legend-blank" x="190" y="'+y+'" font-size="10">'+esc(s.label)+'：____% ｜ ____°</text>';
  }).join("");
  return ['<div class="worksheet-cell__representation worksheet-cell__representation--chart" data-representation="pie-chart-construction-p08f21" data-phase="'+m.phase+'" data-visual-contract-version="P08F21_R1">','<svg class="worksheet-pie-construction-p08f21" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+esc(m.ariaLabel||m.title)+'" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;max-width:360px;height:auto;margin:.15rem auto;">','<title>'+esc(m.title)+'</title>','<text x="180" y="16" text-anchor="middle" font-size="11" font-weight="700">'+esc(m.title)+'</text>',sectorMarkup,legend,'<text x="180" y="195" text-anchor="middle" font-size="9">全體 = 100% = 360°</text>',"</svg>","</div>"].join("");
}

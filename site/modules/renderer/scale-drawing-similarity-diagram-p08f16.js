const esc=v=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const finitePoint=p=>p&&typeof p.label==="string"&&Number.isFinite(p.x)&&Number.isFinite(p.y);
function validate(m){
  if(!m||m.kind!=="scale_drawing_similarity_diagram")return false;
  if(!["CONSTRUCT","MISSING_VERTEX","VERIFY_SCALE","ANGLE_VALUE","ANGLE_LABEL","PARALLEL","SIMILAR_VERIFY"].includes(m.diagramMode))return false;
  if(!Array.isArray(m.sourcePoints)||m.sourcePoints.length<3||!m.sourcePoints.every(finitePoint))return false;
  if(!Array.isArray(m.targetPoints)||m.targetPoints.length!==m.sourcePoints.length||!m.targetPoints.every(finitePoint))return false;
  return Number.isFinite(m.factor)&&m.factor>0&&Number.isFinite(m.maxCoord)&&m.maxCoord>0&&m.sourceBackedScaleTransformation===true;
}
const scale=(p,x0,max)=>({x:x0+24+(p.x/max)*142,y:142-(p.y/max)*105});
function grid(x0,max){
  const lines=[];
  for(let i=0;i<=5;i++){const x=x0+24+i*(142/5),y=142-i*(105/5);lines.push('<line x1="'+x.toFixed(1)+'" y1="37" x2="'+x.toFixed(1)+'" y2="142" stroke="#d6d6d6" stroke-width="0.7"/>');lines.push('<line x1="'+(x0+24)+'" y1="'+y.toFixed(1)+'" x2="'+(x0+166)+'" y2="'+y.toFixed(1)+'" stroke="#d6d6d6" stroke-width="0.7"/>');}
  return lines.join("")+'<line x1="'+(x0+24)+'" y1="142" x2="'+(x0+170)+'" y2="142" stroke="currentColor" stroke-width="1.4"/><line x1="'+(x0+24)+'" y1="146" x2="'+(x0+24)+'" y2="32" stroke="currentColor" stroke-width="1.4"/><text x="'+(x0+170)+'" y="157" font-size="8">'+esc(max)+'</text>';
}
function drawShape(points,x0,max,{closed=true,dashed=false,highlightIndex=null,angleText=null,questionAtHighlight=false}={}){
  if(!points.length)return "";
  const xy=points.map(p=>scale(p,x0,max));
  const d=xy.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" ")+(closed?" Z":"");
  let s='<path d="'+d+'" fill="none" stroke="currentColor" stroke-width="2.2"'+(dashed?' stroke-dasharray="6 4"':"")+'/>';
  points.forEach((p,i)=>{const q=xy[i],hi=i===highlightIndex;s+='<circle cx="'+q.x.toFixed(1)+'" cy="'+q.y.toFixed(1)+'" r="'+(hi?5:3)+'" fill="white" stroke="currentColor" stroke-width="'+(hi?2.3:1.6)+'"/><text x="'+(q.x+6).toFixed(1)+'" y="'+(q.y-5).toFixed(1)+'" font-size="10" font-weight="'+(hi?700:500)+'">'+esc(p.label)+'</text>';if(hi&&angleText!=null)s+='<text x="'+(q.x+10).toFixed(1)+'" y="'+(q.y+13).toFixed(1)+'" font-size="10" font-weight="700">'+esc(questionAtHighlight?"?":angleText+"°")+'</text>';});
  return s;
}
export function renderScaleDrawingSimilarityDiagramP08F16(m){
  if(!validate(m))throw Object.assign(new Error("Q016 scale drawing similarity diagram invalid."),{code:"p08f16_scale_drawing_similarity_diagram_invalid"});
  const max=m.maxCoord,left=10,right=210,answer=m.answerKeyCompact===true;
  let source=drawShape(m.sourcePoints,left,max,{closed:true}),targetPoints=m.targetPoints,target="";
  if(m.diagramMode==="CONSTRUCT"){
    if(answer)target=drawShape(targetPoints,right,max,{closed:true});
    else target=drawShape([targetPoints[0]],right,max,{closed:false,dashed:true});
  }else if(m.diagramMode==="MISSING_VERTEX"){
    const known=targetPoints.filter((_,i)=>i!==m.missingIndex);
    target=answer?drawShape(targetPoints,right,max,{closed:true,highlightIndex:m.missingIndex}):drawShape(known,right,max,{closed:false,dashed:true});
  }else if(m.diagramMode==="VERIFY_SCALE"||m.diagramMode==="SIMILAR_VERIFY"){
    target=drawShape(m.candidatePoints??targetPoints,right,max,{closed:true,dashed:m.candidateValid===false});
  }else if(m.diagramMode==="ANGLE_VALUE"){
    source=drawShape(m.sourcePoints,left,max,{closed:true,highlightIndex:m.vertexIndex,angleText:m.angle});
    target=drawShape(targetPoints,right,max,{closed:true,highlightIndex:m.vertexIndex,angleText:m.angle,questionAtHighlight:!answer});
  }else if(m.diagramMode==="ANGLE_LABEL"){
    source=drawShape(m.sourcePoints,left,max,{closed:true,highlightIndex:m.vertexIndex});
    target=drawShape(targetPoints,right,max,{closed:true,highlightIndex:answer?m.vertexIndex:null});
  }else if(m.diagramMode==="PARALLEL"){
    target=drawShape(targetPoints,right,max,{closed:true});
  }
  const footer=m.diagramMode==="PARALLEL"?'<text x="210" y="181" text-anchor="middle" font-size="10">'+esc(m.pairA)+" 與 "+esc(m.pairB)+"</text>":'<text x="210" y="181" text-anchor="middle" font-size="10">比例 '+esc(m.factorLabel)+" 倍</text>";
  return '<div class="worksheet-cell__representation worksheet-cell__representation--scale-drawing-similarity" data-representation="scale-drawing-similarity-diagram" data-diagram-mode="'+esc(m.diagramMode)+'"><svg class="worksheet-scale-drawing-similarity-diagram" viewBox="0 0 420 190" width="100%" height="150" role="img" aria-label="放大圖縮圖與對應角示意圖" preserveAspectRatio="xMidYMid meet"><text x="105" y="18" text-anchor="middle" font-size="11" font-weight="700">原圖</text><text x="305" y="18" text-anchor="middle" font-size="11" font-weight="700">放大圖／縮圖</text>'+grid(left,max)+grid(right,max)+source+target+footer+'</svg></div>';
}

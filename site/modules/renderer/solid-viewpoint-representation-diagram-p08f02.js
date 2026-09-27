const MODES=new Set(["TURN_TO_FRONT_LABEL","TRACK_FRONT_FACE","COMPLETE_ROTATED_VIEW"]);
const SIDES=new Set(["RIGHT","LEFT"]),TURNS=new Set(["CLOCKWISE","COUNTERCLOCKWISE"]),LABELS=new Set(["甲","乙","丙","丁","戊","己"]);
function valid(m){return m?.kind==="solid_viewpoint_representation_diagram"&&Number.isInteger(m.variant)&&m.variant>=0&&m.variant<240&&Number.isInteger(m.profileIndex)&&m.profileIndex>=0&&m.profileIndex<=9&&MODES.has(m.diagramMode)&&SIDES.has(m.viewSide)&&TURNS.has(m.turnDirection)&&m.quarterTurns===1&&m.rotationAxis==="VERTICAL"&&LABELS.has(m.frontLabel)&&LABELS.has(m.sideLabel)&&LABELS.has(m.topLabel)&&new Set([m.frontLabel,m.sideLabel,m.topLabel]).size===3&&Number.isFinite(m.width)&&Number.isFinite(m.height)&&Number.isFinite(m.depth)&&m.compositionInvariant===true&&m.adjacencyInvariant===true&&m.pairedView===(m.diagramMode==="COMPLETE_ROTATED_VIEW");}
const f=n=>Number(n).toFixed(1);
function polygon(points,cls,label=""){
  const pts=points.map(p=>`${f(p.x)},${f(p.y)}`).join(" "),cx=points.reduce((s,p)=>s+p.x,0)/points.length,cy=points.reduce((s,p)=>s+p.y,0)/points.length;
  return `<g class="${cls}"><polygon points="${pts}" fill="currentColor" fill-opacity="0.035" stroke="currentColor" stroke-width="2.1"/>${label?`<text x="${f(cx)}" y="${f(cy)}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="700" stroke="white" stroke-width="4" paint-order="stroke">${label}</text>`:""}</g>`;
}
function solid(x,y,m,labels){
  const w=m.width,h=m.height,d=m.depth,sgn=m.viewSide==="RIGHT"?1:-1,front=[{x:x-w/2,y:y-h/2},{x:x+w/2,y:y-h/2},{x:x+w/2,y:y+h/2},{x:x-w/2,y:y+h/2}],dx=sgn*d,dy=-d*.55;
  const side=sgn>0?[front[1],{x:front[1].x+dx,y:front[1].y+dy},{x:front[2].x+dx,y:front[2].y+dy},front[2]]:[{x:front[0].x+dx,y:front[0].y+dy},front[0],front[3],{x:front[3].x+dx,y:front[3].y+dy}];
  const top=sgn>0?[{x:front[0].x+dx,y:front[0].y+dy},{x:front[1].x+dx,y:front[1].y+dy},front[1],front[0]]:[{x:front[0].x+dx,y:front[0].y+dy},front[0],front[1],{x:front[1].x+dx,y:front[1].y+dy}];
  const backTop=sgn>0?top[0]:top[3],backBottom={x:backTop.x,y:backTop.y+h};
  return `<g class="solid-viewpoint__solid">${polygon(top,"solid-viewpoint__face solid-viewpoint__face--top",labels.top)}${polygon(side,"solid-viewpoint__face solid-viewpoint__face--side",labels.side)}${polygon(front,"solid-viewpoint__face solid-viewpoint__face--front",labels.front)}<line x1="${f(backTop.x)}" y1="${f(backTop.y)}" x2="${f(backBottom.x)}" y2="${f(backBottom.y)}" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/></g>`;
}
function arrow(m,x,y){
  const cw=m.turnDirection==="CLOCKWISE";
  const path=cw?`M ${x-28} ${y} C ${x-12} ${y-22}, ${x+18} ${y-22}, ${x+30} ${y}`:`M ${x+28} ${y} C ${x+12} ${y-22}, ${x-18} ${y-22}, ${x-30} ${y}`;
  return `<g class="solid-viewpoint__turn" data-turn-direction="${m.turnDirection}"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.2" marker-end="url(#p08f02-arrow)"/><text x="${x}" y="${y+18}" text-anchor="middle" font-size="11">${cw?"順時針":"逆時針"} 90°</text></g>`;
}
function single(m){return `<g>${solid(132,104,m,{front:m.frontLabel,side:m.sideLabel,top:m.topLabel})}${arrow(m,132,30)}<text x="132" y="171" text-anchor="middle" font-size="11">轉動前</text></g>`;}
function paired(m){
  const afterSide=m.viewSide==="RIGHT"?"LEFT":"RIGHT",after={...m,viewSide:afterSide};
  return `<g><g transform="translate(-4 0)">${solid(88,104,{...m,width:m.width*.78,height:m.height*.82,depth:m.depth*.78},{front:m.frontLabel,side:m.sideLabel,top:m.topLabel})}<text x="88" y="171" text-anchor="middle" font-size="11">轉動前</text></g>${arrow(m,160,28)}<g transform="translate(106 0)">${solid(88,104,{...after,width:m.width*.78,height:m.height*.82,depth:m.depth*.78},{front:"?",side:"",top:m.topLabel})}<text x="88" y="171" text-anchor="middle" font-size="11">轉動後</text></g></g>`;
}
export function renderSolidViewpointRepresentationDiagram(model){
  if(!valid(model)){const e=new Error("Solid viewpoint representation diagram is invalid.");e.code="solid_viewpoint_representation_diagram_invalid";throw e;}
  return [
    `<div class="worksheet-cell__representation worksheet-cell__representation--solid-viewpoint" data-representation="solid-viewpoint-representation-diagram" data-diagram-mode="${model.diagramMode}" data-view-side="${model.viewSide}" data-turn-direction="${model.turnDirection}" data-quarter-turns="1">`,
    `<svg class="worksheet-solid-viewpoint-representation-diagram" viewBox="0 0 280 190" width="100%" height="150" role="img" aria-label="立體不同視角與旋轉圖示" preserveAspectRatio="xMidYMid meet"><defs><marker id="p08f02-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor"/></marker></defs>`,
    model.pairedView?paired(model):single(model),
    "</svg></div>"
  ].join("");
}

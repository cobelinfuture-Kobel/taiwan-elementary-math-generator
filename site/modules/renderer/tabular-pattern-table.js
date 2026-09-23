function escapeHtml(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function validCell(value){return typeof value==="string"||typeof value==="number";}
export function validateTabularPatternTable(model){
  if(!model||model.kind!=="tabular_pattern_table")return false;
  if(!Array.isArray(model.headers)||model.headers.length!==2||!model.headers.every(validCell))return false;
  if(!Array.isArray(model.rows)||model.rows.length<3||model.rows.length>6)return false;
  if(!model.rows.every(row=>row&&validCell(row.displayInput)&&validCell(row.displayOutput)))return false;
  return true;
}
export function renderTabularPatternTable(model){
  if(!validateTabularPatternTable(model)){
    const error=new Error("Tabular pattern table representation is invalid.");
    error.code="tabular_pattern_table_invalid";
    throw error;
  }
  const label=escapeHtml(model.ariaLabel??"階段與數量對應表");
  const head=model.headers.map(h=>`<th scope="col" style="border:1px solid currentColor;padding:.2rem .35rem;text-align:center;">${escapeHtml(h)}</th>`).join("");
  const body=model.rows.map(row=>`<tr><td style="border:1px solid currentColor;padding:.2rem .35rem;text-align:center;">${escapeHtml(row.displayInput)}</td><td style="border:1px solid currentColor;padding:.2rem .35rem;text-align:center;">${escapeHtml(row.displayOutput)}</td></tr>`).join("");
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--table" data-representation="tabular-pattern-table">',
    `<table class="worksheet-tabular-pattern-table" aria-label="${label}" style="border-collapse:collapse;width:100%;max-width:320px;margin:.35rem auto;font-size:.9em;">`,
    `<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
    "</div>"
  ].join("");
}

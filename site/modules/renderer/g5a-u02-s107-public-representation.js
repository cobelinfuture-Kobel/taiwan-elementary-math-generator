export const G5A_U02_S107_RENDER_KINDS = Object.freeze([
  "candidate_circle_selection_row",
  "symbolic_complete_factor_relation_table",
  "marked_common_factor_row",
]);
const KINDS = new Set(G5A_U02_S107_RENDER_KINDS);
export function isG5AU02S107RenderKind(kind) { return KINDS.has(kind); }

export function compactG5AU02S107Prompt(model) {
  if (model?.kind === "candidate_circle_selection_row") return `把 ${model.target} 的因數圈起來。`;
  if (model?.kind === "symbolic_complete_factor_relation_table") return "根據完整因數表與配對等式，求出各代號。";
  if (model?.kind === "marked_common_factor_row") return `圈出 ${model.comparedValues[0]} 和 ${model.comparedValues[1]} 的全部公因數，並找出最小與最大。`;
  return null;
}

function candidates(model, esc) {
  return `<div class="g5a-u02-s107-candidates">${(model.candidates ?? []).map((row) => `<span><i></i>${esc(row.text)}</span>`).join("")}</div>`;
}

export function renderG5AU02S107Representation(model, esc) {
  if (model.kind === "candidate_circle_selection_row") {
    return `<div class="g5a-u02-semantic-representation" data-g5a-u02-s107-kind="${esc(model.kind)}">${candidates(model, esc)}</div>`;
  }
  if (model.kind === "symbolic_complete_factor_relation_table") {
    const factorRows = (model.sequence ?? []).map((row) => `<span class="g5a-u02-s107-factor g5a-u02-s107-factor--${esc(row.role)}">${esc(row.text)}</span>`).join("");
    const relations = (model.relationRows ?? []).map((row) => `<div>${esc(row.text)}　${esc(row.responseText)}</div>`).join("");
    return `<div class="g5a-u02-semantic-representation" data-g5a-u02-s107-kind="${esc(model.kind)}"><div class="g5a-u02-s107-factors">${factorRows}</div><div class="g5a-u02-s107-relations">${relations}</div><small>${esc(model.targetRuleText)}</small></div>`;
  }
  if (model.kind === "marked_common_factor_row") {
    const roles = (model.rolePrompts ?? []).map((row) => `<span><b>${esc(row.label)}：</b>${esc(row.responseText)}</span>`).join("");
    return `<div class="g5a-u02-semantic-representation" data-g5a-u02-s107-kind="${esc(model.kind)}">${candidates(model, esc)}<div class="g5a-u02-s107-roles">${roles}</div></div>`;
  }
  return "";
}

export const G5A_U02_S107_STYLE = [
  '.g5a-u02-s107-candidates{display:flex;flex-wrap:wrap;gap:3px 8px}',
  '.g5a-u02-s107-candidates span{display:inline-flex;align-items:center;gap:2px;white-space:nowrap}',
  '.g5a-u02-s107-candidates i{width:.7rem;height:.7rem;border:1px solid #64717e;border-radius:50%}',
  '.g5a-u02-s107-factors{display:flex;flex-wrap:wrap;gap:2px}',
  '.g5a-u02-s107-factor{min-width:1.4rem;text-align:center;border:1px solid #aeb8c2;border-radius:3px;padding:1px 3px}',
  '.g5a-u02-s107-factor--unknown{font-weight:700;border-style:dashed}',
  '.g5a-u02-s107-relations,.g5a-u02-s107-roles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 5px}',
  '.g5a-u02-s107-relations div,.g5a-u02-s107-roles span{border-bottom:1px dotted #aeb8c2;white-space:nowrap}',
].join('');

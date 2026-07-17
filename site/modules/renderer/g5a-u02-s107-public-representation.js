export const G5A_U02_S107_RENDER_KINDS = Object.freeze([
  "candidate_circle_selection_row",
  "symbolic_complete_factor_relation_table",
  "marked_common_factor_row",
]);

const KIND_SET = new Set(G5A_U02_S107_RENDER_KINDS);

export function isG5AU02S107RenderKind(kind) {
  return KIND_SET.has(kind);
}

function emptyCircleRow(values, escapeHtml) {
  return (values ?? []).map((value) => (
    `<span class="g5a-u02-s107-candidate"><span class="g5a-u02-s107-empty-circle" aria-hidden="true"></span><span>${escapeHtml(value)}</span></span>`
  )).join("");
}

function candidateRepresentation(model, escapeHtml) {
  return `<div class="g5a-u02-semantic-representation g5a-u02-s107-candidates" data-g5a-u02-s107-kind="${escapeHtml(model.kind)}"><div class="g5a-u02-s107-candidate-row">${emptyCircleRow(model.candidates, escapeHtml)}</div></div>`;
}

function symbolicRepresentation(model, escapeHtml) {
  const sequence = (model.sequence ?? []).map((entry) => `<span class="g5a-u02-s107-factor-cell g5a-u02-s107-factor-cell--${escapeHtml(entry.role)}">${escapeHtml(entry.text)}</span>`).join("");
  const relations = (model.pairRelations ?? []).map((relation) => {
    const positions = relation.relationRole === "square_midpoint"
      ? `第 ${relation.leftPosition} 格（中央）`
      : `第 ${relation.leftPosition} 格 ↔ 第 ${relation.rightPosition} 格`;
    return `<span>${escapeHtml(positions)}：${escapeHtml(relation.leftText)} × ${escapeHtml(relation.rightText)} = 原數</span>`;
  }).join("");
  const equations = (model.symbolEquations ?? []).map((equation) => `<span class="g5a-u02-s107-equation">${escapeHtml(equation.text)}</span>`).join("");
  return `<div class="g5a-u02-semantic-representation g5a-u02-s107-symbolic" data-g5a-u02-s107-kind="${escapeHtml(model.kind)}"><div class="g5a-u02-s107-factor-table">${sequence}</div><div class="g5a-u02-s107-relation-grid">${relations}</div><div class="g5a-u02-s107-equation-grid">${equations}</div><div class="g5a-u02-semantic-note">${escapeHtml(model.targetRuleText)}</div><div class="g5a-u02-semantic-response">原數與代號：________________________________</div></div>`;
}

function factorSetCard(label, value, factors, escapeHtml) {
  return `<div class="g5a-u02-s107-factor-set"><strong>${escapeHtml(label)} ${escapeHtml(value)}</strong><span>因數：${escapeHtml((factors ?? []).join("、"))}</span></div>`;
}

function commonFactorRepresentation(model, escapeHtml) {
  return `<div class="g5a-u02-semantic-representation g5a-u02-s107-common" data-g5a-u02-s107-kind="${escapeHtml(model.kind)}"><div class="g5a-u02-s107-factor-sets">${factorSetCard("甲數", model.comparedValues?.[0], model.factorSetA, escapeHtml)}${factorSetCard("乙數", model.comparedValues?.[1], model.factorSetB, escapeHtml)}</div><div class="g5a-u02-s107-candidate-row g5a-u02-s107-common-row">${emptyCircleRow(model.candidateRow, escapeHtml)}</div><div class="g5a-u02-s107-minmax"><span>最小公因數：______</span><span>最大公因數：______</span></div></div>`;
}

export function renderG5AU02S107Representation(model, escapeHtml) {
  if (!model || !KIND_SET.has(model.kind)) return "";
  if (model.kind === "candidate_circle_selection_row") return candidateRepresentation(model, escapeHtml);
  if (model.kind === "symbolic_complete_factor_relation_table") return symbolicRepresentation(model, escapeHtml);
  return commonFactorRepresentation(model, escapeHtml);
}

export function compactG5AU02S107Prompt(model) {
  if (model?.kind === "candidate_circle_selection_row") return `在空圈做記號，選出 ${model.target} 的所有因數。`;
  if (model?.kind === "symbolic_complete_factor_relation_table") return "利用完整因數表的對稱位置與代號方程，求原數和所有代號。";
  if (model?.kind === "marked_common_factor_row") return `比較 ${model.comparedValues?.[0]} 和 ${model.comparedValues?.[1]} 的因數集合，圈出公因數。`;
  return null;
}

export const G5A_U02_S107_STYLE = [
  '.g5a-u02-s107-candidate-row{display:flex;flex-wrap:wrap;gap:3px 7px;align-items:center;}',
  '.g5a-u02-s107-candidate{display:inline-flex;align-items:center;gap:2px;font-size:.58rem;white-space:nowrap;}',
  '.g5a-u02-s107-empty-circle{display:inline-block;width:.72em;height:.72em;border:1px solid #596775;border-radius:50%;background:#fff;}',
  '.g5a-u02-s107-factor-table{display:flex;flex-wrap:wrap;gap:2px;align-items:center;}',
  '.g5a-u02-s107-factor-cell{min-width:20px;text-align:center;border:1px solid #aeb8c2;border-radius:3px;padding:1px 3px;font-size:.58rem;}',
  '.g5a-u02-s107-factor-cell--unknown{font-weight:700;border-style:dashed;}',
  '.g5a-u02-s107-relation-grid,.g5a-u02-s107-equation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px 5px;font-size:.5rem;line-height:1.05;}',
  '.g5a-u02-s107-equation{border-bottom:1px dotted #aeb8c2;}',
  '.g5a-u02-s107-factor-sets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px;}',
  '.g5a-u02-s107-factor-set{display:flex;flex-direction:column;border:1px solid #b9c3cd;border-radius:3px;padding:2px;font-size:.54rem;}',
  '.g5a-u02-s107-minmax{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;font-size:.54rem;}',
].join('');

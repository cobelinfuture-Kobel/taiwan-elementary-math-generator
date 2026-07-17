import {
  compactG5AU02S107Prompt,
  G5A_U02_S107_RENDER_KINDS,
  G5A_U02_S107_STYLE,
  isG5AU02S107RenderKind,
  renderG5AU02S107Representation,
} from "./g5a-u02-s107-public-representation.js";

const S106_ONLY_KINDS = Object.freeze([
  "factor_pair_search_stop_boundary",
  "u_shaped_factor_symmetry_record",
  "masked_factor_table_with_pair_cues",
]);

export const G5A_U02_S106_RENDER_KINDS = Object.freeze([
  ...S106_ONLY_KINDS,
  ...G5A_U02_S107_RENDER_KINDS,
]);

const KIND_SET = new Set(G5A_U02_S106_RENDER_KINDS);

export function isG5AU02S106RenderKind(kind) {
  return KIND_SET.has(kind);
}

export function compactG5AU02S106Prompt(model) {
  const s107Prompt = compactG5AU02S107Prompt(model);
  if (s107Prompt) return s107Prompt;
  if (model?.kind === "factor_pair_search_stop_boundary") {
    return `用乘法配對檢查 1 到 ${model.searchEnd}，列出 ${model.target} 的所有因數配對。`;
  }
  if (model?.kind === "u_shaped_factor_symmetry_record") {
    return `把 ${model.target} 的因數由小到大填入 U 型對稱記錄。`;
  }
  if (model?.kind === "masked_factor_table_with_pair_cues") {
    return `利用對稱位置相乘等於 ${model.target}，補回完整因數表。`;
  }
  return null;
}

function searchRepresentation(model, escapeHtml) {
  const rows = (model.searchRows ?? [])
    .filter((row) => row.searchStatus === "within_boundary")
    .map((row) => `<div class="g5a-u02-s106-search-row"><strong>${escapeHtml(row.candidateFactor)}</strong><span>×</span><span>______</span><span>= ${escapeHtml(model.target)}</span></div>`)
    .join("");
  return `<div class="g5a-u02-semantic-representation g5a-u02-s106-search" data-g5a-u02-s106-kind="${escapeHtml(model.kind)}"><div class="g5a-u02-s106-boundary">較小因數檢查範圍：1～${escapeHtml(model.searchEnd)}</div><div class="g5a-u02-s106-search-grid">${rows}</div><div class="g5a-u02-s106-stop">停止：候選 ${escapeHtml(model.crossingBoundary)} 已越過平方根界線。</div></div>`;
}

function symmetryRepresentation(model, escapeHtml) {
  const rows = (model.outerToInnerLinks ?? []).map((link) => {
    const middle = link.linkRole === "square_midpoint";
    const label = middle
      ? `第 ${escapeHtml(link.leftPosition)} 格（中央）`
      : `第 ${escapeHtml(link.leftPosition)} 格 ↔ 第 ${escapeHtml(link.rightPosition)} 格`;
    const equation = middle ? "______ × 自己" : "______ × ______";
    return `<div class="g5a-u02-s106-symmetry-row${middle ? " g5a-u02-s106-symmetry-row--middle" : ""}"><span class="g5a-u02-s106-position">${label}</span><span>${equation} = ${escapeHtml(model.target)}</span></div>`;
  }).join("");
  const midpoint = model.midpointPolicy === "single_square_root_center" ? "；中央因數只寫一次" : "";
  return `<div class="g5a-u02-semantic-representation g5a-u02-s106-symmetry" data-g5a-u02-s106-kind="${escapeHtml(model.kind)}"><div class="g5a-u02-s106-boundary">U 型配對：最外側依序連到內側${midpoint}</div><div class="g5a-u02-s106-symmetry-grid">${rows}</div></div>`;
}

function maskedRepresentation(model, escapeHtml) {
  const sequence = (model.sequence ?? []).map((entry) => `<span class="g5a-u02-s106-factor-cell g5a-u02-s106-factor-cell--${escapeHtml(entry.role)}" data-position="${escapeHtml(entry.position)}">${escapeHtml(entry.text)}</span>`).join("");
  const links = (model.pairLinks ?? []).map((link) => {
    const label = link.linkRole === "square_midpoint"
      ? `第 ${escapeHtml(link.leftPosition)} 格 × 自己`
      : `第 ${escapeHtml(link.leftPosition)} 格 × 第 ${escapeHtml(link.rightPosition)} 格`;
    return `<span>${label} = ${escapeHtml(model.target)}</span>`;
  }).join("");
  return `<div class="g5a-u02-semantic-representation g5a-u02-s106-masked" data-g5a-u02-s106-kind="${escapeHtml(model.kind)}"><div class="g5a-u02-s106-factor-table">${sequence}</div><div class="g5a-u02-s106-pair-cues">${links}</div></div>`;
}

export function renderG5AU02S106Representation(model, escapeHtml) {
  if (!model || !KIND_SET.has(model.kind)) return "";
  if (isG5AU02S107RenderKind(model.kind)) return renderG5AU02S107Representation(model, escapeHtml);
  if (model.kind === "factor_pair_search_stop_boundary") return searchRepresentation(model, escapeHtml);
  if (model.kind === "u_shaped_factor_symmetry_record") return symmetryRepresentation(model, escapeHtml);
  return maskedRepresentation(model, escapeHtml);
}

export const G5A_U02_S106_STYLE = [
  '.g5a-u02-s106-boundary{font-weight:700;font-size:.58rem;line-height:1.08;}',
  '.g5a-u02-s106-search-grid,.g5a-u02-s106-symmetry-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px 5px;}',
  '.g5a-u02-s106-search-row{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;gap:2px;border-bottom:1px dotted #b9c3cd;font-size:.56rem;white-space:nowrap;}',
  '.g5a-u02-s106-stop{font-size:.52rem;line-height:1.05;}',
  '.g5a-u02-s106-symmetry-row{display:flex;flex-direction:column;border:1px solid #c3ccd5;border-radius:3px;padding:2px;font-size:.54rem;line-height:1.08;}',
  '.g5a-u02-s106-symmetry-row--middle{border-style:dashed;}.g5a-u02-s106-position{font-weight:700;}',
  '.g5a-u02-s106-factor-table{display:flex;flex-wrap:wrap;gap:2px;}.g5a-u02-s106-factor-cell{min-width:20px;text-align:center;border:1px solid #aeb8c2;border-radius:3px;padding:1px 3px;font-size:.58rem;}',
  '.g5a-u02-s106-factor-cell--masked{border-style:dashed;font-weight:700;}',
  '.g5a-u02-s106-pair-cues{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px 4px;font-size:.5rem;line-height:1.05;}',
  G5A_U02_S107_STYLE,
].join('');

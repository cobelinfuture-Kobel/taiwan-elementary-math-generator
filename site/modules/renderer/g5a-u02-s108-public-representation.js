export const G5A_U02_S108_RENDER_KINDS = Object.freeze(["remainder_transfer_story_witness"]);
const KINDS = new Set(G5A_U02_S108_RENDER_KINDS);

export function isG5AU02S108RenderKind(kind) { return KINDS.has(kind); }
export function compactG5AU02S108Prompt(model) {
  return isG5AU02S108RenderKind(model?.kind) ? model.scenarioText : null;
}

export function renderG5AU02S108Representation(model, esc) {
  if (!isG5AU02S108RenderKind(model?.kind)) return "";
  const relation = model.divisorRelation ?? {};
  const known = model.distributionWitness?.knownDistribution ?? {};
  const transferred = model.distributionWitness?.transferredDistribution ?? {};
  const roles = model.quantityRoles ?? {};
  return [
    `<div class="g5a-u02-semantic-representation g5a-u02-s108-story" data-g5a-u02-s108-kind="${esc(model.kind)}" data-scenario-family="${esc(model.scenarioFamilyId)}">`,
    '<div class="g5a-u02-s108-role-grid">',
    `<span><b>總數</b>${esc(roles.total?.value)} ${esc(roles.total?.unitLabel)}</span>`,
    `<span><b>原分裝</b>每 ${esc(roles.largerDistribution?.groupSize)} ${esc(roles.largerDistribution?.unitLabel)}</span>`,
    `<span><b>改分裝</b>每 ${esc(roles.smallerDistribution?.groupSize)} ${esc(roles.smallerDistribution?.unitLabel)}</span>`,
    `<span><b>除數關係</b>${esc(relation.equationText)}</span>`,
    '</div>',
    '<div class="g5a-u02-s108-witness">',
    `<div>原分裝：${esc(known.equationText)}</div>`,
    `<div>改分裝：${esc(transferred.equationText)}</div>`,
    '</div>',
    `<div class="g5a-u02-semantic-response">餘數：${esc(model.remainder?.responseText)} ${esc(model.remainder?.unitLabel)}</div>`,
    '</div>',
  ].join("");
}

export const G5A_U02_S108_STYLE = [
  '.g5a-u02-s108-role-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 5px}',
  '.g5a-u02-s108-role-grid span{display:flex;gap:3px;border-bottom:1px dotted #aeb8c2;white-space:nowrap;overflow:hidden}',
  '.g5a-u02-s108-witness{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 5px}',
  '.g5a-u02-s108-witness div{border:1px solid #c5ccd3;border-radius:3px;padding:1px 3px;white-space:nowrap;overflow:hidden}',
  '.g5a-u02-density--high .g5a-u02-s108-role-grid,.g5a-u02-density--ultra .g5a-u02-s108-role-grid{grid-template-columns:repeat(4,minmax(0,1fr));font-size:.48rem}',
  '.g5a-u02-density--high .g5a-u02-s108-witness,.g5a-u02-density--ultra .g5a-u02-s108-witness{font-size:.47rem}',
].join('');

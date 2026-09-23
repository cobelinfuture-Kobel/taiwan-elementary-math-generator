function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function invalid() {
  const error = new Error("Fraction number-line representation is invalid.");
  error.code = "fraction_number_line_invalid";
  return error;
}
export function validateFractionNumberLineModel(model) {
  if (!model || model.kind !== "fraction_number_line") return false;
  if (!Array.isArray(model.ticks) || model.ticks.length < 2 || model.ticks.length > 25 || model.tickCount !== model.ticks.length) return false;
  if (!Array.isArray(model.points) || model.points.length < 1 || model.points.length > 2) return false;
  const validRational = (value) => Number.isSafeInteger(value?.numerator) && Number.isSafeInteger(value?.denominator) && value.denominator > 0;
  return model.ticks.every((tick, index) => tick && tick.index === index && validRational(tick) && typeof tick.label === "string")
    && model.points.every((point) => point && typeof point.label === "string" && point.label.length > 0 && Number.isInteger(point.tickIndex) && point.tickIndex >= 0 && point.tickIndex < model.ticks.length && validRational(point));
}
export function renderFractionNumberLine(model) {
  if (!validateFractionNumberLineModel(model)) throw invalid();
  const width = 420;
  const left = 24;
  const right = 396;
  const axisY = 56;
  const count = model.ticks.length;
  const xForIndex = (index) => left + ((right - left) * index) / (count - 1);
  const pointByIndex = new Map(model.points.map((point) => [point.tickIndex, point]));
  const labelStride = count > 13 ? 2 : 1;
  const tickMarkup = model.ticks.map((tick, index) => {
    const x = xForIndex(index).toFixed(2);
    const point = pointByIndex.get(index);
    const showTickLabel = index === 0 || index === count - 1 || index % labelStride === 0 || Boolean(point);
    return [
      `<line x1="${x}" y1="50" x2="${x}" y2="62" stroke="currentColor" stroke-width="1" />`,
      showTickLabel ? `<text x="${x}" y="76" text-anchor="middle" font-size="8">${escapeHtml(tick.label)}</text>` : "",
      point ? `<circle cx="${x}" cy="${axisY}" r="4" fill="currentColor" />` : "",
      point ? `<text x="${x}" y="40" text-anchor="middle" font-size="12" font-weight="700">${escapeHtml(point.label)}</text>` : "",
    ].join("");
  }).join("");
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--number-line" data-representation="fraction-number-line">',
    `<svg class="worksheet-number-line" viewBox="0 0 ${width} 84" role="img" aria-label="${escapeHtml(model.ariaLabel ?? "分數數線")}" preserveAspectRatio="xMidYMid meet">`,
    `<line x1="${left}" y1="${axisY}" x2="${right}" y2="${axisY}" stroke="currentColor" stroke-width="2" />`,
    tickMarkup,
    "</svg>",
    "</div>",
  ].join("");
}

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


function invalidIntegerNumberLine() {
  const error = new Error("Integer number-line representation is invalid.");
  error.code = "integer_number_line_invalid";
  return error;
}

export function validateIntegerNumberLineModel(model) {
  if (!model || model.kind !== "integer_number_line") return false;
  if (!Number.isInteger(model.startValue) || !Number.isInteger(model.step) || model.step <= 0) return false;
  if (!Number.isInteger(model.tickCount) || model.tickCount < 5 || model.tickCount > 25) return false;
  if (!Array.isArray(model.ticks) || model.ticks.length !== model.tickCount) return false;
  if (!Array.isArray(model.visibleAnchors) || model.visibleAnchors.length < 2) return false;
  if (!model.targetMarker || !Number.isInteger(model.targetMarker.tickIndex)) return false;
  if (model.targetMarker.tickIndex < 0 || model.targetMarker.tickIndex >= model.tickCount) return false;
  if (typeof model.targetMarker.markerId !== "string" || model.targetMarker.markerId.length === 0) return false;
  const expectedValue = (index) => model.startValue + index * model.step;
  if (model.ticks.some((tick, index) =>
    !tick || tick.index !== index || tick.value !== expectedValue(index) || typeof tick.label !== "string"
  )) return false;
  if (model.visibleAnchors.some((anchor) =>
    !anchor || !Number.isInteger(anchor.tickIndex) || anchor.tickIndex < 0 || anchor.tickIndex >= model.tickCount
    || anchor.value !== expectedValue(anchor.tickIndex)
  )) return false;
  if (new Set(model.visibleAnchors.map((anchor) => anchor.tickIndex)).size !== model.visibleAnchors.length) return false;
  const minValue = expectedValue(0);
  const maxValue = expectedValue(model.tickCount - 1);
  if (minValue < 0 || maxValue > 10000) return false;
  return true;
}

export function renderIntegerNumberLine(model) {
  if (!validateIntegerNumberLineModel(model)) throw invalidIntegerNumberLine();
  const width = 420;
  const left = 24;
  const right = 392;
  const axisY = 58;
  const xForIndex = (index) => left + ((right - left) * index) / (model.tickCount - 1);
  const anchorByIndex = new Map(model.visibleAnchors.map((anchor) => [anchor.tickIndex, anchor]));
  const targetIndex = model.targetMarker.tickIndex;
  const ticks = model.ticks.map((tick, index) => {
    const x = xForIndex(index).toFixed(2);
    const anchor = anchorByIndex.get(index);
    return [
      `<line x1="${x}" y1="51" x2="${x}" y2="65" stroke="currentColor" stroke-width="1.2" />`,
      anchor ? `<text x="${x}" y="80" text-anchor="middle" font-size="9">${escapeHtml(String(anchor.value))}</text>` : "",
    ].join("");
  }).join("");
  const targetX = xForIndex(targetIndex).toFixed(2);
  const markerSymbol = escapeHtml(model.targetMarker.symbol ?? "▼");
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--number-line" data-representation="integer-number-line">',
    `<svg class="worksheet-number-line" viewBox="0 0 ${width} 90" role="img" aria-label="${escapeHtml(model.ariaLabel ?? "整數數線")}" preserveAspectRatio="xMidYMid meet">`,
    `<line x1="${left}" y1="${axisY}" x2="${right}" y2="${axisY}" stroke="currentColor" stroke-width="2" />`,
    `<path d="M ${right} ${axisY} l -8 -4 l 0 8 z" fill="currentColor" />`,
    ticks,
    `<text x="${targetX}" y="38" text-anchor="middle" font-size="14" font-weight="700">${markerSymbol}</text>`,
    "</svg>",
    "</div>",
  ].join("");
}

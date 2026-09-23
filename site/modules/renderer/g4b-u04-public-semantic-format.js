const numberFormatter = new Intl.NumberFormat("zh-TW");

const PUBLIC_NUMERIC_ANSWER_SHAPES = new Set([
  "numericAnswer",
  "moneyAmountAnswer",
  "banknoteCountAnswer",
]);

function parseFormattedInteger(value) {
  const normalized = String(value ?? "").replaceAll(",", "");
  if (!/^\d+$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isSafeInteger(number) ? number : null;
}

function formatIntegerToken(value) {
  const number = parseFormattedInteger(value);
  return number === null ? String(value ?? "") : numberFormatter.format(number);
}

function exactQuantityStatement(quantityToken) {
  const quantity = parseFormattedInteger(quantityToken);
  if (quantity === null) return null;
  const formatted = numberFormatter.format(quantity);
  if (quantity <= 60) return `教室裡正好有 ${formatted} 張椅子。`;
  if (quantity <= 2000) return `禮堂裡正好有 ${formatted} 個座位。`;
  return `體育館裡正好有 ${formatted} 個座位。`;
}

function itemNameForContainer(containerName, itemUnit) {
  if (containerName === "書箱" || itemUnit === "本") return "書";
  if (containerName === "收納袋" || itemUnit === "頂") return "帽子";
  return "球";
}

function normalizeExactContext(text) {
  return text.replace(/教室裡正好有\s*([\d,]+)\s*張椅子。/g, (match, quantityToken) => (
    exactQuantityStatement(quantityToken) ?? match
  ));
}

function normalizeFloorPackingContext(text) {
  return text.replace(
    /有\s*([\d,]+)(顆|枝|本)，每\s*([\d,]+)\2\s*裝成一(盒|捆|袋)(橘子|鉛筆|球)，最多可以裝成幾\4完整的\5？/g,
    (match, total, itemUnit, groupSize, classifier, itemName) => (
      `有 ${formatIntegerToken(total)} ${itemUnit}${itemName}，每 ${formatIntegerToken(groupSize)} ${itemUnit}裝成一${classifier}，最多可以裝成幾${classifier}完整的${itemName}？`
    ),
  );
}

function normalizeCeilingPackingContext(text) {
  return text.replace(
    /有\s*([\d,]+)(顆|枝|本|頂)，每(個|盒|袋|捆)(紙箱|書箱|收納袋)最多裝\s*([\d,]+)\2，全部裝完至少需要幾\3\4？/g,
    (match, total, itemUnit, classifier, containerName, capacity) => {
      const itemName = itemNameForContainer(containerName, itemUnit);
      return `有 ${formatIntegerToken(total)} ${itemUnit}${itemName}，每${classifier}${containerName}最多裝 ${formatIntegerToken(capacity)} ${itemUnit}，全部裝完至少需要幾${classifier}${containerName}？`;
    },
  );
}

export function normalizeG4BU04PublicPrompt(value) {
  const text = String(value ?? "");
  return normalizeCeilingPackingContext(
    normalizeFloorPackingContext(
      normalizeExactContext(text),
    ),
  );
}

export function normalizeG4BU04PublicAnswer(value, answerModelShape) {
  const text = String(value ?? "");
  if (!PUBLIC_NUMERIC_ANSWER_SHAPES.has(answerModelShape)) return text;
  const match = text.match(/^([\d,]+)(.*)$/s);
  if (!match) return text;
  return `${formatIntegerToken(match[1])}${match[2]}`;
}

export function auditG4BU04PublicSemanticText(promptText, answerText, answerModelShape) {
  const normalizedPrompt = normalizeG4BU04PublicPrompt(promptText);
  const normalizedAnswer = normalizeG4BU04PublicAnswer(answerText, answerModelShape);
  const errors = [];
  if (/教室裡正好有\s*[\d,]{4,}\s*張椅子/.test(normalizedPrompt)) {
    errors.push("G4BU04_PUBLIC_CONTEXT_SCALE_INVALID");
  }
  if (/^\d{4,}(?:元|人|張|個|盒|袋|捆|月)?$/.test(normalizedAnswer)) {
    errors.push("G4BU04_PUBLIC_NUMBER_FORMAT_INVALID");
  }
  if (/有\s*[\d,]+(?:顆|枝|本|頂)，每/.test(normalizedPrompt)) {
    errors.push("G4BU04_PUBLIC_ITEM_NOUN_MISSING");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    promptText: normalizedPrompt,
    answerText: normalizedAnswer,
  });
}

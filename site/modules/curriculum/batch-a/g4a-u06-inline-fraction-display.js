import { validateInlineMathModel } from "../../renderer/inline-math.js";

export const G4A_U06_STRUCTURED_FRACTION_SOURCE_ID = "g4a_u06_4a06";
const FRACTION_TOKEN = /(?:(\d+)\s+)?(\d+)\/(\d+)/g;

function freezeRuns(runs) {
  return Object.freeze(runs.map((run) => Object.freeze(run)));
}

export function buildG4AU06InlineMathModel({ sourceId, plainText } = {}) {
  if (sourceId !== G4A_U06_STRUCTURED_FRACTION_SOURCE_ID) return null;
  const text = String(plainText ?? "");
  const runs = [];
  let cursor = 0;
  let fractionCount = 0;
  for (const match of text.matchAll(FRACTION_TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) runs.push({ kind: "text", value: text.slice(cursor, index) });
    const whole = match[1] === undefined ? null : Number(match[1]);
    const numerator = Number(match[2]);
    const denominator = Number(match[3]);
    runs.push(whole === null
      ? { kind: "fraction", numerator, denominator }
      : { kind: "mixed_fraction", whole, numerator, denominator });
    cursor = index + match[0].length;
    fractionCount += 1;
  }
  if (fractionCount === 0) return null;
  if (cursor < text.length) runs.push({ kind: "text", value: text.slice(cursor) });
  const model = Object.freeze({
    schemaName: "inline_math_v1",
    sourceId,
    plainText: text,
    runs: freezeRuns(runs),
  });
  const validation = validateInlineMathModel(model, text);
  if (!validation.ok) {
    const error = new Error("G4A-U06 inline fraction binding is invalid.");
    error.code = "g4a_u06_inline_fraction_binding_invalid";
    error.issues = validation.errors;
    throw error;
  }
  return model;
}

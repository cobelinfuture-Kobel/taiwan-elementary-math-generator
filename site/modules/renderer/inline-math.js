const SCHEMA_NAME = "inline_math_v1";
const ALLOWED_RUN_KINDS = new Set(["text", "fraction", "mixed_fraction"]);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function issue(code, path) {
  return Object.freeze({ code, path });
}

function validTextRun(run) {
  return typeof run.value === "string" && run.value.length > 0;
}

function validFractionRun(run) {
  return Number.isSafeInteger(run.numerator)
    && run.numerator >= 0
    && Number.isSafeInteger(run.denominator)
    && run.denominator > 0;
}

function validMixedFractionRun(run) {
  return Number.isSafeInteger(run.whole)
    && run.whole >= 1
    && Number.isSafeInteger(run.numerator)
    && run.numerator > 0
    && Number.isSafeInteger(run.denominator)
    && run.denominator > 0
    && run.numerator < run.denominator;
}

export function serializeInlineMathModel(model) {
  if (!model || !Array.isArray(model.runs)) return "";
  return model.runs.map((run) => {
    if (run.kind === "text") return run.value;
    if (run.kind === "fraction") return `${run.numerator}/${run.denominator}`;
    if (run.kind === "mixed_fraction") return `${run.whole} ${run.numerator}/${run.denominator}`;
    return "";
  }).join("");
}

export function validateInlineMathModel(model, expectedPlainText = undefined) {
  const errors = [];
  if (!model || typeof model !== "object") {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("inline_math_model_required", "")]) });
  }
  if (model.schemaName !== SCHEMA_NAME) errors.push(issue("inline_math_schema_invalid", "schemaName"));
  if (typeof model.sourceId !== "string" || model.sourceId.length === 0) errors.push(issue("inline_math_source_required", "sourceId"));
  if (typeof model.plainText !== "string") errors.push(issue("inline_math_plain_text_required", "plainText"));
  if (!Array.isArray(model.runs) || model.runs.length === 0) {
    errors.push(issue("inline_math_runs_required", "runs"));
  } else {
    model.runs.forEach((run, index) => {
      const path = `runs[${index}]`;
      if (!run || !ALLOWED_RUN_KINDS.has(run.kind)) errors.push(issue("inline_math_run_kind_invalid", `${path}.kind`));
      else if (run.kind === "text" && !validTextRun(run)) errors.push(issue("inline_math_text_run_invalid", path));
      else if (run.kind === "fraction" && !validFractionRun(run)) errors.push(issue("inline_math_fraction_run_invalid", path));
      else if (run.kind === "mixed_fraction" && !validMixedFractionRun(run)) errors.push(issue("inline_math_mixed_fraction_run_invalid", path));
    });
  }
  if (errors.length === 0 && serializeInlineMathModel(model) !== model.plainText) {
    errors.push(issue("inline_math_plain_text_mismatch", "plainText"));
  }
  if (expectedPlainText !== undefined && model.plainText !== String(expectedPlainText)) {
    errors.push(issue("inline_math_expected_text_mismatch", "plainText"));
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function renderFraction(run) {
  const ariaLabel = `${run.denominator} 分之 ${run.numerator}`;
  return [
    `<span class="math-fraction" role="math" aria-label="${escapeHtml(ariaLabel)}">`,
    `<span class="math-fraction__numerator" aria-hidden="true">${escapeHtml(run.numerator)}</span>`,
    `<span class="math-fraction__denominator" aria-hidden="true">${escapeHtml(run.denominator)}</span>`,
    "</span>",
  ].join("");
}

function renderMixedFraction(run) {
  const ariaLabel = `${run.whole} 又 ${run.denominator} 分之 ${run.numerator}`;
  return [
    `<span class="math-mixed-fraction" role="math" aria-label="${escapeHtml(ariaLabel)}">`,
    `<span class="math-mixed-fraction__whole" aria-hidden="true">${escapeHtml(run.whole)}</span>`,
    `<span aria-hidden="true">${renderFraction(run)}</span>`,
    "</span>",
  ].join("");
}

export function renderInlineMathModel(model, expectedPlainText = undefined) {
  const validation = validateInlineMathModel(model, expectedPlainText);
  if (!validation.ok) {
    const error = new Error("Inline math model is invalid.");
    error.code = "inline_math_model_invalid";
    error.issues = validation.errors;
    throw error;
  }
  const markup = model.runs.map((run) => {
    if (run.kind === "text") return escapeHtml(run.value);
    if (run.kind === "fraction") return renderFraction(run);
    return renderMixedFraction(run);
  }).join("");
  return `<span class="inline-math" data-inline-math-schema="${SCHEMA_NAME}" data-inline-math-source="${escapeHtml(model.sourceId)}">${markup}</span>`;
}

export const INLINE_MATH_SCHEMA_NAME = SCHEMA_NAME;

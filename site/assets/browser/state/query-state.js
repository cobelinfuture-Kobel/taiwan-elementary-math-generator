function integerParam(params, key, fallback) {
  const value = params.get(key);
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

export function parseQueryState(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    sourceId: params.get("sourceId") ?? undefined,
    questionCount: integerParam(params, "questionCount", undefined),
    ordering: params.get("ordering") ?? undefined,
    includeAnswerKey: params.get("answerKey") === null ? undefined : params.get("answerKey") === "1",
    generationSeed: params.get("generationSeed") ?? undefined,
    columns: integerParam(params, "columns", undefined),
    rowsPerPage: integerParam(params, "rowsPerPage", undefined)
  };
}

export function writeQueryStateFromState(state) {
  const nextUrl = new URL(window.location.href);
  nextUrl.search = "";
  nextUrl.searchParams.set("sourceId", state.batchA.sourceId);
  nextUrl.searchParams.set("questionCount", String(state.batchA.questionCount));
  nextUrl.searchParams.set("ordering", state.batchA.ordering);
  nextUrl.searchParams.set("answerKey", state.batchA.includeAnswerKey ? "1" : "0");
  nextUrl.searchParams.set("generationSeed", state.batchA.generationSeed);
  nextUrl.searchParams.set("columns", String(state.batchA.columns));
  nextUrl.searchParams.set("rowsPerPage", String(state.batchA.rowsPerPage));
  window.history.replaceState({}, "", nextUrl);
}

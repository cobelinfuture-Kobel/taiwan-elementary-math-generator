function uniqueSorted(values = []) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].sort();
}

export function buildQuestionTypeStateBootstrapUrl(url, row) {
  const next = new URL(url);
  next.searchParams.set("sourceId", row.sourceId);
  next.searchParams.set("selectionMode", row.selectionMode);
  next.searchParams.set("questionMode", row.questionType);
  next.searchParams.set("questionCount", String(row.requestedQuestionCount ?? 20));
  next.searchParams.set("answerKey", "1");
  next.searchParams.set("generationSeed", `pgc-r08-a04-a04-${row.routeIndex}`);
  next.searchParams.set("columns", "3");
  next.searchParams.set("rowsPerPage", "5");
  next.searchParams.set("pgcR08A04A04", String(row.routeIndex));

  next.searchParams.delete("kp");
  for (const knowledgePointId of uniqueSorted(row.selectedKnowledgePointIds ?? [])) {
    next.searchParams.append("kp", knowledgePointId);
  }

  next.searchParams.delete("pg");
  for (const patternGroupId of uniqueSorted(
    row.uiSelectablePatternGroupIds ?? row.publicPatternGroupIds ?? [],
  )) {
    next.searchParams.append("pg", patternGroupId);
  }

  if (row.depthMode !== null && row.depthMode !== undefined) {
    next.searchParams.set("depthMode", row.depthMode);
  }
  if (row.contextMode !== null && row.contextMode !== undefined) {
    next.searchParams.set("contextMode", row.contextMode);
  }
  return next.toString();
}

export function installQuestionTypeStateBootstrap(
  page,
  row,
  { onDisposition = () => {} } = {},
) {
  if (page.__pgcR08QuestionTypeStateBootstrapInstalled) return page;
  const originalGoto = page.goto.bind(page);
  let applied = false;

  page.goto = async (url, options) => {
    if (applied) return originalGoto(url, options);
    applied = true;
    const bootstrappedUrl = buildQuestionTypeStateBootstrapUrl(url, row);
    onDisposition({
      routeId: row.routeId,
      routeIndex: row.routeIndex,
      action: "CANONICAL_QUERY_STATE_BOOTSTRAPPED",
      questionType: row.questionType,
      selectedKnowledgePointIds: uniqueSorted(row.selectedKnowledgePointIds ?? []),
      uiSelectablePatternGroupIds: uniqueSorted(
        row.uiSelectablePatternGroupIds ?? row.publicPatternGroupIds ?? [],
      ),
      bootstrappedUrl,
    });
    return originalGoto(bootstrappedUrl, options);
  };

  Object.defineProperty(page, "__pgcR08QuestionTypeStateBootstrapInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
  });
  return page;
}

export function wrapBrowserWithQuestionTypeStateBootstrap(browser, row, options = {}) {
  return new Proxy(browser, {
    get(target, property, receiver) {
      if (property === "newPage") {
        return async (...args) => installQuestionTypeStateBootstrap(
          await target.newPage(...args),
          row,
          options,
        );
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

const PANEL = "#batch-a-pattern-group-panel";
const COUNT_INPUT = "#batch-a-question-count-input";
const QUESTION_TYPE = "#g5a-u08-question-mode";
const DEPTH_MODE = "#g5a-u08-depth-mode";
const CONTEXT_MODE = "#g5a-u08-context-mode";
const KP_PANEL = "#batch-a-knowledge-point-panel";
const DRAIN_SELECTOR = `${PANEL} [data-pattern-group-id][data-selected="true"]:not([data-compatible="true"]):not([hidden])`;
const SELECT_SELECTOR = `${PANEL} [data-pattern-group-id][data-compatible="true"][data-selected="false"]:not([hidden]):not([disabled])`;
const ALL_SELECTOR = `${PANEL} [data-pattern-group-id]`;

function cssEscape(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function sortedUnique(values = []) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].sort();
}

function sameValues(left = [], right = []) {
  return JSON.stringify(sortedUnique(left)) === JSON.stringify(sortedUnique(right));
}

async function armRuntimeAliasRouteIdentityProjection(page, row, onDisposition) {
  const runtimePatternGroupIds = sortedUnique(row.publicPatternGroupIds ?? []);
  const uiPatternGroupIds = sortedUnique(row.uiSelectablePatternGroupIds ?? runtimePatternGroupIds);
  if (sameValues(runtimePatternGroupIds, uiPatternGroupIds)) return;

  await page.addInitScript(({ selectors, target }) => {
    const uniqueSorted = (values = []) => [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].sort();
    const same = (left = [], right = []) => JSON.stringify(uniqueSorted(left)) === JSON.stringify(uniqueSorted(right));
    let projecting = false;

    function selectedIds(panelSelector, attribute) {
      const panel = document.querySelector(panelSelector);
      if (!panel) return [];
      const property = attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      return [...panel.querySelectorAll(`[data-${attribute}][data-selected="true"]`)]
        .map((node) => node.dataset[property])
        .filter(Boolean)
        .sort();
    }

    function controlValue(selector) {
      return document.querySelector(selector)?.value ?? null;
    }

    function exactPublicStateMatches() {
      if (!same(selectedIds(selectors.patternGroupPanel, "pattern-group-id"), target.uiPatternGroupIds)) return false;
      if (!same(selectedIds(selectors.knowledgePointPanel, "knowledge-point-id"), target.knowledgePointIds)) return false;
      if (controlValue(selectors.questionType) !== target.questionType) return false;
      if (target.depthMode !== null && controlValue(selectors.depthMode) !== target.depthMode) return false;
      if (target.contextMode !== null && controlValue(selectors.contextMode) !== target.contextMode) return false;
      return true;
    }

    function project() {
      if (projecting || !exactPublicStateMatches()) return;
      const input = document.querySelector(selectors.countInput);
      if (!input) return;
      const current = String(input.dataset.capacityRouteIds ?? "").split(",").map((item) => item.trim()).filter(Boolean).sort();
      if (current.length === 1 && current[0] === target.routeId) return;
      projecting = true;
      try {
        input.dataset.capacityRouteIds = target.routeId;
        input.dataset.pgcR08RuntimeAliasRouteIdentity = "projected";
        document.dispatchEvent(new CustomEvent("pgc-r08:runtime-alias-route-identity-projected", {
          detail: {
            routeId: target.routeId,
            runtimePatternGroupIds: target.runtimePatternGroupIds,
            uiPatternGroupIds: target.uiPatternGroupIds,
          },
        }));
      } finally {
        projecting = false;
      }
    }

    document.addEventListener("public:capability-binding", () => queueMicrotask(project));
    document.addEventListener("DOMContentLoaded", () => {
      const observer = new MutationObserver(() => queueMicrotask(project));
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-selected", "data-capacity-route-ids"],
      });
      for (const selector of [selectors.questionType, selectors.depthMode, selectors.contextMode]) {
        document.querySelector(selector)?.addEventListener("change", () => queueMicrotask(project));
      }
      queueMicrotask(project);
    }, { once: true });
  }, {
    selectors: {
      patternGroupPanel: PANEL,
      knowledgePointPanel: KP_PANEL,
      countInput: COUNT_INPUT,
      questionType: QUESTION_TYPE,
      depthMode: DEPTH_MODE,
      contextMode: CONTEXT_MODE,
    },
    target: {
      routeId: row.routeId,
      runtimePatternGroupIds,
      uiPatternGroupIds,
      knowledgePointIds: sortedUnique(row.selectedKnowledgePointIds ?? []),
      questionType: row.questionType,
      depthMode: row.depthMode ?? null,
      contextMode: row.contextMode ?? null,
    },
  });

  onDisposition({
    routeId: row.routeId,
    runtimePatternGroupIds,
    uiPatternGroupIds,
    action: "RUNTIME_ALIAS_ROUTE_IDENTITY_PROJECTION_ARMED",
  });
}

export async function installExactPatternGroupBinder(page, row, { onDisposition = () => {} } = {}) {
  if (page.__pgcR08ExactPatternGroupBinderInstalled) return page;
  const targetIds = new Set(row.uiSelectablePatternGroupIds ?? row.publicPatternGroupIds ?? []);
  const originalLocator = page.locator.bind(page);

  await armRuntimeAliasRouteIdentityProjection(page, row, onDisposition);

  async function snapshot() {
    return originalLocator(ALL_SELECTOR).evaluateAll((nodes) => nodes.map((node) => ({
      id: node.dataset.patternGroupId ?? "",
      selected: node.dataset.selected === "true",
      hidden: Boolean(node.hidden) || getComputedStyle(node).display === "none",
      disabled: Boolean(node.disabled) || node.getAttribute("aria-disabled") === "true",
    })));
  }

  async function nextOperation() {
    const rows = await snapshot();
    const target = [...targetIds]
      .map((id) => rows.find((item) => item.id === id))
      .find((item) => item && !item.selected && !item.hidden && !item.disabled);
    if (target) return { id: target.id, action: "SELECT_EXACT_TARGET" };
    const nonTarget = rows.find((item) => item.selected && !targetIds.has(item.id) && !item.hidden && !item.disabled);
    if (nonTarget) return { id: nonTarget.id, action: "DESELECT_NON_TARGET" };
    return null;
  }

  function exactOperationLocator() {
    const api = {
      first: () => api,
      count: async () => (await nextOperation()) ? 1 : 0,
      isDisabled: async () => {
        const operation = await nextOperation();
        return operation ? originalLocator(`${PANEL} [data-pattern-group-id="${cssEscape(operation.id)}"]`).isDisabled() : false;
      },
      getAttribute: async (name) => {
        const operation = await nextOperation();
        if (!operation) return null;
        if (name === "data-pattern-group-id") return operation.id;
        return originalLocator(`${PANEL} [data-pattern-group-id="${cssEscape(operation.id)}"]`).getAttribute(name);
      },
      click: async (...args) => {
        const operation = await nextOperation();
        if (!operation) throw new Error("PGC_R08_EXACT_PATTERN_GROUP_OPERATION_MISSING");
        await originalLocator(`${PANEL} [data-pattern-group-id="${cssEscape(operation.id)}"]`).click(...args);
        onDisposition({ routeId: row.routeId, patternGroupId: operation.id, action: operation.action });
      },
    };
    return api;
  }

  page.locator = (selector, ...args) => {
    if (selector === DRAIN_SELECTOR) {
      return { first() { return this; }, async count() { return 0; } };
    }
    if (selector === SELECT_SELECTOR) return exactOperationLocator();
    return originalLocator(selector, ...args);
  };

  Object.defineProperty(page, "__pgcR08ExactPatternGroupBinderInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
  });
  return page;
}

export function wrapBrowserWithExactPatternGroupBinder(browser, row, options = {}) {
  return new Proxy(browser, {
    get(target, property, receiver) {
      if (property === "newPage") {
        return async (...args) => installExactPatternGroupBinder(await target.newPage(...args), row, options);
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

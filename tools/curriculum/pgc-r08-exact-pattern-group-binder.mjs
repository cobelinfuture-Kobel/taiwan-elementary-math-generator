const PANEL = "#batch-a-pattern-group-panel";
const DRAIN_SELECTOR = `${PANEL} [data-pattern-group-id][data-selected="true"]:not([data-compatible="true"]):not([hidden])`;
const SELECT_SELECTOR = `${PANEL} [data-pattern-group-id][data-compatible="true"][data-selected="false"]:not([hidden]):not([disabled])`;
const ALL_SELECTOR = `${PANEL} [data-pattern-group-id]`;

function cssEscape(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export function installExactPatternGroupBinder(page, row, { onDisposition = () => {} } = {}) {
  if (page.__pgcR08ExactPatternGroupBinderInstalled) return page;
  const targetIds = new Set(row.uiSelectablePatternGroupIds ?? row.publicPatternGroupIds ?? []);
  const originalLocator = page.locator.bind(page);

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

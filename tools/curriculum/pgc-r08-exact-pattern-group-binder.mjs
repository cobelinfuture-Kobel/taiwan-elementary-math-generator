const PANEL = "#batch-a-pattern-group-panel";
const DRAIN_SELECTOR = `${PANEL} [data-pattern-group-id][data-selected="true"]:not([data-compatible="true"]):not([hidden])`;
const SELECT_SELECTOR = `${PANEL} [data-pattern-group-id][data-compatible="true"][data-selected="false"]:not([hidden]):not([disabled])`;
const ALL_SELECTOR = `${PANEL} [data-pattern-group-id]`;

function cssEscape(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export function installExactPatternGroupBinder(page, row, { onDisposition = () => {} } = {}) {
  if (page.__pgcR08ExactPatternGroupBinderInstalled) return page;
  const targetIds = new Set(row.publicPatternGroupIds ?? []);
  const originalLocator = page.locator.bind(page);

  async function snapshot() {
    return originalLocator(ALL_SELECTOR).evaluateAll((nodes) => nodes.map((node) => ({
      id: node.dataset.patternGroupId ?? "",
      selected: node.dataset.selected === "true",
      compatible: node.dataset.compatible === "true",
      hidden: Boolean(node.hidden) || getComputedStyle(node).display === "none",
      disabled: Boolean(node.disabled) || node.getAttribute("aria-disabled") === "true",
    })));
  }

  function exactCandidateLocator(kind) {
    const candidateId = async () => {
      const rows = await snapshot();
      if (kind === "drain") {
        return rows.find((item) => item.selected && !targetIds.has(item.id) && !item.hidden)?.id ?? null;
      }
      return [...targetIds]
        .map((id) => rows.find((item) => item.id === id))
        .find((item) => item && !item.selected && !item.hidden && !item.disabled)?.id ?? null;
    };
    const api = {
      first: () => api,
      count: async () => (await candidateId()) ? 1 : 0,
      isDisabled: async () => {
        const id = await candidateId();
        return id ? originalLocator(`${PANEL} [data-pattern-group-id="${cssEscape(id)}"]`).isDisabled() : false;
      },
      getAttribute: async (name) => {
        const id = await candidateId();
        if (!id) return null;
        if (name === "data-pattern-group-id") return id;
        return originalLocator(`${PANEL} [data-pattern-group-id="${cssEscape(id)}"]`).getAttribute(name);
      },
      click: async (...args) => {
        const id = await candidateId();
        if (!id) throw new Error(`PGC_R08_EXACT_PATTERN_GROUP_${kind.toUpperCase()}_CANDIDATE_MISSING`);
        await originalLocator(`${PANEL} [data-pattern-group-id="${cssEscape(id)}"]`).click(...args);
        onDisposition({ routeId: row.routeId, patternGroupId: id, action: kind === "drain" ? "DESELECT_NON_TARGET" : "SELECT_EXACT_TARGET" });
      },
    };
    return api;
  }

  page.locator = (selector, ...args) => {
    if (selector === DRAIN_SELECTOR) return exactCandidateLocator("drain");
    if (selector === SELECT_SELECTOR) return exactCandidateLocator("select");
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

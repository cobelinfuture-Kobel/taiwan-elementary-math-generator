export const DISABLED_CONTROL_POLICY_CODES = Object.freeze({
  ENABLED_SELECTION: "ENABLED_SELECTION",
  DISABLED_CURRENT_VALUE_MATCH: "DISABLED_CURRENT_VALUE_MATCH",
  DISABLED_VALUE_MISMATCH: "DISABLED_VALUE_MISMATCH",
});

function makeMismatchError(details) {
  const error = new Error("PGC_R08_BROWSER_DISABLED_CONTROL_VALUE_MISMATCH");
  error.details = details;
  return error;
}

export function installDisabledCurrentValueSelectionPolicy(page, { onDisposition = () => {} } = {}) {
  if (page.__pgcR08DisabledControlPolicyInstalled) return page;
  const originalSelectOption = page.selectOption.bind(page);

  page.selectOption = async (selector, requestedValue, options) => {
    if (typeof selector !== "string" || typeof requestedValue !== "string") {
      return originalSelectOption(selector, requestedValue, options);
    }

    const locator = page.locator(selector);
    const disabled = await locator.isDisabled();
    if (!disabled) {
      const result = await originalSelectOption(selector, requestedValue, options);
      onDisposition({
        selector,
        requestedValue,
        actualValue: await locator.inputValue(),
        disposition: DISABLED_CONTROL_POLICY_CODES.ENABLED_SELECTION,
        mutationPerformed: true,
      });
      return result;
    }

    const actualValue = await locator.inputValue();
    if (actualValue === requestedValue) {
      onDisposition({
        selector,
        requestedValue,
        actualValue,
        disposition: DISABLED_CONTROL_POLICY_CODES.DISABLED_CURRENT_VALUE_MATCH,
        mutationPerformed: false,
      });
      return [actualValue];
    }

    const details = {
      selector,
      requestedValue,
      actualValue,
      disposition: DISABLED_CONTROL_POLICY_CODES.DISABLED_VALUE_MISMATCH,
      mutationPerformed: false,
    };
    onDisposition(details);
    throw makeMismatchError(details);
  };

  Object.defineProperty(page, "__pgcR08DisabledControlPolicyInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
  });
  return page;
}

export function wrapBrowserWithDisabledCurrentValueSelectionPolicy(
  browser,
  { onDisposition = () => {} } = {},
) {
  return new Proxy(browser, {
    get(target, property, receiver) {
      if (property === "newPage") {
        return async (...args) =>
          installDisabledCurrentValueSelectionPolicy(
            await target.newPage(...args),
            { onDisposition },
          );
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

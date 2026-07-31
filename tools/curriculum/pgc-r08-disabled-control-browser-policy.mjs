function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function requestedScalar(values) {
  if (typeof values === "string") return values;
  if (Array.isArray(values) && values.length === 1 && typeof values[0] === "string") {
    return values[0];
  }
  return null;
}

export function classifyDisabledControlSelection({ disabled, currentValue, requestedValue }) {
  if (!disabled) return "SELECT_REQUIRED";
  if (currentValue === requestedValue) return "ACCEPT_CURRENT_VALUE";
  return "FAIL_DISABLED_VALUE_MISMATCH";
}

export function wrapPageWithDisabledControlSelectionPolicy(page) {
  const originalSelectOption = page.selectOption.bind(page);
  return new Proxy(page, {
    get(target, property, receiver) {
      if (property === "selectOption") {
        return async (selector, values, options) => {
          const requestedValue = requestedScalar(values);
          if (requestedValue === null) {
            return originalSelectOption(selector, values, options);
          }
          const locator = target.locator(selector);
          await locator.waitFor({ state: "attached", timeout: options?.timeout ?? 120000 });
          const disabled = await locator.isDisabled();
          const currentValue = await locator.inputValue();
          const classification = classifyDisabledControlSelection({
            disabled,
            currentValue,
            requestedValue,
          });
          if (classification === "ACCEPT_CURRENT_VALUE") {
            return [currentValue];
          }
          if (classification === "FAIL_DISABLED_VALUE_MISMATCH") {
            fail("PGC_R08_DISABLED_CONTROL_VALUE_MISMATCH", {
              selector,
              requestedValue,
              currentValue,
              disabled,
            });
          }
          return originalSelectOption(selector, values, options);
        };
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export function wrapBrowserWithDisabledControlSelectionPolicy(browser) {
  return new Proxy(browser, {
    get(target, property, receiver) {
      if (property === "newPage") {
        return async (...args) => wrapPageWithDisabledControlSelectionPolicy(
          await target.newPage(...args),
        );
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

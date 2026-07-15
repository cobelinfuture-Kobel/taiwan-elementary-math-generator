import assert from "node:assert/strict";
import test from "node:test";

import {
  G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS,
  syncG4BU04ClassicPublicControls,
} from "../../site/assets/browser/g4b-u04-public-controls.js";

const SOURCE_ID = "g4b_u04_4b04";
const LAYOUT_HYDRATED_KEY = "g4bU04QueryHydrated";

function createOption(value) {
  return {
    value,
    dataset: {},
    remove() {},
  };
}

function createSelect(value, optionValues = []) {
  const options = optionValues.map(createOption);
  return {
    value,
    options,
    dataset: {},
    append(option) {
      options.push(option);
    },
    insertBefore(option, before) {
      const index = before ? options.indexOf(before) : -1;
      if (index < 0) options.push(option);
      else options.splice(index, 0, option);
    },
    addEventListener() {},
    dispatchEvent() {},
  };
}

function createClassicRoot({
  sourceId = SOURCE_ID,
  layoutMode = "auto_safe",
} = {}) {
  const source = createSelect(sourceId, [SOURCE_ID, "g5a_u08_5a08"]);
  const proxyQuestionMode = createSelect("mixed", ["mixed", "concept", "operation_estimation"]);
  const proxyContextMode = createSelect("mixed", ["mixed", "daily_life", "sdg"]);
  const layoutSelect = createSelect(layoutMode, ["auto_safe", "custom_with_caps"]);
  const elements = new Map([
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.source, source],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.sourceHelp, { textContent: "" }],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.selectionMode, createSelect("mixedKnowledgePointsSameUnit")],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyQuestionMode, proxyQuestionMode],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyContextMode, proxyContextMode],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.section, { dataset: {} }],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.questionMode, createSelect("mixed")],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.contextMode, createSelect("mixed")],
    [G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.layoutMode, layoutSelect],
  ]);
  return {
    source,
    layoutSelect,
    root: {
      getElementById(id) {
        return elements.get(id) ?? null;
      },
    },
  };
}

function withWindow(href, callback) {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { href } };
  try {
    return callback();
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
}

test("R2F4 Classic first activation hydrates custom_with_caps from the URL before the DOM default", () => {
  withWindow(`https://example.test/math?sourceId=${SOURCE_ID}&layoutMode=custom_with_caps`, () => {
    const { root, layoutSelect } = createClassicRoot({ layoutMode: "auto_safe" });
    const first = syncG4BU04ClassicPublicControls(root);
    assert.equal(first.active, true);
    assert.equal(first.layoutMode, "custom_with_caps");
    assert.equal(layoutSelect.value, "custom_with_caps");
    assert.equal(layoutSelect.dataset[LAYOUT_HYDRATED_KEY], "true");

    layoutSelect.value = "auto_safe";
    const second = syncG4BU04ClassicPublicControls(root);
    assert.equal(second.layoutMode, "auto_safe");
    assert.equal(layoutSelect.value, "auto_safe");
  });
});

test("R2F4 Classic without a layout query keeps auto_safe and preserves a later user selection", () => {
  withWindow(`https://example.test/math?sourceId=${SOURCE_ID}`, () => {
    const { root, layoutSelect } = createClassicRoot({ layoutMode: "auto_safe" });
    const first = syncG4BU04ClassicPublicControls(root);
    assert.equal(first.layoutMode, "auto_safe");
    assert.equal(layoutSelect.dataset[LAYOUT_HYDRATED_KEY], "true");

    layoutSelect.value = "custom_with_caps";
    const second = syncG4BU04ClassicPublicControls(root);
    assert.equal(second.layoutMode, "custom_with_caps");
    assert.equal(layoutSelect.value, "custom_with_caps");
  });
});

test("R2F4 Classic delays query hydration until G4B-U04 becomes the active source", () => {
  withWindow("https://example.test/math?layoutMode=custom_with_caps", () => {
    const { root, source, layoutSelect } = createClassicRoot({
      sourceId: "g5a_u08_5a08",
      layoutMode: "auto_safe",
    });
    const inactive = syncG4BU04ClassicPublicControls(root);
    assert.equal(inactive.active, false);
    assert.equal(inactive.layoutMode, "auto_safe");
    assert.equal(layoutSelect.dataset[LAYOUT_HYDRATED_KEY], undefined);

    source.value = SOURCE_ID;
    const active = syncG4BU04ClassicPublicControls(root);
    assert.equal(active.active, true);
    assert.equal(active.layoutMode, "custom_with_caps");
    assert.equal(layoutSelect.value, "custom_with_caps");
    assert.equal(layoutSelect.dataset[LAYOUT_HYDRATED_KEY], "true");
  });
});

export function parseQueryState(search = window.location.search) {
  const params = new URLSearchParams(search);

  return {
    presetId: params.get("preset") ?? undefined,
    generationSeed: params.get("generationSeed") ?? undefined,
    orderingSeed: params.get("orderingSeed") ?? undefined,
    lockOrderingSeedToGenerationSeed: params.get("lockOrderingSeed") === "1",
    showAnswerKeyPage: params.get("answerKey") === "1"
  };
}

export function writeQueryStateFromState(state) {
  const nextUrl = new URL(window.location.href);
  nextUrl.search = "";

  nextUrl.searchParams.set("preset", state.presetId);
  nextUrl.searchParams.set("generationSeed", state.seeds.generationSeed);

  if (state.seeds.orderingSeed) {
    nextUrl.searchParams.set("orderingSeed", state.seeds.orderingSeed);
  }

  if (state.seeds.lockOrderingSeedToGenerationSeed) {
    nextUrl.searchParams.set("lockOrderingSeed", "1");
  }

  if (state.draftConfig.printLayout.showAnswerKeyPage) {
    nextUrl.searchParams.set("answerKey", "1");
  }

  window.history.replaceState(null, "", nextUrl);
}

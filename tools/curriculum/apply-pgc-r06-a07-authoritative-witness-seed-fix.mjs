import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const marker = "PGC-R06 A07 authoritative capacity witness replay";

function patch(relativePath, replacements) {
  const targetPath = path.join(repoRoot, relativePath);
  let source = fs.readFileSync(targetPath, "utf8");
  if (source.includes(marker)) return false;
  for (const [before, after, label] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) throw new Error(`PGC_R06_A07_WITNESS_ANCHOR_MISSING:${relativePath}:${label}`);
    source = source.replace(before, after);
  }
  fs.writeFileSync(targetPath, `${source.trimEnd()}\n\n// ${marker}\n`);
  return true;
}

const materializerAnchor = `function diagnoseRoute(route) {
  const seedA = \`pgc-r06-a07:\${route.routeId}:A\`;
  const seedB = \`pgc-r06-a07:\${route.routeId}:B\`;
  const first = runRoute(route, seedA);
  const replay = runRoute(route, seedA);
  const second = runRoute(route, seedB);
  const binding = resolveRouteBinding(route);
  const accepted = [first, replay, second].every((run) => run.ok
      && run.questionCount === QUESTION_COUNT
      && run.answerKeyItemCount === QUESTION_COUNT
      && run.missingPromptCount === 0
      && run.duplicatePromptCount === 0
      && run.uniquePromptCount === QUESTION_COUNT)
    && replay.orderedWorksheetSignature === first.orderedWorksheetSignature
    && second.itemSetSignature !== first.itemSetSignature
    && binding.blocked === false
    && binding.questionCountMax === 240
    && binding.capacityRouteMatched === true
    && binding.capacityTaskId === A06_TASK_ID;
  return {
    routeId: route.routeId,
    caseId: route.caseId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    accepted,
    first,
    replay,
    second,
    binding,
  };
}`;

const materializerReplacement = `function acceptedWitnessRuns(route) {
  const evidence = route.selectedCapacityEvidence;
  const runs = (evidence?.runs ?? []).filter((run) => run?.seed
    && run?.ok === true
    && run?.questionCount === QUESTION_COUNT
    && run?.answerKeyItemCount === QUESTION_COUNT
    && Number(run?.missingPromptCount ?? run?.emptyPromptCount ?? 0) === 0
    && Number(run?.duplicatePromptCount ?? 0) === 0
    && run?.itemSetSignature);
  for (let left = 0; left < runs.length; left += 1) {
    for (let right = left + 1; right < runs.length; right += 1) {
      if (runs[left].seed !== runs[right].seed && runs[left].itemSetSignature !== runs[right].itemSetSignature) {
        return [runs[left], runs[right]];
      }
    }
  }
  throw new Error(\`PGC_R06_A07_AUTHORITY_WITNESS_PAIR_MISSING:\${route.routeId}:\${JSON.stringify({
    evidenceAuthority: evidence?.evidenceAuthority ?? null,
    evidenceTaskId: evidence?.taskId ?? null,
    questionCount: evidence?.questionCount ?? null,
    candidateRunCount: runs.length,
    distinctItemSetCount: new Set(runs.map((run) => run.itemSetSignature)).size,
  })}\`);
}

function diagnoseRoute(route) {
  const [witnessA, witnessB] = acceptedWitnessRuns(route);
  const seedA = witnessA.seed;
  const seedB = witnessB.seed;
  const first = runRoute(route, seedA);
  const replay = runRoute(route, seedA);
  const second = runRoute(route, seedB);
  const binding = resolveRouteBinding(route);
  const accepted = [first, replay, second].every((run) => run.ok
      && run.questionCount === QUESTION_COUNT
      && run.answerKeyItemCount === QUESTION_COUNT
      && run.missingPromptCount === 0
      && run.duplicatePromptCount === 0
      && run.uniquePromptCount === QUESTION_COUNT)
    && replay.orderedWorksheetSignature === first.orderedWorksheetSignature
    && second.itemSetSignature !== first.itemSetSignature
    && binding.blocked === false
    && binding.questionCountMax === 240
    && binding.capacityRouteMatched === true
    && binding.capacityTaskId === A06_TASK_ID;
  return {
    routeId: route.routeId,
    caseId: route.caseId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    witnessAuthority: route.selectedCapacityEvidence?.evidenceAuthority ?? null,
    witnessTaskId: route.selectedCapacityEvidence?.taskId ?? null,
    witnessSeeds: [seedA, seedB],
    accepted,
    first,
    replay,
    second,
    binding,
  };
}`;

const testSeedAnchor = `    const seedA = \`pgc-r06-a07:\${route.routeId}:A\`;
    const seedB = \`pgc-r06-a07:\${route.routeId}:B\`;
    const first = runRoute(route, seedA);
    const replay = runRoute(route, seedA);
    const second = runRoute(route, seedB);`;

const testSeedReplacement = `    const evidenceRuns = (route.selectedCapacityEvidence?.runs ?? []).filter((run) => run?.seed
      && run?.ok === true
      && run?.questionCount === QUESTION_COUNT
      && run?.answerKeyItemCount === QUESTION_COUNT
      && Number(run?.missingPromptCount ?? run?.emptyPromptCount ?? 0) === 0
      && Number(run?.duplicatePromptCount ?? 0) === 0
      && run?.itemSetSignature);
    let witnessPair = null;
    for (let left = 0; left < evidenceRuns.length && !witnessPair; left += 1) {
      for (let right = left + 1; right < evidenceRuns.length; right += 1) {
        if (evidenceRuns[left].seed !== evidenceRuns[right].seed
          && evidenceRuns[left].itemSetSignature !== evidenceRuns[right].itemSetSignature) {
          witnessPair = [evidenceRuns[left], evidenceRuns[right]];
          break;
        }
      }
    }
    assert.ok(witnessPair, \`\${route.routeId}:distinct accepted capacity witness pair\`);
    const [witnessA, witnessB] = witnessPair;
    const seedA = witnessA.seed;
    const seedB = witnessB.seed;
    const first = runRoute(route, seedA);
    const replay = runRoute(route, seedA);
    const second = runRoute(route, seedB);`;

const materializerChanged = patch(
  "tools/curriculum/materialize-pgc-r06-a07-final-global-live-d0-closeout.mjs",
  [[materializerAnchor, materializerReplacement, "materializer-authoritative-witnesses"]],
);

const testChanged = patch(
  "tests/curriculum/pgc-r06-a07-final-global-live-d0-closeout.test.js",
  [[testSeedAnchor, testSeedReplacement, "test-authoritative-witnesses"]],
);

console.log(`PGC_R06_A07_AUTHORITATIVE_WITNESS_FIX=${JSON.stringify({
  status: materializerChanged || testChanged ? "APPLIED" : "ALREADY_APPLIED",
  materializerChanged,
  testChanged,
})}`);

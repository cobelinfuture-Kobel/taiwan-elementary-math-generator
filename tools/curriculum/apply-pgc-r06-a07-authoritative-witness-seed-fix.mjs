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

const materializerReplacement = `function authoritativeWitnessSeeds(route) {
  const evidence = route.selectedCapacityEvidence;
  const seeds = unique((evidence?.runs ?? []).map((run) => run?.seed));
  if (evidence?.passed !== true || evidence?.questionCount !== QUESTION_COUNT || seeds.length !== 2) {
    throw new Error(\`PGC_R06_A07_AUTHORITY_WITNESS_MISSING:\${route.routeId}:\${JSON.stringify({
      evidenceAuthority: evidence?.evidenceAuthority ?? null,
      evidenceTaskId: evidence?.taskId ?? null,
      questionCount: evidence?.questionCount ?? null,
      seedCount: seeds.length,
    })}\`);
  }
  return seeds;
}

function diagnoseRoute(route) {
  const [seedA, seedB] = authoritativeWitnessSeeds(route);
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

const testSeedReplacement = `    const evidence = route.selectedCapacityEvidence;
    const witnessSeeds = [...new Set((evidence?.runs ?? []).map((run) => run?.seed).filter(Boolean))];
    assert.equal(evidence?.passed, true, \`\${route.routeId}:capacity evidence not passed\`);
    assert.equal(evidence?.questionCount, QUESTION_COUNT, \`\${route.routeId}:capacity evidence count\`);
    assert.equal(witnessSeeds.length, 2, \`\${route.routeId}:capacity witness seeds\`);
    const [seedA, seedB] = witnessSeeds;
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

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const manifestPath = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s02-unit-renderer-worst-case-audit/current.json",
);
const canonicalHtmlPath = path.join(
  repositoryRoot,
  "docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html",
);
const sourceId = "g5a_u02_5a02";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function textLength(value) {
  return [...String(value ?? "")].length;
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function renderKindFromClass(className) {
  const ignored = new Set(["question", "answer"]);
  const tokens = [...String(className ?? "").matchAll(/g5a-u02-card--([a-z0-9_-]+)/gi)]
    .map((match) => match[1])
    .filter((token) => !ignored.has(token));
  return tokens.at(-1) ?? "static_canonical";
}

function extractAnswers(html) {
  const answers = [];
  const regex = /<article class="[^"]*g5a-u02-card--answer[^"]*"[^>]*>[\s\S]*?<div class="g5a-u02-card__answer">([\s\S]*?)<\/div>[\s\S]*?<\/article>/gi;
  for (const match of html.matchAll(regex)) answers.push(decodeHtml(match[1]));
  return answers;
}

function extractQuestionRecords(html) {
  const answers = extractAnswers(html);
  const records = [];
  const regex = /<article class="([^"]*g5a-u02-card--question[^"]*)"[^>]*>[\s\S]*?<div class="g5a-u02-card__prompt">([\s\S]*?)<\/div>[\s\S]*?<div class="g5a-u02-card__response">([\s\S]*?)<\/div>[\s\S]*?<\/article>/gi;
  let index = 0;
  for (const match of html.matchAll(regex)) {
    const promptText = decodeHtml(match[2]);
    const responsePrompt = decodeHtml(match[3]);
    const answerText = answers[index] ?? "";
    const renderKind = renderKindFromClass(match[1]);
    const promptLength = textLength(promptText);
    const responsePromptLength = textLength(responsePrompt);
    const answerLength = textLength(answerText);
    records.push({
      sourceId,
      routeId: "staticCanonicalHtml",
      routeKind: "staticCanonicalHtml",
      seed: "commit-pinned-s93",
      sequence: index,
      questionId: `g5a-u02-static-${index + 1}`,
      knowledgePointId: null,
      patternGroupId: null,
      patternSpecId: null,
      renderKind,
      answerModelShape: "staticCanonicalAnswer",
      mode: renderKind,
      applicationText: ["application", "reasoning_application", "geometry_application", "contextual"].includes(renderKind),
      promptText,
      responsePrompt,
      answerText,
      promptLength,
      responsePromptLength,
      answerLength,
      burdenScore: promptLength + responsePromptLength + answerLength,
      shapeKey: `${renderKind}|staticCanonicalAnswer|${renderKind}|static_html`,
      evidenceSource: "docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html",
    });
    index += 1;
  }
  return records;
}

function uniqueBy(records, keySelector) {
  return [...new Map(records.map((record) => [keySelector(record), record])).values()];
}

function topBy(records, selector, limit) {
  return [...records]
    .sort((left, right) => selector(right) - selector(left)
      || right.burdenScore - left.burdenScore
      || left.sequence - right.sequence)
    .slice(0, limit)
    .map(clone);
}

function worstByShape(records) {
  const byShape = new Map();
  for (const record of records) {
    const current = byShape.get(record.shapeKey);
    if (!current || record.burdenScore > current.burdenScore) byShape.set(record.shapeKey, record);
  }
  return [...byShape.values()]
    .sort((left, right) => right.burdenScore - left.burdenScore)
    .map(clone);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const html = readFileSync(canonicalHtmlPath, "utf8");
const staticRecords = extractQuestionRecords(html);
if (staticRecords.length !== 22) {
  throw new Error(`GLM_S02_G5A_STATIC_QUESTION_COUNT_MISMATCH:${staticRecords.length}`);
}

const unit = manifest.unitSummaries.find((entry) => entry.sourceId === sourceId);
if (!unit) throw new Error("GLM_S02_G5A_UNIT_SUMMARY_MISSING");

const existingWorst = [
  ...(unit.worstCases?.byShape ?? []),
  ...(unit.worstCases?.highestBurden ?? []),
].filter((record) => record.promptLength > 0 || record.responsePromptLength > 0);
const candidateRecords = uniqueBy([...existingWorst, ...staticRecords], (record) => (
  `${record.routeId}|${record.sequence}|${record.shapeKey}|${record.promptText}`
));

unit.questionSampleCount += staticRecords.length;
unit.shapeKeys = [...new Set([...unit.shapeKeys, ...staticRecords.map((record) => record.shapeKey)])];
unit.shapeFamilyCount = unit.shapeKeys.length;
unit.maxTextMetrics = {
  promptLength: Math.max(unit.maxTextMetrics.promptLength, ...staticRecords.map((record) => record.promptLength)),
  responsePromptLength: Math.max(unit.maxTextMetrics.responsePromptLength, ...staticRecords.map((record) => record.responsePromptLength)),
  answerLength: Math.max(unit.maxTextMetrics.answerLength, ...staticRecords.map((record) => record.answerLength)),
  burdenScore: Math.max(unit.maxTextMetrics.burdenScore, ...staticRecords.map((record) => record.burdenScore)),
};
unit.worstCases = {
  byShape: worstByShape(candidateRecords),
  longestPrompts: topBy(candidateRecords, (record) => record.promptLength, 5),
  longestResponsePrompts: topBy(candidateRecords, (record) => record.responsePromptLength, 5),
  longestAnswers: topBy(candidateRecords, (record) => record.answerLength, 5),
  highestBurden: topBy(candidateRecords, (record) => record.burdenScore, 10),
};
unit.rendererProfiles = uniqueBy([
  ...(unit.rendererProfiles ?? []),
  { profileId: "g5a-u02-profile--compact", questionSheet: null, answerKey: null, evidenceSource: "static_html_class" },
  { profileId: "g5a-u02-profile--reasoning", questionSheet: null, answerKey: null, evidenceSource: "static_html_class" },
  { profileId: "g5a-u02-profile--contextual", questionSheet: null, answerKey: null, evidenceSource: "static_html_class" },
], (profile) => profile.profileId ?? JSON.stringify(profile));
unit.diagnoses = [...new Set([
  ...unit.diagnoses,
  "static_canonical_html_question_shapes_recovered",
  "multiple_renderer_profiles_require_shape_specific_s03_matrix",
])];
unit.staticCanonicalHtmlEvidence = {
  path: path.relative(repositoryRoot, canonicalHtmlPath),
  questionCount: staticRecords.length,
  answerCount: staticRecords.filter((record) => record.answerText.length > 0).length,
  renderKinds: [...new Set(staticRecords.map((record) => record.renderKind))],
  profileClasses: [
    "g5a-u02-profile--compact",
    "g5a-u02-profile--reasoning",
    "g5a-u02-profile--contextual",
  ],
};

manifest.totalQuestionSamples += staticRecords.length;
manifest.g5aU02StaticHtmlEnrichment = {
  status: "APPLIED",
  sourceId,
  questionCount: staticRecords.length,
  canonicalHtmlPath: path.relative(repositoryRoot, canonicalHtmlPath),
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  status: "GLM_S02_G5A_STATIC_HTML_ENRICHED",
  questionCount: staticRecords.length,
  maxPromptLength: unit.maxTextMetrics.promptLength,
  maxBurdenScore: unit.maxTextMetrics.burdenScore,
}, null, 2));

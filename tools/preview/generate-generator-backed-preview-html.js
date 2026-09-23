import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  allocatePatternCounts,
  assembleWorksheetDocument,
  createDefaultConfig,
  generateQuestionsForPattern,
  validateConfig
} from "../../src/core/index.js";
import { buildPreviewHtml } from "./generate-preview-html.js";
import { createGroupedPreviewConfig } from "./fixtures/grouped-preview-config.js";
import { createMultipagePreviewConfig } from "./fixtures/multipage-preview-config.js";
import { createShuffledPreviewConfig } from "./fixtures/shuffled-preview-config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, "output");

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)])
    );
  }

  return value;
}

function createPatternMap(config) {
  return new Map(
    (config?.patternPlan?.patternPool?.patterns ?? []).map((pattern) => [pattern.patternId, pattern])
  );
}

function createGenerationReport(config, allocationResult, generatedQuestions) {
  const countsByPattern = new Map();
  for (const question of generatedQuestions) {
    const patternId = question?.metadata?.patternId ?? null;
    countsByPattern.set(patternId, (countsByPattern.get(patternId) ?? 0) + 1);
  }

  return {
    requestedQuestionCount: config?.generation?.questionCount ?? 0,
    generatedQuestionCount: generatedQuestions.length,
    totalAttempts: generatedQuestions.length,
    duplicateRejectCount: 0,
    constraintRejectCount: 0,
    patternReports: allocationResult.map((allocation) => ({
      patternId: allocation.patternId,
      requestedQuestionCount: allocation.questionCount,
      generatedQuestionCount: countsByPattern.get(allocation.patternId) ?? 0,
      totalAttempts: countsByPattern.get(allocation.patternId) ?? 0,
      failureCount: 0,
      warnings: [],
      failureReasonCodes: []
    })),
    validationWarnings: [],
    generationWarnings: []
  };
}

function generateQuestionsFromAllocations(config, allocationResult, generationSeed) {
  const duplicateKeys = new Set();
  const patternMap = createPatternMap(config);
  const generatedQuestions = [];

  allocationResult.forEach((allocation, allocationIndex) => {
    const pattern = patternMap.get(allocation.patternId);
    if (!pattern) {
      throw new Error(`Missing pattern '${allocation.patternId}' in config pattern pool.`);
    }

    const result = generateQuestionsForPattern(pattern, allocation.questionCount, {
      seed: `${generationSeed ?? "preview-seed"}:${allocation.patternId}:${allocationIndex}`,
      existingDuplicateKeys: duplicateKeys
    });

    if (!result.ok) {
      throw new Error(`Failed to generate questions for pattern '${allocation.patternId}'.`);
    }

    generatedQuestions.push(...result.questions);
  });

  return generatedQuestions;
}

export function buildWorksheetDocumentFromConfig(config, options = {}) {
  const configSnapshot = cloneValue(config ?? createDefaultConfig());
  const validation = validateConfig(configSnapshot);
  if (!validation.ok) {
    throw new Error(`Preview config validation failed: ${validation.errors.map((error) => error.code).join(", ")}`);
  }

  const allocation = allocatePatternCounts(configSnapshot);
  if (!allocation.ok) {
    throw new Error(`Preview allocation failed: ${allocation.errors.map((error) => error.code).join(", ")}`);
  }

  const generatedQuestions = generateQuestionsFromAllocations(
    configSnapshot,
    allocation.allocations,
    options.generationSeed ?? "preview-generation-seed"
  );
  const generationReport = createGenerationReport(configSnapshot, allocation.allocations, generatedQuestions);

  return assembleWorksheetDocument({
    configSnapshot,
    allocationResult: allocation.allocations,
    generatedQuestions,
    generationReport,
    generationSeed: options.generationSeed ?? "preview-generation-seed",
    orderingSeed: options.orderingSeed ?? "preview-ordering-seed"
  });
}

export function buildGeneratorBackedPreviewArtifact({ config, title, generationSeed, orderingSeed }) {
  const worksheetDocument = buildWorksheetDocumentFromConfig(config, {
    generationSeed,
    orderingSeed
  });
  const html = buildPreviewHtml({
    worksheetDocument,
    title,
    stylesheetHref: "../../src/renderer/print-styles.css",
    debugDataAttributes: true
  });

  return {
    worksheetDocument,
    html
  };
}

export function writeGeneratorBackedPreviewArtifact({ outputPath, config, title, generationSeed, orderingSeed }) {
  const artifact = buildGeneratorBackedPreviewArtifact({
    config,
    title,
    generationSeed,
    orderingSeed
  });

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, artifact.html, "utf8");

  return {
    ...artifact,
    outputPath
  };
}

export function writeAllGeneratorBackedPreviewOutputs() {
  const fixtures = [
    {
      name: "grouped-preview",
      outputPath: path.join(OUTPUT_DIR, "grouped-preview.html"),
      config: createGroupedPreviewConfig(),
      title: "Grouped Worksheet Preview",
      generationSeed: "grouped-generation-seed",
      orderingSeed: "grouped-ordering-seed"
    },
    {
      name: "shuffled-preview",
      outputPath: path.join(OUTPUT_DIR, "shuffled-preview.html"),
      config: createShuffledPreviewConfig(),
      title: "Shuffled Worksheet Preview",
      generationSeed: "shuffled-generation-seed",
      orderingSeed: "shuffled-ordering-seed"
    },
    {
      name: "multipage-preview",
      outputPath: path.join(OUTPUT_DIR, "multipage-preview.html"),
      config: createMultipagePreviewConfig(),
      title: "Multipage Worksheet Preview",
      generationSeed: "multipage-generation-seed",
      orderingSeed: "multipage-ordering-seed"
    }
  ];

  return fixtures.map((fixture) => writeGeneratorBackedPreviewArtifact(fixture));
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const outputs = writeAllGeneratorBackedPreviewOutputs();
  outputs.forEach((output) => {
    console.log(`Preview written to ${output.outputPath}`);
  });
}

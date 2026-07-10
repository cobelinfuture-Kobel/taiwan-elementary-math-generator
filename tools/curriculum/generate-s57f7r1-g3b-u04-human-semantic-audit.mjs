import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  listG3BU04SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  generateG3BU04StructuralSemanticQuestion,
  isG3BU04StructuralSemanticPatternSpecId
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js";
import {
  generateG3BU04MultiplicativeSemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-multiplicative-semantic-generator.js";
import {
  validateG3BU04SemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-validator-unit-flow-fullfix.js";
import {
  applyG3BU04HumanSemanticReadbackFullFix,
  validateG3BU04HumanSemanticReadback
} from "../../site/modules/curriculum/batch-a/g3b-u04-human-semantic-readback-fullfix.js";

const OUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../docs/curriculum/output/audit/S57F7R1_G3B_U04_HumanSemanticAudit.json"
);

function generate(patternSpecId, contextDomain, sequenceNumber) {
  const options = {
    patternSpecId,
    contextDomain,
    sequenceNumber,
    seed: `s57f7r1-human-audit:${patternSpecId}:${contextDomain}`
  };
  return isG3BU04StructuralSemanticPatternSpecId(patternSpecId)
    ? generateG3BU04StructuralSemanticQuestion(options)
    : generateG3BU04MultiplicativeSemanticQuestion(options);
}

const rows = [];
let sequenceNumber = 0;
for (const definition of listG3BU04SemanticPatternDefinitions()) {
  for (const contextDomain of definition.contextDomains) {
    sequenceNumber += 1;
    const generated = generate(definition.patternSpecId, contextDomain, sequenceNumber);
    if (!generated.ok || !generated.question) {
      throw new Error(`${definition.patternSpecId}/${contextDomain}: ${JSON.stringify(generated.errors)}`);
    }
    const question = applyG3BU04HumanSemanticReadbackFullFix(generated.question);
    const semanticValidation = validateG3BU04SemanticQuestion(question);
    const readbackValidation = validateG3BU04HumanSemanticReadback(question);
    rows.push({
      sequenceNumber,
      patternSpecId: definition.patternSpecId,
      templateFamilyId: definition.templateFamilyId,
      knowledgePointId: definition.knowledgePointId,
      semanticSignature: definition.semanticSignature,
      equationShape: definition.equationShape,
      contextDomain,
      promptText: question.promptText,
      equationModel: question.equationModel,
      answerText: question.answerText,
      answerUnit: question.answerUnit,
      ownershipModel: question.ownershipModel,
      relationshipDirection: question.relationshipDirection ?? null,
      timePeriodModel: question.timePeriodModel ?? null,
      countNounModel: question.countNounModel ?? null,
      semanticValidatorOk: semanticValidation.ok,
      semanticValidatorErrors: semanticValidation.errors,
      readbackValidatorOk: readbackValidation.ok,
      readbackValidatorErrors: readbackValidation.errors,
      validatorWarnings: [...(semanticValidation.warnings ?? []), ...(readbackValidation.warnings ?? [])]
    });
  }
}

const report = {
  schemaName: "G3BU04HumanSemanticAudit",
  schemaVersion: 2,
  task: "S57F7R1_G3B_U04_HumanSemanticReadbackQA_FullFix",
  sourceId: "g3b_u04_3b04",
  generatedAt: null,
  familyCount: new Set(rows.map((row) => row.patternSpecId)).size,
  familyContextVariantCount: rows.length,
  semanticValidatorFailureCount: rows.filter((row) => !row.semanticValidatorOk).length,
  readbackValidatorFailureCount: rows.filter((row) => !row.readbackValidatorOk).length,
  rows
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  outputPath: OUT_PATH,
  familyCount: report.familyCount,
  familyContextVariantCount: report.familyContextVariantCount,
  semanticValidatorFailureCount: report.semanticValidatorFailureCount,
  readbackValidatorFailureCount: report.readbackValidatorFailureCount
}, null, 2));

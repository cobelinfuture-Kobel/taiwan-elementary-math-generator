import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  generateG3BU08ValidatedSemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
import {
  listG3BU08SemanticContextVariantsForPatternSpec
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-context-registry.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = resolve(ROOT, "data/curriculum/validation/S58E_G3B_U08_HumanSemanticReadbackAudit.json");

function roleCueClear(question) {
  const prompt = question.promptText;
  if (question.knowledgePointId === "kp_g3b_u08_total_from_groups") return /一共|共需要|共有多少/.test(prompt);
  if (question.knowledgePointId === "kp_g3b_u08_group_count_from_total") return /幾(?:球|題|關|條|段|袋|盒|筒|朵)|可以(?:做|剪成|裝成)/.test(prompt);
  if (question.knowledgePointId === "kp_g3b_u08_per_group_from_total") return /平均每天|每人分到|每(?:瓶|碗|杯)有多少|每段長多少/.test(prompt);
  if (question.knowledgePointId === "kp_g3b_u08_reverse_base_from_multiple") return /的\d倍/.test(prompt) && /多少/.test(prompt);
  if (question.knowledgePointId === "kp_g3b_u08_shopping_estimation") return /估一估|多多少|少多少|夠不夠/.test(prompt);
  if (question.knowledgePointId === "kp_g3b_u08_same_price_value_comparison") return /價格相同/.test(prompt) && /哪一種/.test(prompt);
  return false;
}

function numericBoundaryClear(question) {
  const values = Object.values(question.quantities ?? {});
  if (values.some((value) => typeof value === "number" && (!Number.isSafeInteger(value) || value <= 0 || value > 999))) return false;
  if (/小數|分數|百分|%|直式|長除法|餘數/.test(question.promptText)) return false;
  if (question.semanticSnapshot.equationShape === "a/b" && question.quantities.b > 9) return false;
  if (question.semanticSnapshot.equationShape === "a*b" && question.quantities.b > 9) return false;
  return true;
}

function humanPrecheck(question) {
  const checks = {
    naturalTraditionalChinese: /[？?]/.test(question.promptText)
      && /[？?。]$/.test(question.promptText)
      && question.promptText.length >= 15
      && question.promptText.length <= 120
      && !/\{[^}]+\}|每段剪成|成功一(?:球|題|關)|另外的人共|和另外\d+人共\d+人/.test(question.promptText),
    roleCueClear: roleCueClear(question),
    unitOrConclusionClear: Boolean(question.finalAnswerWithUnit)
      && (question.answerModelShape === "semantic_same_price_comparison" || question.finalAnswerWithUnit.includes(question.finalAnswerUnit)),
    uniqueAnswer: question.validationStatus === "accepted",
    gradeBoundaryClear: numericBoundaryClear(question),
    samePriceComparable: question.answerModelShape !== "semantic_same_price_comparison"
      || (/價格相同/.test(question.promptText)
        && question.optionATotal !== question.optionBTotal
        && ["option_a", "option_b"].includes(question.winner)),
    noInternalIdLeakage: !/\b(?:kp|pg|ps|tpl|ctx)_g3b_u08_[a-z0-9_]+\b/i.test(`${question.promptText} ${question.answerText}`)
  };
  return {
    checks,
    pass: Object.values(checks).every(Boolean)
  };
}

const records = [];
for (const spec of listG3BU08SemanticPatternDefinitions()) {
  const variants = listG3BU08SemanticContextVariantsForPatternSpec(spec.patternSpecId);
  for (const [index, variant] of variants.entries()) {
    const generated = generateG3BU08ValidatedSemanticQuestion({
      patternSpecId: spec.patternSpecId,
      contextVariantId: variant.contextVariantId,
      seed: `s58e-audit:${variant.contextVariantId}`,
      sequenceNumber: index + 1
    });
    if (!generated.ok) {
      throw new Error(`${variant.contextVariantId}: ${JSON.stringify(generated.errors)}`);
    }
    const precheck = humanPrecheck(generated.question);
    records.push({
      recordNumber: records.length + 1,
      patternSpecId: spec.patternSpecId,
      patternGroupId: spec.patternGroupId,
      knowledgePointId: spec.knowledgePointId,
      templateFamilyId: spec.templateFamilyId,
      contextVariantId: variant.contextVariantId,
      contextDomain: variant.contextDomain,
      sceneLabelZh: variant.sceneLabelZh,
      promptText: generated.question.promptText,
      equationModel: generated.question.equationModel,
      answerText: generated.question.answerText,
      answerModelShape: generated.question.answerModelShape,
      quantities: generated.question.quantities,
      automaticValidation: {
        valid: generated.validation.valid,
        blockingErrorCount: generated.validation.blockingErrors.length,
        stagePassCount: generated.validation.stageResults.filter((stage) => stage.ok).length
      },
      humanPrecheck: precheck,
      manualReadback: {
        status: "pending_manual_review",
        defectCodes: [],
        notes: ""
      }
    });
  }
}

const failedPrechecks = records.filter((record) => !record.humanPrecheck.pass);
if (records.length !== 72) throw new Error(`Expected 72 records, received ${records.length}`);
if (failedPrechecks.length > 0) {
  throw new Error(`Human precheck failed: ${failedPrechecks.map((record) => record.contextVariantId).join(", ")}`);
}

const audit = {
  schemaName: "G3BU08HumanSemanticReadbackAudit",
  schemaVersion: 1,
  task: "S58E_G3B_U08_SemanticValidatorRuntimeAndHumanReadbackQA_FullFix",
  sourceId: "g3b_u08_3b08",
  unitCode: "3B-U08",
  unitTitle: "乘法與除法",
  status: "automated_precheck_pass_manual_readback_pending",
  validatorVersion: "s58e-g3b-u08-semantic-validator-v1",
  coverage: {
    knowledgePointCount: 6,
    patternGroupCount: 6,
    patternSpecCount: 24,
    templateFamilyCount: 24,
    contextVariantCount: 72,
    variantsPerFamily: 3,
    automaticValidationPassCount: records.filter((record) => record.automaticValidation.valid).length,
    humanPrecheckPassCount: records.filter((record) => record.humanPrecheck.pass).length,
    manualReadbackAcceptedCount: 0,
    blockingDefectCount: 0
  },
  manualReadbackPolicy: {
    reviewEveryRecord: true,
    reviewFields: [
      "promptText",
      "equationModel",
      "answerText",
      "unknown quantity role",
      "unit/classifier flow",
      "grade boundary",
      "context realism",
      "unique answer"
    ],
    acceptanceRule: "All 72 records must be manually accepted with zero blocking semantic defect."
  },
  records
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: OUTPUT, recordCount: records.length, failedPrecheckCount: failedPrechecks.length }, null, 2));

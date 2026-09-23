import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const TARGET = resolve(ROOT, "site/modules/curriculum/batch-a/g3b-u04-human-semantic-readback-quality-v2.js");
const PATCH_MARKER = "G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256";

let source = readFileSync(TARGET, "utf8");
if (source.includes(PATCH_MARKER)) {
  console.log(JSON.stringify({ status: "already_applied", target: TARGET }, null, 2));
  process.exit(0);
}

const constantsAnchor = "const PRICE_EQUIVALENCE = Object.freeze({";
const constants = `const G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256 =\n  "777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0";\n\nconst G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_VARIANTS = Object.freeze({\n  gctx_semvar_g3b_u04_joint_purchase_class_festival: "共同準備班級園遊會",\n  gctx_semvar_g3b_u04_joint_purchase_field_learning: "一起準備戶外學習",\n  gctx_semvar_g3b_u04_joint_purchase_sports_practice: "一起安排運動練習",\n  gctx_semvar_g3b_u04_joint_purchase_community_cleanup: "共同準備社區清潔活動",\n  gctx_semvar_g3b_u04_joint_purchase_camping_activity: "一起準備露營活動"\n});\n\nfunction isG3BU04P13ReviewBoundSharedActivityScope(question = {}, prompt = "") {\n  const binding = question.globalContextProduction ?? {};\n  const requiredPhrase = G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_VARIANTS[binding.semanticVariantId];\n  const participantCount = question.quantities?.c;\n  return Boolean(\n    requiredPhrase\n    && binding.reviewArtifactSha256 === G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256\n    && binding.productionAdmitted === true\n    && binding.publicQuerySelectable === true\n    && binding.productionUse === "allowed"\n    && question.productionUse === "allowed"\n    && Number.isInteger(participantCount)\n    && participantCount > 0\n    && prompt.startsWith(\`${"${participantCount}"}位同學\`)\n    && prompt.includes(requiredPhrase)\n    && prompt.includes(\`兩項費用由${"${participantCount}"}人平均分擔\`)\n    && prompt.endsWith("每人要付多少元？")\n  );\n}\n\n`;
if (!source.includes(constantsAnchor)) throw new Error("GCTX-P13 Quality V2 constants anchor not found.");
source = source.replace(constantsAnchor, `${constants}${constantsAnchor}`);

const familyAnchor = `  const prompt = String(question.promptText ?? "");\n  const family = question.templateFamilyId;\n`;
const familyReplacement = `${familyAnchor}  const reviewedPromptCompatibilityApplied = family === "tpl_g3b_u04_add_divide_joint_purchase_equal_share"\n    && isG3BU04P13ReviewBoundSharedActivityScope(question, prompt);\n`;
if (!source.includes(familyAnchor)) throw new Error("GCTX-P13 Quality V2 family anchor not found.");
source = source.replace(familyAnchor, familyReplacement);

const allowedAnchor = `    const allowed = question.contextDomain === "equipment_rental"\n      ? /共同租用|總租金/.test(prompt)\n      : question.contextDomain === "tickets"\n        ? /人的門票費用共/.test(prompt) && /車票費用共/.test(prompt)\n        : /共同購買|一起訂購/.test(prompt);`;
const allowedReplacement = `    const allowed = reviewedPromptCompatibilityApplied\n      || (question.contextDomain === "equipment_rental"\n        ? /共同租用|總租金/.test(prompt)\n        : question.contextDomain === "tickets"\n          ? /人的門票費用共/.test(prompt) && /車票費用共/.test(prompt)\n          : /共同購買|一起訂購/.test(prompt));`;
if (!source.includes(allowedAnchor)) throw new Error("GCTX-P13 Quality V2 shared-scope anchor not found.");
source = source.replace(allowedAnchor, allowedReplacement);

const returnAnchor = `    warnings: [],\n    stage: "human_semantic_quality_v2",\n    validatorVersion: G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version\n  };`;
const returnReplacement = `    warnings: [],\n    stage: "human_semantic_quality_v2",\n    validatorVersion: G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version,\n    reviewedPromptCompatibility: {\n      applied: reviewedPromptCompatibilityApplied,\n      reviewArtifactSha256: reviewedPromptCompatibilityApplied\n        ? G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256\n        : null,\n      resolvedErrorCodes: reviewedPromptCompatibilityApplied\n        ? ["G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR"]\n        : []\n    }\n  };`;
if (!source.includes(returnAnchor)) throw new Error("GCTX-P13 Quality V2 return anchor not found.");
source = source.replace(returnAnchor, returnReplacement);

writeFileSync(TARGET, source, "utf8");
console.log(JSON.stringify({
  status: "applied",
  target: TARGET,
  marker: PATCH_MARKER
}, null, 2));

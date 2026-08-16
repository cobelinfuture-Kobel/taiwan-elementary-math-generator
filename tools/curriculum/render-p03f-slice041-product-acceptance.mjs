import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getCurrentPixelRegistrySnapshot} from "../../site/pixel/pixel-registry-bridge.js";
import {exactMixedDomainCompare} from "../../site/modules/curriculum/public/shared-mixed-domain-normalizer-p03f32.js";
import {G6B_U01_P03F41_GROUP_ID,G6B_U01_P03F41_KP_ID,G6B_U01_P03F41_SOURCE_ID,G6B_U01_P03F41_SPEC_ID} from "../../site/modules/curriculum/registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUTPUT=path.join(ROOT,"tmp/p03f-slice041-product-acceptance");
fs.mkdirSync(OUTPUT,{recursive:true});
const printStyles=fs.readFileSync(path.join(ROOT,"src/renderer/print-styles.css"),"utf8");
const fontRoot=path.join(ROOT,"node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles=fs.readFileSync(path.join(fontRoot,"400.css"),"utf8").replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,(_,file)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot,"files",file)).toString("base64")}) format('woff2')`);
const sha256=file=>crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const physicalPages=file=>(fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g)??[]).length;
const relationSymbol=relation=>({LESS_THAN:"<",EQUAL:"=",GREATER_THAN:">"})[relation]??null;

const result=buildBatchABrowserWorksheetDocument({
  sourceId:G6B_U01_P03F41_SOURCE_ID,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:[G6B_U01_P03F41_KP_ID],
  selectedPatternGroupIds:[G6B_U01_P03F41_GROUP_ID],
  patternSpecIds:[G6B_U01_P03F41_SPEC_ID],
  questionMode:"numeric",
  questionCount:24,
  generationSeed:"p03f41-acceptance",
  includeAnswerKey:true,
  ordering:"groupedByPattern",
  printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true},
});
if(!result.ok||!result.worksheetDocument)throw new Error(`P03F41_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document=result.worksheetDocument;
const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""}).replace("</head>",`<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath=path.join(OUTPUT,"g6b-u01-rank9-mixed-domain-order.html");
const pdfPath=path.join(OUTPUT,"g6b-u01-rank9-mixed-domain-order.pdf");
fs.writeFileSync(htmlPath,html);

const browser=await chromium.launch({headless:true});
const consoleErrors=[];
const pageErrors=[];
let pageMetrics=[];
try{
  const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",error=>pageErrors.push(String(error)));
  await page.setContent(html,{waitUntil:"networkidle"});
  const pages=page.locator(".worksheet-page");
  for(let index=0;index<await pages.count();index++)await pages.nth(index).screenshot({path:path.join(OUTPUT,`rank9-mixed-domain-order-page-${String(index+1).padStart(2,"0")}.png`)});
  await page.emulateMedia({media:"print"});
  pageMetrics=await page.$$eval(".worksheet-page",nodes=>nodes.map((node,index)=>({index,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,overflowY:node.scrollHeight>node.clientHeight+1,overflowX:node.scrollWidth>node.clientWidth+1})));
  await page.pdf({path:pdfPath,format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"0",right:"0",bottom:"0",left:"0"}});
}finally{await browser.close();}

const questions=document.generatedQuestions;
const answers=document.answerKeyItems;
const registry=getCurrentPixelRegistrySnapshot();
const sourceSummary=registry.bySourceId[G6B_U01_P03F41_SOURCE_ID];
const crossLayerMismatchCount=questions.filter((question,index)=>!answers[index]||answers[index].questionId!==question.id||answers[index].answerText!==question.answerText||document.questionDisplayModels[index]?.promptText!==question.blankedDisplayText).length;
const exactAnswerMismatchCount=questions.filter(question=>{try{const fraction={numerator:question.fractionNumerator,denominator:question.fractionDenominator};const exact=question.decimalLeft?exactMixedDomainCompare({leftDomain:"DECIMAL",leftValue:question.decimal,rightDomain:"FRACTION",rightValue:fraction}):exactMixedDomainCompare({leftDomain:"FRACTION",leftValue:fraction,rightDomain:"DECIMAL",rightValue:question.decimal});return question.answerText!==relationSymbol(exact.relation)||question.finalAnswer?.comparison!==exact.comparison||question.finalAnswer?.exact!==true;}catch{return true;}}).length;
const semanticScopeFindingCount=questions.filter(question=>question.sourceId!==G6B_U01_P03F41_SOURCE_ID||question.metadata?.knowledgePointId!==G6B_U01_P03F41_KP_ID||question.metadata?.patternGroupId!==G6B_U01_P03F41_GROUP_ID||question.patternSpecId!==G6B_U01_P03F41_SPEC_ID||question.metadata?.productAdmissionTask!=="P03F_W3DirectProductVerticalSlice041Implementation").length;
const applicationLeakFindingCount=questions.filter(question=>question.questionMode!=="numeric"||question.globalContextProduction!=null||question.metadata?.contextAuthority!=null||question.metadata?.globalContextProduction!=null).length;
const arithmeticLeakFindingCount=questions.filter(question=>question.action!=="COMPARE"||question.operation!=="mixed_domain_compare"||question.metadata?.requiredCapabilityIds?.includes("cap_decimal_arithmetic")||question.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")).length;
const slice047LeakFindingCount=questions.filter(question=>question.metadata?.knowledgePointId==="kp_g6b_u01_mixed_decimal_fraction_add_sub").length;
const relationCounts=Object.fromEntries(["<","=",">"].map(symbol=>[symbol,questions.filter(question=>question.answerText===symbol).length]));
const decimalLeftWitnessCount=questions.filter(question=>question.decimalLeft===true).length;
const fractionLeftWitnessCount=questions.filter(question=>question.decimalLeft===false).length;
const report={
  schemaName:"P03FSlice041ChromiumProductAcceptanceReportV1",
  taskId:"P03F_W3DirectProductVerticalSlice041ChromiumAcceptance",
  status:"PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId:G6B_U01_P03F41_SOURCE_ID,
  publicSourceCount:registry.sourceCount,
  visibleKnowledgePointCount:registry.visibleKnowledgePointCount,
  sourceVisibleKnowledgePointCount:sourceSummary?.visibleKnowledgePoints?.length??0,
  sourceHiddenKnowledgePointCount:sourceSummary?.hiddenPendingCount??0,
  sourceNotSelectableKnowledgePointCount:sourceSummary?.notSelectableCount??0,
  totalQuestionCount:questions.length,
  totalAnswerKeyItemCount:answers.length,
  questionPageCount:document.questionPages.length,
  answerPageCount:document.answerKeyPages.length,
  totalPhysicalPdfPageCount:physicalPages(pdfPath),
  screenshotCount:pageMetrics.length,
  observedKnowledgePointIds:[...new Set(questions.map(question=>question.metadata?.knowledgePointId))],
  observedPatternGroupIds:[...new Set(questions.map(question=>question.metadata?.patternGroupId))],
  observedPatternSpecIds:[...new Set(questions.map(question=>question.patternSpecId))],
  relationCounts,
  decimalLeftWitnessCount,
  fractionLeftWitnessCount,
  crossLayerMismatchCount,
  exactAnswerMismatchCount,
  semanticScopeFindingCount,
  applicationLeakFindingCount,
  arithmeticLeakFindingCount,
  slice047LeakFindingCount,
  duplicatePromptFindingCount:questions.length-new Set(document.questionDisplayModels.map(model=>model.promptText)).size,
  overflowFindingCount:pageMetrics.filter(row=>row.overflowX||row.overflowY).length,
  consoleErrorCount:consoleErrors.length,
  pageErrorCount:pageErrors.length,
  sharedP03F32MixedDomainNormalizer:document.metadata?.worksheetAdapter?.sharedP03F32MixedDomainNormalizer===true,
  sharedPagination:document.metadata?.worksheetAdapter?.sharedPagination===true,
  sharedRenderer:document.metadata?.worksheetAdapter?.sharedRenderer===true,
  parallelPipeline:document.metadata?.worksheetAdapter?.parallelPipeline===true,
  htmlSha256:sha256(htmlPath),
  pdfSha256:sha256(pdfPath),
  pdfByteLength:fs.statSync(pdfPath).size,
  pageMetrics,
  visualReview:{status:"PENDING",allPagesReviewed:false},
};
const pass=report.publicSourceCount===33&&report.visibleKnowledgePointCount===239&&report.sourceVisibleKnowledgePointCount===2&&report.sourceHiddenKnowledgePointCount===3&&report.sourceNotSelectableKnowledgePointCount===3&&report.totalQuestionCount===24&&report.totalAnswerKeyItemCount===24&&report.questionPageCount===3&&report.answerPageCount===3&&report.totalPhysicalPdfPageCount===6&&report.screenshotCount===6&&report.relationCounts["<"]>0&&report.relationCounts["="]>0&&report.relationCounts[">"]>0&&report.decimalLeftWitnessCount>0&&report.fractionLeftWitnessCount>0&&report.observedKnowledgePointIds.length===1&&report.observedKnowledgePointIds[0]===G6B_U01_P03F41_KP_ID&&report.observedPatternGroupIds.length===1&&report.observedPatternGroupIds[0]===G6B_U01_P03F41_GROUP_ID&&report.observedPatternSpecIds.length===1&&report.observedPatternSpecIds[0]===G6B_U01_P03F41_SPEC_ID&&report.crossLayerMismatchCount===0&&report.exactAnswerMismatchCount===0&&report.semanticScopeFindingCount===0&&report.applicationLeakFindingCount===0&&report.arithmeticLeakFindingCount===0&&report.slice047LeakFindingCount===0&&report.duplicatePromptFindingCount===0&&report.overflowFindingCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0&&report.sharedP03F32MixedDomainNormalizer&&report.sharedPagination&&report.sharedRenderer&&!report.parallelPipeline;
if(!pass)throw new Error(`P03F41_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT,"p03f-slice041-product-acceptance-report.json"),`${JSON.stringify(report,null,2)}\n`);
console.log(`P03F41_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getCurrentPixelRegistrySnapshot} from "../../site/pixel/pixel-registry-bridge.js";
import {G4B_U06_P03F42_GROUP_ID,G4B_U06_P03F42_KP_ID,G4B_U06_P03F42_SOURCE_ID,G4B_U06_P03F42_SPEC_ID} from "../../site/modules/curriculum/registry/g4b-u06-rank10-decimal-number-line-selector-projection-p03f42.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUTPUT=path.join(ROOT,"tmp/p03f-slice042-product-acceptance");
fs.mkdirSync(OUTPUT,{recursive:true});
const printStyles=fs.readFileSync(path.join(ROOT,"src/renderer/print-styles.css"),"utf8");
const fontRoot=path.join(ROOT,"node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles=fs.readFileSync(path.join(fontRoot,"400.css"),"utf8").replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,(_,file)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot,"files",file)).toString("base64")}) format('woff2')`);
const sha256=file=>crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const physicalPages=file=>(fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g)??[]).length;
const exactText=valueScaled=>{const whole=Math.floor(valueScaled/10),fraction=valueScaled%10;return fraction?`${whole}.${fraction}`:`${whole}`;};

const result=buildBatchABrowserWorksheetDocument({
  sourceId:G4B_U06_P03F42_SOURCE_ID,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:[G4B_U06_P03F42_KP_ID],
  selectedPatternGroupIds:[G4B_U06_P03F42_GROUP_ID],
  patternSpecIds:[G4B_U06_P03F42_SPEC_ID],
  questionMode:"numeric",
  questionCount:24,
  generationSeed:"p03f42-acceptance",
  includeAnswerKey:true,
  ordering:"groupedByPattern",
  printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true},
});
if(!result.ok||!result.worksheetDocument)throw new Error(`P03F42_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document=result.worksheetDocument;
const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""}).replace("</head>",`<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath=path.join(OUTPUT,"g4b-u06-rank10-decimal-number-line.html");
const pdfPath=path.join(OUTPUT,"g4b-u06-rank10-decimal-number-line.pdf");
fs.writeFileSync(htmlPath,html);

const browser=await chromium.launch({headless:true});
const consoleErrors=[];
const pageErrors=[];
let pageMetrics=[];
let representationMetrics={count:0,svgCount:0,pointMarkerCount:0,overflowCount:0};
try{
  const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",error=>pageErrors.push(String(error)));
  await page.setContent(html,{waitUntil:"networkidle"});
  representationMetrics=await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('[data-representation="decimal-number-line"]')];
    const svgs=[...document.querySelectorAll('svg.worksheet-number-line[aria-label="小數數線，標示 A、B 兩點"]')];
    const pointMarkerCount=svgs.reduce((total,svg)=>total+svg.querySelectorAll("circle").length,0);
    const overflowCount=nodes.filter(node=>{const svg=node.querySelector("svg");if(!svg)return true;const parent=node.getBoundingClientRect(),child=svg.getBoundingClientRect();return child.width>parent.width+1||child.height>parent.height+1;}).length;
    return{count:nodes.length,svgCount:svgs.length,pointMarkerCount,overflowCount};
  });
  const pages=page.locator(".worksheet-page");
  for(let index=0;index<await pages.count();index++)await pages.nth(index).screenshot({path:path.join(OUTPUT,`rank10-decimal-number-line-page-${String(index+1).padStart(2,"0")}.png`)});
  await page.emulateMedia({media:"print"});
  pageMetrics=await page.$$eval(".worksheet-page",nodes=>nodes.map((node,index)=>({index,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,overflowY:node.scrollHeight>node.clientHeight+1,overflowX:node.scrollWidth>node.clientWidth+1})));
  await page.pdf({path:pdfPath,format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"0",right:"0",bottom:"0",left:"0"}});
}finally{await browser.close();}

const questions=document.generatedQuestions;
const answers=document.answerKeyItems;
const registry=getCurrentPixelRegistrySnapshot();
const sourceSummary=registry.bySourceId[G4B_U06_P03F42_SOURCE_ID];
const crossLayerMismatchCount=questions.filter((question,index)=>!answers[index]||answers[index].questionId!==question.id||answers[index].answerText!==question.answerText||document.questionDisplayModels[index]?.promptText!==question.blankedDisplayText||JSON.stringify(answers[index]?.numberLine)!==JSON.stringify(question.numberLine)||JSON.stringify(document.questionDisplayModels[index]?.numberLine)!==JSON.stringify(question.numberLine)).length;
const exactAnswerMismatchCount=questions.filter(question=>{const expectedScaled=Math.abs(question.pointBScaled-question.pointAScaled),expectedText=exactText(expectedScaled);return question.decimalScale!==10||question.distanceScaled!==expectedScaled||question.answerText!==expectedText||question.finalAnswer?.canonicalText!==expectedText||question.finalAnswer?.scaledValue!==expectedScaled||question.finalAnswer?.scale!==10||question.finalAnswer?.exact!==true;}).length;
const sourceSubdivisionFindingCount=questions.filter(question=>question.decimalScale!==10||![1,2].includes(question.stepScaled)||question.axisStartScaled%10!==0||question.axisEndScaled-question.axisStartScaled!==10||question.numberLine?.subdivisionCount!==10/question.stepScaled||question.numberLine?.tickCount!==10/question.stepScaled+1||question.metadata?.sourceSubdivisionPolicy!=="PAGE3_TENTHS_OR_FIFTHS_ONLY").length;
const semanticScopeFindingCount=questions.filter(question=>question.sourceId!==G4B_U06_P03F42_SOURCE_ID||question.metadata?.knowledgePointId!==G4B_U06_P03F42_KP_ID||question.metadata?.patternGroupId!==G4B_U06_P03F42_GROUP_ID||question.patternSpecId!==G4B_U06_P03F42_SPEC_ID||question.metadata?.productAdmissionTask!=="P03F_W3DirectProductVerticalSlice042Implementation").length;
const applicationLeakFindingCount=questions.filter(question=>question.questionMode!=="numeric"||question.globalContextProduction!=null||question.metadata?.contextAuthority!=null||question.metadata?.globalContextProduction!=null||question.metadata?.applicationClassification!=="APPLICATION_NOT_APPLICABLE").length;
const arithmeticLeakFindingCount=questions.filter(question=>question.action!=="MEASURE_DISTANCE"||question.operation!=="number_line_distance"||question.metadata?.requiredCapabilityIds?.includes("cap_decimal_arithmetic")).length;
const hiddenSiblingLeakFindingCount=questions.filter(question=>question.metadata?.knowledgePointId==="kp_g4b_u06_infer_decimal_product").length;
const step01WitnessCount=questions.filter(question=>question.stepScaled===1&&question.decimalScale===10).length;
const step02WitnessCount=questions.filter(question=>question.stepScaled===2&&question.decimalScale===10).length;
const rightwardWitnessCount=questions.filter(question=>question.pointBScaled>question.pointAScaled).length;
const leftwardWitnessCount=questions.filter(question=>question.pointBScaled<question.pointAScaled).length;
const problemKeys=questions.map(question=>`${question.blankedDisplayText}|${JSON.stringify(question.numberLine)}`);
const duplicateProblemFindingCount=questions.length-new Set(problemKeys).size;
const report={
  schemaName:"P03FSlice042ChromiumProductAcceptanceReportV1",
  taskId:"P03F_W3DirectProductVerticalSlice042ChromiumAcceptance",
  status:"PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId:G4B_U06_P03F42_SOURCE_ID,
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
  representationCount:representationMetrics.count,
  numberLineSvgCount:representationMetrics.svgCount,
  pointMarkerCount:representationMetrics.pointMarkerCount,
  representationOverflowFindingCount:representationMetrics.overflowCount,
  observedKnowledgePointIds:[...new Set(questions.map(question=>question.metadata?.knowledgePointId))],
  observedPatternGroupIds:[...new Set(questions.map(question=>question.metadata?.patternGroupId))],
  observedPatternSpecIds:[...new Set(questions.map(question=>question.patternSpecId))],
  step01WitnessCount,
  step02WitnessCount,
  rightwardWitnessCount,
  leftwardWitnessCount,
  crossLayerMismatchCount,
  exactAnswerMismatchCount,
  sourceSubdivisionFindingCount,
  semanticScopeFindingCount,
  applicationLeakFindingCount,
  arithmeticLeakFindingCount,
  hiddenSiblingLeakFindingCount,
  duplicateProblemFindingCount,
  overflowFindingCount:pageMetrics.filter(row=>row.overflowX||row.overflowY).length,
  consoleErrorCount:consoleErrors.length,
  pageErrorCount:pageErrors.length,
  sharedNumberLineRendererAdapter:document.metadata?.worksheetAdapter?.sharedNumberLineRendererAdapter===true,
  sharedPagination:document.metadata?.worksheetAdapter?.sharedPagination===true,
  sharedRenderer:document.metadata?.worksheetAdapter?.sharedRenderer===true,
  parallelPipeline:document.metadata?.worksheetAdapter?.parallelPipeline===true,
  applicationExpansion:document.metadata?.applicationExpansion===true,
  slice043Expansion:document.metadata?.slice043Expansion===true,
  htmlSha256:sha256(htmlPath),
  pdfSha256:sha256(pdfPath),
  pdfByteLength:fs.statSync(pdfPath).size,
  pageMetrics,
  visualReview:{status:"PENDING",allPagesReviewed:false},
};
const pass=report.publicSourceCount===33&&report.visibleKnowledgePointCount===240&&report.sourceVisibleKnowledgePointCount===5&&report.sourceHiddenKnowledgePointCount===1&&report.sourceNotSelectableKnowledgePointCount===0&&report.totalQuestionCount===24&&report.totalAnswerKeyItemCount===24&&report.questionPageCount===3&&report.answerPageCount===3&&report.totalPhysicalPdfPageCount===6&&report.screenshotCount===6&&report.representationCount===48&&report.numberLineSvgCount===48&&report.pointMarkerCount===96&&report.step01WitnessCount===12&&report.step02WitnessCount===12&&report.rightwardWitnessCount>0&&report.leftwardWitnessCount>0&&report.observedKnowledgePointIds.length===1&&report.observedKnowledgePointIds[0]===G4B_U06_P03F42_KP_ID&&report.observedPatternGroupIds.length===1&&report.observedPatternGroupIds[0]===G4B_U06_P03F42_GROUP_ID&&report.observedPatternSpecIds.length===1&&report.observedPatternSpecIds[0]===G4B_U06_P03F42_SPEC_ID&&report.crossLayerMismatchCount===0&&report.exactAnswerMismatchCount===0&&report.sourceSubdivisionFindingCount===0&&report.semanticScopeFindingCount===0&&report.applicationLeakFindingCount===0&&report.arithmeticLeakFindingCount===0&&report.hiddenSiblingLeakFindingCount===0&&report.duplicateProblemFindingCount===0&&report.representationOverflowFindingCount===0&&report.overflowFindingCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0&&report.sharedNumberLineRendererAdapter&&report.sharedPagination&&report.sharedRenderer&&!report.parallelPipeline&&!report.applicationExpansion&&!report.slice043Expansion;
if(!pass)throw new Error(`P03F42_CHROMIUM_FAILED:${JSON.stringify(report)}`);
fs.writeFileSync(path.join(OUTPUT,"p03f-slice042-product-acceptance-report.json"),`${JSON.stringify(report,null,2)}\n`);
console.log(`P03F42_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);

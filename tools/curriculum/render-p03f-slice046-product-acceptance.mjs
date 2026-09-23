import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U06_P03F46_GROUP_ID,
  G5B_U06_P03F46_KP_ID,
  G5B_U06_P03F46_SOURCE_ID,
  G5B_U06_P03F46_SPEC_ID,
  P03F46_HIDDEN_SIBLING_KP_IDS,
  P03F46_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g5b-u06-rank10-decimal-divided-by-integer-selector-projection-p03f46.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUTPUT=path.join(ROOT,"tmp/p03f-slice046-product-acceptance");
fs.mkdirSync(OUTPUT,{recursive:true});
const printStyles=fs.readFileSync(path.join(ROOT,"src/renderer/print-styles.css"),"utf8");
const fontRoot=path.join(ROOT,"node_modules/@fontsource/noto-sans-tc");
const embeddedFontStyles=fs.readFileSync(path.join(fontRoot,"400.css"),"utf8").replace(/url\(\.\/files\/([^)]*\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]*\.woff\) format\('woff'\)/g,(_,file)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join(fontRoot,"files",file)).toString("base64")}) format('woff2')`);
const sha256=(file)=>crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const physicalPages=(file)=>(fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g)??[]).length;
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){const t=a%b;a=b;b=t;}return a;};
const pow=(base,exp)=>{let out=1n;for(let i=0;i<exp;i+=1)out*=base;return out;};
function exactDecimal(numerator,denominator){
  let n=BigInt(numerator),d=BigInt(denominator);const g=gcd(n,d);n/=g;d/=g;
  let rest=d,twos=0,fives=0;while(rest%2n===0n){rest/=2n;twos+=1;}while(rest%5n===0n){rest/=5n;fives+=1;}
  if(rest!==1n)throw new Error("NON_TERMINATING_REFERENCE");
  const scale=Math.max(twos,fives),coefficient=n*pow(2n,scale-twos)*pow(5n,scale-fives),digits=String(coefficient).padStart(scale+1,"0");
  const whole=scale?digits.slice(0,-scale)||"0":digits,fraction=scale?digits.slice(-scale).replace(/0+$/,""):"";
  return fraction?`${whole}.${fraction}`:whole;
}

const result=buildBatchABrowserWorksheetDocument({
  sourceId:G5B_U06_P03F46_SOURCE_ID,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:[G5B_U06_P03F46_KP_ID],
  selectedPatternGroupIds:[G5B_U06_P03F46_GROUP_ID],
  patternSpecIds:[G5B_U06_P03F46_SPEC_ID],
  questionMode:"numeric",
  questionCount:24,
  generationSeed:"p03f46-source-witness-product-acceptance",
  includeAnswerKey:true,
  ordering:"groupedByPattern",
  printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true},
});
if(!result.ok||!result.worksheetDocument)throw new Error(`P03F46_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document=result.worksheetDocument;
const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""}).replace("</head>",`<style>${embeddedFontStyles}\nbody { font-family: 'Noto Sans TC', sans-serif !important; }</style><style>${printStyles}</style></head>`);
const htmlPath=path.join(OUTPUT,"g5b-u06-rank10-q046.html"),pdfPath=path.join(OUTPUT,"g5b-u06-rank10-q046.pdf");
fs.writeFileSync(htmlPath,html);
const browser=await chromium.launch({headless:true});
const consoleErrors=[],pageErrors=[];let pageMetrics=[];
try{
  const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
  page.on("console",(message)=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",(error)=>pageErrors.push(String(error)));
  await page.setContent(html,{waitUntil:"networkidle"});
  const pages=page.locator(".worksheet-page");
  for(let index=0;index<await pages.count();index+=1)await pages.nth(index).screenshot({path:path.join(OUTPUT,`q046-page-${String(index+1).padStart(2,"0")}.png`)});
  await page.emulateMedia({media:"print"});
  pageMetrics=await page.$$eval(".worksheet-page",(nodes)=>nodes.map((node,index)=>({index,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,overflowY:node.scrollHeight>node.clientHeight+1,overflowX:node.scrollWidth>node.clientWidth+1})));
  await page.pdf({path:pdfPath,format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"0",right:"0",bottom:"0",left:"0"}});
}finally{await browser.close();}

const questions=document.generatedQuestions,answers=document.answerKeyItems,registry=getCurrentPixelRegistrySnapshot(),source=registry.bySourceId[G5B_U06_P03F46_SOURCE_ID];
const crossLayerMismatchCount=questions.filter((q,index)=>!answers[index]||answers[index].questionId!==q.id||answers[index].answerText!==q.answerText||document.questionDisplayModels[index]?.promptText!==q.blankedDisplayText).length;
const exactAnswerMismatchCount=questions.filter((q)=>{
  const expected=exactDecimal(q.dividendCoefficient,(10**q.dividendScale)*q.integerDivisor);
  return q.answerText!==expected||q.quotient!==expected||q.finalAnswer?.canonicalText!==expected||q.finalAnswer?.exact!==true;
}).length;
const semanticScopeFindingCount=questions.filter((q)=>q.sourceId!==G5B_U06_P03F46_SOURCE_ID||q.metadata?.knowledgePointId!==G5B_U06_P03F46_KP_ID||q.metadata?.patternGroupId!==G5B_U06_P03F46_GROUP_ID||q.patternSpecId!==G5B_U06_P03F46_SPEC_ID||q.metadata?.productAdmissionTask!=="P03F_W3DirectProductVerticalSlice046Implementation").length;
const capabilityMismatchFindingCount=questions.filter((q)=>JSON.stringify(q.metadata?.requiredCapabilityIds??[])!==JSON.stringify(P03F46_REQUIRED_CAPABILITY_IDS)).length;
const futureScopeLeakFindingCount=questions.filter((q)=>q.questionMode!=="numeric"||q.globalContextProduction!=null||q.metadata?.contextAuthority!=null||q.metadata?.globalContextAuthorityPath!=null||q.metadata?.q050ApplicationExpansion!==false||q.metadata?.q050EstimationExpansion!==false||q.metadata?.q050ZeroPlaceholderKnowledgePointExpansion!==false).length;
const duplicatePromptFindingCount=questions.length-new Set(questions.map((q)=>q.blankedDisplayText)).size;
const observedDividendScales=[...new Set(questions.map((q)=>q.dividendScale))].sort((a,b)=>a-b);
const sourceWitness={present:questions.some((q)=>q.promptText==="48.32 ÷ 8 = ？"&&q.answerText==="6.04"),internalZeroQuotient:questions.some((q)=>q.answerText.includes("0"))};
const visibleIds=new Set((source?.visibleKnowledgePoints??[]).map((row)=>row.knowledgePointId??row.id));
const hiddenSiblingVisibleLeakCount=P03F46_HIDDEN_SIBLING_KP_IDS.filter((id)=>visibleIds.has(id)).length;
const adapter=document.metadata?.worksheetAdapter??{};
const report={
  schemaName:"P03FSlice046ChromiumProductAcceptanceReportV1",
  taskId:"P03F_W3DirectProductVerticalSlice046ChromiumAcceptance",
  status:"PASS_AUTOMATED_PENDING_VISUAL_REVIEW",
  sourceId:G5B_U06_P03F46_SOURCE_ID,
  publicSourceCount:registry.sourceCount,
  visibleKnowledgePointCount:registry.visibleKnowledgePointCount,
  sourceVisibleKnowledgePointCount:source?.visibleKnowledgePoints?.length??0,
  sourceHiddenKnowledgePointCount:source?.hiddenPendingCount??0,
  sourceNotSelectableKnowledgePointCount:source?.notSelectableCount??0,
  hiddenSiblingVisibleLeakCount,
  totalQuestionCount:questions.length,
  totalAnswerKeyItemCount:answers.length,
  questionPageCount:document.questionPages.length,
  answerPageCount:document.answerKeyPages.length,
  totalPhysicalPdfPageCount:physicalPages(pdfPath),
  screenshotCount:pageMetrics.length,
  observedKnowledgePointIds:[...new Set(questions.map((q)=>q.metadata?.knowledgePointId))],
  observedPatternGroupIds:[...new Set(questions.map((q)=>q.metadata?.patternGroupId))],
  observedPatternSpecIds:[...new Set(questions.map((q)=>q.patternSpecId))],
  observedDividendScales,
  sourceWitness,
  crossLayerMismatchCount,
  exactAnswerMismatchCount,
  semanticScopeFindingCount,
  capabilityMismatchFindingCount,
  futureScopeLeakFindingCount,
  duplicatePromptFindingCount,
  overflowFindingCount:pageMetrics.filter((row)=>row.overflowX||row.overflowY).length,
  consoleErrorCount:consoleErrors.length,
  pageErrorCount:pageErrors.length,
  sharedExactRationalNormalizer:adapter.sharedExactRationalNormalizer===true,
  sharedDecimalArithmetic:adapter.sharedDecimalArithmetic===true,
  sharedDecimalNumberSystem:adapter.sharedDecimalNumberSystem===true,
  sharedDecimalDomainValidator:adapter.sharedDecimalDomainValidator===true,
  sharedNumericRendererAdapter:adapter.sharedNumericRendererAdapter===true,
  sharedPagination:adapter.sharedPagination===true,
  sharedRenderer:adapter.sharedRenderer===true,
  parallelPipeline:adapter.parallelPipeline===true,
  applicationExpansion:document.metadata?.applicationExpansion===true,
  estimationExpansion:document.metadata?.estimationExpansion===true,
  zeroPlaceholderKnowledgePointExpansion:document.metadata?.zeroPlaceholderKnowledgePointExpansion===true,
  globalContextExpansion:document.metadata?.globalContextExpansion===true,
  q050ApplicationExpansion:document.metadata?.q050ApplicationExpansion===true,
  q050EstimationExpansion:document.metadata?.q050EstimationExpansion===true,
  q050ZeroPlaceholderKnowledgePointExpansion:document.metadata?.q050ZeroPlaceholderKnowledgePointExpansion===true,
  slice047Expansion:document.metadata?.slice047Expansion===true,
  htmlSha256:sha256(htmlPath),pdfSha256:sha256(pdfPath),pdfByteLength:fs.statSync(pdfPath).size,pageMetrics,
  visualReview:{status:"PENDING",allPagesReviewed:false},
};
const pass=report.publicSourceCount===33&&report.visibleKnowledgePointCount===247&&report.sourceVisibleKnowledgePointCount===2&&report.sourceHiddenKnowledgePointCount===3&&report.sourceNotSelectableKnowledgePointCount===3&&report.hiddenSiblingVisibleLeakCount===0&&report.totalQuestionCount===24&&report.totalAnswerKeyItemCount===24&&report.questionPageCount===3&&report.answerPageCount===3&&report.totalPhysicalPdfPageCount===6&&report.screenshotCount===6&&report.observedKnowledgePointIds.length===1&&report.observedKnowledgePointIds[0]===G5B_U06_P03F46_KP_ID&&report.observedPatternGroupIds.length===1&&report.observedPatternGroupIds[0]===G5B_U06_P03F46_GROUP_ID&&report.observedPatternSpecIds.length===1&&report.observedPatternSpecIds[0]===G5B_U06_P03F46_SPEC_ID&&[1,2,3].every((scale)=>report.observedDividendScales.includes(scale))&&report.sourceWitness.present&&report.sourceWitness.internalZeroQuotient&&report.crossLayerMismatchCount===0&&report.exactAnswerMismatchCount===0&&report.semanticScopeFindingCount===0&&report.capabilityMismatchFindingCount===0&&report.futureScopeLeakFindingCount===0&&report.duplicatePromptFindingCount===0&&report.overflowFindingCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0&&report.sharedExactRationalNormalizer&&report.sharedDecimalArithmetic&&report.sharedDecimalNumberSystem&&report.sharedDecimalDomainValidator&&report.sharedNumericRendererAdapter&&report.sharedPagination&&report.sharedRenderer&&!report.parallelPipeline&&!report.applicationExpansion&&!report.estimationExpansion&&!report.zeroPlaceholderKnowledgePointExpansion&&!report.globalContextExpansion&&!report.q050ApplicationExpansion&&!report.q050EstimationExpansion&&!report.q050ZeroPlaceholderKnowledgePointExpansion&&!report.slice047Expansion;
fs.writeFileSync(path.join(OUTPUT,"p03f-slice046-product-acceptance-report.json"),`${JSON.stringify(report,null,2)}\n`);
if(!pass)throw new Error(`P03F46_CHROMIUM_FAILED:${JSON.stringify(report)}`);
console.log(`P03F46_CHROMIUM_ACCEPTANCE=${JSON.stringify(report)}`);

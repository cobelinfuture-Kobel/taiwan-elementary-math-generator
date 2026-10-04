import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

import { buildG3AU01VisualRank04WorksheetDocument } from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank04-worksheet.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const OUT=path.resolve("tmp/g3a-u01-rank04-hidden-worksheet-acceptance");
fs.mkdirSync(OUT,{recursive:true});

const result=buildG3AU01VisualRank04WorksheetDocument({
  questionCount:60,
  generationSeed:"g3a-u01-rank04-hidden-density",
  includeAnswerKey:true,
  printLayout:{
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    showQuestionNumbers:true,
    showAnswerKeyPage:true,
  },
});
if(!result.ok){
  throw new Error("G3AU01_RANK04_HIDDEN_WORKSHEET_GENERATION_FAILED:"+JSON.stringify(result.errors));
}

const doc=result.worksheetDocument;
const css=fs.readFileSync(path.resolve("src/renderer/print-styles.css"),"utf8");
const raw=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
const html=raw.replace("</head>",`<style>${css}</style></head>`);

const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1280,height:1400}});
  await page.emulateMedia({media:"print"});
  await page.setContent(html,{waitUntil:"load"});

  const measurement=await page.evaluate(()=>{
    const questionCells=[...document.querySelectorAll(".worksheet-cell--question")];
    const answerCells=[...document.querySelectorAll(".worksheet-cell--answer-key")];
    const pages=[...document.querySelectorAll(".worksheet-page")].map((node,index)=>{
      const cells=[...node.querySelectorAll(".worksheet-cell")].map((cell)=>{
        const cr=cell.getBoundingClientRect();
        const rep=cell.querySelector('[data-representation="integer-number-line"]');
        const rr=rep?.getBoundingClientRect()??null;
        return {
          questionId:cell.dataset.questionId??null,
          cellType:cell.dataset.cellType??null,
          overflowY:cell.scrollHeight>cell.clientHeight+1 || (rr?rr.bottom>cr.bottom+1:false),
          overflowX:cell.scrollWidth>cell.clientWidth+1 || (rr?rr.right>cr.right+1:false),
          markerCount:cell.querySelectorAll('[data-answer-marker="true"]').length,
          markerPolicy:rep?.dataset?.markerPolicy??null,
          labelCount:rep?.querySelectorAll("svg text").length??0,
        };
      });
      return {
        index,
        overflowY:node.scrollHeight>node.clientHeight+1,
        overflowX:node.scrollWidth>node.clientWidth+1,
        cells,
      };
    });
    return {
      pages,
      questionCellCount:questionCells.length,
      answerCellCount:answerCells.length,
      questionMarkerCount:questionCells.reduce(
        (sum,cell)=>sum+cell.querySelectorAll('[data-answer-marker="true"]').length,0
      ),
      answerMarkerCount:answerCells.reduce(
        (sum,cell)=>sum+cell.querySelectorAll('[data-answer-marker="true"]').length,0
      ),
      questionForbiddenPolicyCount:questionCells.filter(
        (cell)=>cell.querySelector('[data-representation="integer-number-line"]')?.dataset?.markerPolicy==="forbidden"
      ).length,
      answerForbiddenPolicyCount:answerCells.filter(
        (cell)=>cell.querySelector('[data-representation="integer-number-line"]')?.dataset?.markerPolicy==="forbidden"
      ).length,
    };
  });

  const pages=measurement.pages;
  const cells=pages.flatMap((row)=>row.cells);
  const overflowPages=pages.filter((row)=>row.overflowX||row.overflowY);
  const overflowCells=cells.filter((row)=>row.overflowX||row.overflowY);
  const tickCounts=[...new Set(doc.questionDisplayModels.map((row)=>row.numberLine.tickCount))].sort((a,b)=>a-b);
  const missingCounts=[...new Set(doc.questionDisplayModels.map((row)=>row.layoutHints.missingLabelCount))].sort((a,b)=>a-b);

  const browserByQuestion=new Map(
    cells.filter((row)=>row.questionId).map((row)=>[`${row.cellType}:${row.questionId}`,row])
  );
  const projectionMismatchCount=doc.questionDisplayModels.reduce((count,row,index)=>{
    const question=browserByQuestion.get(`question:${row.questionId}`);
    const answer=browserByQuestion.get(`answer-key:${row.questionId}`);
    const missing=row.layoutHints.missingLabelCount;
    const expectedQuestionLabels=row.numberLine.tickCount-missing;
    const expectedAnswerLabels=doc.answerKeyItems[index].numberLine.tickCount;
    return count + (
      question?.labelCount===expectedQuestionLabels
      && answer?.labelCount===expectedAnswerLabels
        ? 0 : 1
    );
  },0);

  const report={
    schemaName:"G3AU01Rank04HiddenWorksheetAcceptanceV1",
    status:
      overflowPages.length===0
      && overflowCells.length===0
      && measurement.questionCellCount===60
      && measurement.answerCellCount===60
      && measurement.questionMarkerCount===0
      && measurement.answerMarkerCount===0
      && measurement.questionForbiddenPolicyCount===60
      && measurement.answerForbiddenPolicyCount===60
      && projectionMismatchCount===0
        ?"PASS"
        :"FAIL",
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    questionPageCount:doc.questionPages.length,
    answerPageCount:doc.answerKeyPages.length,
    renderedPageCount:pages.length,
    renderedCellCount:cells.length,
    tickCounts,
    missingCounts,
    overflowPageCount:overflowPages.length,
    overflowCellCount:overflowCells.length,
    questionMarkerCount:measurement.questionMarkerCount,
    answerMarkerCount:measurement.answerMarkerCount,
    questionForbiddenPolicyCount:measurement.questionForbiddenPolicyCount,
    answerForbiddenPolicyCount:measurement.answerForbiddenPolicyCount,
    projectionMismatchCount,
    twelveTickCasePresent:doc.questionDisplayModels.some((row)=>row.numberLine.tickCount===12),
  };

  fs.writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  await page.screenshot({path:path.join(OUT,"preview.png"),fullPage:true});

  if(report.status!=="PASS"){
    throw new Error("G3AU01_RANK04_HIDDEN_WORKSHEET_ACCEPTANCE_FAILED:"+JSON.stringify(report));
  }
  if(JSON.stringify(tickCounts)!==JSON.stringify([7,8,9,10,11,12])){
    throw new Error("G3AU01_RANK04_HIDDEN_TICK_DENSITY_COVERAGE_INVALID");
  }
  if(JSON.stringify(missingCounts)!==JSON.stringify([1,2,3])){
    throw new Error("G3AU01_RANK04_HIDDEN_MISSING_COUNT_COVERAGE_INVALID");
  }
  console.log("G3AU01_RANK04_HIDDEN_WORKSHEET_ACCEPTANCE="+JSON.stringify(report));
}finally{
  await browser.close();
}

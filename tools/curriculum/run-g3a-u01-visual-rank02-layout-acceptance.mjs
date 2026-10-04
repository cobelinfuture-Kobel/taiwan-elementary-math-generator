import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

import { buildG3AU01VisualRank02WorksheetDocument } from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-worksheet.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const OUT=path.resolve("tmp/g3a-u01-rank02-layout-acceptance");
fs.mkdirSync(OUT,{recursive:true});

const result=buildG3AU01VisualRank02WorksheetDocument({
  questionCount:60,
  generationSeed:"g3a-u01-rank02-layout-density",
  includeAnswerKey:true,
  printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showQuestionNumbers:true,showAnswerKeyPage:true}
});
if(!result.ok) throw new Error("G3AU01_RANK02_LAYOUT_GENERATION_FAILED:"+JSON.stringify(result.errors));

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
    const pageRows=[...document.querySelectorAll(".worksheet-page")].map((node,index)=>{
      const rect=node.getBoundingClientRect();
      const cells=[...node.querySelectorAll(".worksheet-cell")].map((cell)=>{
        const cr=cell.getBoundingClientRect();
        const rep=cell.querySelector('[data-representation="integer-number-line"]');
        const rr=rep?.getBoundingClientRect()??null;
        return {
          questionId:cell.dataset.questionId??null,
          clientHeight:cell.clientHeight,
          scrollHeight:cell.scrollHeight,
          clientWidth:cell.clientWidth,
          scrollWidth:cell.scrollWidth,
          representationBottom:rr?rr.bottom:null,
          cellBottom:cr.bottom,
          representationRight:rr?rr.right:null,
          cellRight:cr.right,
          overflowY:cell.scrollHeight>cell.clientHeight+1 || (rr?rr.bottom>cr.bottom+1:false),
          overflowX:cell.scrollWidth>cell.clientWidth+1 || (rr?rr.right>cr.right+1:false),
        };
      });
      return {
        index,
        clientHeight:node.clientHeight,
        scrollHeight:node.scrollHeight,
        clientWidth:node.clientWidth,
        scrollWidth:node.scrollWidth,
        overflowY:node.scrollHeight>node.clientHeight+1,
        overflowX:node.scrollWidth>node.clientWidth+1,
        cells,
        width:rect.width,
        height:rect.height,
      };
    });
    return {pages:pageRows};
  });

  const pages=measurement.pages;
  const cells=pages.flatMap(row=>row.cells);
  const overflowPages=pages.filter(row=>row.overflowX||row.overflowY);
  const overflowCells=cells.filter(row=>row.overflowX||row.overflowY);
  const tickCounts=[...new Set(doc.questionDisplayModels.map(row=>row.numberLine.tickCount))].sort((a,b)=>a-b);
  const report={
    schemaName:"G3AU01Rank02ActualA4LayoutAcceptanceV1",
    status:overflowPages.length===0&&overflowCells.length===0?"PASS":"FAIL",
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    questionPageCount:doc.questionPages.length,
    answerPageCount:doc.answerKeyPages.length,
    renderedPageCount:pages.length,
    renderedCellCount:cells.length,
    tickCounts,
    overflowPageCount:overflowPages.length,
    overflowCellCount:overflowCells.length,
    twelveTickCasePresent:doc.questionDisplayModels.some(row=>row.numberLine.tickCount===12),
  };
  fs.writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  await page.screenshot({path:path.join(OUT,"preview.png"),fullPage:true});
  if(report.status!=="PASS") throw new Error("G3AU01_RANK02_LAYOUT_OVERFLOW:"+JSON.stringify(report));
  if(JSON.stringify(tickCounts)!==JSON.stringify([7,8,9,10,11,12])) throw new Error("G3AU01_RANK02_LAYOUT_DENSITY_COVERAGE_INVALID");
  if(!report.twelveTickCasePresent) throw new Error("G3AU01_RANK02_LAYOUT_12_TICK_CASE_MISSING");
  console.log("G3AU01_RANK02_ACTUAL_A4_LAYOUT_ACCEPTANCE="+JSON.stringify(report));
}finally{
  await browser.close();
}

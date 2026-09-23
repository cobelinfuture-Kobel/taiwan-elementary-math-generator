import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { startStaticPreviewServer } from "../../tools/preview/serve-preview.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

function requestText(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode ?? 0,
          headers: response.headers,
          body
        });
      });
    }).on("error", reject);
  });
}

test("grouped preview can be opened through local static server", async () => {
  const { server, host, port } = await startStaticPreviewServer({ port: 0, rootDir: PROJECT_ROOT });
  const actualPort = server.address().port;

  try {
    const response = await requestText(`http://${host}:${actualPort}/tools/preview/output/grouped-preview.html`);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.includes("worksheet-page worksheet-page--questions print-page"), true);
  } finally {
    server.close();
  }
});

test("shuffled preview can be opened through local static server", async () => {
  const { server, host } = await startStaticPreviewServer({ port: 0, rootDir: PROJECT_ROOT });
  const actualPort = server.address().port;

  try {
    const response = await requestText(`http://${host}:${actualPort}/tools/preview/output/shuffled-preview.html`);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.includes("Shuffled Worksheet Preview"), true);
  } finally {
    server.close();
  }
});

test("multipage preview can be opened through local static server", async () => {
  const { server, host } = await startStaticPreviewServer({ port: 0, rootDir: PROJECT_ROOT });
  const actualPort = server.address().port;

  try {
    const response = await requestText(`http://${host}:${actualPort}/tools/preview/output/multipage-preview.html`);
    assert.equal(response.statusCode, 200);
    assert.equal((response.body.match(/worksheet-page worksheet-page--questions print-page/g) ?? []).length > 1, true);
  } finally {
    server.close();
  }
});

test("print stylesheet loads correctly over http", async () => {
  const { server, host } = await startStaticPreviewServer({ port: 0, rootDir: PROJECT_ROOT });
  const actualPort = server.address().port;

  try {
    const response = await requestText(`http://${host}:${actualPort}/src/renderer/print-styles.css`);
    assert.equal(response.statusCode, 200);
    assert.equal(String(response.headers["content-type"]).includes("text/css"), true);
    assert.equal(response.body.includes("@media print"), true);
  } finally {
    server.close();
  }
});

test("preview index links all regression outputs", async () => {
  const { server, host } = await startStaticPreviewServer({ port: 0, rootDir: PROJECT_ROOT });
  const actualPort = server.address().port;

  try {
    const response = await requestText(`http://${host}:${actualPort}/tools/preview/index.html`);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.includes("./output/grouped-preview.html"), true);
    assert.equal(response.body.includes("./output/shuffled-preview.html"), true);
    assert.equal(response.body.includes("./output/multipage-preview.html"), true);
  } finally {
    server.close();
  }
});

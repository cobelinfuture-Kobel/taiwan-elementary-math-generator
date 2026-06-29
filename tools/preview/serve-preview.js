import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const FALLBACK_DEFAULT_INDEX_ROUTE = "/tools/preview/index.html";

const CONTENT_TYPES = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
});

function getContentType(filePath) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}

function resolveRequestPath(urlPathname, rootDir, defaultIndexRoute = FALLBACK_DEFAULT_INDEX_ROUTE) {
  const normalizedPath = urlPathname === "/" ? defaultIndexRoute : urlPathname;
  const decodedPath = decodeURIComponent(normalizedPath);
  const absolutePath = path.resolve(rootDir, `.${decodedPath}`);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }

  return absolutePath;
}

export function createStaticPreviewServer(options = {}) {
  const rootDir = path.resolve(options.rootDir ?? PROJECT_ROOT);
  const defaultIndexRoute = options.defaultIndexRoute ?? FALLBACK_DEFAULT_INDEX_ROUTE;

  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const absolutePath = resolveRequestPath(requestUrl.pathname, rootDir, defaultIndexRoute);

    if (!absolutePath) {
      sendText(response, 403, "Forbidden");
      return;
    }

    if (!existsSync(absolutePath)) {
      sendText(response, 404, "Not Found");
      return;
    }

    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      const nestedIndexPath = path.join(absolutePath, "index.html");
      if (!existsSync(nestedIndexPath)) {
        sendText(response, 403, "Directory listing is disabled.");
        return;
      }

      response.writeHead(302, { Location: `${requestUrl.pathname.replace(/\/?$/, "/")}index.html` });
      response.end();
      return;
    }

    response.writeHead(200, {
      "Content-Type": getContentType(absolutePath),
      "Cache-Control": "no-cache"
    });
    createReadStream(absolutePath).pipe(response);
  });
}

export function startStaticPreviewServer(options = {}) {
  const port = options.port ?? 4173;
  const host = options.host ?? "127.0.0.1";
  const defaultIndexRoute = options.defaultIndexRoute ?? FALLBACK_DEFAULT_INDEX_ROUTE;
  const server = createStaticPreviewServer(options);

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      resolve({
        server,
        port,
        host,
        rootDir: path.resolve(options.rootDir ?? PROJECT_ROOT),
        previewUrl: `http://${host}:${port}${defaultIndexRoute}`
      });
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startStaticPreviewServer().then(({ previewUrl, rootDir }) => {
    console.log(`Static preview server root: ${rootDir}`);
    console.log(`Open ${previewUrl}`);
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

import { createStaticPreviewServer } from "../preview/serve-preview.js";

const SITE_PORT = Number(process.env.SITE_PORT ?? 4174);
const SITE_HOST = process.env.SITE_HOST ?? "127.0.0.1";
const SITE_ROOT = new URL("../../site", import.meta.url).pathname;

const server = createStaticPreviewServer({
  rootDir: SITE_ROOT,
  defaultIndexRoute: "/index.html"
});

server.listen(SITE_PORT, SITE_HOST, () => {
  console.log(`Site static server root: ${SITE_ROOT}`);
  console.log(`Open http://${SITE_HOST}:${SITE_PORT}/index.html`);
});

server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
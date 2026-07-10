import test from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

function walk(directory, root = directory) {
  const rows = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) rows.push(...walk(path, root));
    else if (name.endsWith(".test.js") && name !== "zzzz-s57f2-count-scan.test.js") {
      const lines = readFileSync(path, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        if (/\b83\b/.test(line)) rows.push(`${relative(root, path)}:${index + 1}:${line.trim()}`);
      });
    }
  }
  return rows;
}

test("S57F2 diagnostic lists legacy hard-coded selector count assertions", () => {
  const matches = walk(new URL(".", import.meta.url).pathname);
  throw new Error(`S57F2_SELECTOR_COUNT_MATCHES\n${matches.join("\n")}`);
});

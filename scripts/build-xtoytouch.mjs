import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "scripts", "xtoytouch-source");
const outputDir = path.join(root, "public", "xtoytouch");

const parts = (await readdir(sourceDir))
  .filter((name) => name.endsWith(".b64"))
  .sort();

if (!parts.length) {
  throw new Error("Fonte do XtoyTouch nao encontrada.");
}

const encoded = (await Promise.all(
  parts.map((name) => readFile(path.join(sourceDir, name), "utf8")),
))
  .join("")
  .replace(/\s+/g, "");

let script = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");

// Identidade oficial do projeto. Mantemos esse ajuste como salvaguarda para que
// um pacote antigo nunca volte a publicar o namespace da antiga comunidade.
script = script.replace(
  /^\/\/\s*@namespace\s+.*$/m,
  "// @namespace    https://xtoybox.cloud/",
);

// O arquivo completo já possui estas URLs. Este fallback serve apenas para
// futuras fontes que sejam enviadas sem os campos de atualização.
if (!/^\/\/\s*@updateURL\s+/m.test(script)) {
  script = script.replace(
    /^\/\/\s*@supportURL\s+.*$/m,
    (line) => `${line}\n// @updateURL    https://xtoybox.cloud/xtoytouch/XtoyTouch.meta.js\n// @downloadURL  https://xtoybox.cloud/xtoytouch/XtoyTouch.user.js`,
  );
}

const metadataMarker = "// ==/UserScript==";
const metadataEnd = script.indexOf(metadataMarker);

if (metadataEnd === -1) {
  throw new Error("Metadata do XtoyTouch nao encontrada.");
}

const metadata = `${script.slice(0, metadataEnd + metadataMarker.length)}\n`;

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "XtoyTouch.user.js"), script, "utf8");
await writeFile(path.join(outputDir, "XtoyTouch.meta.js"), metadata, "utf8");

console.log(`XtoyTouch ${metadata.match(/@version\s+([^\s]+)/)?.[1] || ""} preparado para publicacao.`);

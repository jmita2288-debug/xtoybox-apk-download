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

const storedParts = await Promise.all(parts.map((name) => readFile(path.join(sourceDir, name), "utf8")));

// Os três primeiros blocos são armazenados sem o primeiro caractere para manter
// os blobs de publicação dentro do limite do conector usado na manutenção.
// A reconstrução acontece apenas no build; o arquivo servido ao usuário é o JS original.
const prefixes = ["H", "Y", "t"];
const encoded = storedParts
  .map((part, index) => `${prefixes[index] || ""}${part}`)
  .join("")
  .replace(/\s+/g, "");

const script = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
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

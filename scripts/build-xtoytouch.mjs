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
const cleanParts = storedParts.map((part) => part.replace(/\s+/g, ""));
const metadataMarker = "// ==/UserScript==";
const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decodeCandidate(prefixes) {
  const encoded = cleanParts
    .map((part, index) => `${prefixes[index] || ""}${part}`)
    .join("");

  try {
    const candidate = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
    if (!candidate.includes(metadataMarker) || !candidate.includes("@name         XtoyTouch - xCloud")) return null;
    return candidate;
  } catch {
    return null;
  }
}

// O primeiro bloco perdeu apenas o H de um cabeçalho gzip em Base64 (H4sI...).
// Os dois blocos seguintes também foram armazenados sem o primeiro caractere.
// Descobrimos esses dois caracteres durante o build para não depender de um
// prefixo manual incorreto e quebrar a publicação do site.
let script = null;
let recoveredPrefixes = null;

if (cleanParts.length >= 3) {
  outer:
  for (const secondPrefix of base64Alphabet) {
    for (const thirdPrefix of base64Alphabet) {
      const prefixes = ["H", secondPrefix, thirdPrefix];
      const candidate = decodeCandidate(prefixes);
      if (candidate) {
        script = candidate;
        recoveredPrefixes = prefixes;
        break outer;
      }
    }
  }
} else {
  script = decodeCandidate(["H"]);
  recoveredPrefixes = script ? ["H"] : null;
}

if (!script) {
  throw new Error("Nao foi possivel reconstruir a fonte do XtoyTouch.");
}

// A comunidade SafeZone nao faz mais parte do projeto. O namespace oficial
// passa a pertencer exclusivamente ao XTOYBOX e e aplicado tanto no instalador
// quanto no arquivo de metadata usado para atualizacoes.
script = script.replace(
  /^\/\/\s*@namespace\s+.*$/m,
  "// @namespace    https://xtoybox.cloud/",
);

const metadataEnd = script.indexOf(metadataMarker);
if (metadataEnd === -1) {
  throw new Error("Metadata do XtoyTouch nao encontrada.");
}

const metadata = `${script.slice(0, metadataEnd + metadataMarker.length)}\n`;

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "XtoyTouch.user.js"), script, "utf8");
await writeFile(path.join(outputDir, "XtoyTouch.meta.js"), metadata, "utf8");

console.log(`XtoyTouch ${metadata.match(/@version\s+([^\s]+)/)?.[1] || ""} preparado para publicacao.`);
console.log(`Prefixos recuperados: ${recoveredPrefixes?.join(",") || "n/a"}`);
console.log("Namespace oficial: https://xtoybox.cloud/");

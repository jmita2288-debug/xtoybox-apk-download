const SOURCE_URL = "https://raw.githubusercontent.com/Alexandre0062/touchx/main/touchx.user.js";
const PUBLIC_BASE = "https://xtoybox.cloud/xtoytouch";
const UPDATE_URL = `${PUBLIC_BASE}/XtoyTouch.meta.js`;
const DOWNLOAD_URL = `${PUBLIC_BASE}/XtoyTouch.user.js`;
const END_MARKER = "// ==/UserScript==";

function injectUpdateMetadata(source) {
  const markerIndex = source.indexOf(END_MARKER);
  if (markerIndex === -1) {
    throw new Error("Metadata do userscript nao encontrada");
  }

  let header = source.slice(0, markerIndex).trimEnd();
  const suffix = source.slice(markerIndex);

  header = header
    .replace(/^\/\/\s*@updateURL\s+.*(?:\r?\n|$)/gim, "")
    .replace(/^\/\/\s*@downloadURL\s+.*(?:\r?\n|$)/gim, "")
    .trimEnd();

  const lines = header.split(/\r?\n/);
  const updateLines = [
    `// @updateURL    ${UPDATE_URL}`,
    `// @downloadURL  ${DOWNLOAD_URL}`,
  ];
  const runAtIndex = lines.findIndex((line) => /^\/\/\s*@run-at\b/i.test(line));

  if (runAtIndex >= 0) lines.splice(runAtIndex, 0, ...updateLines);
  else lines.push(...updateLines);

  return `${lines.join("\n")}\n${suffix}`;
}

function metadataOnly(script) {
  const markerIndex = script.indexOf(END_MARKER);
  if (markerIndex === -1) {
    throw new Error("Metadata do userscript nao encontrada");
  }
  return `${script.slice(0, markerIndex + END_MARKER.length)}\n`;
}

export default async function handler(req, res) {
  try {
    const response = await fetch(SOURCE_URL, {
      headers: {
        Accept: "text/plain, application/javascript;q=0.9, */*;q=0.1",
        "User-Agent": "XTOYBOX-XtoyTouch-Updater",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GitHub respondeu ${response.status}`);
    }

    const source = await response.text();
    const script = injectUpdateMetadata(source);
    const mode = String(req.query?.mode || "script").toLowerCase();
    const body = mode === "meta" ? metadataOnly(script) : script;

    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=300");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (mode !== "meta") {
      res.setHeader("Content-Disposition", 'inline; filename="XtoyTouch.user.js"');
    }
    res.status(200).send(body);
  } catch (error) {
    console.error("XtoyTouch updater error:", error);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).send("// XtoyTouch: fonte temporariamente indisponivel.\n");
  }
}

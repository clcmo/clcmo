// Gera o site do GitHub Pages em _site/ a partir de content/*.md (nada disso é versionado).
import { mkdir, rm, writeFile } from "node:fs/promises";
import { Marked } from "marked";
import { DEFAULT_LANG, LANGS, fill, loadAll, renderReadme, resolveRepo, slug } from "./lib.mjs";

const OUT = "_site";
const BRANCH = process.env.SITE_BRANCH ?? "main";

const repo = await resolveRepo();
const docs = await loadAll();
const [owner, name] = repo.split("/");
const blobBase = `https://github.com/${repo}/blob/${BRANCH}/`;

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Links relativos do README (LICENSE, .github/...) viram links absolutos para o GitHub.
const marked = new Marked({ gfm: true });
marked.use({
  walkTokens(token) {
    if (token.type === "link" && !/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(token.href)) {
      token.href = blobBase + token.href.replace(/^\.?\//, "");
    }
  },
});

// Âncoras nos títulos (o marked não gera ids).
const withIds = (html) =>
  html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (_, n, inner) => `<h${n} id="${slug(inner)}">${inner}</h${n}>`);

const CSS = `
:root{
  --bg:#f6f7f9; --ink:#161a22; --muted:#566170; --line:#d9dee6; --accent:#234e8f; --code:#eceff4;
  --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --serif:ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  color-scheme:light dark;
}
@media (prefers-color-scheme:dark){
  :root{--bg:#11151c;--ink:#e7eaf0;--muted:#9aa5b5;--line:#2a313d;--accent:#8fb6f2;--code:#1a2029}
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:1.125rem/1.75 var(--serif)}
a{color:var(--accent);text-underline-offset:.18em}
a:focus-visible,button:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:2px}
.wrap{max-width:46rem;margin:0 auto;padding:0 1.25rem}
header{border-bottom:1px solid var(--line);font:600 .95rem/1 var(--sans)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:3.5rem}
header .repo{color:var(--ink);text-decoration:none}
nav{display:flex;gap:.25rem}
nav a{color:var(--muted);text-decoration:none;padding:.5rem .65rem;border-bottom:2px solid transparent}
nav a:hover{color:var(--ink)}
nav a[aria-current="page"]{color:var(--ink);border-bottom-color:var(--accent)}
main{padding:2.5rem 0 4rem}
h1,h2,h3,h4{font-family:var(--sans);line-height:1.2;letter-spacing:-.01em;scroll-margin-top:1rem}
h1{font-size:clamp(2rem,6vw,2.9rem);margin:0 0 1.25rem}
h2{font-size:1.5rem;margin:3rem 0 .75rem;padding-top:1.25rem;border-top:1px solid var(--line)}
h3{font-size:1.15rem;margin:2rem 0 .5rem}
p,ul,ol{margin:0 0 1.1rem}
li{margin:.25rem 0}
p:has(> a > img){display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem}
p > a > img,p > img{display:block;height:28px;width:auto;max-width:100%}
code{font:.88em var(--mono);background:var(--code);padding:.12em .35em;border-radius:4px}
pre{background:var(--code);padding:1rem 1.1rem;border-radius:6px;overflow-x:auto;line-height:1.55}
pre code{background:none;padding:0}
table{display:block;overflow-x:auto;border-collapse:collapse;margin:0 0 1.25rem}
th,td{padding:.45rem .8rem;border:1px solid var(--line);text-align:left}
footer{border-top:1px solid var(--line);color:var(--muted);font:.9rem/1.6 var(--sans);padding:1.5rem 0 3rem}
footer .wrap{display:flex;gap:1.25rem}
footer a{color:var(--muted)}
`;

function page(lang, doc) {
  const md = renderReadme(lang, doc, repo, "site");
  const html = withIds(marked.parse(md));
  const alternates = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="../${l.code}/">`,
  ).join("\n  ");
  const nav = LANGS.map(
    (l) =>
      `<a href="../${l.code}/" lang="${l.htmlLang}" hreflang="${l.htmlLang}"${l.code === lang.code ? ' aria-current="page"' : ""}>${esc(l.label)}</a>`,
  ).join("");

  return `<!doctype html>
<html lang="${lang.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fill(doc.meta.title, repo))}</title>
  <meta name="description" content="${esc(fill(doc.meta.description, repo))}">
  ${alternates}
  <style>${CSS}</style>
</head>
<body>
  <header><div class="wrap">
    <a class="repo" href="https://github.com/${repo}">${esc(owner)}/${esc(name)}</a>
    <nav aria-label="Idioma / Language">${nav}</nav>
  </div></header>
  <main><div class="wrap"><article>
${html}
  </article></div></main>
  <footer><div class="wrap">
    <a href="https://github.com/${repo}">GitHub</a>
    <a href="${blobBase}LICENSE">MIT</a>
  </div></footer>
</body>
</html>
`;
}

function redirect() {
  const map = Object.fromEntries(LANGS.map((l) => [l.code.split("-")[0], l.code]));
  const links = LANGS.map((l) => `<a href="./${l.code}/" lang="${l.htmlLang}">${esc(l.label)}</a>`).join(" | ");
  return `<!doctype html>
<html lang="${DEFAULT_LANG.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(name)}</title>
  <link rel="canonical" href="./${DEFAULT_LANG.code}/">
  <noscript><meta http-equiv="refresh" content="0; url=./${DEFAULT_LANG.code}/"></noscript>
  <script>
    (function () {
      var map = ${JSON.stringify(map)};
      var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
      var target = "${DEFAULT_LANG.code}";
      for (var i = 0; i < prefs.length; i++) {
        var short = String(prefs[i]).toLowerCase().split("-")[0];
        if (map[short]) { target = map[short]; break; }
      }
      location.replace("./" + target + "/");
    })();
  </script>
</head>
<body style="font-family:system-ui,sans-serif;padding:2rem">
  <p>${links}</p>
</body>
</html>
`;
}

await rm(OUT, { recursive: true, force: true });
for (const lang of LANGS) {
  await mkdir(`${OUT}/${lang.code}`, { recursive: true });
  await writeFile(`${OUT}/${lang.code}/index.html`, page(lang, docs[lang.code]));
  console.log(`✔ ${OUT}/${lang.code}/index.html`);
}
await writeFile(`${OUT}/index.html`, redirect());
await writeFile(`${OUT}/.nojekyll`, "");
console.log(`✔ ${OUT}/index.html`);

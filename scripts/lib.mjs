// Utilitários compartilhados por build-readme.mjs e build-site.mjs.
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

/** Idiomas suportados. O primeiro com `readme: "README.md"` é o padrão do GitHub. */
export const LANGS = [
  { code: "pt-br", htmlLang: "pt-BR", label: "Português", flag: "🇧🇷", readme: "README.md" },
  { code: "en", htmlLang: "en", label: "English", flag: "🇺🇸", readme: "README.en.md" },
];
export const DEFAULT_LANG = LANGS[0];

const REQUIRED_KEYS = ["title", "description", "toc"];
const GITHUB_REMOTE = /github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/;

/** Descobre "dono/repositório": variável do Actions, depois git remote, depois package.json. */
export async function resolveRepo() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;

  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const m = url.match(GITHUB_REMOTE);
    if (m) return `${m[1]}/${m[2]}`;
  } catch {
    /* sem git ou sem remote: segue para o package.json */
  }

  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  const m = String(pkg.repository?.url ?? pkg.repository ?? "").match(GITHUB_REMOTE);
  if (m) return `${m[1]}/${m[2]}`;

  throw new Error("Não foi possível descobrir o repositório. Defina GITHUB_REPOSITORY=dono/repo.");
}

/** Lê content/<code>.md: front matter simples (chave: valor) + corpo em Markdown. */
export async function loadContent(lang) {
  const path = `content/${lang.code}.md`;
  const raw = (await readFile(path, "utf8")).replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${path}: front matter ausente (--- ... ---).`);

  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  for (const key of REQUIRED_KEYS) {
    if (!meta[key]) throw new Error(`${path}: campo obrigatório "${key}" ausente no front matter.`);
  }
  return { meta, body: m[2].trim(), path };
}

/** Títulos de nível 2 fora de blocos de código. */
export function headings(body) {
  const out = [];
  let fence = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h = !fence && line.match(/^## +(.+?)\s*#*$/);
    if (h) out.push(h[1]);
  }
  return out;
}

/** Slug no padrão de âncoras do GitHub (mantém letras acentuadas). */
export function slug(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

/** Carrega todos os idiomas e garante que as versões têm a mesma estrutura. */
export async function loadAll() {
  const docs = {};
  for (const lang of LANGS) docs[lang.code] = await loadContent(lang);

  const [ref, ...rest] = LANGS;
  for (const lang of rest) {
    const a = headings(docs[ref.code].body).length;
    const b = headings(docs[lang.code].body).length;
    if (a !== b) {
      throw new Error(
        `Estrutura diferente: ${docs[ref.code].path} tem ${a} seções (##) e ${docs[lang.code].path} tem ${b}.`,
      );
    }
  }
  return docs;
}

/** Substitui os marcadores internos {{REPO}}, {{OWNER}}, {{NAME}}, {{PAGES_URL}}. */
export function fill(text, repo) {
  const [owner, name] = repo.split("/");
  const vars = { REPO: repo, OWNER: owner, NAME: name, PAGES_URL: `https://${owner}.github.io/${name}/` };
  return text.replace(/\{\{(REPO|OWNER|NAME|PAGES_URL)\}\}/g, (_, k) => vars[k]);
}

function badges(repo) {
  const [owner] = repo.split("/");
  const s = (path, extra = "") => `https://img.shields.io/github/${path}?style=for-the-badge${extra}`;
  return [
    `[![License](${s(`license/${repo}`)})](LICENSE)`,
    `[![Release](${s(`v/release/${repo}`)})](https://github.com/${repo}/releases)`,
    `[![CI](${s(`actions/workflow/status/${repo}/ci.yml`, "&label=CI")})](https://github.com/${repo}/actions/workflows/ci.yml)`,
    `[![Stars](${s(`stars/${repo}`)})](https://github.com/${repo}/stargazers)`,
    `[![Forks](${s(`forks/${repo}`)})](https://github.com/${repo}/network)`,
    `[![Issues](${s(`issues/${repo}`)})](https://github.com/${repo}/issues)`,
    `[![Sponsors](${s(`sponsors/${owner}`, "&color=pink")})](https://github.com/sponsors/${owner})`,
  ].join("\n");
}

function langSwitch(current) {
  return LANGS.map((l) =>
    l.code === current.code ? `${l.flag} **${l.label}**` : `${l.flag} [${l.label}](${l.readme})`,
  ).join(" | ");
}

/**
 * Monta o Markdown final.
 * mode "github": README com seletor de idioma. mode "site": sem seletor (o layout HTML tem o seu).
 */
export function renderReadme(lang, doc, repo, mode = "github") {
  const { meta, body } = doc;
  const text = fill(body, repo);
  const items = headings(text);

  const parts = [
    `<!-- ARQUIVO GERADO / GENERATED FILE — edite/edit content/${lang.code}.md e rode/run \`npm run build:readme\` -->`,
  ];
  if (mode === "github") parts.push(langSwitch(lang));
  parts.push(`# ${fill(meta.title, repo)}`, badges(repo), fill(meta.description, repo));

  if (items.length >= 4) {
    parts.push(`## ${meta.toc}`, items.map((h) => `- [${h}](#${slug(h)})`).join("\n"));
  }
  parts.push(text);
  return parts.join("\n\n") + "\n";
}

// Gera README.md (padrão) e README.en.md a partir de content/*.md.
import { writeFile } from "node:fs/promises";
import { LANGS, loadAll, renderReadme, resolveRepo } from "./lib.mjs";

const repo = await resolveRepo();
const docs = await loadAll();

for (const lang of LANGS) {
  await writeFile(lang.readme, renderReadme(lang, docs[lang.code], repo, "github"));
  console.log(`✔ ${lang.readme}`);
}

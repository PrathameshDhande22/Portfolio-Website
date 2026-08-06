import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";

export const SHIKI_THEMES = { light: "github-light", dark: "github-dark" };

const FENCE = /^[ \t]*(?:```|~~~)([A-Za-z0-9_+#-]+)/gm;

let core: Promise<HighlighterCore> | null = null;

function highlighterCore() {
  core ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });

  return core;
}

export async function highlighterFor(markdown: string): Promise<HighlighterCore> {
  const highlighter = await highlighterCore();
  const loaded = new Set(highlighter.getLoadedLanguages());

  const wanted = [...markdown.matchAll(FENCE)]
    .map((match) => match[1].toLowerCase())
    .filter((lang) => !loaded.has(lang) && lang in bundledLanguages);

  await Promise.all(
    [...new Set(wanted)].map((lang) =>
      highlighter.loadLanguage(bundledLanguages[lang as keyof typeof bundledLanguages])
    )
  );

  return highlighter;
}

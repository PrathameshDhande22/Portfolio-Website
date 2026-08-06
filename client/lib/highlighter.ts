import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubLight from "shiki/themes/github-light.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import csharp from "shiki/langs/csharp.mjs";
import html from "shiki/langs/html.mjs";
import java from "shiki/langs/java.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import python from "shiki/langs/python.mjs";
import sql from "shiki/langs/sql.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";

export const highlighter = createHighlighterCoreSync({
  themes: [githubLight, githubDark],
  langs: [bash, css, csharp, html, java, javascript, json, markdown, python, sql, tsx, typescript, yaml],
  engine: createJavaScriptRegexEngine(),
});

export const SHIKI_THEMES = { light: "github-light", dark: "github-dark" };

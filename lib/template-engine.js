import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { readdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import Handlebars from "handlebars";
import { registerHelpers } from "./helpers.js";
import { loadConfig, getCacheDir } from "./registry.js";

// Register Handlebars helpers on load
registerHelpers(Handlebars);

/**
 * Fetch a single template from GitHub (or use cached copy).
 * Returns parsed template.json config.
 */
export async function downloadTemplate(templateMeta, { forceRefresh = false } = {}) {
  const cacheDir = getCacheDir();
  const templateCacheDir = path.join(cacheDir, "templates", templateMeta.path);
  const configPath = path.join(templateCacheDir, "template.json");

  // Use cache if available and not forcing refresh
  if (!forceRefresh && existsSync(configPath)) {
    const data = await readFile(configPath, "utf-8");
    return JSON.parse(data);
  }

  // Fetch from GitHub via degit
  const config = await loadConfig();
  const repo = config.remoteRegistry;
  const remotePath = `${repo}/templates/${templateMeta.path}`;

  const degit = (await import("degit")).default;
  const emitter = degit(remotePath, { cache: false, force: true });

  // Clear old cache for this template
  if (existsSync(templateCacheDir)) {
    await rm(templateCacheDir, { recursive: true, force: true });
  }

  await emitter.clone(templateCacheDir);

  const data = await readFile(configPath, "utf-8");
  return JSON.parse(data);
}

export async function renderTemplate(templateMeta, templateConfig, answers) {
  const cacheDir = getCacheDir();
  const templateDir = path.join(cacheDir, "templates", templateMeta.path, "files");
  const outputBase = templateConfig.output
    ? Handlebars.compile(templateConfig.output)(answers)
    : ".";
  const outputDir = path.resolve(process.cwd(), outputBase);

  await processDirectory(templateDir, outputDir, answers);
}

async function processDirectory(srcDir, destDir, answers) {
  await mkdir(destDir, { recursive: true });

  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const renderedName = Handlebars.compile(entry.name)(answers);
    const destPath = path.join(destDir, renderedName);

    if (entry.isDirectory()) {
      await processDirectory(srcPath, destPath, answers);
    } else if (entry.name.endsWith(".hbs")) {
      const outputName = renderedName.replace(/\.hbs$/, "");
      const outputPath = path.join(destDir, outputName);
      const template = await readFile(srcPath, "utf-8");
      const compiled = Handlebars.compile(template);
      const result = compiled(answers);
      await writeFile(outputPath, result, "utf-8");
    } else {
      const content = await readFile(srcPath);
      await writeFile(destPath, content);
    }
  }
}

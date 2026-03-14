import { readFile, writeFile, mkdir } from "fs/promises";
import { readdir, stat } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import Handlebars from "handlebars";
import { registerHelpers } from "./helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

// Register Handlebars helpers on load
registerHelpers(Handlebars);

export async function downloadTemplate(templateMeta) {
  const templateDir = path.join(TEMPLATES_DIR, templateMeta.path);
  const configPath = path.join(templateDir, "template.json");
  const data = await readFile(configPath, "utf-8");
  return JSON.parse(data);
}

export async function renderTemplate(templateMeta, templateConfig, answers) {
  const templateDir = path.join(TEMPLATES_DIR, templateMeta.path, "files");
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
    // Render folder/file names through Handlebars too
    const renderedName = Handlebars.compile(entry.name)(answers);
    const destPath = path.join(destDir, renderedName);

    if (entry.isDirectory()) {
      await processDirectory(srcPath, destPath, answers);
    } else if (entry.name.endsWith(".hbs")) {
      // Render .hbs template files
      const outputName = renderedName.replace(/\.hbs$/, "");
      const outputPath = path.join(destDir, outputName);
      const template = await readFile(srcPath, "utf-8");
      const compiled = Handlebars.compile(template);
      const result = compiled(answers);
      await writeFile(outputPath, result, "utf-8");
    } else {
      // Copy non-template files as-is
      const content = await readFile(srcPath);
      await writeFile(destPath, content);
    }
  }
}

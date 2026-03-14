import chalk from "chalk";
import { loadRegistry } from "../lib/registry.js";

export async function templatesCommand(options) {
  const registry = await loadRegistry();

  console.log(chalk.bold("\n📦 Available Templates\n"));

  let templates = registry.templates;

  if (options.category) {
    templates = templates.filter(
      (t) => t.category?.toLowerCase() === options.category.toLowerCase()
    );
  }

  if (templates.length === 0) {
    console.log(chalk.yellow("  No templates found."));
    return;
  }

  const categories = [...new Set(templates.map((t) => t.category || "other"))];

  for (const category of categories) {
    console.log(chalk.cyan.bold(`  ${category}`));
    const categoryTemplates = templates.filter(
      (t) => (t.category || "other") === category
    );
    for (const t of categoryTemplates) {
      console.log(
        `    ${chalk.green(t.name)}  ${chalk.gray(t.description || "")}`
      );
    }
    console.log();
  }
}

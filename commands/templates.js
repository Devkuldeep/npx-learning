import chalk from "chalk";
import ora from "ora";
import { loadRegistry, syncRegistry, loadConfig } from "../lib/registry.js";

export async function templatesCommand(options) {
  let registry = await loadRegistry();

  // If registry is empty, try syncing from remote
  if (!registry.templates || registry.templates.length === 0) {
    const config = await loadConfig();
    const spinner = ora("Fetching template registry from GitHub...").start();
    try {
      await syncRegistry(config.remoteRegistry);
      registry = await loadRegistry();
      spinner.succeed("Registry synced.");
    } catch (err) {
      spinner.fail("Could not fetch registry.");
      console.error(chalk.gray(err.message));
      return;
    }
  }

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

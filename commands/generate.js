import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { loadRegistry, syncRegistry, loadConfig } from "../lib/registry.js";
import { downloadTemplate, renderTemplate } from "../lib/template-engine.js";

export async function generateCommand(templateName, options) {
  // Sync registry from GitHub if no local cache exists
  const registry = await loadRegistry();
  let templateMeta = registry.templates.find((t) => t.name === templateName);

  // If template not found locally, try syncing from remote
  if (!templateMeta) {
    const config = await loadConfig();
    const syncSpinner = ora("Syncing template registry from GitHub...").start();
    try {
      await syncRegistry(config.remoteRegistry);
      syncSpinner.succeed("Registry synced.");
    } catch (err) {
      syncSpinner.fail("Could not sync registry from remote.");
    }
    const freshRegistry = await loadRegistry();
    templateMeta = freshRegistry.templates.find((t) => t.name === templateName);
  }

  if (!templateMeta) {
    console.log(chalk.red(`\n❌ Template "${templateName}" not found.`));
    console.log(chalk.gray("Run `dev templates` to see available templates.\n"));
    process.exit(1);
  }

  console.log(
    chalk.bold(`\n🚀 Generating: ${chalk.cyan(templateMeta.name)}\n`)
  );

  // Fetch template from GitHub (cached or fresh)
  const fetchSpinner = ora("Fetching template...").start();
  let templateConfig;
  try {
    templateConfig = await downloadTemplate(templateMeta, {
      forceRefresh: options.refresh || false,
    });
    fetchSpinner.succeed("Template ready.");
  } catch (err) {
    fetchSpinner.fail("Failed to fetch template.");
    console.error(chalk.gray(err.message));
    process.exit(1);
  }

  // Ask questions from template.json
  let answers = {};
  if (templateConfig.questions && templateConfig.questions.length > 0) {
    answers = await inquirer.prompt(templateConfig.questions);
  }

  // Render and generate files
  const spinner = ora("Generating files...").start();

  try {
    await renderTemplate(templateMeta, templateConfig, answers);
    spinner.succeed(chalk.green("Files generated successfully!"));
  } catch (err) {
    spinner.fail(chalk.red("Generation failed."));
    console.error(err);
    process.exit(1);
  }

  console.log(chalk.bold("\n✅ Done!\n"));
}

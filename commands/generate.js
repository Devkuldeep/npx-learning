import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import path from "path";
import { loadRegistry, syncRegistry, loadConfig } from "../lib/registry.js";
import {
  downloadTemplate,
  renderTemplate,
  runPostInstall,
} from "../lib/template-engine.js";

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
    console.log(
      chalk.gray("Run `dev templates` to see available templates.\n")
    );
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
  const spinner = ora("Scaffolding project...").start();
  let outputDir;
  try {
    outputDir = await renderTemplate(templateMeta, templateConfig, answers);
    spinner.succeed("Project scaffolded.");
  } catch (err) {
    spinner.fail(chalk.red("Scaffolding failed."));
    console.error(err);
    process.exit(1);
  }

  // Run post-install commands (npm install, git init, etc.)
  const postInstall = templateConfig.postInstall || [];
  if (postInstall.length > 0 && !options.skipInstall) {
    console.log();
    const installSpinner = ora("Installing dependencies...").start();
    try {
      runPostInstall(outputDir, postInstall);
      installSpinner.succeed("Dependencies installed.");
    } catch (err) {
      installSpinner.fail("Post-install failed.");
      console.error(chalk.gray(err.message));
    }
  }

  // Print summary
  const relPath = path.relative(process.cwd(), outputDir) || ".";
  console.log(chalk.bold("\n✅ Done! Your project is ready.\n"));
  console.log(chalk.cyan("  Next steps:\n"));
  if (relPath !== ".") {
    console.log(chalk.white(`    cd ${relPath}`));
  }

  const nextSteps = templateConfig.nextSteps || [];
  for (const step of nextSteps) {
    console.log(chalk.white(`    ${step}`));
  }

  if (nextSteps.length === 0 && postInstall.length === 0) {
    console.log(chalk.white("    npm install"));
    console.log(chalk.white("    npm run dev"));
  }
  console.log();
}

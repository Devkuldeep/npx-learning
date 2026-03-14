import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { loadRegistry } from "../lib/registry.js";
import { downloadTemplate, renderTemplate } from "../lib/template-engine.js";

export async function generateCommand(templateName) {
  const registry = await loadRegistry();
  const templateMeta = registry.templates.find((t) => t.name === templateName);

  if (!templateMeta) {
    console.log(chalk.red(`\n❌ Template "${templateName}" not found.`));
    console.log(chalk.gray("Run `dev templates` to see available templates.\n"));
    process.exit(1);
  }

  console.log(
    chalk.bold(`\n🚀 Generating: ${chalk.cyan(templateMeta.name)}\n`)
  );

  // Load template.json from the template folder
  const templateConfig = await downloadTemplate(templateMeta);

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

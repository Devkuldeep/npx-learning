import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { loadConfig, saveConfig } from "../lib/registry.js";

export async function updateCommand() {
  const config = await loadConfig();

  if (!config.remoteRegistry) {
    const { repo } = await inquirer.prompt([
      {
        name: "repo",
        message:
          "Enter your remote template registry (e.g. github-user/template-registry):",
        type: "input",
      },
    ]);

    if (!repo) {
      console.log(chalk.yellow("No registry configured."));
      return;
    }

    config.remoteRegistry = repo;
    await saveConfig(config);
    console.log(chalk.green(`\n✅ Remote registry set to: ${repo}\n`));
  }

  const spinner = ora(
    `Pulling templates from ${config.remoteRegistry}...`
  ).start();

  try {
    // Dynamic import for degit (CommonJS module)
    const degit = (await import("degit")).default;
    const emitter = degit(config.remoteRegistry, { cache: false, force: true });

    await emitter.clone("templates-remote");
    spinner.succeed(
      chalk.green(`Templates updated from ${config.remoteRegistry}`)
    );
    console.log(
      chalk.gray("  Remote templates cloned to: templates-remote/\n")
    );
  } catch (err) {
    spinner.fail(chalk.red("Failed to update templates."));
    console.error(chalk.gray(err.message));
  }
}

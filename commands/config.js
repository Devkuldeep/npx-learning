import chalk from "chalk";
import { loadConfig, saveConfig } from "../lib/registry.js";

export async function configCommand(action, value) {
  const config = await loadConfig();

  switch (action) {
    case "set-repo": {
      if (!value) {
        console.log(chalk.red("\n❌ Usage: dev config set-repo <user/repo>\n"));
        return;
      }
      config.remoteRegistry = value;
      await saveConfig(config);
      console.log(chalk.green(`\n✅ Remote registry set to: ${value}\n`));
      break;
    }
    case "get-repo": {
      console.log(
        chalk.bold(`\n📦 Remote registry: ${chalk.cyan(config.remoteRegistry)}\n`)
      );
      break;
    }
    case "show": {
      console.log(chalk.bold("\n⚙️  CLI Configuration\n"));
      for (const [key, val] of Object.entries(config)) {
        console.log(`  ${chalk.cyan(key)}: ${val}`);
      }
      console.log();
      break;
    }
    default: {
      console.log(chalk.yellow("\nAvailable config actions:"));
      console.log(chalk.gray("  dev config set-repo <user/repo>  — Set GitHub template repository"));
      console.log(chalk.gray("  dev config get-repo              — Show current repository"));
      console.log(chalk.gray("  dev config show                  — Show all config\n"));
    }
  }
}

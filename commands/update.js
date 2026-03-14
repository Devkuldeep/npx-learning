import chalk from "chalk";
import ora from "ora";
import { rm } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { loadConfig, syncRegistry, getCacheDir } from "../lib/registry.js";

export async function updateCommand(options) {
  const config = await loadConfig();
  const repo = config.remoteRegistry;

  console.log(chalk.bold(`\n🔄 Updating from: ${chalk.cyan(repo)}\n`));

  // Step 1: Sync registry.json from remote
  const registrySpinner = ora("Syncing template registry...").start();
  try {
    await syncRegistry(repo);
    registrySpinner.succeed("Registry synced.");
  } catch (err) {
    registrySpinner.fail("Failed to sync registry.");
    console.error(chalk.gray(err.message));
    return;
  }

  // Step 2: Clear cached templates so they get re-fetched on next generate
  if (options.clearCache) {
    const cacheDir = path.join(getCacheDir(), "templates");
    if (existsSync(cacheDir)) {
      const cacheSpinner = ora("Clearing template cache...").start();
      await rm(cacheDir, { recursive: true, force: true });
      cacheSpinner.succeed("Template cache cleared.");
    }
  }

  console.log(chalk.bold("\n✅ Templates are up to date!\n"));
}

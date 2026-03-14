import chalk from "chalk";
import { loadRegistry, searchTemplates } from "../lib/registry.js";

export async function searchCommand(query) {
  const registry = await loadRegistry();
  const results = searchTemplates(registry, query);

  console.log(chalk.bold(`\n🔍 Search results for "${query}"\n`));

  if (results.length === 0) {
    console.log(chalk.yellow("  No templates matched your search.\n"));
    return;
  }

  for (const t of results) {
    console.log(
      `  ${chalk.green(t.name)}  ${chalk.gray(t.category || "")}  ${chalk.gray(t.description || "")}`
    );
  }
  console.log();
}

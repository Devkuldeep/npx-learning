#!/usr/bin/env node

import { Command } from "commander";
import { templatesCommand } from "../commands/templates.js";
import { generateCommand } from "../commands/generate.js";
import { searchCommand } from "../commands/search.js";
import { updateCommand } from "../commands/update.js";
import { configCommand } from "../commands/config.js";

const program = new Command();

program
  .name("dev")
  .description("Internal Developer CLI — generate code from templates")
  .version("1.0.0");

program
  .command("templates")
  .description("List all available templates")
  .option("-c, --category <category>", "Filter by category")
  .action(templatesCommand);

program
  .command("generate <template>")
  .description("Generate code from a template")
  .option("-r, --refresh", "Force re-fetch template from GitHub")
  .action(generateCommand);

program
  .command("search <query>")
  .description("Search templates by name, category, or description")
  .action(searchCommand);

program
  .command("update")
  .description("Sync registry and templates from remote GitHub repo")
  .option("--clear-cache", "Clear all cached templates")
  .action(updateCommand);

program
  .command("config [action] [value]")
  .description("Manage CLI configuration (set-repo, get-repo, show)")
  .action(configCommand);

program.parse();

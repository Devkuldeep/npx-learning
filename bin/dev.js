#!/usr/bin/env node

import { Command } from "commander";
import { templatesCommand } from "../commands/templates.js";
import { generateCommand } from "../commands/generate.js";
import { searchCommand } from "../commands/search.js";
import { updateCommand } from "../commands/update.js";

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
  .action(generateCommand);

program
  .command("search <query>")
  .description("Search templates by name, category, or description")
  .action(searchCommand);

program
  .command("update")
  .description("Pull templates from remote Git registry")
  .action(updateCommand);

program.parse();

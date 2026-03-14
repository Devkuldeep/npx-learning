# Contributing to Dev CLI

Thanks for contributing! This guide covers how to work on the CLI itself, add templates, and submit changes.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Running Locally](#running-locally)
- [Code Architecture](#code-architecture)
- [Adding a New CLI Command](#adding-a-new-cli-command)
- [Adding a New Handlebars Helper](#adding-a-new-handlebars-helper)
- [Adding a New Template](#adding-a-new-template)
- [Testing Changes](#testing-changes)
- [Git Workflow](#git-workflow)
- [Code Style](#code-style)

---

## Development Setup

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 18 | `node -v` |
| npm | >= 9 | `npm -v` |
| Git | any | `git --version` |

### Clone both repos

This project uses two repositories:

| Repo | Purpose |
|------|---------|
| `npx-learning` | The CLI tool (commands, engine, helpers) |
| `dev-templates` | The templates + registry (hosted on GitHub, fetched by CLI) |

```bash
# CLI repo
git clone https://github.com/Devkuldeep/npx-learning.git
cd npx-learning
npm install
npm install -g .

# Templates repo (separate)
git clone https://github.com/Devkuldeep/dev-templates.git
```

### Verify

```bash
dev --version    # Should print 1.0.0
dev templates    # Should list all templates
```

---

## Running Locally

### With global symlink (recommended)

```bash
cd npx-learning
npm install -g .
```

Now `dev` is globally available and symlinked to your source. Changes are reflected immediately — no need to re-install.

### Without global install

```bash
node bin/dev.js templates
node bin/dev.js generate express-api
node bin/dev.js search auth
```

### Reset cache (useful during development)

```bash
# Clear all cached templates and registry
rm -rf ~/.dev-cli/templates ~/.dev-cli/registry.json

# Or use the CLI
dev update --clear-cache
```

---

## Code Architecture

```
npx-learning/
├── bin/dev.js              ← Entry point. Registers all commands with Commander.
├── commands/               ← One file per CLI command
│   ├── generate.js         ← Main flow: fetch → prompt → render → install
│   ├── templates.js        ← List templates (grouped by category)
│   ├── search.js           ← Search templates by query
│   ├── update.js           ← Sync registry from GitHub
│   └── config.js           ← Manage CLI config
├── lib/                    ← Core logic
│   ├── registry.js         ← Load/sync/cache registry, config management
│   ├── template-engine.js  ← Fetch templates, render Handlebars, post-install
│   └── helpers.js          ← Handlebars helpers (pascalCase, eq, etc.)
├── templates/              ← Local copy of templates (also in dev-templates repo)
├── registry.json           ← Local fallback registry
└── package.json
```

### Request flow

```
User runs: dev generate nestjs-crud

bin/dev.js
  → Commander parses args
  → calls generateCommand("nestjs-crud", options)

commands/generate.js
  → loadRegistry() — tries ~/.dev-cli/registry.json, falls back to local
  → finds template meta (name, category, path)
  → downloadTemplate() — checks cache, fetches from GitHub via degit if needed
  → inquirer.prompt() — asks questions from template.json
  → renderTemplate() — processes .hbs files through Handlebars
  → runPostInstall() — runs npm install, git init, etc.
  → prints next steps

lib/registry.js
  → loadRegistry() — cache → local fallback
  → syncRegistry() — degit clones full repo to tmp, copies registry.json to cache
  → loadConfig() / saveConfig() — ~/.dev-cli/config.json

lib/template-engine.js
  → downloadTemplate() — degit clones template subfolder from GitHub to cache
  → renderTemplate() — walks files/, compiles .hbs through Handlebars, writes output
  → runPostInstall() — execSync shell commands in output directory
```

---

## Adding a New CLI Command

### 1. Create the command file

```javascript
// commands/my-command.js
import chalk from "chalk";

export async function myCommand(arg, options) {
  console.log(chalk.bold(`Running my-command with: ${arg}`));
  // Your logic here
}
```

### 2. Register in `bin/dev.js`

```javascript
import { myCommand } from "../commands/my-command.js";

program
  .command("my-command <arg>")
  .description("Description of my command")
  .option("-f, --flag", "Some flag")
  .action(myCommand);
```

### 3. Test it

```bash
dev my-command test-arg
dev my-command test-arg --flag
```

---

## Adding a New Handlebars Helper

### 1. Add to `lib/helpers.js`

```javascript
export function registerHelpers(Handlebars) {
  // ...existing helpers...

  // upperCase: hello → HELLO
  Handlebars.registerHelper("upperCase", (str) => {
    return str.toUpperCase();
  });
}
```

### 2. Use in templates

```handlebars
export const TABLE_NAME = "{{upperCase moduleName}}";
```

---

## Adding a New Template

Templates live in the **`dev-templates`** repo, not in `npx-learning`.

### Quick steps

1. Create `templates/<category>/<name>/template.json`
2. Create `templates/<category>/<name>/files/` with `.hbs` template files
3. Add entry to `registry.json`
4. Commit + push to GitHub
5. Run `dev update --clear-cache`

See [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) for the complete template authoring guide.

---

## Testing Changes

### Test CLI changes

```bash
# Re-link after changes
npm install -g .

# Test commands
dev --help
dev templates
dev search auth
dev config show
```

### Test template changes

```bash
# Clear cache to force re-fetch
dev update --clear-cache

# Generate in a temp directory
mkdir /tmp/test-gen && cd /tmp/test-gen
dev generate <template-name> --refresh

# Verify output
ls -la
cat package.json
```

### Test post-install

```bash
dev generate express-api
# Should auto-run npm install and git init

dev generate express-api --skip-install
# Should skip npm install
```

---

## Git Workflow

### For CLI changes (npx-learning)

```bash
git checkout -b feature/my-feature
# Make changes
git add -A
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### For template changes (dev-templates)

```bash
cd dev-templates
git checkout -b add/my-template
# Add template files + registry entry
git add -A
git commit -m "feat: add my-template"
git push origin add/my-template
```

### Commit message convention

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature or template |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `refactor:` | Code restructuring |
| `chore:` | Maintenance, dependencies |

---

## Code Style

- **ES Modules** — Use `import`/`export`, not `require()`
- **Async/await** — No callbacks
- **Template literals** — For string interpolation
- **Chalk** — For colored terminal output
- **Ora** — For spinners during async operations
- **No semicolons** — (following project convention... actually the project uses semicolons, keep consistent)
- **2-space indentation**

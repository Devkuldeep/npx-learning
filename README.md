# Dev CLI — Internal Developer Platform

A CLI tool that generates production-ready code from templates hosted on GitHub. Think `create-next-app` or `nest generate`, but for your own custom templates.

```
dev generate express-api
```
```
🚀 Generating: express-api

✔ Template ready.
? Project name: my-api
? Port: 3000
? Enable CORS? Yes
✔ Project scaffolded.
✔ Dependencies installed.

✅ Done! Your project is ready.

  Next steps:

    cd my-api
    npm run dev
    Open http://localhost:3000
```

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Available Templates](#available-templates)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Development Setup](#development-setup)
- [Adding New Templates](#adding-new-templates)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## Installation

### From npm (global install)

```bash
npm install -g npx-learning
```

### From source

```bash
git clone https://github.com/Devkuldeep/npx-learning.git
cd npx-learning
npm install
npm install -g .
```

### Verify installation

```bash
dev --version
dev --help
```

---

## Quick Start

```bash
# 1. List all available templates
dev templates

# 2. Generate a project
dev generate express-api

# 3. Search for templates
dev search auth

# 4. Update templates from GitHub
dev update
```

### Generate into an existing project

Module templates (like `nestjs-crud`, `nestjs-auth`) generate files into your current project — no new project created:

```bash
cd my-nestjs-project
dev generate nestjs-crud
# ? Resource name: products
# → Creates src/modules/products/ with controller, service, DTOs, etc.
```

---

## Commands

### `dev templates`

List all available templates grouped by category.

```bash
dev templates                    # Show all
dev templates -c backend         # Filter by category
dev templates -c frontend
dev templates -c infrastructure
```

### `dev generate <template>`

Generate code from a template. Fetches from GitHub, asks interactive questions, scaffolds files, and auto-installs dependencies.

```bash
dev generate express-api              # Generate a new Express API project
dev generate nestjs-crud              # Generate CRUD module in existing project
dev generate nextjs-app --refresh     # Force re-fetch from GitHub
dev generate express-api --skip-install  # Skip npm install
```

| Flag | Description |
|------|-------------|
| `-r, --refresh` | Force re-fetch template from GitHub (bypass cache) |
| `--skip-install` | Skip automatic `npm install` and other post-install commands |

### `dev search <query>`

Search templates by name, description, or category.

```bash
dev search auth          # Find auth-related templates
dev search docker        # Find Docker templates
dev search nestjs        # Find all NestJS templates
```

### `dev update`

Sync the template registry from the remote GitHub repository.

```bash
dev update                # Sync registry
dev update --clear-cache  # Sync registry + clear all cached templates
```

| Flag | Description |
|------|-------------|
| `--clear-cache` | Delete all locally cached templates (forces re-download on next generate) |

### `dev config`

Manage CLI configuration.

```bash
dev config show                          # Show all config
dev config get-repo                      # Show current GitHub repo
dev config set-repo myorg/my-templates   # Point to a different template repo
```

---

## Available Templates

### Backend

| Template | Description | Output |
|----------|-------------|--------|
| `express-api` | Express REST API with routing, CORS, health check | New project directory |
| `nestjs-crud` | NestJS CRUD module — controller, service, DTOs, entity, tests | `src/modules/<name>/` |
| `nestjs-auth` | NestJS auth module — JWT/session, guards, refresh tokens | `src/auth/` |
| `nestjs-microservice` | NestJS microservice — Kafka, RabbitMQ, or Redis transport | `src/<name>/` |

### Frontend

| Template | Description | Output |
|----------|-------------|--------|
| `nextjs-app` | Next.js 14 App Router — TypeScript, Tailwind, API routes, optional auth | New project directory |
| `react-component` | React component — TypeScript, CSS modules/Tailwind, test, barrel export | `src/components/<name>/` |

### Infrastructure

| Template | Description | Output |
|----------|-------------|--------|
| `docker-service` | Dockerfile + docker-compose — optional Postgres, MongoDB, Redis | Current directory |
| `github-actions` | GitHub Actions CI — Node/Bun, tests, optional Docker build & push | `.github/workflows/` |

---

## Configuration

Config is stored at `~/.dev-cli/config.json`.

| Key | Default | Description |
|-----|---------|-------------|
| `remoteRegistry` | `Devkuldeep/dev-templates` | GitHub `user/repo` where templates are hosted |

### Cache location

All cached data lives in `~/.dev-cli/`:

```
~/.dev-cli/
├── config.json              # CLI configuration
├── registry.json            # Cached template registry
└── templates/               # Cached template files
    ├── backend/nestjs-crud/
    ├── frontend/nextjs-app/
    └── ...
```

### Using a custom template repository

You can point the CLI to any GitHub repo that follows the template structure:

```bash
dev config set-repo your-org/your-templates
dev update
```

---

## How It Works

```
┌─────────────────┐     degit      ┌──────────────────────────┐
│   dev generate   │ ────────────→ │  GitHub: user/repo       │
│   express-api    │               │  ├── registry.json       │
└────────┬────────┘               │  └── templates/          │
         │                         │      └── backend/        │
         │                         │          └── express-api/ │
         │                         └──────────────────────────┘
         ▼
┌─────────────────┐
│  Cache template  │  ~/.dev-cli/templates/backend/express-api/
│  locally         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Read template   │  template.json → questions, output, postInstall
│  config          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ask interactive │  inquirer.js prompts from template.json
│  questions       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render .hbs     │  Handlebars compiles templates with answers
│  templates       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Post-install    │  npm install, git init, etc.
│  commands        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Print next      │  cd my-project, npm run dev, etc.
│  steps           │
└─────────────────┘
```

---

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- Git

### Clone and install

```bash
git clone https://github.com/Devkuldeep/npx-learning.git
cd npx-learning
npm install
```

### Link for local development

```bash
npm install -g .   # or: npm link
```

This makes `dev` available globally. Any changes to the source are reflected immediately since it's symlinked.

### Run without global install

```bash
node bin/dev.js templates
node bin/dev.js generate express-api
```

### Project structure

```
npx-learning/
├── bin/
│   ├── dev.js              # CLI entry point (shebang + commander setup)
│   └── hello.js            # Hello world entry point
├── commands/
│   ├── config.js           # `dev config` command
│   ├── generate.js         # `dev generate` command
│   ├── search.js           # `dev search` command
│   ├── templates.js        # `dev templates` command
│   └── update.js           # `dev update` command
├── lib/
│   ├── helpers.js           # Handlebars helpers (pascalCase, camelCase, etc.)
│   ├── registry.js          # Registry loading, syncing, caching, search
│   └── template-engine.js   # Template fetching, rendering, post-install
├── templates/               # Local template copies (also on GitHub)
│   ├── backend/
│   ├── frontend/
│   └── infrastructure/
├── registry.json            # Template catalog
├── package.json
├── .gitignore
└── index.js
```

---

## Adding New Templates

See [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) for a complete step-by-step guide.

**Quick overview:**

1. Create a folder in `dev-templates/templates/<category>/<name>/`
2. Add `template.json` with questions, output path, postInstall, nextSteps
3. Add `.hbs` files in a `files/` subdirectory
4. Register it in `registry.json`
5. Push to GitHub
6. Run `dev update --clear-cache`

---

## Tech Stack

| Package | Purpose |
|---------|---------|
| [Commander.js](https://github.com/tj/commander.js) | CLI framework — commands, options, help |
| [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) | Interactive prompts (input, list, confirm) |
| [Handlebars](https://handlebarsjs.com/) | Template rendering engine |
| [Degit](https://github.com/Rich-Harris/degit) | Git clone without history (fast template fetching) |
| [Chalk](https://github.com/chalk/chalk) | Terminal colors |
| [Ora](https://github.com/sindresorhus/ora) | Terminal spinners |
| [fs-extra](https://github.com/jprichardson/node-fs-extra) | Enhanced file system operations |

---

## License

ISC

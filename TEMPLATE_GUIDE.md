# Template Authoring Guide

A complete guide to creating new templates for the Dev CLI.

---

## Table of Contents

- [Template Structure](#template-structure)
- [Step-by-Step: Create a New Template](#step-by-step-create-a-new-template)
- [template.json Reference](#templatejson-reference)
- [Handlebars Templating](#handlebars-templating)
- [Available Helpers](#available-helpers)
- [Dynamic File Names](#dynamic-file-names)
- [Conditional Files](#conditional-files)
- [Post-Install Commands](#post-install-commands)
- [Testing Your Template](#testing-your-template)
- [Publishing](#publishing)
- [Examples](#examples)

---

## Template Structure

Every template lives inside the `dev-templates` GitHub repo:

```
dev-templates/
├── registry.json                     # Template catalog
└── templates/
    └── <category>/
        └── <template-name>/
            ├── template.json          # Config: questions, output, postInstall
            └── files/                 # Template files (.hbs or static)
                ├── package.json.hbs
                ├── src/
                │   └── index.ts.hbs
                └── ...
```

### Key rules

- **`template.json`** — Required. Defines questions, output path, post-install commands.
- **`files/`** — Required directory. Contains all template files.
- **`.hbs` extension** — Files ending in `.hbs` are processed through Handlebars. The `.hbs` suffix is stripped in output.
- **Non-`.hbs` files** — Copied as-is without processing.

---

## Step-by-Step: Create a New Template

### 1. Choose a category and name

Templates are organized into categories:

| Category | For | Example |
|----------|-----|---------|
| `backend` | Server-side frameworks, APIs, modules | `express-api`, `nestjs-crud` |
| `frontend` | Client frameworks, components, pages | `nextjs-app`, `react-component` |
| `infrastructure` | Docker, CI/CD, deployment | `docker-service`, `github-actions` |

### 2. Create the directory

```bash
cd dev-templates/templates
mkdir -p backend/my-template/files
```

### 3. Create `template.json`

```json
{
  "name": "my-template",
  "questions": [
    {
      "name": "projectName",
      "message": "Project name:",
      "type": "input"
    },
    {
      "name": "database",
      "message": "Database:",
      "type": "list",
      "choices": ["postgres", "mongodb", "sqlite"]
    },
    {
      "name": "includeTests",
      "message": "Include tests?",
      "type": "confirm",
      "default": true
    }
  ],
  "output": "{{projectName}}",
  "postInstall": ["npm install", "git init"],
  "nextSteps": ["npm run dev", "Open http://localhost:3000"]
}
```

### 4. Create template files

```bash
# files/package.json.hbs
# files/src/index.ts.hbs
# files/tsconfig.json.hbs
```

Example `files/package.json.hbs`:

```handlebars
{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    {{#if (eq database "postgres")}}
    "pg": "^8.11.0",
    {{/if}}
    {{#if (eq database "mongodb")}}
    "mongodb": "^6.0.0",
    {{/if}}
    "express": "^4.18.0"
  }
}
```

### 5. Register in `registry.json`

Add an entry to `dev-templates/registry.json`:

```json
{
  "templates": [
    ...existing templates...,
    {
      "name": "my-template",
      "category": "backend",
      "path": "backend/my-template",
      "description": "My custom template with database support"
    }
  ]
}
```

### 6. Push and test

```bash
cd dev-templates
git add -A
git commit -m "Add my-template"
git push

# Then in any directory:
dev update --clear-cache
dev generate my-template
```

---

## template.json Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Template name (matches CLI argument) |
| `questions` | array | No | Inquirer.js prompt objects |
| `output` | string | No | Output directory path (Handlebars-enabled). Default: `.` (current dir) |
| `postInstall` | array | No | Shell commands to run after scaffolding (e.g., `["npm install", "git init"]`) |
| `nextSteps` | array | No | Instructions shown to the user after generation |

### Question types

Questions use [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) format:

#### Text input
```json
{
  "name": "projectName",
  "message": "Project name:",
  "type": "input"
}
```

#### Single select (list)
```json
{
  "name": "database",
  "message": "Database:",
  "type": "list",
  "choices": ["postgres", "mongodb", "none"]
}
```

#### Yes/No (confirm)
```json
{
  "name": "includeTests",
  "message": "Include tests?",
  "type": "confirm",
  "default": true
}
```

#### With default value
```json
{
  "name": "port",
  "message": "Port:",
  "type": "input",
  "default": "3000"
}
```

### Output path patterns

| Pattern | Example result | Use case |
|---------|---------------|----------|
| `"{{projectName}}"` | `my-api/` | New project in a new folder |
| `"src/modules/{{name}}"` | `src/modules/users/` | Module inside existing project |
| `"src/auth"` | `src/auth/` | Fixed path module |
| `"."` | Current directory | Files in current directory |
| `".github/workflows"` | `.github/workflows/` | Config files |

---

## Handlebars Templating

All `.hbs` files are processed through [Handlebars](https://handlebarsjs.com/). The answers from `questions` are available as variables.

### Variable interpolation

```handlebars
// {{projectName}} is replaced with the user's answer
export const APP_NAME = "{{projectName}}";
```

### Conditionals

```handlebars
{{#if auth}}
import { AuthGuard } from './guards/auth.guard';
{{/if}}

{{#unless includeTests}}
// Tests skipped
{{/unless}}
```

### Equality checks

```handlebars
{{#if (eq database "postgres")}}
import { TypeOrmModule } from '@nestjs/typeorm';
{{/if}}

{{#if (neq database "none")}}
// Database configuration
{{/if}}
```

### Loops (if needed)

```handlebars
{{#each items}}
  - {{this}}
{{/each}}
```

---

## Available Helpers

These Handlebars helpers are registered globally:

| Helper | Input | Output | Example |
|--------|-------|--------|---------|
| `pascalCase` | `user-profile` | `UserProfile` | `{{pascalCase moduleName}}` |
| `camelCase` | `user-profile` | `userProfile` | `{{camelCase moduleName}}` |
| `kebabCase` | `UserProfile` | `user-profile` | `{{kebabCase moduleName}}` |
| `snakeCase` | `UserProfile` | `user_profile` | `{{snakeCase moduleName}}` |
| `eq` | `a, b` | `true/false` | `{{#if (eq database "postgres")}}` |
| `neq` | `a, b` | `true/false` | `{{#if (neq database "none")}}` |

### Using helpers in templates

```handlebars
import { {{pascalCase moduleName}}Service } from './{{kebabCase moduleName}}.service';
import { {{pascalCase moduleName}}Controller } from './{{kebabCase moduleName}}.controller';

export class {{pascalCase moduleName}}Module {}
```

If `moduleName = "user-profile"`, this renders:

```typescript
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';

export class UserProfileModule {}
```

---

## Dynamic File Names

File and folder names can also use Handlebars:

```
files/
├── {{moduleName}}.controller.ts.hbs
├── {{moduleName}}.service.ts.hbs
├── {{moduleName}}.module.ts.hbs
└── dto/
    ├── create-{{moduleName}}.dto.ts.hbs
    └── update-{{moduleName}}.dto.ts.hbs
```

If `moduleName = "product"`, output becomes:

```
product.controller.ts
product.service.ts
product.module.ts
dto/
├── create-product.dto.ts
└── update-product.dto.ts
```

---

## Conditional Files

Since Handlebars processes all `.hbs` files, you can make entire files conditionally empty:

```handlebars
{{#if includeTests}}
import { Test } from '@nestjs/testing';
import { {{pascalCase moduleName}}Service } from './{{moduleName}}.service';

describe('{{pascalCase moduleName}}Service', () => {
  // tests here
});
{{/if}}
```

If `includeTests = false`, the file is created but empty. For truly conditional file creation, use directory structures that map to different choices.

---

## Post-Install Commands

The `postInstall` array runs shell commands in the output directory after files are generated:

```json
{
  "postInstall": ["npm install", "git init"]
}
```

| Command | When to use |
|---------|-------------|
| `npm install` | Template has a `package.json` |
| `git init` | New project (not a module in existing project) |
| `npx prisma generate` | Prisma-based templates |
| `chmod +x ./scripts/*.sh` | Scripts that need execute permission |

**Do NOT use `postInstall` for module templates** (nestjs-crud, nestjs-auth, etc.) — they generate into existing projects that already have `node_modules`.

---

## Testing Your Template

### Local testing (before pushing)

1. Copy your template to the dev-templates cache manually:

```bash
# Copy to the local cache
mkdir -p ~/.dev-cli/templates/backend/my-template
cp -r dev-templates/templates/backend/my-template/* ~/.dev-cli/templates/backend/my-template/
```

2. Make sure registry has your template (either in `~/.dev-cli/registry.json` or the local `registry.json`)

3. Test generation:

```bash
mkdir /tmp/test && cd /tmp/test
dev generate my-template
```

4. Verify:
   - All files created with correct names
   - Variable interpolation works
   - Conditionals render correctly
   - Post-install commands run
   - Next steps show correctly

### After pushing

```bash
dev update --clear-cache
dev generate my-template --refresh
```

---

## Publishing

### To the shared template repo

1. Fork/clone `Devkuldeep/dev-templates`
2. Add your template as described above
3. Push to your fork or the main repo
4. Run `dev update` to sync

### To your own template repo

1. Create any GitHub repo with the same structure:
   ```
   your-repo/
   ├── registry.json
   └── templates/
       └── ...
   ```
2. Point CLI to it:
   ```bash
   dev config set-repo your-username/your-repo
   dev update
   ```

---

## Examples

### Project template (creates new project)

**express-api** — Creates a new Express project folder:

```json
{
  "name": "express-api",
  "questions": [
    { "name": "projectName", "message": "Project name:", "type": "input" },
    { "name": "port", "message": "Port:", "type": "input", "default": "3000" },
    { "name": "cors", "message": "Enable CORS?", "type": "confirm", "default": true }
  ],
  "output": "{{projectName}}",
  "postInstall": ["npm install", "git init"],
  "nextSteps": ["npm run dev", "Open http://localhost:{{port}}"]
}
```

### Module template (generates into existing project)

**nestjs-crud** — Creates files inside `src/modules/<name>/`:

```json
{
  "name": "nestjs-crud",
  "questions": [
    { "name": "moduleName", "message": "Resource name (e.g. user, product):", "type": "input" },
    { "name": "database", "message": "Database ORM:", "type": "list", "choices": ["typeorm", "prisma"] },
    { "name": "auth", "message": "Add authentication guard?", "type": "confirm", "default": false }
  ],
  "output": "src/modules/{{moduleName}}",
  "nextSteps": ["Import the module in app.module.ts", "npm run start:dev"]
}
```

### Config template (no npm install needed)

**github-actions** — Creates CI pipeline files:

```json
{
  "name": "github-actions",
  "questions": [
    { "name": "projectName", "message": "Project name:", "type": "input" },
    { "name": "runtime", "message": "Runtime:", "type": "list", "choices": ["node", "bun"] },
    { "name": "runTests", "message": "Include test step?", "type": "confirm", "default": true }
  ],
  "output": ".github/workflows",
  "nextSteps": ["git add .github/", "git commit -m 'Add CI pipeline'", "git push"]
}
```

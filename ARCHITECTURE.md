# Architecture

Technical architecture of the Dev CLI platform.

---

## System Overview

```
┌──────────────────────────────────────────────────────┐
│                    User's Terminal                     │
│                                                       │
│  $ dev generate nestjs-crud                           │
│  $ dev templates                                      │
│  $ dev search auth                                    │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                   CLI Layer (bin/)                     │
│                                                       │
│  bin/dev.js — Commander.js program                    │
│  ├── templates command                                │
│  ├── generate command                                 │
│  ├── search command                                   │
│  ├── update command                                   │
│  └── config command                                   │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                 Command Layer (commands/)              │
│                                                       │
│  Each command orchestrates the flow:                  │
│  generate.js: fetch → prompt → render → install       │
│  templates.js: load registry → display                │
│  search.js: load registry → filter → display          │
│  update.js: sync from GitHub → clear cache            │
│  config.js: read/write ~/.dev-cli/config.json         │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                   Core Layer (lib/)                    │
│                                                       │
│  registry.js         template-engine.js    helpers.js │
│  ├── loadRegistry()  ├── downloadTemplate()  ├── pascalCase │
│  ├── syncRegistry()  ├── renderTemplate()    ├── camelCase  │
│  ├── loadConfig()    ├── runPostInstall()    ├── kebabCase  │
│  ├── saveConfig()    └── processDirectory()  ├── snakeCase  │
│  └── searchTemplates()                       ├── eq         │
│                                              └── neq        │
└───────────────────────┬──────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
┌─────────────────────┐  ┌─────────────────────────┐
│   Local Cache        │  │   GitHub Remote          │
│   ~/.dev-cli/        │  │   Devkuldeep/            │
│   ├── config.json    │  │   dev-templates          │
│   ├── registry.json  │  │   ├── registry.json      │
│   └── templates/     │  │   └── templates/         │
│       └── ...        │  │       ├── backend/        │
└─────────────────────┘  │       ├── frontend/       │
                          │       └── infrastructure/ │
                          └─────────────────────────┘
```

---

## Module Details

### bin/dev.js — Entry Point

- Shebang `#!/usr/bin/env node` enables running as `dev` binary
- Uses Commander.js to define commands, options, and route to handlers
- Registered in `package.json` `"bin"` field for global install

### commands/generate.js — Generate Command

The main user-facing flow:

```
1. loadRegistry()          ← Try cache, then local fallback
2. Find template by name   ← If not found, syncRegistry() and retry
3. downloadTemplate()      ← Check cache or fetch from GitHub via degit
4. inquirer.prompt()       ← Ask questions defined in template.json
5. renderTemplate()        ← Process .hbs files through Handlebars
6. runPostInstall()        ← Execute npm install, git init, etc.
7. Print next steps        ← Show cd, npm run dev, etc.
```

### lib/registry.js — Registry Management

**Config storage:** `~/.dev-cli/config.json`
```json
{ "remoteRegistry": "Devkuldeep/dev-templates" }
```

**Registry loading priority:**
1. `~/.dev-cli/registry.json` (cached from GitHub)
2. `<cli-install-dir>/registry.json` (bundled fallback)
3. Empty `{ templates: [] }`

**Sync flow:**
1. Clone entire GitHub repo to `~/.dev-cli/_tmp_registry/` via degit
2. Copy `registry.json` to `~/.dev-cli/registry.json`
3. Delete temp directory

### lib/template-engine.js — Template Engine

**Template fetching:**
1. Check `~/.dev-cli/templates/<path>/template.json` exists
2. If cached and not `forceRefresh`, return cached config
3. Otherwise: degit clones `<repo>/templates/<path>` to cache
4. Return parsed `template.json`

**Rendering flow:**
1. Walk `files/` directory recursively
2. For each `.hbs` file: compile with Handlebars → write without `.hbs` extension
3. For non-`.hbs` files: copy as-is
4. File/folder names are also Handlebars-compiled (e.g., `{{moduleName}}.ts.hbs`)

**Post-install:**
- `execSync(command, { cwd: outputDir, stdio: "inherit" })`
- Runs each command sequentially in the output directory
- `stdio: "inherit"` streams output to user's terminal

### lib/helpers.js — Handlebars Helpers

| Helper | Transform | Example |
|--------|-----------|---------|
| `pascalCase` | `user-profile` → `UserProfile` | Class names |
| `camelCase` | `user-profile` → `userProfile` | Variable names |
| `kebabCase` | `UserProfile` → `user-profile` | File names, URLs |
| `snakeCase` | `UserProfile` → `user_profile` | Database columns |
| `eq` | `(a, b) → boolean` | Conditional blocks |
| `neq` | `(a, b) → boolean` | Conditional blocks |

---

## Data Flow

### Template Registry

```
registry.json
{
  "templates": [
    {
      "name": "nestjs-crud",           ← CLI argument
      "category": "backend",           ← For grouping/filtering
      "path": "backend/nestjs-crud",   ← Path within templates/ dir
      "description": "..."             ← Shown in search/list
    }
  ]
}
```

### Template Config (template.json)

```
{
  "name": "nestjs-crud",
  "questions": [...],        ← Inquirer.js prompts → produces answers{}
  "output": "src/{{name}}",  ← Where to write files (Handlebars-enabled)
  "postInstall": [...],      ← Shell commands to run after
  "nextSteps": [...]         ← Instructions shown to user
}
```

### Answer flow

```
template.json questions → Inquirer prompts → answers object → Handlebars context

answers = {
  moduleName: "product",
  database: "typeorm",
  auth: true
}

These are available in:
  - .hbs file contents:  {{moduleName}}, {{#if auth}}
  - File names:          {{moduleName}}.controller.ts.hbs
  - Output path:         src/modules/{{moduleName}}
```

---

## Caching Strategy

| What | Where | When refreshed |
|------|-------|----------------|
| CLI config | `~/.dev-cli/config.json` | On `dev config set-repo` |
| Registry | `~/.dev-cli/registry.json` | On `dev update` |
| Individual templates | `~/.dev-cli/templates/<path>/` | On first `dev generate` or `--refresh` |

**Cache invalidation:**
- `dev update` → syncs `registry.json`
- `dev update --clear-cache` → syncs registry + deletes all cached templates
- `dev generate <name> --refresh` → re-fetches that specific template

---

## Dependencies

| Package | Version | Role |
|---------|---------|------|
| commander | ^14.0.3 | CLI framework: commands, arguments, options, help text |
| inquirer | ^12.11.1 | Interactive terminal prompts (input, list, confirm) |
| handlebars | ^4.7.8 | Template compilation and rendering |
| degit | ^2.8.4 | Fast git clone without history (template fetching) |
| chalk | ^5.6.2 | Terminal string styling (colors, bold) |
| ora | ^9.3.0 | Terminal spinner (loading indicators) |
| fs-extra | ^11.3.4 | Enhanced filesystem operations |

All dependencies are ESM-compatible. The project uses `"type": "module"` in package.json.

---

## Security Considerations

- **Template execution:** `postInstall` commands run with the user's shell privileges. Templates from untrusted sources should be reviewed before use.
- **No eval:** Templates are processed through Handlebars only — no arbitrary code execution in template rendering.
- **Local cache:** All cached data is in the user's home directory (`~/.dev-cli/`), not globally shared.
- **degit:** Fetches from GitHub over HTTPS. No authentication required for public repos.

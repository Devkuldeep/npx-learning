import { readFile, writeFile, mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import os from "os";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache directory: ~/.dev-cli/
const CACHE_DIR = path.join(os.homedir(), ".dev-cli");
const CONFIG_PATH = path.join(CACHE_DIR, "config.json");
const REGISTRY_CACHE = path.join(CACHE_DIR, "registry.json");

// Fallback local registry (bundled with CLI)
const LOCAL_REGISTRY = path.resolve(__dirname, "..", "registry.json");

// Default remote repo — change this to your GitHub repo
const DEFAULT_REPO = "kuldeep-patel-18/dev-templates";

export async function ensureCacheDir() {
  await mkdir(CACHE_DIR, { recursive: true });
}

export async function loadConfig() {
  await ensureCacheDir();
  if (!existsSync(CONFIG_PATH)) {
    return { remoteRegistry: DEFAULT_REPO };
  }
  const data = await readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(data);
}

export async function saveConfig(config) {
  await ensureCacheDir();
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function loadRegistry() {
  // Try cached registry first (fetched from GitHub)
  if (existsSync(REGISTRY_CACHE)) {
    const data = await readFile(REGISTRY_CACHE, "utf-8");
    return JSON.parse(data);
  }
  // Fall back to local bundled registry
  if (existsSync(LOCAL_REGISTRY)) {
    const data = await readFile(LOCAL_REGISTRY, "utf-8");
    return JSON.parse(data);
  }
  return { templates: [] };
}

export async function syncRegistry(repo) {
  await ensureCacheDir();
  const degit = (await import("degit")).default;

  // Download just registry.json from the repo
  const tmpDir = path.join(CACHE_DIR, "_tmp_registry");
  const emitter = degit(repo, { cache: false, force: true });
  await emitter.clone(tmpDir);

  // Copy registry.json to cache
  const srcRegistry = path.join(tmpDir, "registry.json");
  if (existsSync(srcRegistry)) {
    const data = await readFile(srcRegistry, "utf-8");
    await writeFile(REGISTRY_CACHE, data, "utf-8");
  }

  // Clean up tmp
  const { rm } = await import("fs/promises");
  await rm(tmpDir, { recursive: true, force: true });
}

export function searchTemplates(registry, query) {
  const q = query.toLowerCase();
  return registry.templates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.category || "").toLowerCase().includes(q)
  );
}

export function getCacheDir() {
  return CACHE_DIR;
}

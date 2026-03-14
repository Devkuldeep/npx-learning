import { readFile, writeFile, mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_PATH = path.resolve(__dirname, "..", "registry.json");
const CONFIG_PATH = path.resolve(__dirname, "..", "dev-cli.config.json");

export async function loadRegistry() {
  const data = await readFile(REGISTRY_PATH, "utf-8");
  return JSON.parse(data);
}

export async function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return { remoteRegistry: null };
  }
  const data = await readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(data);
}

export async function saveConfig(config) {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
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

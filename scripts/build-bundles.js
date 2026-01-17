import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");

const BUNDLES_ROOT = path.join(PROJECT_ROOT, "bundles");
const BUNDLE_DIR = path.join(BUNDLES_ROOT, "AvailabilityBundle");
const ZIP_PATH = path.join(BUNDLES_ROOT, "AvailabilityBundle.zip");

const EXE_NAME = "Availability.exe";

const DIST_SRC = path.join(PROJECT_ROOT, "dist");
const EXE_SRC = path.join(PROJECT_ROOT, EXE_NAME);

// Optional: If later settings are moved from localStorage -> file, we can ship a default settings.json.
// For now, this is just a placeholder.
const SETTINGS_SRC = path.join(PROJECT_ROOT, "settings.json");

function run(cmd) {
    console.log(`[CMD] ${cmd}`);
    execSync(cmd, { stdio: "inherit", shell: true });
}

function clean(p) {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function ensure(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) throw new Error(`Missing: ${src}`);
    fs.cpSync(src, dest, { recursive: true });
}

function copyFileIfExists(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.copyFileSync(src, dest);
}

// --------- CLEAN OLD OUTPUT -----------
console.log("[INFO] Cleaning old bundle output…");
ensure(BUNDLES_ROOT);
clean(BUNDLE_DIR);
clean(ZIP_PATH);

// --------- BUILD VITE ----------
console.log("[INFO] Building Vite (dist)…");
run("bun run build");

// --------- BUILD EXE ----------
console.log("[INFO] Building executable with Bun…");
run(`bun build server.js --compile --outfile ${EXE_NAME}`);

// Sanity checks
if (!fs.existsSync(DIST_SRC)) throw new Error("dist missing (vite build failed?)");
if (!fs.existsSync(EXE_SRC)) throw new Error("EXE missing (bun build failed?)");

// --------- CREATE BUNDLE ----------
console.log("[INFO] Creating AvailabilityBundle…");
ensure(BUNDLE_DIR);

// Copy exe + dist
fs.copyFileSync(EXE_SRC, path.join(BUNDLE_DIR, EXE_NAME));
copyDir(DIST_SRC, path.join(BUNDLE_DIR, "dist"));

// Optional settings.json (only useful if/when you move away from localStorage)
copyFileIfExists(SETTINGS_SRC, path.join(BUNDLE_DIR, "settings.json"));

// Optional: write a small metadata file (handy for debugging)
fs.writeFileSync(
    path.join(BUNDLE_DIR, "bundle-meta.json"),
    JSON.stringify(
        {
            app: "availability",
            builtAtIso: new Date().toISOString(),
            exeName: EXE_NAME
        },
        null,
        2
    )
);

// --------- ZIP ----------
console.log("[INFO] Zipping AvailabilityBundle…");
const zip = new AdmZip();
zip.addLocalFolder(BUNDLE_DIR, "AvailabilityBundle");
zip.writeZip(ZIP_PATH);

console.log("\n🎉 Bundling complete!");
console.log(`Bundle folder: ${BUNDLE_DIR}`);
console.log(`Zip: ${ZIP_PATH}`);

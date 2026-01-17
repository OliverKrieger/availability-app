import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";
import getPort from "get-port";

const isBundled = !!process.pkg || !!process.isBun;
const exeDir = path.dirname(process.execPath);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = isBundled ? exeDir : __dirname;

const app = express();
const distPath = path.join(baseDir, "dist");

app.use(express.static(distPath));

app.get(/.*/, (_, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

async function start() {
    const PORT = await getPort({ port: 5678 });

    const server = app.listen(PORT, () => {
        console.log(`Availability app running at http://localhost:${PORT}`);
        open(`http://localhost:${PORT}`);
    });

    const shutdown = () => server.close(() => process.exit(0));
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

start();

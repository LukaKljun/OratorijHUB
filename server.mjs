import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rename, stat } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, "dist");
const contentPath = join(root, "data", "content.json");
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const send = (response, status, body, type = "text/plain; charset=utf-8") => {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": type.includes("application/json") ? "no-store" : "public, max-age=300",
  });
  response.end(body);
};

const readContent = async () => {
  const raw = await readFile(contentPath, "utf8");
  return JSON.parse(raw);
};

const writeContent = async (content) => {
  await mkdir(dirname(contentPath), { recursive: true });
  const temporaryPath = `${contentPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporaryPath, contentPath);
  return content;
};

const readRequestBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const handleApi = async (request, response) => {
  if (request.url !== "/api/content") {
    send(response, 404, "Not found");
    return;
  }

  if (request.method === "GET") {
    const content = await readContent();
    send(response, 200, JSON.stringify(content), "application/json; charset=utf-8");
    return;
  }

  if (request.method === "POST") {
    const body = await readRequestBody(request);
    const content = JSON.parse(body);
    const saved = await writeContent(content);
    send(response, 200, JSON.stringify(saved), "application/json; charset=utf-8");
    return;
  }

  send(response, 405, "Method not allowed");
};

const serveStatic = async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(distDir, safePath);

  if (!filePath.startsWith(distDir)) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = join(filePath, "index.html");
    const file = await readFile(filePath);
    send(response, 200, file, mimeTypes[extname(filePath)] || "application/octet-stream");
  } catch {
    const index = await readFile(join(distDir, "index.html"));
    send(response, 200, index, "text/html; charset=utf-8");
  }
};

const server = createServer(async (request, response) => {
  try {
    if (request.url?.startsWith("/api/")) {
      await handleApi(request, response);
      return;
    }
    await serveStatic(request, response);
  } catch (error) {
    console.error(error);
    send(response, 500, "Server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Oratorij Hub running at http://127.0.0.1:${port}`);
});

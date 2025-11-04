// launcher-server.js
// WebContainer 실행을 위한 최소한의 정적 서버 (COOP/COEP 헤더 포함)
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";

const port = 8080;

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/favicon.ico") {
      res.writeHead(204);
      return res.end(); // No Content로 조용히 처리
    }

    if (req.url && req.url.startsWith("/webcontainer/connect/")) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      });
      return res.end(`<!doctype html>
<meta charset="utf-8">
<title>Preview requires editor</title>
<style>body{font:14px system-ui;padding:24px}</style>
<p>이 프리뷰 URL은 단독 새창에서 동작하지 않습니다. 에디터 탭(이 페이지)에서만 표시됩니다.</p>
<script>try{window.close()}catch(e){setTimeout(()=>location.replace('about:blank'),50)}</script>`);
    }
    // / 또는 /index.html 모두 launcher.html로
    let filePath =
      "." +
      (req.url === "/" || req.url === "/index.html"
        ? "/launcher.html"
        : req.url);
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || "application/octet-stream";

    const data = await readFile(filePath);

    // WebContainer에 필수적인 헤더들
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 WebContainer 런처 서버 실행 중                         ║
║                                                            ║
║  📍 http://localhost:${port}                                ║
║                                                            ║
║  💡 이 서버는 단지 launcher.html을 제공하는 역할입니다     ║
║     실제 Node 앱은 WebContainer(브라우저)에서 실행됩니다  ║
╚════════════════════════════════════════════════════════════╝
  `);
});

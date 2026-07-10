import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mdPath = join(root, "SYSTEM.md");
const docsDir = join(root, "docs");
const htmlPath = join(docsDir, "Relocate-System-Documentation.html");
const pdfPath = join(docsDir, "Relocate-System-Documentation.pdf");

mkdirSync(docsDir, { recursive: true });

const md = readFileSync(mdPath, "utf8");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdToHtml(markdown) {
  const lines = markdown.split("\n");
  const out = [];
  let inCode = false;
  let inTable = false;
  let tableRows = [];

  function flushTable() {
    if (!tableRows.length) return;
    out.push("<table>");
    tableRows.forEach((row, index) => {
      const tag = index === 0 ? "th" : "td";
      const cells = row
        .split("|")
        .slice(1, -1)
        .map((cell) => `<${tag}>${inlineFormat(cell.trim())}</${tag}>`)
        .join("");
      out.push(index === 0 ? `<thead><tr>${cells}</tr></thead><tbody>` : `<tr>${cells}</tr>`);
    });
    out.push("</tbody></table>");
    tableRows = [];
    inTable = false;
  }

  function inlineFormat(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushTable();
      if (!inCode) {
        inCode = true;
        out.push("<pre><code>");
      } else {
        inCode = false;
        out.push("</code></pre>");
      }
      continue;
    }

    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }

    if (line.trim().startsWith("|")) {
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue;
      inTable = true;
      tableRows.push(line.trim());
      continue;
    }

    flushTable();

    if (line.startsWith("# ")) {
      out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
    } else if (line.startsWith("- [ ] ")) {
      out.push(`<p class="check">☐ ${inlineFormat(line.slice(6))}</p>`);
    } else if (line.startsWith("- ")) {
      out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      out.push(`<li class="ol">${inlineFormat(line.replace(/^\d+\.\s/, ""))}</li>`);
    } else if (line.trim() === "---") {
      out.push("<hr />");
    } else if (line.trim() === "") {
      out.push("");
    } else {
      out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }

  flushTable();
  return out.join("\n");
}

const body = mdToHtml(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Relocate — Full System Documentation</title>
  <style>
    @page { margin: 18mm 16mm; size: A4; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #1e293b;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    h1 { font-size: 22pt; color: #0f766e; border-bottom: 3px solid #14b8a6; padding-bottom: 8px; margin-top: 0; page-break-after: avoid; }
    h2 { font-size: 14pt; color: #0f766e; margin-top: 22px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; page-break-after: avoid; page-break-before: always; }
    h2:first-of-type { page-break-before: avoid; }
    h3 { font-size: 11.5pt; color: #334155; margin-top: 16px; page-break-after: avoid; }
    p, li { margin: 6px 0; }
    li { margin-left: 18px; }
    code, pre { font-family: Consolas, monospace; font-size: 9pt; }
    code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
    pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; white-space: pre-wrap; overflow-wrap: anywhere; page-break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9.5pt; page-break-inside: avoid; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f0fdfa; color: #115e59; font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    a { color: #0d9488; text-decoration: none; }
    .cover { text-align: center; padding: 40px 0 30px; page-break-after: always; }
    .cover h1 { border: none; font-size: 28pt; }
    .cover p { font-size: 12pt; color: #64748b; }
    .footer-note { margin-top: 30px; font-size: 9pt; color: #64748b; text-align: center; }
    .check { padding-left: 4px; }
  </style>
</head>
<body>
  <div class="cover">
    <h1>Relocate</h1>
    <p><strong>Full System Documentation</strong></p>
    <p>Presentation &amp; Technical Reference</p>
    <p>Moving &amp; relocation platform — Mombasa &amp; Nairobi, Kenya</p>
    <p>M-Pesa payments · Driver portal · Live GPS · Admin dashboard</p>
    <p>Version 0.1.0 · July 2026</p>
    <p>github.com/techwizh/relocationweb</p>
  </div>
  <div class="cover" style="padding-top:20px">
    <h2 style="border:none;page-break-before:avoid;font-size:16pt">Executive summary</h2>
    <p><strong>Relocate</strong> is a web platform for booking moving vehicles in Kenya.</p>
    <p>Customers book online, pay via M-Pesa, chat with drivers, and track moves live.</p>
    <p>Drivers register, get approved by admin, receive jobs, and share GPS.</p>
    <p>Admins manage the landing page, approve drivers, assign bookings, and monitor fleet.</p>
    <p><strong>Live stack:</strong> Vercel (frontend) + Render (backend API) + Neon (PostgreSQL)</p>
    <p><strong>Website:</strong> Vercel URL &nbsp;|&nbsp; <strong>API:</strong> relocationweb-api.onrender.com</p>
  </div>
  ${body}
  <p class="footer-note">Generated from SYSTEM.md — Relocate project documentation</p>
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");

const edgePaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

const browser = edgePaths.find((path) => {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
});

if (!browser) {
  console.log(`HTML saved to: ${htmlPath}`);
  console.log("No Edge/Chrome found. Open the HTML file and use Print → Save as PDF.");
  process.exit(0);
}

const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
execSync(
  `"${browser}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`,
  { stdio: "inherit" },
);

console.log(`PDF saved to: ${pdfPath}`);

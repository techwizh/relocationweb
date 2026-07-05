import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

loadEnv();

async function main() {
  const key = process.env.MPESA_CONSUMER_KEY ?? "";
  const secret = process.env.MPESA_CONSUMER_SECRET ?? "";

  if (!key || !secret) {
    console.error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in .env");
    process.exit(1);
  }

  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${credentials}` } },
  );

  const text = await response.text();
  console.log("OAuth HTTP status:", response.status);

  if (text.trimStart().startsWith("<")) {
    console.error("Daraja returned HTML instead of JSON — credentials may be wrong or blocked.");
    process.exit(1);
  }

  try {
    const data = JSON.parse(text);
    if (data.access_token) {
      console.log("OAuth OK — access token received.");
      process.exit(0);
    }
    console.error("OAuth failed:", data.errorMessage ?? text);
    process.exit(1);
  } catch {
    console.error("Unexpected response:", text.slice(0, 200));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

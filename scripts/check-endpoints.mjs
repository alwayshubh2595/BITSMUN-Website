// Reliability check for the Google Apps Script registration endpoints.
//
//   node scripts/check-endpoints.mjs                 # reachability only, no writes
//   node scripts/check-endpoints.mjs --submit-test   # sends ONE marked test row
//
// Reads endpoint URLs from the environment, or from .env / .env.seed if present.
//
// The reachability pass is read-only: it issues a GET, which an Apps Script web
// app answers from doGet (or errors) without ever running doPost. It proves the
// deployment exists and is publicly callable. It does NOT prove that a POST
// writes a row — only a real submission proves that, which is what
// --submit-test does. Test rows are tagged so you can find and delete them.

import fs from "node:fs";
import path from "node:path";

const ENDPOINTS = [
  ["Registrations (all forms)", "VITE_REGFORM_URL"],
  ["Coupons (domestic)", "VITE_COUPONS_URL"],
  ["Coupons (international)", "VITE_INTCOUPONS_URL"],
];

const loadEnvFiles = () => {
  for (const file of [".env", ".env.seed", ".env.local"]) {
    const full = path.resolve(file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
    console.log(`(loaded ${file})`);
  }
};

const TIMEOUT_MS = 20000;

const reach = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, { redirect: "follow", signal: controller.signal });
    const ms = Date.now() - started;
    const body = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, ms, body };
  } catch (err) {
    return { ok: false, status: 0, ms: Date.now() - started, error: err.message };
  } finally {
    clearTimeout(timer);
  }
};

const submitTest = async (url) => {
  const stamp = new Date().toISOString();
  const form = new FormData();
  // Every field is marked so the row is unmistakable in the sheet.
  form.append("name", `ZZ_TEST_DELETE_ME ${stamp}`);
  form.append("email", "endpoint-check@example.invalid");
  form.append("phone", "+910000000000");
  form.append("age", "99");
  form.append("institute", "AUTOMATED ENDPOINT TEST — DELETE THIS ROW");
  form.append("mode", "Online");
  form.append("committee1", "TEST");
  form.append("committee2", "TEST");
  form.append("experience", "TEST");
  form.append("portfolio", "TEST");
  form.append("fileName", "");
  form.append("fileContent", "");
  form.append("formType", "delegate");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  const started = Date.now();
  try {
    const res = await fetch(url, { method: "POST", body: form, signal: controller.signal });
    const body = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, ms: Date.now() - started, body, stamp };
  } catch (err) {
    return { ok: false, status: 0, ms: Date.now() - started, error: err.message, stamp };
  } finally {
    clearTimeout(timer);
  }
};

const summarise = (body) => {
  if (!body) return "(empty body)";
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > 160 ? `${flat.slice(0, 160)}…` : flat;
};

const main = async () => {
  loadEnvFiles();
  const doSubmit = process.argv.includes("--submit-test");

  console.log("\n=== REACHABILITY (read-only, no rows written) ===\n");
  const missing = [];
  for (const [label, key] of ENDPOINTS) {
    const url = process.env[key];
    if (!url) {
      missing.push(`${label} (${key})`);
      console.log(`  ${label.padEnd(24)} NOT CONFIGURED — ${key} is unset`);
      continue;
    }
    const r = await reach(url);
    const verdict = r.ok ? "reachable" : r.status ? `HTTP ${r.status}` : `unreachable: ${r.error}`;
    console.log(`  ${label.padEnd(24)} ${verdict.padEnd(22)} ${r.ms}ms`);
    if (r.body) console.log(`  ${" ".repeat(24)} -> ${summarise(r.body)}`);
  }

  if (missing.length) {
    console.log(`\n  ${missing.length} endpoint(s) unset. Any form using one CANNOT submit:`);
    missing.forEach((m) => console.log(`    - ${m}`));
  }

  if (!doSubmit) {
    console.log("\nReachability only proves the deployment answers a GET.");
    console.log("It does NOT prove a POST writes a row. Re-run with --submit-test");
    console.log("to send one tagged row, then check the sheet and delete it.\n");
    return;
  }

  const url = process.env.VITE_REGFORM_URL;
  if (!url) {
    console.error("\nVITE_REGFORM_URL is unset; cannot run the write test.");
    process.exit(1);
  }

  console.log("\n=== WRITE TEST (creates one row in the delegate sheet) ===\n");
  const r = await submitTest(url);
  console.log(`  status : ${r.ok ? `HTTP ${r.status} ok` : r.status ? `HTTP ${r.status}` : `failed: ${r.error}`}`);
  console.log(`  latency: ${r.ms}ms`);
  console.log(`  body   : ${summarise(r.body)}`);
  console.log(`\n  Look for a row named "ZZ_TEST_DELETE_ME ${r.stamp}" and delete it.`);
  console.log("  If the request succeeded but no row appeared, the script is");
  console.log("  accepting POSTs without persisting — the exact silent failure");
  console.log("  the frontend hardening cannot detect from outside.\n");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

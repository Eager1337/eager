#!/usr/bin/env node
/**
 * Startup / pre-deploy environment check.
 *   bun run verify:env
 * Prints only variable NAMES, never values. Exits 1 when something required
 * is missing so a Vercel build fails loudly rather than shipping a broken
 * admin login or blank images.
 *
 * Only the Supabase variables are hard requirements. The admin sign-in
 * username/password come from OWNER_LOGIN_* (or the dashboard-stored
 * credentials), the backing owner account is provisioned automatically when
 * OWNER_ACCOUNT_* is absent, and AI runs on OPENAI_API_KEY outside Lovable.
 */
const REQUIRED = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const CONDITIONAL = [
  {
    names: ["OWNER_LOGIN_USERNAME", "OWNER_LOGIN_PASSWORDS"],
    note: "admin sign-in — skip only if you saved credentials via the dashboard (admin → Security)",
  },
  {
    names: ["LOVABLE_API_KEY", "OPENAI_API_KEY"],
    anyOf: true,
    note: "AI workspace / image studio / site builder — one of the two is enough",
  },
];

const OPTIONAL = [
  { name: "VITE_SUPABASE_PROJECT_ID", note: "cosmetic, links back to the project" },
  { name: "OWNER_ACCOUNT_EMAIL", note: "pins the backing owner account; auto-provisioned when empty" },
  { name: "OWNER_ACCOUNT_PASSWORD", note: "pins the backing owner account; auto-provisioned when empty" },
  { name: "AI_TEXT_MODEL", note: "override the text model" },
  { name: "AI_IMAGE_MODEL", note: "override the image model" },
];

const missing = REQUIRED.filter((name) => !process.env[name]);

for (const name of REQUIRED) {
  console.log(`${process.env[name] ? "ok  " : "MISS"}  ${name}`);
}

for (const group of CONDITIONAL) {
  const present = group.names.filter((n) => process.env[n]);
  const ok = group.anyOf ? present.length > 0 : present.length === group.names.length;
  console.log(`${ok ? "ok  " : "warn"}  ${group.names.join(group.anyOf ? " | " : " + ")} — ${group.note}`);
}

for (const { name, note } of OPTIONAL) {
  console.log(`${process.env[name] ? "ok  " : "warn"}  ${name} (optional) — ${note}`);
}

if (missing.length > 0) {
  console.error(`\nMissing required environment variables: ${missing.join(", ")}`);
  console.error("Add them in Vercel -> Settings -> Environment Variables, then redeploy.");
  process.exit(1);
}

console.log("\nEnvironment looks complete.");

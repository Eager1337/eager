#!/usr/bin/env node
/**
 * Startup / pre-deploy environment check.
 *   bun run verify:env
 * Prints only variable NAMES, never values. Exits 1 when something required
 * is missing so a Vercel build fails loudly instead of shipping a broken
 * admin login or blank images.
 */
const REQUIRED = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OWNER_LOGIN_USERNAME",
  "OWNER_LOGIN_PASSWORDS",
  "OWNER_ACCOUNT_EMAIL",
  "OWNER_ACCOUNT_PASSWORD",
];
const OPTIONAL = ["VITE_SUPABASE_PROJECT_ID", "LOVABLE_API_KEY"];

const missing = REQUIRED.filter((name) => !process.env[name]);
const missingOptional = OPTIONAL.filter((name) => !process.env[name]);

for (const name of REQUIRED) {
  console.log(`${process.env[name] ? "ok  " : "MISS"}  ${name}`);
}
for (const name of OPTIONAL) {
  console.log(`${process.env[name] ? "ok  " : "warn"}  ${name} (optional)`);
}

if (missingOptional.length > 0) {
  console.warn(`\nOptional variables not set: ${missingOptional.join(", ")}`);
}

if (missing.length > 0) {
  console.error(`\nMissing required environment variables: ${missing.join(", ")}`);
  console.error("Add them in Vercel -> Settings -> Environment Variables, then redeploy.");
  process.exit(1);
}

console.log("\nEnvironment looks complete.");
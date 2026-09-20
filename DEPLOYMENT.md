# Deployment guide: Lovable → GitHub → Vercel

The app is TanStack Start (React 19 + Vite 7). The admin login, the database
and the uploaded images all live in the Supabase backend, so the same backend
must be reachable from Vercel.

> Read section 1 first. If your backend is **Lovable Cloud** (the default),
> you must move it to your own Supabase project before Vercel can work,
> because Lovable Cloud does not give you the secret `service_role` key.

## 1. If your backend is Lovable Cloud: move it to your own Supabase

Lovable Cloud is a Supabase project that Lovable owns. You cannot see it in
the Supabase dashboard, and you cannot copy the `service_role` key from it.
Without that key the admin login, image streaming and most admin panels fail
on Vercel. So move the backend to a Supabase project you own:

1. **Export your data.** In Lovable open Cloud → Overview → Advanced
   settings → Export project data, and export the database. The export
   includes tables and data. It does **not** include storage files, secrets,
   or usable user passwords.
2. **Create your own project.** Sign up at supabase.com and create a project
   (the free plan is fine to start). Pick a region close to your visitors.
3. **Rebuild the schema and restore the data.** The schema is in this repo,
   so from a terminal:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR-NEW-PROJECT-REF
   npx supabase db push
   ```

   Then import the exported data (Supabase dashboard → SQL editor or
   Table editor → import). You can also ask Lovable to rebuild the schema
   after you connect the project.
4. **Recreate the storage bucket.** Supabase dashboard → Storage → New
   bucket → name it `portfolio-media`, keep it **private**. Re-upload your
   images through the admin Image Manager (storage files are not exported).
5. **Connect the new backend to Lovable** so you can keep editing there:
   in Lovable, Cloud → remove Lovable Cloud, then "Already have a Supabase
   project? Connect it here". Lovable rewrites the project's Supabase
   variables automatically.
6. **Copy the new values.** Supabase dashboard → Settings → API: project
   URL, publishable (anon) key, and `service_role` key. You need them below.

Your old admin account does not carry over (passwords are not exported) —
that is fine. The first sign-in on the new backend provisions a fresh backing
account automatically (see section 3).

## 2. Deploy to Vercel

1. Push this repo to GitHub (it is already connected if you edit in Lovable).
2. In Vercel: Add New → Project → import the GitHub repo. Keep the detected
   framework preset. The build produces a Vercel serverless bundle
   (`.vercel/output`) automatically — no framework settings to change.
3. Before the first deploy, add these environment variables for
   Production, Preview and Development (values from your Supabase
   dashboard → Settings → API):

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable / anon key |
   | `SUPABASE_URL` | Project URL (same as above) |
   | `SUPABASE_PUBLISHABLE_KEY` | Publishable / anon key (same as above) |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role` secret key |
   | `OWNER_LOGIN_USERNAME` | Your admin username (same as in Lovable) |
   | `OWNER_LOGIN_PASSWORDS` | Your admin password (same as in Lovable) |

   `OWNER_LOGIN_*` are only needed if you never saved credentials from the
   dashboard (admin → Security → Credentials). If you saved them there, the
   database already has them and you can skip both.

4. Deploy. Then open `/admin` and sign in with your username and password.

### AI workspace, Image Studio and the site builder

`LOVABLE_API_KEY` is injected by Lovable and cannot be exported, so AI
features cannot call Lovable's gateway from Vercel. They automatically fall
back to your own OpenAI key instead:

1. Create a key at platform.openai.com (add a few dollars of credit).
2. Add `OPENAI_API_KEY` to the Vercel environment variables.
3. Optional: `AI_TEXT_MODEL` (default `gpt-5.2`) and `AI_IMAGE_MODEL`
   (default `gpt-image-1-mini`) to change the models.

Inside Lovable the AI still uses Lovable's gateway and your Lovable credits.

### Validate the environment before deploying

```bash
bun run verify:env
```

It prints only variable names and exits with code 1 when a required value is
missing, so a Vercel build fails loudly instead of shipping a broken admin
login. Suffix the Vercel "Install Command" with it if you want it enforced
on every build:

```
bun install && bun run verify:env
```

## 3. How the admin login works after the move

- **Username + password.** Checked against the credentials saved in the
  dashboard (admin → Security → Credentials) first; otherwise against
  `OWNER_LOGIN_USERNAME` / `OWNER_LOGIN_PASSWORDS`. There are no defaults in
  the code — if neither exists the login screen says exactly what is missing.
- **Backing owner account.** After your credentials check out, the server
  signs into a Supabase auth account to mint the session. If
  `OWNER_ACCOUNT_EMAIL` / `OWNER_ACCOUNT_PASSWORD` are set they are used;
  otherwise the first sign-in provisions a random account once and stores it
  in the `admin_credentials` table. Nothing to configure.
- **Admin role.** The backing account gets the `admin` role in `user_roles`
  automatically (role-based access control, never a client-side flag).
- **Protected server functions** reject requests without a bearer token.

## 4. Post-deploy checklist

Environment and build

- [ ] All required variables present in Production, Preview and Development
- [ ] `bun run verify:env` passes on the deploy machine
- [ ] `bun run build` finishes with no errors
- [ ] Database migrations applied to the same backend project as Lovable

Auth and access control

- [ ] `/admin` login succeeds with your username and password
- [ ] Sign-out clears the session and `/admin` asks for credentials again

Media and endpoints

- [ ] Images render on `/`, `/portfolio` and `/explore`
- [ ] `/api/public/media/<key>` streams an uploaded image
- [ ] Admin image upload writes to the `portfolio-media` bucket

AI

- [ ] AI Workspace returns an answer (confirms `OPENAI_API_KEY`)
- [ ] Image Studio generates a picture (confirms `OPENAI_API_KEY`)

Original quick pass

- [ ] `/` loads and the hero carousel animates
- [ ] `/portfolio`, `/explore`, `/investor`, `/cv`, `/contact` all return 200
- [ ] `/admin` login succeeds and the sidebar shows every section
- [ ] No horizontal scrolling at 360 px width
- [ ] `<slug>.eager.app` serves the published site (after adding the wildcard
      domain in Vercel → Settings → Domains)

## 5. Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Login says "not configured", lists `SUPABASE_*` | Supabase variables missing on Vercel | Add them and redeploy |
| Login says missing `OWNER_LOGIN_*` | No dashboard-stored credentials and no env vars | Add both variables, or set credentials in admin → Security |
| Login rejected with correct password | Pointing at a different backend than the one your credentials live in | Match `SUPABASE_URL` to the project where the credentials were saved |
| Images blank / 404 | `SUPABASE_SERVICE_ROLE_KEY` missing or bucket not recreated | Add the key; recreate the private `portfolio-media` bucket |
| AI says not configured | Neither `LOVABLE_API_KEY` nor `OPENAI_API_KEY` set | Add `OPENAI_API_KEY` on Vercel |
| AI fails with 429/402 | OpenAI rate limit or out of credit | Top up or lower the model tier |
| Data looks empty | Vercel points at a different Supabase project than Lovable | Match `SUPABASE_URL` on both |

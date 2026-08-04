# Deployment guide: Lovable to GitHub to Vercel

The app is TanStack Start (React 19 + Vite 7). Everything below keeps the admin
login, the database, and the uploaded images identical across environments,
because all three live in the backend, not in the repository.

## 1. Required environment variables

Set these in Vercel under Project Settings, Environment Variables, for
Production, Preview and Development.

### Client (safe to expose, must keep the VITE_ prefix)

| Name | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public browser key |
| `VITE_SUPABASE_PROJECT_ID` | Project reference |

### Server only (never prefix with VITE_)

| Name | Purpose |
| --- | --- |
| `SUPABASE_URL` | Backend URL for server functions |
| `SUPABASE_PUBLISHABLE_KEY` | Public key for server-side public reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged writes, storage uploads, admin tasks |
| `LOVABLE_API_KEY` | AI Workspace and Image Studio |
| `OWNER_LOGIN_USERNAME` | Admin username |
| `OWNER_LOGIN_PASSWORDS` | Admin password |
| `OWNER_ACCOUNT_EMAIL` | Email of the backing owner account |
| `OWNER_ACCOUNT_PASSWORD` | Password of the backing owner account |

Copy the values from the Lovable project (Settings, then the backend/secrets
view). Do not commit any of them to git.

## 2. Steps

1. In Lovable, connect GitHub and push the project.
2. In Vercel, import the GitHub repository. Framework preset: Vite.
   - Build command: `bun run build`
   - Output: handled by the TanStack Start adapter, leave the default.
3. Paste every variable from section 1 before the first deploy.
4. Deploy. Then open `/admin` and sign in with `OWNER_LOGIN_USERNAME` and
   `OWNER_LOGIN_PASSWORDS`.

## 3. What stays the same after the move

- **Admin credentials.** Read from environment variables at request time on the
  server, with the same values in Lovable and Vercel.
- **Database.** Same backend project, so clients, projects, leads, orders,
  bookings, finance, security logs and visitors are all shared.
- **Uploaded images.** Stored in the `portfolio-media` bucket and served through
  `/api/public/media/:key`, so no binary files need to ship in git.
- **Static assets.** Bundled from `src/assets/*.asset.json` CDN pointers.

## 4. Post-deploy checklist

- [ ] `/` loads and the hero carousel animates
- [ ] `/portfolio`, `/explore`, `/investor`, `/cv`, `/contact` all return 200
- [ ] `/admin` login succeeds and the sidebar shows every section
- [ ] AI Workspace returns an answer (confirms `LOVABLE_API_KEY`)
- [ ] Image Manager upload succeeds (confirms `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] No horizontal scrolling at 360 px width

## 5. Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Admin login rejected | `OWNER_LOGIN_*` missing on Vercel | Add both variables and redeploy |
| Images blank | Server key missing, so media route cannot sign reads | Add `SUPABASE_SERVICE_ROLE_KEY` |
| AI says not configured | `LOVABLE_API_KEY` missing | Add it, redeploy |
| Data looks empty | Pointed at a different backend project | Match `SUPABASE_URL` to the Lovable value |

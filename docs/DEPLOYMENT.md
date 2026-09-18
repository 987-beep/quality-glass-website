# DEPLOYMENT — GitHub + Vercel + InsForge playbook

Everything here is verified working. **There is no other deploy mechanism.**

## The chain

```
code edit → npm run build (green, "✓ Generating 37/37")
        → commit → push to GitHub main  ──▶  VERCEL auto-build (~90 s)
        ──▶  curl live URL to VERIFY  ──▶  tell owner to hard-refresh
```

## 1. GitHub

- Repo: `https://github.com/987-beep/quality-glass-website` (PUBLIC — never commit secrets)
- Remote (re-add if the sandbox lost it — `.git/config` isn't always persisted):

```bash
git remote add origin https://github.com/987-beep/quality-glass-website.git
```

- Commit identity (use inline, works even without global config):

```bash
git -c user.name="Ajmal" -c user.email="987-beep@users.noreply.github.com" commit -m "…"
```

- **Push needs a Personal Access Token** (classic, `repo` scope, owned by 987-beep):

```bash
git push https://987-beep:<TOKEN>@github.com/987-beep/quality-glass-website.git main
```

Ask the owner for a fresh token **only at the very end**, when the build is green. Never store it
in files, never echo it back, never put it in a committed config.

## 2. Vercel

- Project linked to the repo; production branch `main`; auto-deploy on push (~90 s).
- Framework preset **Next.js**, Build `next build`, Install `npm i`, Node 20.
- Env vars set for all environments: `INSFORGE_URL`, `INSFORGE_API_KEY`, `INSFORGE_DATABASE_URL`.
- Live URL: https://quality-glass-website.vercel.app
- No CLI, no dashboard click needed for deploys. Custom domain is pending (owner doesn't want
  the vercel.app subdomain shown in Google search — explained: only a custom domain fixes that).

## 3. InsForge

- Dashboard holds the project (URL, `ik_` key, DB password). Same 3 values are in Vercel env.
- Runtime auth note: `lib/server/insforge.ts` forwards the `cookie` header on the auth surface —
  **removing that breaks permanent login** (users logged out ~every 2 h before the fix).
- Direct-PG scripts: see `docs/DATABASE.md` §maintenance flag.

## 4. Post-deploy verification (always)

```bash
sleep 90
curl -s https://quality-glass-website.vercel.app | grep -o 'data-theme="[a-z-]*"' | head -1   # expect data-theme="gold"
```

Grep for whatever you changed (CSS token, API status, string). The change is not "done" until the
live site shows it. If Vercel build failed, owner re-deploys from dashboard ("Redeploy" on the
previous green commit) — code fix + push is usually faster.

# Deploying to a new Netlify account

The old site lives under a Netlify account nobody on this side can reach. Nothing
about the build depends on it, so a fresh repo plus a fresh Netlify site is a
clean path — with one exception, the domain (see the last section).

## 1. Push to a new repo

The existing git history committed `.env` several times (`git log --all -- .env`
shows `added env`, `added .env file`, `Delete .env`, …). Deleting a file does not
remove it from history, so pushing this history to a new **public** repo would
publish those old endpoint URLs.

They are Google Apps Script `/exec` URLs, which are already readable in the
deployed bundle, so this is not a live credential leak. It is still worth not
carrying forward: start the new repo with **no history**.

```sh
# from a copy of the working tree, with .git removed
git init
git add .
git commit -m "SOD x BITSMUN 2026"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Confirm before pushing that `git status --short` lists no `.env`, `.env.seed`, or
`.env.local` — all three are gitignored, but check rather than assume.

## 2. Create the Netlify site

"Add new site" → "Import an existing project" → pick the new repo. `netlify.toml`
supplies the build command, publish directory, Node version, SPA redirect, and
cache headers, so the defaults Netlify proposes can be accepted as-is.

## 3. Set the environment variables

**Do this before the first deploy.** Vite inlines `VITE_*` values at *build*
time. A site built with them unset produces a bundle where every form fails —
and setting them afterwards changes nothing until you trigger a *new* build.

Site settings → Environment variables:

| Key | Value |
| --- | --- |
| `VITE_SANITY_PROJECT_ID` | `h5reu7l4` |
| `VITE_REGFORM_URL` | new Apps Script `/exec` — see `scripts/apps-script/README.md` |
| `VITE_COUPONS_URL` | existing coupon endpoint |
| `VITE_INTCOUPONS_URL` | existing international coupon endpoint |

Current values for the last two are in `.env.seed` (gitignored, extracted from
the live bundle). None of these is a secret: Vite ships them to every visitor.
Anything that must stay private has to live server-side in the Apps Script.

`VITE_REGFORM_URL` is the one that needs real attention — the endpoints the live
site currently uses all return **HTTP 403**, so registrations are silently
discarded while the form reports success. Deploy `scripts/apps-script/Code.gs`
with *Who has access: **Anyone*** and use that URL.

## 4. Verify on the `.netlify.app` URL first

Before touching DNS, on the temporary Netlify subdomain:

- Load `/Committees` **directly**, not by clicking through — this is what the SPA
  redirect exists for, and it is the failure that only shows up in production.
- Submit one real delegate registration and confirm the row lands in the sheet.
  A green success message proves nothing on its own; that is exactly how the
  current breakage hides.
- Check the theme toggle, and the header logo in both themes.

## 5. Point the domain

`bitsmun.org` currently uses **Netlify DNS** (NS1 nameservers) configured under
the old account. The new Netlify account cannot change that; the **registrar**
can. The domain is at **Squarespace Domains II**, expiring **2027-02-01**.

With registrar access, either repoint the nameservers at the new account's
Netlify DNS, or leave the nameservers alone and set A/CNAME records at the
registrar to the new site. Without registrar access the domain cannot move, and
that is independent of anything Netlify-side.

The old site keeps serving until DNS propagates — minutes to a few hours. Verify
the new site fully (step 4) before switching, because the rollback is another
propagation wait.

# Handover — SOD x BITSMUN website

Everything a new maintainer needs to take over this site. Read this end to end
before touching anything; the parts that break in surprising ways are flagged.

Blanks marked **`<FILL IN>`** are things only the outgoing team knows. Fill them
in before you hand this file on, and do **not** put passwords in here — this
file lives in a Git repo. Passwords belong in a password manager or a sealed
handover note.

---

## 1. What this is

A React + Vite single-page site, deployed on Netlify as static files. There is
no server. Three moving parts behind it:

| Part | What it does | Where it lives |
|---|---|---|
| **Netlify** | Builds from GitHub on push, serves the site, holds the domain config | netlify.com |
| **Sanity CMS** | All editable content — committees, EB, gallery, contact details, registration open/closed flags. Fetched live in the browser, so edits appear without a rebuild | sanity.io, project `h5reu7l4`, dataset `production` |
| **Google Apps Script** | Receives registration form posts, writes rows to a Google Sheet, saves payment screenshots to Drive | script.google.com |

---

## 2. Accounts and access

Transfer or share **all five** of these. Losing any one of them means losing a
part of the site.

| # | Service | Account / owner | Notes |
|---|---|---|---|
| 1 | **GitHub** | `<FILL IN — GitHub username/email>` | Repo: `https://github.com/alwayshubh2595/BITSMUN-Website` |
| 2 | **Netlify** | `<FILL IN — login email>` | Site name: `<FILL IN>`. Logged in via `<FILL IN — GitHub OAuth / email+password>` |
| 3 | **Sanity** | `<FILL IN — login email>` | Project ID `h5reu7l4`. Manage at sanity.io/manage |
| 4 | **Google** (Sheets + Apps Script + Drive) | `<FILL IN — likely bitsmun.pilani.bits@gmail.com>` | Owns the responses sheet, the script, and the screenshots folder |
| 5 | **Domain registrar** for `bitsmun.org` | `<FILL IN — registrar name and login email>` | DNS points at Netlify |

Conference mailbox referenced on the site: `bitsmun.pilani.bits@gmail.com`

### Transferring each one

- **GitHub** — Settings → Collaborators, or transfer the repo to the new owner
  or a `bitsmun` org. An org is better: it survives people graduating.
- **Netlify** — Site settings → Members, add the new maintainer as Owner. If
  Netlify login is "Login with GitHub", the new person needs GitHub access
  first. The site can also simply be re-deployed from scratch on a brand-new
  Netlify account by connecting the repo — nothing about the build is
  account-specific. Only the domain DNS would need repointing.
- **Sanity** — sanity.io/manage → the project → Members → Invite, role
  **Administrator**.
- **Google** — either hand over the mailbox credentials, or in the Sheet and the
  Apps Script project use Share → Add people → Owner.
- **Registrar** — registrar-specific; usually an account-to-account push.

---

## 3. Deploying

Push to the default branch. Netlify builds automatically.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

Build config is in `netlify.toml`: build command `npm run build`, publish
directory `dist`, Node 18 pinned.

### Environment variables

Set in Netlify under **Site configuration → Environment variables**. They must
also exist locally in a `.env` file for `npm run dev`. See `.env.example` for
the full list of names.

| Variable | Points at |
|---|---|
| `VITE_SANITY_PROJECT_ID` | `h5reu7l4` |
| `VITE_DELREGFORM_URL` | Apps Script `/exec` URL, delegate form |
| `VITE_EBREGFORM_URL` | Apps Script `/exec` URL, EB form |
| `VITE_INTDELREGFORM_URL` | Apps Script `/exec` URL, international form |
| `VITE_COUPONS_URL` | Coupon lookup script (currently non-functional) |
| `VITE_INTCOUPONS_URL` | Coupon lookup script (currently non-functional) |

**Two traps here, both of which have already cost days:**

1. Vite bakes `VITE_*` values into the JavaScript bundle **at build time**.
   Changing one in Netlify does nothing until you trigger a fresh deploy. It
   also means these values are **publicly readable** by anyone who views the
   bundle — never put a real secret in a `VITE_` variable.
2. Paste the URL as a **plain URL**. A Markdown link pasted into the Netlify
   field once produced a value like `https://…exec](https://…exec` and every
   submission failed with no obvious cause.

---

## 4. Sanity CMS — editing content

Studio lives in `bitsmun/`. Run it locally:

```bash
cd bitsmun && npm install && npm run dev
```

Or use the hosted studio if one is deployed for this project.

Editable document types include committees, executive board, gallery, contact
details, campus ambassador tiers, and the registration flags.

### The CORS trap

Sanity matches allowed origins **exactly**. `https://bitsmun.org` and
`https://www.bitsmun.org` are two different origins. If only one is allowlisted
and visitors land on the other, every content fetch returns 403 and the site
shows empty committees and "registrations closed" for no visible reason.

Fix: sanity.io/manage → project → API → CORS origins. Make sure **both** the
apex and `www` are listed, plus `http://localhost:3000` (or whatever port dev
uses) for local work.

---

## 5. Registrations — open and closed

There are **two** switches. Understand both.

### The code switch (currently ON — registrations are closed)

`src/utils/registrationStatus.js`:

```js
export const REGISTRATIONS_CLOSED = true;
```

While this is `true`, every registration link is hidden and every form refuses
to render, whatever the CMS says. To open registrations: set it to `false`,
commit, push, and wait for the Netlify deploy. Then set the CMS flags below.

### The CMS switch

Sanity `registration` document, three free-text fields:

- `registrationType` — delegate
- `EBregistrationType` — executive board
- `IntregistrationType` — international delegate

The value must be exactly `OPEN` (case and whitespace are normalised, anything
else counts as closed — a CMS typo fails safe, closed). These take effect
immediately, no rebuild needed, **but only while the code switch is `false`**.

---

## 6. Registration backend

Source of truth: `scripts/apps-script/Code.gs`. Its own README sits beside it.

**Flow:** the form POSTs to the Apps Script `/exec` URL → the script validates
name and email → decodes the payment screenshot into a Drive folder and gets a
shareable link → takes a script lock → appends a row to the right tab.

**Spreadsheet:** ID `1DDmZTr4oCZ2YhBIqimecIGTOtmDmJ6VDZEKCOuOQWsI`, tabs
`Delegates`, `Executive Board`, `International Delegates`. Headers are created
automatically on first write.

**Drive folder:** `SODxBITSMUN 2026 — Payment Screenshots`, files shared
"anyone with the link, view".

### Safety features already built in, do not remove

- Values starting `=`, `+`, `-`, `@` are prefixed with an apostrophe. Without
  this, a delegate can type a formula into the name field that runs under an
  organiser's account when they open the sheet and exfiltrates the email column.
- Uploads are limited to 6 MB and to jpg/png/webp/heic/pdf. The endpoint is
  public; without the allowlist it is a free malware host on the conference's
  own Drive.
- A script lock serialises appends, so a registration rush cannot overwrite rows.
- Duplicate submissions from the same email within two minutes are ignored.
- Anything posted that is not in the schema lands in an `Extra` column rather
  than being dropped.

### Known state (deliberate, not a bug)

The deployed script version still runs the **old** column schema. Consequences:
an unused `age` column, and `portfolio1`, `portfolio2`, `listAmount` landing in
`Extra` as `portfolio1=India; portfolio2=France; listAmount=1000`. No data is
lost. Deploying the current `Code.gs` cleans this up and will not disturb
existing rows.

### Deploying the Apps Script — read this before trying

This is the single most error-prone part of the whole system.

- **Saving is not deploying.** A deployment serves a frozen snapshot of the code
  at the moment it was created. Editing and saving changes nothing live.
- Use **Deploy → Manage deployments → edit the existing deployment → New
  version**. This keeps the same `/exec` URL.
- **Deploy → New deployment** mints a *different* URL **and** resets "Who has
  access", which then returns a Google sign-in page instead of JSON. If you do
  this, you must set access to **Anyone** again and update the Netlify env var,
  then redeploy the site.
- Settings that must hold: **Execute as: Me**, **Who has access: Anyone**.
- Verify by opening the `/exec` URL in a browser. Correct behaviour is a JSON
  health check listing the three tab names. A sign-in page or
  `Script function not found: doGet` means the deployment is wrong or stale.

### Housekeeping owed

- Old deployments from previous editions may still be live, public, and writing
  to the sheet while running outdated code. Archive every deployment you are not
  using.
- Several Apps Script projects are named "Untitled project". Rename them so the
  next person can tell them apart.
- Test rows (`ZZ_SCHEMA_CHECK` and similar) should be deleted from the Delegates
  tab.

### Coupons

**Currently non-functional** — both coupon endpoints return 403, so every code
is rejected. If coupons are wanted, this needs rebuilding. Note the original
design was unsound: it sent the entire code→discount map to the browser (all
codes publicly readable) and applied the discount client-side. Validation
belongs on the server.

---

## 7. Repo layout

```
src/
  Pages/          one file per route
  components/     Header, Footer, forms, cards, home sections
    schema/       Yup validation for each form
  styles/         SCSS modules, one per component
  assets/         logo, brochure PDF, payment QR, images
  utils/          registrationStatus.js — the open/closed switch
  client.js       Sanity client
scripts/apps-script/Code.gs   registration backend
bitsmun/          Sanity Studio
netlify.toml      build + redirects + headers
public/_redirects SPA fallback (duplicate of the netlify.toml rule, on purpose)
```

Routing is React Router. Deep links only work because of the SPA redirect —
if you move hosting, recreate it or every refresh on a subpage 404s.

---

## 8. Annual rollover checklist

1. Replace the logo in `src/assets/` and the header import.
2. Replace `src/assets/SODxBITSMUN-2026-Brochure.pdf` and the payment QR.
3. Update dates in `src/Pages/Home.jsx` (hero meta row) and
   `src/components/HomeSections.jsx` (`stats`). Both currently read **TBA**.
4. Update fees in `src/components/DelRegForm.jsx` (`MODE_FEES`).
5. Update the portfolio matrix link in the same file.
6. Update the secretariat contacts in `src/Pages/ContactUs.jsx` (`CONTACTS`).
7. Update committees, EB, and gallery in Sanity.
8. Point the Apps Script at a **new** spreadsheet for the new year
   (`SPREADSHEET_ID`) and update `DRIVE_FOLDER_NAME`.
9. Flip `REGISTRATIONS_CLOSED` to `false` and set the Sanity flags to `OPEN`.

---

## 9. If something looks broken

| Symptom | Almost always |
|---|---|
| Committees empty, everything shows "closed" | Sanity CORS — apex vs `www` |
| Form says registrations are misconfigured | Missing or malformed `VITE_*REGFORM_URL`, or the site was not rebuilt after changing it |
| Submissions vanish | Apps Script access is not "Anyone", or the URL points at an archived deployment |
| A change does not appear live | Netlify did not rebuild. Compare the bundle filename (`assets/index-<hash>.js`) before and after — an unchanged hash means no new build |
| Refresh on a subpage 404s | SPA redirect missing |

---

## 10. Security notes for whoever takes over

- Any credential that has appeared in a chat log, an email, or this repo must be
  treated as compromised. Rotate Sanity API tokens on handover.
- `VITE_*` variables are public by design. Never put a token in one.
- The Apps Script endpoint is public and unauthenticated. That is required for
  the forms to work; the defences in `Code.gs` are what make it acceptable.
  Keep them.
- The Drive screenshot folder contains payment screenshots — personal data.
  Restrict who can see it, and delete it once the conference is settled.

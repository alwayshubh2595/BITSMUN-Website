# Registration backend — deployment

One Apps Script serves all three forms and writes to one spreadsheet:

**https://docs.google.com/spreadsheets/d/1DDmZTr4oCZ2YhBIqimecIGTOtmDmJ6VDZEKCOuOQWsI**

Tabs are created automatically on the first submission of each type:

| Tab | Form |
|---|---|
| `Delegates` | `/Registrations` |
| `Executive Board` | `/EBRegistrations` |
| `International Delegates` | `/InternationalRegistrations` |

Payment screenshots and resumes go to a Drive folder called
*SODxBITSMUN 2026 — Payment Screenshots*, and the row stores a link.

---

## Why this replaces the 2025 setup

The 2025 backend was five separate Apps Script deployments. On 2026-08-09 all
five returned **HTTP 403** with a Google sign-in page — their "Who has access"
setting was no longer `Anyone`, so every registration submitted from the live
site was rejected. Because the old frontend never checked the response, each
delegate still saw *"Your response has been recorded."*

This version fixes both halves:

- **One deployment** instead of five, so there is one access setting to get right.
- **Every response is JSON with an explicit `result` field**, so the site can
  tell success from failure. The frontend now surfaces errors and retries.

---

## Deploy

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Delete anything in `Code.gs` and paste the contents of the `Code.gs` next to
   this README. Save.
3. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone** ← this is the setting that broke in 2025
4. Click **Deploy** and authorise when prompted (it needs Sheets and Drive
   access; the "unverified app" warning is expected for your own script —
   *Advanced → Go to project*).
5. Copy the **Web app URL**, ending in `/exec`.

## Wire it up

Set this one variable in **Netlify → Site configuration → Environment
variables**, replacing the five old `VITE_*` form URLs:

```
VITE_REGFORM_URL = https://script.google.com/macros/s/AKfy.../exec
```

Then **trigger a fresh deploy**. Vite inlines env vars at build time, so
changing the variable without rebuilding leaves the old value in the shipped
JavaScript.

## Verify

```bash
# Health check — no rows written
curl -sL "<your /exec URL>"
# expect: {"result":"success","service":"SODxBITSMUN 2026 registrations",...}

# Full check, from the repo root
node scripts/check-endpoints.mjs
node scripts/check-endpoints.mjs --submit-test   # writes one tagged row
```

A 403 with an HTML sign-in page means *Who has access* is not `Anyone`.

## Re-deploying after edits

Use **Deploy → Manage deployments → Edit (pencil) → Version: New version**.
That keeps the same URL. Creating a *new deployment* mints a different URL and
requires updating Netlify again.

---

## Known gaps

These are deliberate, not oversights:

- **Coupon validation is still client-side.** The old coupons endpoint returned
  the entire code→discount map to the browser, so every code was public. Moving
  validation into this script is the fix; it is not implemented here because
  the 2026 coupon list does not exist yet.
- **The amount is whatever the browser sent.** Payment is verified by a human
  against the uploaded screenshot, so treat the amount column as a claim rather
  than a fact.
- **No confirmation email.** `MailApp.sendEmail` in `doPost` would give both
  sides a receipt; worth adding once the copy is agreed.

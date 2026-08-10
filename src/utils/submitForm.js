// Reliable submission wrapper for the Google Apps Script registration endpoints.
//
// The previous implementation did `await fetch(url).then(() => setSubmitted(true))`
// with no `response.ok` check and no `.catch()`, so quota errors, script errors,
// oversized payloads and network drops all rendered a success message while
// nothing reached the sheet. Every failure mode below must surface to the user.

const DEFAULT_TIMEOUT_MS = 45000;
const DEFAULT_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1200;

export class SubmissionError extends Error {
  constructor(message, { retryable = false, cause } = {}) {
    super(message);
    this.name = "SubmissionError";
    this.retryable = retryable;
    this.cause = cause;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Apps Script answers a successful ContentService call with JSON, but returns an
// HTML error page when the script itself throws. Treat an explicit error result
// as a failure; anything else on a 2xx is a success.
const bodyReportsFailure = (text) => {
  if (!text) return false;
  try {
    const parsed = JSON.parse(text);
    const status = String(parsed.result ?? parsed.status ?? "").toLowerCase();
    return status === "error" || status === "failed";
  } catch {
    // Not JSON. An Apps Script crash renders a page containing this phrase.
    return /google apps script|exception:|script function not found/i.test(text);
  }
};

const postOnce = async (scriptURL, formData, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(scriptURL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new SubmissionError(
        "The server took too long to respond. Your registration was not saved.",
        { retryable: true, cause: err }
      );
    }
    throw new SubmissionError(
      "Could not reach the registration server. Check your connection.",
      { retryable: true, cause: err }
    );
  } finally {
    clearTimeout(timer);
  }

  // An opaque response means the request was sent no-cors and we cannot confirm
  // it landed. Never report success on one.
  if (response.type === "opaque") {
    throw new SubmissionError(
      "Could not confirm your registration was saved. Please try again.",
      { retryable: true }
    );
  }

  if (!response.ok) {
    const retryable = response.status >= 500 || response.status === 429;
    throw new SubmissionError(
      `The registration server rejected the submission (error ${response.status}).`,
      { retryable }
    );
  }

  const text = await response.text().catch(() => "");
  if (bodyReportsFailure(text)) {
    throw new SubmissionError(
      "The registration server could not record your response.",
      { retryable: true }
    );
  }

  return text;
};

/**
 * POST a FormData payload to an Apps Script endpoint, retrying transient
 * failures. Resolves only when the write is confirmed; otherwise throws a
 * SubmissionError whose message is safe to show to a delegate.
 */
export async function submitToScript(scriptURL, formData, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    attempts = DEFAULT_ATTEMPTS,
  } = options;

  if (!scriptURL) {
    // Build-time env var missing: `fetch(undefined)` would otherwise fail silently.
    throw new SubmissionError(
      "Registrations are misconfigured right now. Please contact us at bitsmun.pilani.bits@gmail.com.",
      { retryable: false }
    );
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await postOnce(scriptURL, formData, timeoutMs);
    } catch (err) {
      lastError = err;
      if (!(err instanceof SubmissionError) || !err.retryable) throw err;
      if (attempt < attempts) await wait(RETRY_BASE_DELAY_MS * attempt);
    }
  }

  throw new SubmissionError(
    `${lastError.message} We tried ${attempts} times. Please retry, and contact us at bitsmun.pilani.bits@gmail.com if this keeps happening.`,
    { retryable: true, cause: lastError }
  );
}

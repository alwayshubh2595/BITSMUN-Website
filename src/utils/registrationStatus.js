// The Sanity `registration` doc stores open/closed as free-text strings typed by
// hand, so they arrive with stray whitespace and inconsistent casing — and the
// doc can be missing entirely while it is being edited. Treat anything that is
// not an explicit "open" as closed, so a CMS mistake fails safe.
// Site-wide kill switch. Set to false and redeploy to hand control back to the
// Sanity flags. While it is true, every registration entry point on the site is
// hidden and every form refuses to render, regardless of what the CMS says —
// this is the setting to trust when registrations must be off, because it does
// not depend on anyone remembering to edit three separate CMS fields.
export const REGISTRATIONS_CLOSED = true;

export const isOpenFlag = (value) =>
  !REGISTRATIONS_CLOSED &&
  typeof value === "string" &&
  value.trim().toUpperCase() === "OPEN";

// The Sanity `registration` doc stores open/closed as free-text strings typed by
// hand, so they arrive with stray whitespace and inconsistent casing — and the
// doc can be missing entirely while it is being edited. Treat anything that is
// not an explicit "open" as closed, so a CMS mistake fails safe.
export const isOpenFlag = (value) =>
  typeof value === "string" && value.trim().toUpperCase() === "OPEN";

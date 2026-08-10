// Seeds the 2026 secretariat into Sanity from /home/shubh/Documents/BITSMUN/photos,
// uploading each photo as an image asset and linking it to the aboutus document.
//
//   node scripts/seed-team-2026.mjs                       # dry run, writes nothing
//   SANITY_TOKEN=xxx node scripts/seed-team-2026.mjs --apply
//   SANITY_TOKEN=xxx node scripts/seed-team-2026.mjs --apply --prune
//
// --prune deletes aboutus documents not in this set (i.e. last year's team).
// Destructive, so it is opt-in — run without it first and read the report.
//
// Names and posts come from the photo filenames. `srno` drives display order on
// the About Us page and is set by seniority below, not by filename order.
//
// Originals are uploaded as-is; Sanity keeps the source asset and the About Us
// page requests a resized WebP via URL transform params, so nothing ships the
// full 626KB file to a browser.

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const PHOTO_DIR = "/home/shubh/Documents/BITSMUN/photos";
const apply = process.argv.includes("--apply");
const prune = process.argv.includes("--prune");

// The filenames spell this "Charge d'Affairs"; the correct diplomatic title is
// "Chargé d'Affaires". Using the correct form — change here if you disagree.
const CHARGE_DAFFAIRES = "Chargé d'Affaires";

// Seniority order for the About Us grid.
const team = [
  { srno: 1, name: "Anshuman Pathak", post: "Secretary General", file: "Secretary General , Anshuman Pathak.jpeg" },
  { srno: 2, name: "Sharda Sinha", post: "Director General", file: "Director General , Sharda Sinha.jpeg" },
  { srno: 3, name: "Yash Shewaramani", post: "Deputy Secretary General", file: "Deputy Secretary General , Yash Shewaramani.jpeg" },
  { srno: 4, name: "Shubh Srivastava", post: CHARGE_DAFFAIRES, file: "Charge d'Affairs Shubh Srivastava.jpg" },
  { srno: 5, name: "Umit Adlakha", post: CHARGE_DAFFAIRES, file: "Charge d'Affairs Umit Adhalaka.jpeg" },
];

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const client = createClient({
  projectId: "h5reu7l4",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const main = async () => {
  const missing = team.filter((m) => !fs.existsSync(path.join(PHOTO_DIR, m.file)));
  if (missing.length) {
    console.error("Missing photo files:");
    missing.forEach((m) => console.error(`  - ${m.file}`));
    process.exit(1);
  }

  const existing = await client.fetch(`*[_type == "aboutus"]{_id, name, post}`);
  const resolved = team.map((member) => {
    const match = existing.find(
      (doc) => doc.name && doc.name.trim().toLowerCase() === member.name.toLowerCase()
    );
    return { ...member, _id: match?._id ?? `team-2026-${slug(member.name)}`, _reused: Boolean(match) };
  });

  const keep = new Set(resolved.map((m) => m._id));
  const stale = existing.filter((doc) => !keep.has(doc._id));

  console.log(`Found ${existing.length} existing team document(s).`);
  console.log(`\nWill write ${resolved.length} member(s):`);
  resolved.forEach((m) =>
    console.log(`  ${m.srno}. ${m.name} — ${m.post}${m._reused ? "  (updating existing doc)" : "  (new)"}`)
  );
  if (stale.length) {
    console.log(`\n${stale.length} document(s) are not part of the 2026 team:`);
    stale.forEach((doc) => console.log(`  - ${doc.name ?? "(unnamed)"} — ${doc.post ?? ""}  [${doc._id}]`));
    console.log(prune ? "  -> these WILL be deleted (--prune)" : "  -> left untouched (pass --prune to delete)");
  }

  if (!apply) {
    console.log("\nDry run. Nothing was written. Re-run with --apply to commit.");
    return;
  }
  if (!process.env.SANITY_TOKEN) {
    console.error("\nSANITY_TOKEN is not set. Aborting.");
    process.exit(1);
  }

  let tx = client.transaction();
  for (const member of resolved) {
    const buffer = fs.readFileSync(path.join(PHOTO_DIR, member.file));
    const asset = await client.assets.upload("image", buffer, {
      filename: `${slug(member.name)}.${member.file.split(".").pop()}`,
    });
    console.log(`  uploaded ${member.name} -> ${asset._id}`);

    const fields = {
      name: member.name,
      post: member.post,
      srno: member.srno,
      image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
    };
    tx = tx.createIfNotExists({ _id: member._id, _type: "aboutus", ...fields });
    tx = tx.patch(member._id, (p) => p.set(fields));
  }
  if (prune) for (const doc of stale) tx = tx.delete(doc._id);

  await tx.commit();
  console.log(`\nDone. Wrote ${resolved.length} member(s)${prune ? `, deleted ${stale.length}` : ""}.`);
  console.log("Social links (github/linkedin/instagram) are not set here — add them in the Studio.");
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

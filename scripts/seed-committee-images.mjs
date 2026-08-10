// Uploads committee artwork extracted from the SOD x BITSMUN 2026 brochure and
// attaches it to the matching committee documents.
//
//   node scripts/seed-committee-images.mjs                 # dry run
//   SANITY_TOKEN=xxx node scripts/seed-committee-images.mjs --apply
//
// Images come from the brochure's own committee pages rather than from a web
// search: they are already licensed and chosen by the design team, and they
// carry the duotone treatment the rest of the 2026 collateral uses.
//
// This sets all eight, including the three that carried 2025 artwork, because a
// grid mixing brochure photos with last year's flat logos looks inconsistent.
// The previous asset ids are printed before writing so a revert is possible.

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const IMAGE_DIR = process.env.COMMITTEE_IMAGE_DIR;
const apply = process.argv.includes("--apply");

// committee document name -> image filename
const mapping = {
  "UNGA DISEC": "unga-disec.jpg",
  "UNHRC": "unhrc.jpg",
  "Global AI Summit 2026": "global-ai-summit.jpg",
  "Lok Sabha": "lok-sabha.jpg",
  "CCC US NSC": "ccc-us-nsc.jpg",
  "IP": "ip.jpg",
  "UNSC": "unsc.jpg",
  "FIA": "fia.jpg",
};

const client = createClient({
  projectId: "h5reu7l4",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const main = async () => {
  if (!IMAGE_DIR) {
    console.error("Set COMMITTEE_IMAGE_DIR to the folder holding the cropped images.");
    process.exit(1);
  }

  const committees = await client.fetch(
    `*[_type == "committees"]|order(srno){_id, name, "currentAsset": image.asset._ref}`
  );

  const plan = [];
  for (const committee of committees) {
    const file = mapping[committee.name];
    if (!file) {
      console.warn(`  ! no image mapped for "${committee.name}" — skipping`);
      continue;
    }
    const full = path.join(IMAGE_DIR, file);
    if (!fs.existsSync(full)) {
      console.error(`  ! missing file ${full}`);
      process.exit(1);
    }
    plan.push({ ...committee, file: full });
  }

  console.log(`Will set artwork on ${plan.length} committee(s):`);
  plan.forEach((c) =>
    console.log(`  ${c.name.padEnd(24)} previous asset: ${c.currentAsset ?? "(none)"}`)
  );

  if (!apply) {
    console.log("\nDry run. Nothing was written. Re-run with --apply to commit.");
    return;
  }
  if (!process.env.SANITY_TOKEN) {
    console.error("\nSANITY_TOKEN is not set. Aborting.");
    process.exit(1);
  }

  let tx = client.transaction();
  for (const committee of plan) {
    const asset = await client.assets.upload("image", fs.readFileSync(committee.file), {
      filename: path.basename(committee.file),
    });
    console.log(`  uploaded ${committee.name} -> ${asset._id}`);
    tx = tx.patch(committee._id, (p) =>
      p.set({
        image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      })
    );
  }

  await tx.commit();
  console.log(`\nDone. Set artwork on ${plan.length} committee(s).`);
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

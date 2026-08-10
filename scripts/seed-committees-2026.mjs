// Seeds the 2026 committee lineup into Sanity from the SOD x BITSMUN 2026 brochure.
//
//   node scripts/seed-committees-2026.mjs              # dry run, writes nothing
//   SANITY_TOKEN=xxx node scripts/seed-committees-2026.mjs --apply
//   SANITY_TOKEN=xxx node scripts/seed-committees-2026.mjs --apply --prune
//
// --apply  writes the eight 2026 committees using deterministic ids, so re-running
//          updates in place rather than creating duplicates.
// --prune  additionally deletes committee documents that are NOT in this set,
//          i.e. the leftover 2025 committees. Left off by default because it is
//          destructive; run without it first and read the report.
//
// Get a token from sanity.io/manage -> project h5reu7l4 -> API -> Tokens (Editor).
// Do not commit the token.
//
// NOTE: images are not set here. Every committee needs an image uploaded in the
// Studio (Committees -> <committee> -> Image), otherwise its card renders without
// artwork. The `type` field is load-bearing: the delegate registration form only
// shows committees whose type matches the chosen mode of participation, so a
// missing or misspelt type makes a committee unselectable.

import { createClient } from "@sanity/client";

const apply = process.argv.includes("--apply");
const prune = process.argv.includes("--prune");

const committees = [
  {
    _id: "committee-2026-unga-disec",
    name: "UNGA DISEC",
    bio: "United Nations General Assembly DISEC",
    type: "Offline",
    srno: 1,
    agenda:
      "Addressing the challenges to regional security, nuclear non-proliferation, and maritime stability arising from the United States – Iran conflict",
  },
  {
    _id: "committee-2026-unhrc",
    name: "UNHRC",
    bio: "United Nations Human Rights Council",
    type: "Offline",
    srno: 2,
    agenda:
      "Deliberation on the human rights implications of counter-terrorism measures, with special emphasis on digital surveillance, preventive detention, and the protection of due process rights",
  },
  {
    _id: "committee-2026-global-ai-summit",
    name: "Global AI Summit 2026",
    bio: "Global AI Summit 2026",
    type: "Offline",
    srno: 3,
    agenda:
      "Strengthening global cooperation on the governance of artificial intelligence systems, with special emphasis on safety standards, equitable access, and harmonization across stakeholders",
  },
  {
    _id: "committee-2026-lok-sabha",
    name: "Lok Sabha",
    bio: "Lok Sabha",
    type: "Offline",
    srno: 4,
    agenda:
      "Reviewing the implementation framework and financial sustainability of welfare provisions under the Code on Social Security, 2020, with special emphasis on social security coverage for gig and platform workers",
  },
  {
    _id: "committee-2026-ccc-us-nsc",
    name: "CCC US NSC",
    bio: "United States National Security Council",
    type: "Offline",
    srno: 5,
    // Crisis committee: the brochure gives a freeze date in place of an agenda.
    freezeDate: "June 2013",
  },
  {
    _id: "committee-2026-ip",
    name: "IP",
    bio: "International Press",
    type: "Offline",
    srno: 6,
    // CommitteeCard renders this under "Roles:" rather than "Agenda:" for IP.
    agenda: "Calling all Journalists and Photographers",
  },
  {
    _id: "committee-2026-unsc",
    name: "UNSC",
    bio: "United Nations Security Council",
    type: "Online",
    srno: 7,
    agenda:
      "Addressing the challenges posed by the use of Private Military Companies in armed conflicts, with special emphasis on accountability, civilian protection, state responsibility, and compliance with international humanitarian law.",
  },
  {
    // FIA replaced ECOSOC in the revised 2026 brochure. --prune removes the old
    // ECOSOC document; without it the stale committee stays visible on the site.
    _id: "committee-2026-fia",
    name: "FIA",
    bio: "Fédération Internationale de l'Automobile",
    type: "Online",
    srno: 8,
    agenda:
      "Evaluating the commercial and sporting criteria for grid expansion and revising the Concorde Agreement's anti-dilution regulations",
  },
];

const client = createClient({
  projectId: "h5reu7l4",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const main = async () => {
  const existing = await client.fetch(`*[_type == "committees"]{_id, name}`);

  // UNHRC, IP and UNSC carry over from 2025 and already have images uploaded.
  // Reuse the existing document when the name matches so that artwork (and any
  // chair assignments) survive, instead of orphaning it under a new id.
  const byName = new Map(
    existing.filter((doc) => doc.name).map((doc) => [doc.name.trim().toLowerCase(), doc._id])
  );
  const resolved = committees.map((committee) => {
    const reused = byName.get(committee.name.trim().toLowerCase());
    return reused ? { ...committee, _id: reused, _reused: true } : committee;
  });

  const keep = new Set(resolved.map((c) => c._id));
  const stale = existing.filter((doc) => !keep.has(doc._id));

  console.log(`Found ${existing.length} existing committee document(s).`);
  console.log(`Will write ${resolved.length} committee(s) for 2026:`);
  resolved.forEach((c) =>
    console.log(`  - ${c.name} [${c.type}]${c._reused ? "  (updating existing doc, image preserved)" : "  (NEW — needs an image)"}`)
  );
  if (stale.length) {
    console.log(`\n${stale.length} document(s) are not part of the 2026 set:`);
    stale.forEach((doc) => console.log(`  - ${doc.name ?? "(unnamed)"}  [${doc._id}]`));
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
  for (const committee of resolved) {
    // Preserve any image/chair/viceChair already set in the Studio: patch only
    // the brochure fields, and create the doc first if it is new.
    const { _id, _reused, ...fields } = committee;
    tx = tx.createIfNotExists({ _id, _type: "committees", ...fields });
    tx = tx.patch(_id, (p) => p.set(fields));
  }
  if (prune) for (const doc of stale) tx = tx.delete(doc._id);

  await tx.commit();
  console.log(`\nDone. Wrote ${resolved.length} committee(s)${prune ? `, deleted ${stale.length}` : ""}.`);
  console.log("Remember to upload an image for each committee in the Studio.");
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

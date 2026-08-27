import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import sanityClient from "../client.js";
import { isOpenFlag } from "../utils/registrationStatus.js";
import PrizePool from "./PrizePool.jsx";
import styles from "../styles/HomeSections.module.scss";

// Everything below the hero. The homepage was a single 100vh panel with no
// scroll content, so a visitor learned nothing without navigating away.

const stats = [
  { value: "TBA", label: "Dates, 2026" },
  { value: "8", label: "Committees" },
  { value: "₹1.5L+", label: "Prize Pool" },
  { value: "BITS", label: "Pilani Campus" },
];

// SODMUN, the partner organisation behind SOD x BITSMUN 2026.
const SODMUN_URL = "https://sodmun.com";

const sodmunStats = [
  { value: "2024", label: "First edition" },
  { value: "750+", label: "Delegates, 4th conference" },
  { value: "2,000+", label: "Delegates all editions" },
  { value: "₹13L+", label: "Raised for solar schools" },
];

const committeePreview = (url) =>
  url ? `${url}?w=640&h=480&fit=crop&auto=format&q=70` : undefined;

// Subtle fade-up as each band enters the viewport. `once` so it does not
// re-trigger on every scroll, and the whole thing is skipped for users who
// have asked for reduced motion.
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const HomeSections = ({ registration }) => {
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "committees"]|order(srno){name, bio, type, agenda, image{asset->{url}}}`
      )
      .then((data) => setCommittees(data ?? []))
      .catch(() => setCommittees([]));
  }, []);

  const anyOpen =
    isOpenFlag(registration?.registrationType) ||
    isOpenFlag(registration?.EBregistrationType) ||
    isOpenFlag(registration?.IntregistrationType);

  return (
    <div className={styles.page}>
      <section className={styles.statsBand}>
        <div className={styles.container}>
          <ul className={styles.stats}>
            {stats.map((stat) => (
              <li key={stat.label}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <motion.section className={styles.intro} {...reveal}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>
            <span className={styles.index}>01</span> Debate · Discuss · Decide
          </p>
          <h2 className={styles.sectionHeading}>
            One of India&apos;s largest Model UN conferences
          </h2>
          <p className={styles.lede}>
            For three days each year, BITS Pilani becomes a room where the
            world&apos;s hardest questions get argued out. SOD x BITSMUN 2026
            brings together delegates from across the country and beyond to
            debate, negotiate and decide across eight committees.
          </p>
          <Link className={styles.textLink} to="/AboutUs">
            More about BITSMUN &rarr;
          </Link>
        </div>
      </motion.section>

      <motion.section className={styles.partner} {...reveal}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>
            <span className={styles.index}>02</span> In partnership with
          </p>
          <h2 className={styles.sectionHeading}>
            Summit of Diplomacy Model United Nations
          </h2>
          <div className={styles.partnerGrid}>
            <div className={styles.partnerCopy}>
              <p>
                SODMUN is a teen-led Model United Nations conference hosted in
                Dubai. Since its first conference in 2024, it has grown from 200
                delegates to over 750 at its fourth conference, with more than
                2,000 delegates across all editions. It is the largest private
                teen-led MUN conference in the world, built and run entirely by
                teenagers.
              </p>
              <p>
                Past editions have converted that growth into real-world impact,
                raising over 13 lakhs INR to bring solar energy to rural schools.
                Now, we are bringing SODMUN to India.
              </p>
              <a
                className={styles.textLink}
                href={SODMUN_URL}
                target="_blank"
                rel="noreferrer"
              >
                Visit sodmun.com &rarr;
              </a>
            </div>
            <ul className={styles.partnerStats}>
              {sodmunStats.map((stat) => (
                <li key={stat.label}>
                  <span className={styles.partnerStatValue}>{stat.value}</span>
                  <span className={styles.partnerStatLabel}>{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      {committees.length > 0 && (
        <motion.section className={styles.committees} {...reveal}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionHeading}>
                <span className={styles.index}>03</span> Committees
              </h2>
              <Link className={styles.textLink} to="/Committees">
                View agendas &rarr;
              </Link>
            </div>
            <div className={styles.accordion}>
              {committees.map((committee, i) => (
                <Link
                  className={styles.panel}
                  to="/Committees"
                  key={committee.name}
                  style={{
                    backgroundImage: committee.image?.asset?.url
                      ? `url(${committeePreview(committee.image.asset.url)})`
                      : undefined,
                  }}
                >
                  <span className={styles.panelScrim} aria-hidden="true" />

                  {/* Collapsed: a vertical spine of index + name. */}
                  <span className={styles.panelSpine}>
                    <span className={styles.panelIndex}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.panelSpineName}>{committee.name}</span>
                  </span>

                  {/* Expanded: cross-fades in as the panel widens. */}
                  <span className={styles.panelDetail}>
                    <span className={styles.panelMode}>{committee.type}</span>
                    <span className={styles.panelName}>{committee.name}</span>
                    <span className={styles.panelBio}>{committee.bio}</span>
                    {committee.agenda && (
                      <span className={styles.panelAgenda}>{committee.agenda}</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      <div className={styles.container}>
        <PrizePool />
      </div>

      <motion.section className={styles.cta} {...reveal}>
        <div className={styles.containerNarrow}>
          <h2 className={styles.ctaHeading}>
            <span className={styles.index}>05</span>{" "}
            {anyOpen ? "Registrations are open" : "Registrations open soon"}
          </h2>
          <p className={styles.ctaText}>
            {anyOpen
              ? "Secure your place at SOD x BITSMUN 2026."
              : "Follow us to hear the moment registrations go live."}
          </p>
          <div className={styles.ctaActions}>
            {isOpenFlag(registration?.registrationType) && (
              <Link className={styles.buttonPrimary} to="/Registrations">
                Register as a Delegate
              </Link>
            )}
            {isOpenFlag(registration?.IntregistrationType) && (
              <Link className={styles.buttonGhost} to="/InternationalRegistrations">
                International Delegates
              </Link>
            )}
            {isOpenFlag(registration?.EBregistrationType) && (
              <Link className={styles.buttonGhost} to="/EBApplications">
                Apply to the Executive Board
              </Link>
            )}
            {!anyOpen && (
              <Link className={styles.buttonGhost} to="/Committees">
                Explore Committees
              </Link>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomeSections;

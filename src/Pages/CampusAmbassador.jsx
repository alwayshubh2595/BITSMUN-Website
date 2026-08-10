import React, { useContext, useEffect } from 'react';
import styles from "../styles/CA.module.scss";
import Header from '../components/Header';
import Footer from '../components/Footer';
import EntryContext from '../Context/EntryContext';

// Tier data lifted out of the markup so the three cards stay identical in
// structure — they were previously three hand-written stacked blocks.
const tiers = [
  {
    index: "01",
    range: "10 – 15",
    delegate: ["Discount of ₹150 per delegate"],
    ambassador: ["Discount of 25% of delegation fee"],
  },
  {
    index: "02",
    range: "15 – 20",
    delegate: ["Discount of ₹250 per delegate"],
    ambassador: ["Discount of 75% of delegation fee"],
  },
  {
    index: "03",
    range: "20+",
    delegate: ["Discount of ₹400 per delegate"],
    ambassador: [
      "Discount of 100% of delegation fee",
      "1 Prof Show ticket (subject to availability and feasibility)",
    ],
  },
];

const contacts = [
  { name: "Anshuman Pathak", phone: "+91 99581 95460" },
];

const EMAIL = "bitsmun.pilani.bits@gmail.com";

const CampusAmbassador = () => {
  const context = useContext(EntryContext);

  useEffect(() => {
    document.title = "Campus Ambassador Program | BITSMUN Pilani 2026";
    context.setEntry();
  }, []);

  return (
    <>
      <Header color="black" />
      <div className={styles.mainpage}>
        <header className={styles.pageHead}>
          <p className={styles.eyebrow}>SOD x BITSMUN 2026</p>
          <h1 className={styles.heading}>Campus Ambassador Program</h1>
          <p className={styles.lede}>
            Bring a delegation from your institution and earn discounts for them
            and for yourself. The more delegates you register, the more both
            sides save.
          </p>
        </header>

        <div className={styles.tiers}>
          {tiers.map((tier) => (
            <article className={styles.tier} key={tier.index}>
              <div className={styles.tierHead}>
                <span className={styles.tierIndex}>{tier.index}</span>
                <span className={styles.tierRange}>{tier.range}</span>
                <span className={styles.tierUnit}>Delegates</span>
              </div>

              <div className={styles.benefit}>
                <h2>For each delegate</h2>
                <ul>
                  {tier.delegate.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>

              <div className={styles.benefit}>
                <h2>For you</h2>
                <ul>
                  {tier.ambassador.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <section className={styles.highlight}>
          <h2>Top 3 performing Campus Ambassadors</h2>
          <p>
            The three highest-performing Campus Ambassadors receive gift hampers
            and Prof Show tickets, subject to availability and feasibility.
          </p>
        </section>

        <section className={styles.contactSection}>
          <h2>Get in touch</h2>
          <p className={styles.contactIntro}>
            To know more about the Campus Ambassador Program, or to sign up:
          </p>
          <div className={styles.contactGrid}>
            {contacts.map((person) => (
              <div className={styles.contactCard} key={person.name}>
                <span className={styles.contactName}>{person.name}</span>
                <a
                  className={styles.contactLink}
                  href={`tel:${person.phone.replace(/\s/g, "")}`}
                >
                  {person.phone}
                </a>
                <a className={styles.contactLink} href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              </div>
            ))}
          </div>
        </section>

        <p className={styles.terms}>
          All Prof Show tickets are strictly subject to availability and
          feasibility, and the final decision rests with the Secretariat.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default CampusAmbassador;

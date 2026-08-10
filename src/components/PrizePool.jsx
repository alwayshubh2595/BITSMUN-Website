import React from "react";
import styles from "../styles/PrizePool.module.scss";

// Figures from the SOD x BITSMUN 2026 brochure. Static because they are fixed
// for the edition — unlike committees, there is no reason to round-trip these
// through the CMS.
const categories = [
  {
    label: "Offline",
    awards: [
      { name: "Best Delegate", amount: "12,000" },
      { name: "High Commendation", amount: "6,000" },
      { name: "Special Mention", amount: "2,000" },
    ],
  },
  {
    label: "Online",
    awards: [
      { name: "Best Delegate", amount: "6,000" },
      { name: "High Commendation", amount: "3,000" },
      { name: "Special Mention", amount: "1,000" },
    ],
  },
  {
    label: "International Press",
    awards: [
      { name: "Best Journalist", amount: "7,000" },
      { name: "Best Photographer", amount: "7,000" },
    ],
  },
];

const PrizePool = () => (
  <section className={styles.prizePool} aria-labelledby="prize-pool-heading">
    <h2 id="prize-pool-heading" className={styles.heading}>
      <span className={styles.index}>04</span> PRIZE POOL
    </h2>
    <p className={styles.total}>Over &#8377;1,50,000 across all committees</p>

    <div className={styles.grid}>
      {categories.map((category) => (
        <div className={styles.card} key={category.label}>
          <div className={styles.cardLabel}>{category.label}</div>
          <ul className={styles.awards}>
            {category.awards.map((award) => (
              <li key={award.name}>
                <span className={styles.awardName}>{award.name}</span>
                <span className={styles.awardAmount}>&#8377;{award.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

export default PrizePool;

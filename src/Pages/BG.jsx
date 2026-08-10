import React, { useEffect } from 'react'
import styles from "../styles/BG.module.scss"
import Header from '../components/Header'
import Footer from '../components/Footer'

// 2026 committees, in brochure order. `guide` stays null until that committee's
// background guide is ready — drop the PDF in src/assets, import it, and set it
// here. The 2025 guides are still in src/assets but are deliberately not
// imported, so they no longer ship in the bundle.
const committees = [
  { name: "United Nations General Assembly - DISEC (UNGA DISEC)", guide: null },
  { name: "United Nations Human Rights Council (UNHRC)", guide: null },
  { name: "Global AI Summit 2026", guide: null },
  { name: "Lok Sabha", guide: null },
  { name: "United States National Security Council (CCC US NSC)", guide: null },
  { name: "International Press (IP)", guide: null },
  { name: "United Nations Security Council (UNSC)", guide: null },
  { name: "Fédération Internationale de l'Automobile (FIA)", guide: null },
]

const BG = () => {
  useEffect(() => {
    document.title = "Background Guides | BITSMUN Pilani 2026";
  }, [])

  const released = committees.filter((committee) => committee.guide)

  return (
    <div className={styles.BGWrapper}>
      <Header color="black" />
      <div className={styles.title}>BACKGROUND GUIDES</div>
      <div className={styles.subTitle}>
        {released.length
          ? "Click on the committee to view the corresponding Background Guide"
          : "Background Guides will be out soon. Stay Tuned"}
      </div>
      <div className={styles.content}>
        {committees.map((committee) =>
          committee.guide ? (
            <a
              key={committee.name}
              target="_blank"
              rel="noreferrer"
              href={`${committee.guide}#toolbar=0`}
            >
              <div className={styles.bg1}>
                <i className="fa-solid fa-file"></i> &nbsp;&nbsp;{committee.name}
              </div>
            </a>
          ) : null
        )}
      </div>
      <Footer />
    </div>
  )
}

export default BG

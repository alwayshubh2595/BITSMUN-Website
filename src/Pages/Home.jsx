import styles from "../styles/Home.module.scss";
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { gsap, CSSPlugin, Expo } from "gsap";
import EntryContext from "../Context/EntryContext";
import { useContext, useEffect, useState } from "react";
import sanityClient from "../client.js";
import { isOpenFlag } from "../utils/registrationStatus.js";
import Footer from "../components/Footer.jsx";
import HomeSections from '../components/HomeSections.jsx'
import HeroSlideshow from '../components/HeroSlideshow.jsx'
import loaderMark from "../assets/sod-bitsmun-2026-logo.png";

gsap.registerPlugin(CSSPlugin);

// Conference branding, kept in one place so the loader and the hero cannot
// drift apart. Matches the 2026 brochure, which stacks "SOD X" above
// "BITSMUN 2026" on the cover.
const PARTNER_PREFIX = "SOD X";
// Stacked in the hero; the loader still spells the single-line form.
const PARTNER_LINES = ["SOD", "X"];
const PARTNER_URL = "https://sodmun.com";
const CONFERENCE_NAME = "BITSMUN 2026";
const LOADER_TEXT = `${PARTNER_PREFIX} ${CONFERENCE_NAME}`;

const Home = () => {
  let context = useContext(EntryContext);
  const [counter, setCounter] = useState(0);
  const [letter, setLetter] = useState([]);
  const [data, setData] = useState(null);
  const [fetchReg, setFetchReg] = useState(false);
  const [fetchLetter, setFetchLetter] = useState(false);
  const [isFetched, setFetched] = useState(false);
  useEffect(() => {
    if (fetchReg && fetchLetter) {
      setFetched(true);
    }
  }, [fetchReg, fetchLetter]);

  useEffect(() => {
    document.title = "BITSMUN Pilani";
    sanityClient
      .fetch(
        `*[_type == "registration"]{
          registrationType,
          EBregistrationType,
          IntregistrationType
        }`
      )
      .then((data) => {
        setData(data?.[0] ?? {});
        setFetchReg(true);
      })
      .catch(() => {
        setData({});
        setFetchReg(true);
      });
  }, []);

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "letter"]{
        letter,
        author,
        authorPost,
        bitsmunEdition
      }`
      )
      .then((data) => {
        setLetter(data);
        setFetchLetter(true);
      });
  }, []);

  useEffect(() => {
    // Already past the intro (returning to Home, or seen earlier this session):
    // there is nothing to animate. The old code reached for ".section2" here,
    // which lives in commented-out markup and so was always null — dereferencing
    // it threw on every tick once the intro had played.
    if (context.entered) return undefined;

    // An intro is decoration. Anyone who has asked the OS to reduce motion gets
    // the page, not the performance.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setCounter(100);
      context.setEntry();
      return undefined;
    }

    // Driven by requestAnimationFrame rather than a 100-tick setInterval: the
    // old version fired a React re-render every 8ms and drifted on slow frames,
    // which is exactly when a loader most needs to stay smooth. Easing out means
    // it moves fast early and settles, instead of crawling at a constant rate.
    let frame = 0;
    let done = false;
    const DURATION_MS = 1100;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCounter(Math.round(eased * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else if (!done) {
        done = true;
        reveal();
      }
    };
    frame = requestAnimationFrame(tick);

    // Skip on any deliberate input, not just a double-click nobody discovers.
    const handleSkip = () => {
      cancelAnimationFrame(frame);
      done = true;
      setCounter(100);
      context.setEntry();
    };

    document.addEventListener("dblclick", handleSkip);
    document.addEventListener("keydown", handleSkip);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("dblclick", handleSkip);
      document.removeEventListener("keydown", handleSkip);
    };
  }, []);

  // Reveal timeline, roughly halved from the original ~3.4s so the whole intro
  // (counter + reveal) lands near a second.
  // The hero is already mounted and full-width underneath, so the exit is a
  // curtain lift rather than the old horizontal wipe that grew .Home from zero
  // width — that squashed the hero's layout mid-animation and reflowed on every
  // frame. Lifting a panel on transform alone is composited and never reflows.
  const reveal = () => {
    gsap
      .timeline()
      .to(".loaderContent", { opacity: 0, y: -18, duration: 0.3, ease: "power2.in" })
      .to(".loaderPanel", {
        yPercent: -100,
        duration: 0.75,
        ease: Expo.easeInOut,
      })
      .add(() => context.setEntry());
  };

  return (
    <>
      <div className={styles.homeContainer}>
        {!context.entered && (
          <div
            className={`loaderPanel ${styles.loaderPanel}`}
            role="status"
            aria-live="polite"
            aria-label={`Loading ${LOADER_TEXT}`}
          >
            <div className={`loaderContent ${styles.loaderContent}`}>
              <img
                className={styles.loaderMark}
                src={loaderMark}
                alt=""
                aria-hidden="true"
              />
              <div className={styles.loaderWord}>{LOADER_TEXT}</div>
              {/* Hairline meter, matching the hero's frame ticks. The fill is
                  transform-driven so it animates on the compositor. */}
              <div className={styles.loaderMeter}>
                <span
                  className={styles.loaderMeterFill}
                  style={{ transform: `scaleX(${counter / 100})` }}
                />
              </div>
              <div className={styles.loaderMeta}>
                <span>BITS PILANI</span>
                {/* Tabular figures + padding stop the counter reflowing as it
                    crosses 9 and 99. */}
                <span className={styles.loaderCount}>
                  {String(counter).padStart(3, "0")}
                </span>
              </div>
            </div>
            <div className={styles.skipText}>Press any key to skip</div>
          </div>
        )}
        <motion.div
          className={`Home ${styles.Home}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSlideshow />
          <Header color="white" />
          {/* Halftone screen + hairline frame, echoing the brochure artwork. */}
          <div className={styles.heroTexture} aria-hidden="true"></div>
          <div className={styles.heroFrame} aria-hidden="true"></div>
          <div className={styles.mainSection}>
            {/* One lockup: the partner credit and the wordmark are set on a
                shared left edge and a single type ramp, rather than a tiny
                label floating above an oversized headline. */}
            <div className={styles.lockup}>
              <a
                className={styles.partner}
                href={PARTNER_URL}
                target="_blank"
                rel="noreferrer"
              >
                {PARTNER_LINES.map((word, i) => (
                  <span
                    className={i === 1 ? styles.partnerX : styles.partnerWord}
                    key={word}
                  >
                    {word}
                  </span>
                ))}
              </a>
              <h1 className={styles.wordmark}>
                <span className={styles.wordmarkName}>BITSMUN</span>
                <span className={styles.wordmarkYear}>2026</span>
              </h1>
            </div>
            <div className={styles.mainSectionDetails}>
              {/* Technical meta row: monospace, hairline-separated, uppercase.
                  Reads as specification rather than decoration. */}
              <ul className={styles.metaRow}>
                <li>04&ndash;06 SEP 2026</li>
                <li>BITS PILANI</li>
                <li>08 COMMITTEES</li>
              </ul>

              {data && (
                <div className={styles.heroActions}>
                  {isOpenFlag(data.registrationType) ? (
                    <>
                      <Link className={styles.heroPrimary} to="/Registrations">
                        Register as Delegate
                      </Link>
                      <Link className={styles.heroSecondary} to="/Committees">
                        View Committees
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className={styles.heroClosed}>
                        Delegate registrations are closed
                      </span>
                      <Link className={styles.heroSecondary} to="/Committees">
                        View Committees
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            {context.entered && (
              <div className={styles.scrollCue} aria-hidden="true">
                <span>Scroll</span>
                <i className="fa-solid fa-chevron-down"></i>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {context.entered && (
        <>
          <HomeSections registration={data} />
          <Footer />
        </>
      )}
      {/* {letter &&
        letter.map((item) => (
          <>
          <div
            className={`section2 ${styles.section2}`}
            style={{ display: context.entered ? "flex" : "none" }}
          >
            <div className={styles.section2Heading}>
              <center>
                LETTER FROM THE &nbsp;
                {item.authorPost ? item.authorPost.toUpperCase() : ""}
              </center>
            </div>

            <div className={styles.section2Text}>
              Dear Delegates, <br />
              {item.letter} <br /> Regards
              <br /> {item.author ? item.author : ""} <br />
              {item.authorPost ? item.authorPost : ""} <br />
              BITSMUN {item.bitsmunEdition ? item.bitsmunEdition : ""}
            </div>
          </div>
          <Footer/>
          </>
        ))} */}
    </>
  );
};

export default Home;

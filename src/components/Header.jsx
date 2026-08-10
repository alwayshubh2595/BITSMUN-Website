import styles from "../styles/Header.module.scss";
import React, { useEffect, useRef, useState } from "react";
// The 2026 mark's ring and wordmark are white on transparent, so it needs a
// dark ground. `logob` is the same artwork with those whites recoloured to ink
// for use over light headers.
import logow from "../assets/sod-bitsmun-2026-logo.png";
import logob from "../assets/sod-bitsmun-2026-logo-dark.png";
import reachPilani from "../assets/How_To_Reach_Pilani.pdf"
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import sanityClient from "../client.js";
import { isOpenFlag } from "../utils/registrationStatus.js";
import ThemeToggle from "./ThemeToggle.jsx";

const Header = (props) => {
  const [data, setData] = useState(null);
  const [hamburgerMenu, setHamburgerMenu] = useState(false);
  const [documentsMenu, setDocumentsMenu] = useState(false);
  const [registrationsMenu, setRegistrationsMenu] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Which logo to show depends on the theme, not on props.color — the latter is
  // a literal ink colour for the nav text and does not follow the toggle. The
  // observer keeps the swap live when the visitor flips the theme.
  const [isLight, setIsLight] = useState(
    () => document.documentElement.getAttribute("data-theme") === "light"
  );
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsLight(root.getAttribute("data-theme") === "light");
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    sync();
    return () => observer.disconnect();
  }, []);
  // The hero sits on a photo, so its header is always light-on-dark.
  const headerLogo = props.color === "white" || !isLight ? logow : logob;

  const changeHamburgerMenu = () => {
    setHamburgerMenu(!hamburgerMenu);
    if (hamburgerMenu) {
      setDocumentsMenu(false);
      setRegistrationsMenu(false);
    }
  };

  // Closing on mouseleave alone is unforgiving: any slight overshoot while
  // travelling to an item dismisses the menu. A short grace period makes it
  // usable without keeping the menu open indefinitely.
  const CLOSE_DELAY_MS = 260;
  const docsTimer = useRef(null);
  const regsTimer = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(docsTimer.current);
      clearTimeout(regsTimer.current);
    },
    []
  );

  const openDocumentsMenu = () => {
    clearTimeout(docsTimer.current);
    setDocumentsMenu(true);
  };

  const closeDocumentsMenu = () => {
    clearTimeout(docsTimer.current);
    docsTimer.current = setTimeout(() => setDocumentsMenu(false), CLOSE_DELAY_MS);
  };

  const toggleDocumentsMenu = () => {
    clearTimeout(docsTimer.current);
    setDocumentsMenu((open) => !open);
  };

  const openRegistrationsMenu = () => {
    clearTimeout(regsTimer.current);
    setRegistrationsMenu(true);
  };

  const closeRegistrationsMenu = () => {
    clearTimeout(regsTimer.current);
    regsTimer.current = setTimeout(() => setRegistrationsMenu(false), CLOSE_DELAY_MS);
  };

  const toggleRegistrationsMenu = () => {
    clearTimeout(regsTimer.current);
    setRegistrationsMenu((open) => !open);
  };

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "registration"]{
          registrationType,
          EBregistrationType,
          IntregistrationType,
        }`
      )
      .then((data) => {
        const flags = data?.[0];
        setData(flags ? data : null);
        setIsRegistrationOpen(
          isOpenFlag(flags?.EBregistrationType) ||
            isOpenFlag(flags?.registrationType) ||
            isOpenFlag(flags?.IntregistrationType)
        );
      })
      .catch(() => {
        setData(null);
        setIsRegistrationOpen(false);
      });
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={styles.Header}
        style={{ color: props.color }}
      >
        <div className={styles.logo} draggable="false">
          <img src={headerLogo} alt="SOD x BITSMUN 2026" draggable="false" />
        </div>

        <div className={styles.navbar}>
          <Link className={`${props.color} ${styles.link}`} to="/">
            <div>Home</div>
          </Link>
          <Link className={`${props.color} ${styles.link}`} to="/AboutUs">
            <div>About Us</div>
          </Link>
          <Link className={`${props.color} ${styles.link}`} to="/Committees">
            <div>Committees</div>
          </Link>
          
          {isRegistrationOpen && (
            <div className={styles.dropdown} onMouseEnter={openRegistrationsMenu} onMouseLeave={closeRegistrationsMenu}>
              <div className={`${props.color} ${styles.link}`}>
                Registrations <i className={`fa fa-caret-down ${registrationsMenu ? styles.rotate : styles.norotate}`}></i>
              </div>
              {registrationsMenu && (
                <div className={styles.dropdownContent}>
                  {isOpenFlag(data?.[0]?.EBregistrationType) && (
                    <Link

                      to="/EBRegistrations"
                    >
                      EB Registrations
                    </Link>
                  )}
                  {isOpenFlag(data?.[0]?.registrationType) && (
                    <Link

                      to="/Registrations"
                    >
                      Delegate Registrations
                    </Link>
                  )}
                  {isOpenFlag(data?.[0]?.IntregistrationType) && (
                    <Link

                      to="/InternationalRegistrations"
                    >
                      International Delegate Registrations
                    </Link>
                  )}

                </div>
              )}
            </div>
          )}
          <div className={styles.dropdown} onMouseEnter={openDocumentsMenu} onMouseLeave={closeDocumentsMenu}>
            <div className={`${props.color} ${styles.link}`}>
              Info/Docs <i className={`fa fa-caret-down ${documentsMenu ? styles.rotate : styles.norotate}`}></i>
            </div>
            {documentsMenu && (
              <div className={styles.dropdownContent}>
                <a target="_blank" href="https://drive.google.com/file/d/1J-L_hB1AWgoTntW7XeOF_t5q5f5v4H6i/view?usp=sharing">Brochure</a>
                <Link to="/BG">Background Guides</Link>
                <Link to="/CampusAmbassador">Campus Ambassador</Link>
                <Link to="/Gallery">Gallery</Link>
                <a href={`${reachPilani}#toolbar=0`}>How to reach Pilani</a>

              </div>
            )}
          </div>


          <Link className={`${props.color} ${styles.link}`} to="/ContactUs">
            <div>Contact Us</div>
          </Link>
          <ThemeToggle />
        </div>
        <button onClick={changeHamburgerMenu} className={styles.hamburgerIcon}>
          <i style={{ color: props.color }} class="fa-solid fa-bars"></i>
        </button>
        <div
          className={styles.hamburgerMenu}
          style={{ width: hamburgerMenu ? "100vw" : "0vw" }}
        >
          <div className={styles.hamburgerHeader}>
            <div className={styles.hamburgerHeaderLogo} draggable="false">
              <img
                src={isLight ? logob : logow}
                alt="SOD x BITSMUN 2026"
                draggable="false"
              />
            </div>
            <div className={styles.hamburgerActions}>
              <ThemeToggle />
              <button className={styles.closeIcon} onClick={changeHamburgerMenu}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div className={styles.hamburgerNavbar}>
            <Link style={{ color: "black" }} className={styles.link} to="/">
              <div>Home</div>
            </Link>
            <Link
              style={{ color: "black" }}
              className={styles.link}
              to="/AboutUs"
            >
              <div>About Us</div>
            </Link>
            <Link
              style={{ color: "black" }}
              className={styles.link}
              to="/Committees"
            >
              <div>Committees</div>
            </Link>
            
            {isRegistrationOpen && (
              <div className={styles.dropdown} onClick={toggleRegistrationsMenu} onMouseLeave={closeRegistrationsMenu}>
                <div className={styles.link} style={{ color: "black" }}>
                  Registrations <i className={`fa fa-caret-down ${registrationsMenu ? styles.rotate : ''}`}></i>
                </div>
                {registrationsMenu && (
                  <div className={styles.dropdownContent}>
                    {isOpenFlag(data?.[0]?.EBregistrationType) && (
                      <Link

                        to="/EBRegistrations"
                      >
                        EB Registrations
                      </Link>
                    )}
                    {isOpenFlag(data?.[0]?.registrationType) && (
                      <Link
                        to="/Registrations"
                      >
                        Delegate Registrations
                      </Link>
                    )}
                    {isOpenFlag(data?.[0]?.IntregistrationType) && (
                      <Link
                        to="/InternationalRegistrations"
                      >
                        International Delegate Registrations
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className={styles.dropdown} onClick={toggleDocumentsMenu} onMouseLeave={closeDocumentsMenu}>
              <div className={styles.link} style={{ color: "black" }}>
              Info/Docs <i className={`fa fa-caret-down ${documentsMenu ? styles.rotate : ''}`}></i>
              </div>
              {documentsMenu && (
                <div className={styles.dropdownContent}>
                  <a target="_blank" href="https://drive.google.com/file/d/1J-L_hB1AWgoTntW7XeOF_t5q5f5v4H6i/view?usp=sharing">Brochure</a>
                  <Link to="/BG">Background Guides</Link>
                  <Link to="/CampusAmbassador">Campus Ambassador</Link>
                  <Link to="/Gallery">Gallery</Link>
                  <a href={`${reachPilani}#toolbar=0`}>How to reach Pilani</a>

                </div>
              )}
            </div>

            <Link
              style={{ color: "black" }}
              className={styles.link}
              to="/ContactUs"
            >
              <div>Contact Us</div>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Header;

import React, {useContext, useState, useEffect} from 'react'
import styles from "../styles/Footer.module.scss"
import { Link } from 'react-router-dom'
import EntryContext from "../Context/EntryContext";
const Footer = () => {
    let context= useContext(EntryContext);
  return (
    <footer className={styles.footer} style={{ display: context.entered ? "flex" : "none" }}>
        <div className={styles.footerSection}>
        <a href="https://www.instagram.com/bitsmunpilani?igsh=MWduajNsaDlvbmJrdw=="><div>Instagram</div></a>
        <a href="https://www.facebook.com/pilani.bitsmun/"><div>Facebook</div></a>
        <a href="https://x.com/bitsmun_pilani?t=OghGh48oFfa8T1RKxy3Flw&s=08"><div>Twitter</div></a>
        <Link to="/Developer">Developer</Link>
        </div>

    </footer>
  )
}

export default Footer
import React, { useContext, useState, useEffect } from 'react'
import styles from "../styles/AboutUscard.module.scss"
const AboutUsCard = (props) => {
    return (
        <>
            <div className={styles.AboutUsCard}>
                <div className={styles.Image}><img src={props.img} alt={props.name} /></div>
                <div className={styles.Details}>
                    <div className={styles.Name}><center>{props.name}</center></div>
                    <div className={styles.post}> <center>{props.post}</center></div>
                    {((props.github||props.linkedin)||props.instagram)&&<div className={styles.SocialMedia}>
                        {props.github&&<a href={props.github}><i class="fa-brands fa-github"></i></a>}
                        {props.linkedin&&<a href={props.linkedin}><i class="fa-brands fa-linkedin"></i></a>}
                        {props.instagram&&<a href={props.instagram}><i class="fa-brands fa-instagram"></i></a>}
                    </div>}
                </div>
            </div>
        </>
    )
}

export default AboutUsCard
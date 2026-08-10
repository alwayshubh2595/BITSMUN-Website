import React, { useContext, useState, useEffect } from 'react'
import styles from "../styles/DeveloperCard.module.scss"
const DeveloperCard = (props) => {
    return (
        <>
            <div className={styles.DeveloperCard}>
                <div className={styles.DeveloperImage}><img src={props.img} alt={props.name} /></div>
                <div className={styles.DeveloperDetails}>
                    <div className={styles.DeveloperName}><center>{props.name}</center></div>
                    {((props.github||props.linkedin)||props.instagram)&&<div className={styles.DevSocialMedia}>
                        {props.github&&<a href={props.github}><i class="fa-brands fa-github"></i></a>}
                        {props.linkedin&&<a href={props.linkedin}><i class="fa-brands fa-linkedin"></i></a>}
                        {props.instagram&&<a href={props.instagram}><i class="fa-brands fa-instagram"></i></a>}
                    </div>}
                </div>
            </div>
        </>
    )
}

export default DeveloperCard
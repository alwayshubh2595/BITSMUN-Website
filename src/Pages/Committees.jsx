import styles from "../styles/Committees.module.scss";
import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import EntryContext from "../Context/EntryContext";
import { useContext, useState, useEffect } from "react";
import CommitteeCard from "../components/CommitteeCard";
import sanityClient from "../client.js";
import { Grid } from  'react-loader-spinner'
import Footer from "../components/Footer.jsx";
import PrizePool from "../components/PrizePool.jsx";

// Committee artwork is uploaded at 900px; the card renders it at 4:3 well under
// that, so let Sanity's CDN do the resizing and format conversion.
const committeeImage = (url) =>
  url ? `${url}?w=640&h=480&fit=crop&auto=format&q=70` : undefined;

const Committees = () => {
  const [isFetched,setFetched] = useState(false);
  let context = useContext(EntryContext);
  useEffect(() => {
    context.setEntry();
  }, [])
  const [committees, setCommittees] = useState([]);
  useEffect(() => {
    document.title = "Committees | BITSMUN Pilani 2026";
    sanityClient
      .fetch(
        `*[_type == "committees"]{
      name,
      bio,
      srno,
      type,
      agenda,
      chair,
      viceChair,
      rapporteur,
      delegateStrength,
      freezeDate,
      image{
        asset->{
          _id,
          url},
          alt
      
      
      }
    }`
      )
      .then((data) => {
        const sortedCommittees = data.sort((a, b) => a.srno - b.srno);
        setCommittees(sortedCommittees);
        setFetched(true);
      })
      .catch(() => {
        setCommittees([]);
        setFetched(true);
      })
  }, []);

  return (
    <>
    {
      isFetched?null:
      <div className={styles.PageLoader}>
        <Grid
  height="80"
  width="80"
  color="#7280ff"
  ariaLabel="grid-loading"
  radius="12.5"
  wrapperStyle={{}}
  wrapperClass=""
  visible={true}
/>
      </div>
    }

      <div className={styles.mainpage}>
        <Header color="black" />
        <div className={styles.header}>
          <h1 className={styles.title}>COMMITTEES</h1>
          <p className={styles.subTitle}>
            Eight committees across offline and online tracks for SOD x BITSMUN 2026
          </p>
        </div>
        <div className={styles.committeeSection}>
        {committees &&
          committees.map((committee, index) => (
            <CommitteeCard
            alt={committee.name}
              key={committee.name ?? index}
              name={committee.name}
              img={committeeImage(committee.image?.asset?.url)}
              fullname={committee.bio}
              index={index}
              agenda={committee.agenda}
              type={committee.type}
              delegateStrength={committee.delegateStrength}
              freezeDate={committee.freezeDate}
              // chair={committee.chair}
              // viceChair={committee.viceChair}
              // rapporteur={committee.rapporteur}
            />
          ))}
          </div>
          <div >
            {!committees.length&& <div className={styles.tba}> Committees are yet to be announced! Stay Tuned</div>}
          </div>
          <PrizePool />
          <Footer/>

      </div>

    </>
  );
};

export default Committees;

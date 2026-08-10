import styles from "../styles/Developer.module.scss";
import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import EntryContext from "../Context/EntryContext";
import { useContext, useEffect, useState } from "react";
import sanityClient from "../client.js";
import { Grid } from "react-loader-spinner";
import DeveloperCard from "../components/DeveloperCard.jsx";
import Footer from "../components/Footer.jsx";

// Card renders at 4:5; let the CDN resize rather than shipping the original.
const devPhoto = (url) =>
  url ? `${url}?w=800&h=1000&fit=crop&auto=format&q=75` : undefined;

const Developer = () => {
  const [isFetched, setFetched] = useState(false);
  const [DeveloperDetails, setDeveloperDetails] = useState([]);

  useEffect(() => {
    document.title = "Developer | BITSMUN Pilani 2026"; // Set the tab title
    sanityClient
      .fetch(
        `*[_type == "developer"]{
    name,
    github,
    linkedin,
    instagram,
    image{
      asset->{
        _id,
        url},
        alt
       
    }
  }`
      )
      .then((data) => {
        setDeveloperDetails(data ?? []);
        setFetched(true);
      })
      .catch(() => {
        setDeveloperDetails([]);
        setFetched(true);
      });
  }, []);

  let context = useContext(EntryContext);
  useEffect(() => {
    context.setEntry();
  }, []);

  return (
    <>
      {isFetched ? null : (
        <div className={styles.PageLoader}>
          <Grid
            height="80"
            width="80"
            color="#7280ff"
            ariaLabel="grid-loading"
            radius="12.5"
            visible={true}
          />
        </div>
      )}
      <motion.div
        className={styles.mainpage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header color="black" />
        <h1 className={styles.heading}>Developer</h1> {/* Add page title */}
        <div className={styles.devCards}>
          {DeveloperDetails && DeveloperDetails.map((developer) => (
            <DeveloperCard
              key={developer.name}
              name={developer.name}
              img={devPhoto(developer.image?.asset?.url)}
              github={developer.github}
              linkedin={developer.linkedin}
              instagram={developer.instagram}
            />
          ))}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Developer;

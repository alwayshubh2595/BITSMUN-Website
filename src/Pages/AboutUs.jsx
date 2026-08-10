import styles from "../styles/AboutUs.module.scss";
import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import EntryContext from "../Context/EntryContext";
import { useContext, useEffect, useState } from "react";
import sanityClient from "../client.js";
import { Grid } from "react-loader-spinner";
import AboutUsCard from "../components/AboutUsCard.jsx";
import Footer from "../components/Footer.jsx";
// Team cards render at roughly 4:5. Ask Sanity's CDN for exactly that, as WebP,
// rather than downloading whatever resolution was uploaded.
const teamPhoto = (url) =>
  url ? `${url}?w=800&h=1000&fit=crop&crop=top&auto=format&q=75` : undefined;

const AboutUs = () => {
  const [isFetched, setFetched] = useState(false);
  const [Details, setDetails] = useState([]);
  useEffect(() => {
    document.title = "About Us | BITSMUN Pilani 2026"
    sanityClient
      .fetch(
        `*[_type == "aboutus"]{
    name,
    post,
    srno,
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
        setDetails(data);
        setFetched(true);
      })
  }, []);

  let context = useContext(EntryContext);
  useEffect(() => {
    context.setEntry();
  }, []);
  function compare(a, b) {
    if (a.srno < b.srno) {
      return -1;
    }
    if (a.srno > b.srno) {
      return 1;
    }
    return 0;
  }
  Details.sort(compare);
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
        <div className={styles.intro}>
          
Step into the extraordinary world of BITSMUN Pilani, where the art of diplomacy converges with an unwavering commitment to excellence. Nestled within the iconic Birla Institute of Technology and Science (BITS) Pilani campus, BITSMUN Pilani stands tall as an epitome of intellectual prowess and a cradle for future leaders. <br />
 <br />
As one of the largest and most influential Model United Nations conferences in India, BITSMUN Pilani transcends the ordinary, offering a transformative experience to delegates who dare to immerse themselves in the complexities of global affairs. Our journey, a riveting narrative of growth and ambition, has transformed BITSMUN Pilani into an unparalleled platform where innovation, collaboration, and visionary leadership converge. <br />
<br />
The heartbeat of our success echoes in the dedicated efforts of our organizing committee, advisors, and the brilliant minds who grace our conference. Together, we create an intellectual symphony, harmonizing diverse perspectives into a crescendo of innovation and diplomacy. <br />
 <br />
As we invite you to be a part of BITSMUN Pilani, we extend a hand to those who seek not just an event but an unforgettable journey. Join us in the pursuit of knowledge, the thrill of debate, and the camaraderie that transcends borders. BITSMUN Pilani beckons you to redefine your limits, embrace the extraordinary, and contribute to a legacy that propels us towards a brighter, more interconnected future. Welcome to BITSMUN Pilani – where brilliance knows no bounds! <br />
        </div>
        <div className={styles.heading}>THE TEAM</div>
        <div className={styles.aboutuscards}>
          {Details &&
            Details.map((e) => (
              <AboutUsCard
                key={e.name}
                name={e.name}
                post={e.post}
                // Sanity resizes and re-encodes on delivery, so the browser gets
                // a ~40KB WebP instead of the multi-hundred-KB original.
                img={teamPhoto(e.image?.asset?.url)}
                github={e.github}
                linkedin={e.linkedin}
                instagram={e.instagram}
              />
            ))}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default AboutUs;

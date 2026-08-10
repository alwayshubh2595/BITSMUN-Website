import React from "react";
import styles from "../styles/EBRegistrations.module.scss";
import EBRegForm from "../components/EBRegForm";
import Header from "../components/Header";
import EntryContext from "../Context/EntryContext";
import { useContext, useEffect, useState } from "react";
import sanityClient from "../client.js";
import { isOpenFlag } from "../utils/registrationStatus.js";
import Footer from "../components/Footer";
const EBRegistrations = () => {
  let context = useContext(EntryContext);
  useEffect(() => {
    document.title = "EB Registrations | BITSMUN Pilani 2026";
    context.setEntry();
  }, []);
  const [data, setData] = useState(null);
  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "registration"]{
          registrationType,
          EBregistrationType
        }`
      )
      .then((data) => {
        setData(data.length ? data : [{}]);
      })
      .catch(() => setData([{}]))
  }, []);
  return (
    <>
      <div className={styles.mainpage}>
        <div className={styles.container}>
          <Header color="black" />
          {isOpenFlag(data?.[0]?.EBregistrationType) && (<div className={styles.formsec}>
            <EBRegForm />
          </div>)}
          <div>
          {data && !isOpenFlag(data?.[0]?.EBregistrationType) && (
            <div className={styles.closed}> EB Registrations are Closed!</div>
          )}
          </div>
        </div>
        <Footer />

      </div>
    </>
  );
};

export default EBRegistrations;

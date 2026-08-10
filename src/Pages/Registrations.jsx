import React from "react";
import styles from "../styles/EBRegistrations.module.scss";
import Header from "../components/Header";
import DelRegForm from "../components/DelRegForm";
import EntryContext from "../Context/EntryContext";
import { useContext, useEffect, useState } from "react";
import sanityClient from "../client.js";
import { isOpenFlag } from "../utils/registrationStatus.js";
import Footer from "../components/Footer";
const Registrations = () => {
  let context = useContext(EntryContext);
  useEffect(() => {
    context.setEntry();
  }, []);
  const [data, setData] = useState(null);
  useEffect(() => {
    document.title = "Delegate Registrations | BITSMUN Pilani 2026";
    sanityClient
      .fetch(
        `*[_type == "registration"]{
          registrationType,
          
        }`
      )
      .then((data) => {
        setData(data.length ? data : [{}]);
      })
      .catch(() => setData([{}]));
  }, []);
  return (
    <>
      <div className={styles.mainpage}>
        <div className={styles.container}>
          <Header color="black" />
          {isOpenFlag(data?.[0]?.registrationType) && (
            <>
              
              <div className={styles.formsec}>
                <DelRegForm />
              </div>
            </>
          )}
          <div>
            {data && !isOpenFlag(data?.[0]?.registrationType) && (
              <div className={styles.closed}>
                
                Delegate Registrations are Closed!
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Registrations;

import styles from "../styles/ContactUs.module.scss";
import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import EntryContext from "../Context/EntryContext";
import { useContext, useEffect, useState } from "react";
import sanityClient from "../client.js";
import { Grid } from 'react-loader-spinner'
import Footer from "../components/Footer.jsx";

// Secretariat contacts, named so a caller knows who they are reaching.
const CONTACTS = [
  { name: "Anshuman Pathak", phone: "+91 99581 95460" },
  { name: "Sharda Sinha", phone: "+91 70489 78865" },
];

const ContactUs = () => {
  const [contactDetails, setContactDetails] = useState([]);
  const [isFetched, setFetched] = useState(false);
  const [isMapFetched, setMapFetched] = useState(false);
  const [areDetailsFetched, setDetailsFetched] = useState(false);
  const MapFetched = () => {
    setMapFetched(true);
  }
  useEffect(() => {
    document.title = "Contact Us | BITSMUN Pilani 2026";
    sanityClient
      .fetch(
        `*[_type == "contactDetails"]{
      phone,
      email,
      email2,
      devname,
      devphone,
      devmail,
    }`
      )
      .then((data) => {
        setContactDetails(data);
        setDetailsFetched(true);
      })

  }, []);
  useEffect(() => {
    if (areDetailsFetched) {
      setFetched(true);
    }
  });

  let context = useContext(EntryContext);
  useEffect(() => {
    context.setEntry();
  }, []);
  return (
    <>
      {
        isFetched ? null :
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
        <motion.div
          className={`Home ${styles.contactUs}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {contactDetails &&
            contactDetails.map((contactDetail) => (
              <div className={styles.details}>
                <div className={styles.detailsSection1}>
                  For any queries, feel free to reach out to us:
                </div>
                <div className={styles.detailsSection2}>
                  <div className={styles.locations}>
                    <i class="fa-solid fa-location-dot"></i>BITS Pilani <br />
                    Pilani Road <br />
                    Rajasthan-333031
                  </div>
                  {/* Two named contacts. The Sanity document only carries a
                      single unnamed `phone`, so these are listed here where a
                      reader can tell who they are actually calling. */}
                  {CONTACTS.map((contact) => (
                    <div className={styles.phone} key={contact.phone}>
                      <i class="fa-solid fa-phone"></i>
                      <a href={`tel:${contact.phone.split(" ").join("")}`}>
                        {contact.name} &mdash; {contact.phone}
                      </a>
                    </div>
                  ))}
                  <div className={styles.mail}>
                    <i class="fa-solid fa-envelope"></i>
                    <a
                      href={`mailto:${contactDetail.email.split(" ").join("")}`}
                    >
                      {contactDetail.email}
                    </a>
                  </div>
                  <div className={styles.mail}>
                    <i class="fa-solid fa-envelope"></i>{" "}
                    <a
                      href={`mailto:${contactDetail.email2.split(" ").join("")}`}
                    >
                      {contactDetail.email2}
                    </a>
                  </div>
                </div>
                {/* <div className={styles.detailsSection3}>
                  <div className={styles.section3Heading}>For any queries regarding website, contact:</div>
                  <div className={styles.section3Details}>
                    <div className={styles.devName}><i class="fa-solid fa-user"></i>{contactDetail.devname}</div>
                    <div className={styles.devPhone}><i class="fa-solid fa-phone"></i>
                      <a href={`tel:${contactDetail.devphone.split(" ").join("")}`}>{contactDetail.devphone}</a></div>
                    <div className={styles.devMail}><i class="fa-solid fa-envelope"></i>
                      <a href={`mailto:${contactDetail.devmail.split(" ").join("")}`}>{contactDetail.devmail}</a></div>

                  </div>
                </div> */}
              </div>
            ))}

          <div className={styles.map}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3511.0009464394975!2d75.58544547502373!3d28.358820996458494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39131964f43e4575%3A0x1fbad30854cf884d!2sBirla%20Institute%20of%20Technology%20And%20Science%2C%20Pilani%20(BITS%20Pilani)!5e0!3m2!1sen!2sin!4v1699856459391!5m2!1sen!2sin"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              onLoad={MapFetched}
            ></iframe>
          </div>
        </motion.div>
        <Footer />
      </div>
    </>
  );
};

export default ContactUs;

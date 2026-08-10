import React from 'react'
import styles from "../styles/ErrorPage.module.scss"
import Header from '../components/Header'
import Footer from '../components/Footer'
import EntryContext from "../Context/EntryContext";
import { useContext, useEffect, useState } from "react";
const ErrorPage = () => {
  let context = useContext(EntryContext);
  useEffect(() => {
    document.title = "Error 404- Page not Found";
    context.setEntry();
  }, []);
  return (
    <div className={styles.mainpage}>
      <Header color="black" />
        <div className={styles.errormessage}>Error 404. Page not Found</div>
        <Footer/>
    </div>
  )
}

export default ErrorPage
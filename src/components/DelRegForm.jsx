import React from "react";
import styles from "../styles/DelRegForm.module.scss";
import { useFormik } from "formik";
import schema from "./schema/schema";
import { useState, useEffect } from "react";
import sanityClient from "../client.js";
import qr from "../assets/qr.jpg";
import { submitToScript } from "../utils/submitForm.js";
import { prepareUpload } from "../utils/fileUpload.js";

const DelRegForm = () => {
  const [committees, setCommittees] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isPreparingUpload, setPreparingUpload] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [amount, setAmount] = useState("N/A");
  const [originalAmount, setOriginalAmount] = useState("N/A");
  const [selectedMode, setSelectedMode] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const couponsfileURL = import.meta.env.VITE_COUPONS_URL;

  const scriptURL = import.meta.env.VITE_REGFORM_URL;

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "committees"]{
      name,
      bio,
      type,
      srno,
    }`
      )
      .then((data) => {
        // Sort committees by srno
        const sortedCommittees = data.sort((a, b) => a.srno - b.srno);
        setCommittees(sortedCommittees);
      })
      .catch(() => setCommittees([]));
  }, []);

  const onSubmit = async (values, actions) => {
    setSubmitError("");

    if (!values.fileContent) {
      setSubmitError("Please upload your payment screenshot before submitting.");
      return;
    }

    try {
      await submitToScript(scriptURL, new FormData(document.forms["delregform"]));
    } catch (err) {
      // Keep the filled-in form intact so the delegate can retry without
      // re-entering everything.
      setSubmitError(err.message);
      return;
    }

    setSubmitted(true);
    actions.resetForm();
    setCoupon("");
    setAmount("N/A");
    setOriginalAmount("N/A");
    setSelectedMode("");
    setFileInputKey((key) => key + 1);
    setTimeout(() => setSubmitted(false), 6000);
  };

  const {
    values,
    errors,
    handleChange,
    touched,
    handleSubmit,
    handleBlur,
    isSubmitting,
    setFieldValue,
  } = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "+91",
      age: "",
      institute: "",
      mode: "",
      committee1: "",
      committee2: "",
      experience: "",
      portfolio: "",
      coupon: "",
      fileContent: "",
      fileName: "",
    },
    validationSchema: schema,
    onSubmit,
  });

  const handleUpload = async (event) => {
    const file = event.currentTarget.files[0];
    setUploadError("");
    setFieldValue("fileContent", "");
    setFieldValue("fileName", "");
    if (!file) return;

    setPreparingUpload(true);
    try {
      const { fileContent, fileName } = await prepareUpload(file);
      setFieldValue("fileContent", fileContent);
      setFieldValue("fileName", fileName);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setPreparingUpload(false);
    }
  };

  const handleModeChange = (event) => {
    const mode = event.target.value;
    setSelectedMode(mode);
    const newAmount = mode === "Online" ? 1500 : mode === "Offline" ? 3500 : "N/A";
    setAmount(newAmount);
    setOriginalAmount(newAmount);
    handleChange(event);
  };

  const validateCoupon = async () => {
    setIsValidating(true);
    const trimmedCoupon = coupon.trim();

    try {
      const response = await fetch(couponsfileURL);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const coupons2 = await response.json();

      if (coupons2[trimmedCoupon]) {
        const discount = coupons2[trimmedCoupon];
        setAmount(originalAmount - discount);
        setCouponError("");
      } else {
        setAmount(originalAmount);
        setCouponError("Invalid coupon code");
      }
    } catch {
      setAmount(originalAmount);
      setCouponError("Could not check that coupon right now. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const filteredCommittees = committees.filter(
    (committee) =>
      committee.type &&
      committee.type.toLowerCase() === selectedMode.toLowerCase()
  );

  return (
    <>
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className={styles.delform}
        method="post"
        name="delregform"
        action={import.meta.env.VITE_REGFORM_URL}
      >
        {/* Routes the submission to the right tab in the sheet. */}
        <input type="hidden" name="formType" value="delegate" readOnly />
        <input
          type="hidden"
          value={values.fileContent}
          id="fileContent"
          name="fileContent"
          onChange={handleChange}
        />
        <input
          type="hidden"
          value={values.fileName}
          id="fileName"
          name="fileName"
          onChange={handleChange}
        />
        <div className={styles.inputField}>
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            name="name"
            id="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your full name"
            className={
              errors.name && touched.name
                ? `${styles.error} ${styles.name}`
                : `${styles.name}`
            }
          />
          {errors.name && touched.name ? (
            <p className={styles.errorPara}>{errors.name}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="email">Email: </label>
          <input
            type="email"
            name="email"
            id="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your email"
            className={
              errors.email && touched.email
                ? `${styles.error} ${styles.email}`
                : `${styles.email}`
            }
          />
          {errors.email && touched.email ? (
            <p className={styles.errorPara}>{errors.email}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="phone">Phone: </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your phone number"
            className={
              errors.phone && touched.phone
                ? `${styles.error} ${styles.phone}`
                : `${styles.phone}`
            }
          />
          {errors.phone && touched.phone ? (
            <p className={styles.errorPara}>{errors.phone}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="age">Age: </label>
          <input
            type="number"
            name="age"
            id="age"
            value={values.age}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your Age"
            className={
              errors.age && touched.age
                ? `${styles.error} ${styles.age}`
                : `${styles.age}`
            }
          />
          {errors.age && touched.age ? (
            <p className={styles.errorPara}>{errors.age}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="institute">Institution: </label>
          <input
            type="string"
            name="institute"
            id="institute"
            value={values.institute}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter the Name of your School/College/University"
            className={
              errors.institute && touched.institute
                ? `${styles.error} ${styles.institute}`
                : `${styles.institute}`
            }
          />
          {errors.institute && touched.institute ? (
            <p className={styles.errorPara}>{errors.institute}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="mode">Mode of Participation: </label>
          <select
            name="mode"
            id="mode"
            value={values.mode}
            onChange={handleModeChange}
            onBlur={handleBlur}
            className={
              errors.mode && touched.mode
                ? `${styles.error} ${styles.mode}`
                : `${styles.mode}`
            }
          >
            <option value="" disabled selected>
              Choose mode of participation
            </option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
          {errors.mode && touched.mode ? (
            <p className={styles.errorPara}>{errors.mode}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="committee1">Committee Preference 1: </label>
          <select
            name="committee1"
            id="committee1"
            value={values.committee1}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              errors.committee1 && touched.committee1
                ? `${styles.error} ${styles.committee}`
                : `${styles.committee}`
            }
          >
            <option value="" disabled selected>
              {!selectedMode
                ? "Select a mode of participation first"
                : "Choose a committee"}
            </option>
            {filteredCommittees.map((committee, index) => (
              <option value={committee.name} key={index}>
                [{committee.type.toUpperCase()}] &nbsp; {committee.bio}
              </option>
            ))}
          </select>
          {errors.committee1 && touched.committee1 ? (
            <p className={styles.errorPara}>{errors.committee1}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="committee2">Committee Preference 2: </label>
          <select
            name="committee2"
            id="committee2"
            value={values.committee2}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              errors.committee2 && touched.committee2
                ? `${styles.error} ${styles.committee}`
                : `${styles.committee}`
            }
          >
            <option value="" disabled selected>
              {!selectedMode
                ? "Select a mode of participation first"
                : "Choose a committee"}
            </option>
            {filteredCommittees.map((committee, index) => (
              <option value={committee.name} key={index}>
                [{committee.type.toUpperCase()}] &nbsp; {committee.bio}
              </option>
            ))}
          </select>
          {errors.committee2 && touched.committee2 ? (
            <p className={styles.errorPara}>{errors.committee2}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="experience">MUN Experience: </label>
          <input
            type="string"
            name="experience"
            id="experience"
            value={values.experience}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your MUN Experience"
            className={
              errors.experience && touched.experience
                ? `${styles.error} ${styles.experience}`
                : `${styles.experience}`
            }
          />
          {errors.experience && touched.experience ? (
            <p className={styles.errorPara}>{errors.experience}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="portfolio">
            Choices of Portfolio: &nbsp;
            <a style={{color:"black"}} target="_blank" href="https://docs.google.com/spreadsheets/d/1MUcmJOdLpoOBCskiigt8kj5UPFgodRhmkyaZExnF5zE/edit?gid=1870681100#gid=1870681100">(Link to Matrix)</a>
          </label>
          <input
            type="string"
            name="portfolio"
            id="portfolio"
            value={values.portfolio}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your Choices of Portfolio"
            className={
              errors.portfolio && touched.portfolio
                ? `${styles.error} ${styles.portfolio}`
                : `${styles.portfolio}`
            }
          />
          {errors.portfolio && touched.portfolio ? (
            <p className={styles.errorPara}>{errors.portfolio}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="coupon">Coupon Code: </label>
          <div className={styles.couponRow}>
          <input
            type="text"
            name="coupon"
            id="coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            autoComplete="off"
            placeholder="Enter your coupon code"
            className={styles.coupon}
          />
          <button
            type="button"
            onClick={validateCoupon}
            className={`${styles.checkButton} ${isValidating ? styles.loading : ''}`}
            disabled={isValidating}
          >
            {isValidating ? "" : 'Check'}
          </button>
          </div>
          {couponError && <p className={styles.errorPara}>{couponError}</p>}
        </div>
        <div className={styles.regfee}>
          
          &nbsp;Amount to be paid: {originalAmount !== "N/A" && originalAmount !== amount && (
            <span className={styles.strikeThrough}>₹{originalAmount}</span>
          )} ₹{amount}
        </div>
        <div className={styles.qr}>
          <div className={styles.qrTitle}>Scan the QR Code Below to make your Payment</div>
          <div className={styles.qrimg}> <img src={qr} alt="qr" /></div>
        </div>
        
        <div className={styles.inputField}>
          <label htmlFor="resume">Upload Payment Screenshot: </label>
          <input
            key={fileInputKey}
            type="file"
            id="resume"
            accept="image/*"
            onChange={handleUpload}
            required
          />
          {isPreparingUpload && (
            <p className={styles.errorPara}>Processing your screenshot…</p>
          )}
          {uploadError && <p className={styles.errorPara}>{uploadError}</p>}
        </div>

        <button
          className={styles.submitButton}
          disabled={isSubmitting || isPreparingUpload}
          type="submit"
        >
          SUBMIT
        </button>
        <div
          style={{
            opacity: isSubmitting ? 1 : 0,
            display: isSubmitting ? "flex" : "none",
          }}
          className={styles.submitte}
        >
          Please wait while we record your response! Do not reload or close the page!
        </div>
        <div
          style={{
            opacity: submitted ? 1 : 0,
            display: submitted ? "flex" : "none",
          }}
          className={styles.submitted}
        >
          <i
            className="fa-regular fa-circle-check"
            style={{ fontSize: "1.1rem" }}
          ></i>
          &nbsp;Your response has been recorded. Thankyou for registering!
        </div>
        {submitError && (
          <div className={styles.submitFailed}>
            <i
              className="fa-regular fa-circle-xmark"
              style={{ fontSize: "1.1rem" }}
            ></i>
            &nbsp;{submitError}
          </div>
        )}
      </form>
    </>
  );
};

export default DelRegForm;
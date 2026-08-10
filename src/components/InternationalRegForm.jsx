import React from "react";
import styles from "../styles/IntRegForm.module.scss";
import { useFormik } from "formik";
import schema from "./schema/intregschema";
import { useState, useEffect } from "react";
import sanityClient from "../client.js";
import qr from "../assets/qr.jpg";
import currencySymbolMap from 'currency-symbol-map';
import currencyCodes from 'currency-codes';
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
  const [isCouponVerified, setIsCouponVerified] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [phonePrefix, setPhonePrefix] = useState("");
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [countryListError, setCountryListError] = useState("");
  const [ratesError, setRatesError] = useState("");
  const couponsfileURL = import.meta.env.VITE_INTCOUPONS_URL;

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

    // restcountries only exposes the fields we need; requesting everything has
    // historically been rate-limited. A failure here must not break the form,
    // so the country field stays usable as free text.
    fetch("https://restcountries.com/v3.1/all?fields=name,flag,idd,currencies")
      .then(response => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return response.json();
      })
      .then(data => {
        const countries = data
          .filter(country => country?.name?.common)
          .map(country => {
            const root = country.idd?.root ?? "";
            const suffix = country.idd?.suffixes?.[0] ?? "";
            return {
              label: `${country.flag ?? ""} ${country.name.common} (${root}${suffix})`,
              value: country.name.common,
              code: `${root}${suffix}`,
              currency: country.currencies ? Object.keys(country.currencies)[0] : null
            };
          });
        setCountryOptions(countries);
      })
      .catch(() => {
        setCountryOptions([]);
        setCountryListError(
          "We could not load the country list. Please type your country and dialling code manually."
        );
      });

    fetch("https://api.exchangerate-api.com/v4/latest/AED")
      .then(response => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return response.json();
      })
      .then(data => {
        setExchangeRates(data.rates ?? {});
      })
      .catch(() => {
        setExchangeRates({});
        setRatesError(
          "Live currency conversion is unavailable. The fee is AED 200 equivalent — please contact us at bitsmun.pilani.bits@gmail.com to confirm the amount in your currency."
        );
      });
  }, []);

  const onSubmit = async (values, actions) => {
    const finalValues = {
      ...values,
      phone: `${phonePrefix}${values.phone}`
    };

    if (!isCouponVerified) {
      delete finalValues.coupon;
    }

    setSubmitError("");

    if (!values.fileContent) {
      setSubmitError("Please upload your payment screenshot before submitting.");
      return;
    }

    try {
      await submitToScript(scriptURL, new FormData(document.forms["intdelregform"]));
    } catch (err) {
      // Keep the filled-in form intact so the delegate can retry.
      setSubmitError(err.message);
      return;
    }

    setSubmitted(true);
    actions.resetForm();
    setCoupon("");
    setIsCouponVerified(false);
    setAmount("N/A");
    setOriginalAmount("N/A");
    setSelectedMode("");
    setPhonePrefix("");
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
      phone: "",
      age: "",
      institute: "",
      countryName:"",
      mode: "",
      committee1: "",
      committee2: "",
      experience: "",
      portfolio1: "",
      portfolio2: "",
      portfolio3: "",
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
    // const newAmount = mode === "Online" ? "N/A" : mode === "Offline" ? 3500 : "N/A";
    // setAmount(newAmount);
    // setOriginalAmount(newAmount);
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
        const discountPercentage = coupons2[trimmedCoupon];
        const discountAmount = (originalAmount * discountPercentage) / 100;
        setAmount(originalAmount - discountAmount);
        setCouponError("");
        setIsCouponVerified(true);
      } else {
        setAmount(originalAmount);
        setCouponError("Invalid coupon code");
        setIsCouponVerified(false);
      }
    } catch {
      setAmount(originalAmount);
      setCouponError("Could not check that coupon right now. Please try again.");
      setIsCouponVerified(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCountryChange = (event) => {
    const selectedCountry = countryOptions.find(country => country.value === event.target.value);
    if (selectedCountry) {
      setPhonePrefix(`${selectedCountry.code}`);
      setFieldValue("phone", "");

      const currency = selectedCountry.currency;
      if (currency && exchangeRates[currency]) {
        const convertedAmount = (200 * exchangeRates[currency]).toFixed(2);
        setAmount(convertedAmount);
        setOriginalAmount(convertedAmount);
        setCurrencySymbol(currencySymbolMap(currency));
        const currencyDetails = currencyCodes.code(currency);
        setCurrencyName(currencyDetails ? currencyDetails.currency : "");
      } else {
        setAmount("N/A");
        setOriginalAmount("N/A");
        setCurrencySymbol("");
        setCurrencyName("");
      }
    }
    handleChange(event);
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
        name="intdelregform"
        action={import.meta.env.VITE_REGFORM_URL}
      >
        {/* Routes the submission to the right tab in the sheet. */}
        <input type="hidden" name="formType" value="international" readOnly />
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
          <label htmlFor="countryName">Country of Residence: </label>
          <input
            type="text"
            name="countryName"
            id="countryName"
            value={values.countryName}
            onChange={handleCountryChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your country of residence"
            list="countryOptions"
            className={
              errors.countryName && touched.countryName
                ? `${styles.error} ${styles.countryName}`
                : `${styles.countryName}`
            }
          />
          <datalist id="countryOptions">
            {countryOptions.map((country, index) => (
              <option key={index} value={country.value}>
                {country.label}
              </option>
            ))}
          </datalist>
          {errors.countryName && touched.countryName ? (
            <p className={styles.errorPara}>{errors.countryName}</p>
          ) : (
            ""
          )}
          {countryListError && (
            <p className={styles.errorPara}>{countryListError}</p>
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="phone">Phone: </label>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              value={phonePrefix}
              readOnly
              style={{ width: '50px', marginRight: '5px' }}
            />
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
          </div>
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
          <label htmlFor="portfolio1">
            First Choice of Portfolio: &nbsp;
            <a style={{color:"black"}} target="_blank" href="https://docs.google.com/spreadsheets/d/1MUcmJOdLpoOBCskiigt8kj5UPFgodRhmkyaZExnF5zE/edit?gid=1870681100#gid=1870681100">(Link to Matrix)</a>
          </label>
          <input
            type="string"
            name="portfolio1"
            id="portfolio1"
            value={values.portfolio1}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your Choice of Portfolio"
            className={
              errors.portfolio1 && touched.portfolio1
                ? `${styles.error} ${styles.portfolio1}`
                : `${styles.portfolio1}`
            }
          />
          {errors.portfolio1 && touched.portfolio1 ? (
            <p className={styles.errorPara}>{errors.portfolio1}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="portfolio2">
            Second Choice of Portfolio: &nbsp;
            <a style={{color:"black"}} target="_blank" href="https://docs.google.com/spreadsheets/d/1MUcmJOdLpoOBCskiigt8kj5UPFgodRhmkyaZExnF5zE/edit?gid=1870681100#gid=1870681100">(Link to Matrix)</a>
          </label>
          <input
            type="string"
            name="portfolio2"
            id="portfolio2"
            value={values.portfolio2}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your Choice of Portfolio"
            className={
              errors.portfolio2 && touched.portfolio2
                ? `${styles.error} ${styles.portfolio2}`
                : `${styles.portfolio2}`
            }
          />
          {errors.portfolio2 && touched.portfolio2 ? (
            <p className={styles.errorPara}>{errors.portfolio2}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="portfolio3">
            Third Choice of Portfolio: &nbsp;
            <a style={{color:"black"}} target="_blank" href="https://docs.google.com/spreadsheets/d/1MUcmJOdLpoOBCskiigt8kj5UPFgodRhmkyaZExnF5zE/edit?gid=1870681100#gid=1870681100">(Link to Matrix)</a>
          </label>
          <input
            type="string"
            name="portfolio3"
            id="portfolio3"
            value={values.portfolio3}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter your Choice of Portfolio"
            className={
              errors.portfolio3 && touched.portfolio3
                ? `${styles.error} ${styles.portfolio1}`
                : `${styles.portfolio1}`
            }
          />
          {errors.portfolio3 && touched.portfolio3 ? (
            <p className={styles.errorPara}>{errors.portfolio3}</p>
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
            <span className={styles.strikeThrough}>{currencySymbol}{originalAmount} {currencyName}</span>
          )} {currencySymbol}{amount} {currencyName}
        </div>
        {ratesError && <p className={styles.errorPara}>{ratesError}</p>}

        <div className={styles.accountDetails}>
          <h3>BITSMUN Account Details</h3>
          <p><strong>Account Name:</strong> BITSMUN</p>
          <p><strong>Account Number:</strong> 01500110018729</p>
          <p><strong>Bank Name:</strong> UCO Bank</p>
          {/* <p><strong>IFSC Code:</strong> UCBA0000150</p> */}
          <p><strong>Swift Code:</strong> UCBAINBB214</p>

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
          &nbsp;Your response has been recorded!  You will recieve a confirmation once your payment is confirmed.
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
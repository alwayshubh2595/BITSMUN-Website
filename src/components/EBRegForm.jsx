import React from "react";
import styles from "../styles/DelRegForm.module.scss";
import { useFormik } from "formik";
import EBschema from "./schema/EBschema.js";
import { useState, useEffect } from "react";
import sanityClient from "../client.js";
import { submitToScript } from "../utils/submitForm.js";
import { prepareUpload } from "../utils/fileUpload.js";
const EBRegForm = () => {
  const [committees, setCommittees] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isPreparingUpload, setPreparingUpload] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const scriptUrl = import.meta.env.VITE_REGFORM_URL;
  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "committees"]{
      name,
      bio,
      type,
    }`
      )
      .then((data) => {
        setCommittees(data);
      })
      .catch(() => setCommittees([]));
  }, []);

  const onSubmit = async (values, actions) => {
    setSubmitError("");

    try {
      await submitToScript(scriptUrl, new FormData(document.forms["ebregform"]));
    } catch (err) {
      // Keep the filled-in form intact so the applicant can retry.
      setSubmitError(err.message);
      return;
    }

    setSubmitted(true);
    actions.resetForm();
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
      committee1: "",
      committee2: "",
      experience: "",
      ebexperience: "",
      fileContent: "",
      fileName: "",
    },
    validationSchema: EBschema,
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

  return (
    <>
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className={styles.delform}
        method="post"
        action={import.meta.env.VITE_REGFORM_URL}
        name="ebregform"
      >
        {/* Routes the submission to the right tab in the sheet. */}
        <input type="hidden" name="formType" value="eb" readOnly />
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
          <label htmlFor="committee1">Committee Preference 1: </label>
          <select
            name="committee1"
            id="commiittee1"
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
              Choose a committee
            </option>
            {committees &&
              committees.map((committee, index) => {
                return (
                  <option value={committee.name} key={index}>
                    [{committee.type.toUpperCase()}] &nbsp;{committee.bio}
                  </option>
                );
              })}
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
            id="commiittee2"
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
              Choose a committee
            </option>
            {committees &&
              committees.map((committee, index) => {
                return (
                  <option value={committee.name} key={index}>
                    [{committee.type.toUpperCase()}] &nbsp;{committee.bio}

                  </option>
                );
              })}
          </select>
          {errors.committee2 && touched.committee2 ? (
            <p className={styles.errorPara}>{errors.committee2}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="experience">No of MUN's Attended: </label>
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
          <label htmlFor="ebexperience">EB Experience: </label>
          <input
            type="string"
            name="ebexperience"
            id="ebexperience"
            value={values.ebexperience}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            placeholder="Enter Number of MUN's attended as a member of Executive Board"
            className={
              errors.ebexperience && touched.ebexperience
                ? `${styles.error} ${styles.ebexperience}`
                : `${styles.ebexperience}`
            }
          />
          {errors.experience && touched.experience ? (
            <p className={styles.errorPara}>{errors.experience}</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputField}>
          <label htmlFor="resume">Upload Your Resume: </label>
          <input
            key={fileInputKey}
            type="file"
            id="resume"
            accept=".pdf,image/*"
            onChange={handleUpload}
          />
          {isPreparingUpload && (
            <p className={styles.errorPara}>Processing your file…</p>
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
          Please wait while we record your response! Do not reload or close the
          page!
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
          &nbsp;Your response has been recorded! You'll soon be contacted for an
          interview!
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

export default EBRegForm;

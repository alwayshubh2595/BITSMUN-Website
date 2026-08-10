import { React, useState } from "react";
import EntryContext from "./EntryContext";

// The intro animation should be a first-impression flourish, not a toll booth.
// Once it has played, remember that for the rest of the browser session so a
// reload or a return visit goes straight to the content.
const SEEN_KEY = "bitsmun:intro-seen";

const hasSeenIntro = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private browsing / storage disabled: fall back to playing the intro.
    return false;
  }
};

const rememberIntro = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* no-op */
  }
};

const EntryState = (props) => {
  const [entered, updateEntry] = useState(hasSeenIntro);

  const setEntry = () => {
    rememberIntro();
    updateEntry(true);
  };
  const setExit = () => {
    updateEntry(false);
  };

  return (
    <EntryContext.Provider value={{ entered, setEntry, setExit }}>
      {props.children}
    </EntryContext.Provider>
  );
};

export default EntryState;

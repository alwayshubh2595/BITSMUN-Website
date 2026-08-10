import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/HeroSlideshow.module.scss";

// Campus photography behind the hero lockup, cross-fading on a quick cycle.
// Sources are pre-cropped to 16:9 at 1600x900 WebP (the originals are ~15MB
// 6000px JPEGs), so all fifteen together weigh about 1.6MB.
const images = Object.values(
  import.meta.glob("../assets/campus/*.webp", { eager: true, import: "default" })
);

// Hold time per photo and the cross-fade duration. The fade overlaps the hold,
// so a full cycle is HOLD_MS. Both are also referenced in the stylesheet.
const HOLD_MS = 2000;

const shuffle = (items) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const HeroSlideshow = () => {
  // Randomise once per mount so repeat visits do not open on the same photo.
  const ordered = useMemo(() => shuffle(images), []);
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (ordered.length <= 1 || prefersReducedMotion()) return undefined;

    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % ordered.length);
    }, HOLD_MS);

    return () => clearInterval(timer.current);
  }, [ordered.length]);

  if (!ordered.length) return null;

  return (
    <div className={styles.slideshow} aria-hidden="true">
      {ordered.map((src, i) => (
        <div
          key={src}
          className={`${styles.slide} ${i === active ? styles.isActive : ""}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      {/* Scrim keeps the wordmark legible over whatever photo is showing. */}
      <div className={styles.scrim} />
    </div>
  );
};

export default HeroSlideshow;

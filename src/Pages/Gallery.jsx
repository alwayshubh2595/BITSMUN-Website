import React, { useContext, useEffect } from 'react'
import InfiniteMenu from '../components/GalleryInfiniteMenu'
import Header from '../components/Header'
import Footer from '../components/Footer'
import EntryContext from '../Context/EntryContext'
import styles from '../styles/Gallery.module.scss'

// Dynamically import all images from assets/Gallery (case-sensitive, all common
// extensions). Gallery photos are pre-cropped to the 512x512 the WebGL atlas
// consumes and stored as WebP — see scripts/README for how to add more.
const images = Object.values(import.meta.glob('../assets/Gallery/*.{webp,png,jpg,jpeg,svg,WEBP,PNG,JPG,JPEG,SVG}', { eager: true, import: 'default' }));

const items = images.map((img, idx) => ({
  image: img,
  link: '#',
  title: `BITSMUN`,
  description: `Moment ${idx + 1}`
}));

const Gallery = () => {
  const context = useContext(EntryContext);

  useEffect(() => {
    document.title = "Gallery | BITSMUN Pilani 2026";
    // Without this the shared Footer stays hidden, since it keys off the
    // homepage intro having completed.
    context.setEntry();
  }, []);

  return (
    <div className={styles.galleryPage}>
      <Header color="black" />
      <div className={styles.title}>GALLERY</div>
      <div className={styles.subTitle}>Drag to explore moments from past editions</div>
      {items.length ? (
        <div className={styles.stage}>
          <InfiniteMenu items={items} />
        </div>
      ) : (
        <div className={styles.empty}>Photos coming soon.</div>
      )}
      <Footer />
    </div>
  )
}

export default Gallery

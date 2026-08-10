// Payment screenshots and resumes are sent to Apps Script as base64 inside a
// form field. Phone screenshots are routinely 5-10MB, which becomes ~13MB of
// base64 and gets rejected by the endpoint. Images are downscaled and re-encoded
// until they fit the budget; other file types are size-checked and rejected
// up front rather than failing at submit time.

// Budget applies to the base64 string, which is ~4/3 the size of the binary.
export const MAX_ENCODED_BYTES = 4 * 1024 * 1024;
const MAX_RAW_BYTES_NON_IMAGE = 3 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITIES = [0.82, 0.7, 0.55, 0.4];

export class FileUploadError extends Error {
  constructor(message) {
    super(message);
    this.name = "FileUploadError";
  }
}

const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new FileUploadError("Could not read that file. Please try another."));
    reader.readAsDataURL(file);
  });

const loadImage = (dataURL) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new FileUploadError("That image could not be opened. Please try another."));
    img.src = dataURL;
  });

const compressImage = async (dataURL) => {
  const img = await loadImage(dataURL);

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext("2d");
  // Payment screenshots may be PNGs with transparency; flatten so JPEG
  // encoding does not turn transparent regions black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  for (const quality of JPEG_QUALITIES) {
    const encoded = canvas.toDataURL("image/jpeg", quality);
    if (encoded.length <= MAX_ENCODED_BYTES) return encoded;
  }

  throw new FileUploadError(
    "That image is too large even after compression. Please upload a smaller screenshot."
  );
};

const withJpegExtension = (name) => name.replace(/\.[^.]+$/, "") + ".jpg";

/**
 * Turn a picked File into { fileContent, fileName } ready for the hidden form
 * fields, compressing images and rejecting anything that will not fit.
 */
export async function prepareUpload(file) {
  if (!file) throw new FileUploadError("No file selected.");

  const dataURL = await readAsDataURL(file);

  if (file.type.startsWith("image/")) {
    if (dataURL.length <= MAX_ENCODED_BYTES) {
      return { fileContent: dataURL, fileName: file.name };
    }
    const compressed = await compressImage(dataURL);
    return { fileContent: compressed, fileName: withJpegExtension(file.name) };
  }

  if (file.size > MAX_RAW_BYTES_NON_IMAGE || dataURL.length > MAX_ENCODED_BYTES) {
    throw new FileUploadError(
      `That file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please upload one under 3MB.`
    );
  }

  return { fileContent: dataURL, fileName: file.name };
}

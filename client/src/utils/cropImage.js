/**
 * Create image from URL (for canvas use).
 */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

/**
 * Get cropped image as Blob (circular crop for profile).
 * @param {string} imageSrc - Data URL or URL of the image
 * @param {object} cropAreaPixels - { x, y, width, height } from react-easy-crop
 * @param {boolean} circular - If true, clip to circle
 * @returns {Promise<Blob>}
 */
export default async function getCroppedImg(imageSrc, cropAreaPixels, circular = true) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const { x, y, width, height } = cropAreaPixels;

  canvas.width = width;
  canvas.height = height;

  if (circular) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

// Resize/compress before storing — storage holds the whole app's JSON,
// so every photo has to stay small.
//
// PNG/WebP sources are re-encoded as PNG to preserve transparency (e.g. a
// background-removed car cutout) — JPEG has no alpha channel, so flattening
// a transparent PNG to JPEG silently fills the transparent area black.
// Anything else (JPEG photos, which never have alpha) stays JPEG for the
// smaller file size.
export function compressImage(file, maxDim = 640, quality = 0.6) {
  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(keepAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

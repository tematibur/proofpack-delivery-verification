const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PREPARED_IMAGE_BYTES = 900 * 1024;
const MAX_LONG_EDGE = 1600;
const MIN_LONG_EDGE = 800;

const jpegBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The browser could not prepare this photo."))),
      "image/jpeg",
      quality
    );
  });

const jpegName = (name: string) => `${name.replace(/\.[^.]+$/, "") || "delivery-photo"}.jpg`;

export async function preparePhotoForUpload(file: File): Promise<File> {
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error(`Photo ${file.name} is larger than 10 MB.`);
  }

  if (file.type === "image/jpeg" && file.size <= MAX_PREPARED_IMAGE_BYTES) {
    return file;
  }

  const bitmap = await createImageBitmap(file);

  try {
    const sourceLongEdge = Math.max(bitmap.width, bitmap.height);
    let longEdge = Math.min(sourceLongEdge, MAX_LONG_EDGE);
    let quality = 0.88;
    let latestBlob: Blob | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const scale = longEdge / sourceLongEdge;
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("The browser could not prepare this photo.");

      context.drawImage(bitmap, 0, 0, width, height);
      latestBlob = await jpegBlob(canvas, quality);

      if (latestBlob.size <= MAX_PREPARED_IMAGE_BYTES) {
        return new File([latestBlob], jpegName(file.name), {
          type: "image/jpeg",
          lastModified: file.lastModified
        });
      }

      if (quality > 0.64) {
        quality -= 0.08;
      } else {
        longEdge = Math.max(MIN_LONG_EDGE, Math.round(longEdge * 0.82));
        quality = 0.78;
      }
    }

    if (!latestBlob) throw new Error("The browser could not prepare this photo.");
    return new File([latestBlob], jpegName(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified
    });
  } finally {
    bitmap.close();
  }
}

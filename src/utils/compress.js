import imageCompression from "browser-image-compression";

export const compressImage = async (file) => {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: undefined, // keep same resolution
    initialQuality: 0.5, // fixed 50%
    useWebWorker: true,
    fileType: file.type, // keep same format
  });

  return compressed;
};
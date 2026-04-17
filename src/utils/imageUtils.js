export const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
  });
};

export const formatSize = (bytes) => {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
};
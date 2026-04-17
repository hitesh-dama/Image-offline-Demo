import React, { useState } from "react";
import imageCompression from "browser-image-compression";
// import { handleSubmitFlow } from "../utils/uploadFlow";
import "./ImageCompressor.css";

// Helper: get dimensions
const getImageDimensions = (file) => {
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

// Helper: format size
const formatSize = (bytes) => {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

export default function ImageCompressor() {
  const [results, setResults] = useState([]);
  const [original, setOriginal] = useState(null);
  const [originalInfo, setOriginalInfo] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected");

  const [convertToJpeg, setConvertToJpeg] = useState(true);
  const [resizeEnabled, setResizeEnabled] = useState(true);

  const qualityLevels = [0.9, 0.7, 0.5, 0.3];

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResults([]);
    setSelectedFileName(file.name);

    const originalURL = URL.createObjectURL(file);
    setOriginal(originalURL);

    const originalDim = await getImageDimensions(file);

    setOriginalInfo({
      size: formatSize(file.size),
      dim: originalDim,
      type: file.type,
    });

    const tempResults = [];

    for (let quality of qualityLevels) {
      const start = performance.now();

      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: resizeEnabled ? 1280 : undefined,
        initialQuality: quality,
        useWebWorker: true,
        fileType: convertToJpeg ? "image/jpeg" : file.type,
      });

      const compressedDim = await getImageDimensions(compressedFile);

      const end = performance.now();

      const savings = (
        ((file.size - compressedFile.size) / file.size) *
        100
      ).toFixed(2);

      tempResults.push({
        quality: Math.round(quality * 100),
        url: URL.createObjectURL(compressedFile),
        file: compressedFile,
        size: formatSize(compressedFile.size),
        dim: compressedDim,
        type: compressedFile.type,
        savings,
        time: (end - start).toFixed(0),
      });
    }

    setResults(tempResults);
  };

  return (
    <section className="compress-shell">
      <header className="compress-hero">
        <p className="compress-kicker">Compression Studio</p>
        <h2 className="compress-title">Image Compression Demo</h2>
        <p className="compress-subtitle">
          Compare output quality, file size, and speed across multiple compression levels.
        </p>
      </header>

      <div className="compress-controls">
        <label className="compress-toggle">
          <input
            type="checkbox"
            checked={convertToJpeg}
            onChange={(e) => setConvertToJpeg(e.target.checked)}
          />
          <span>Convert to JPEG</span>
        </label>

        <label className="compress-toggle">
          <input
            type="checkbox"
            checked={resizeEnabled}
            onChange={(e) => setResizeEnabled(e.target.checked)}
          />
          <span>Resize to 1280px</span>
        </label>

        <label className="upload-btn" htmlFor="compress-file-input">
          Choose Image
        </label>
        <input
          id="compress-file-input"
          className="upload-input-hidden"
          type="file"
          accept="image/*"
          onChange={handleImage}
        />
        <p className="selected-file-name">{selectedFileName}</p>
      </div>

      {original && originalInfo && (
        <section className="original-panel">
          <div>
            <h3>Original Image</h3>
            <p className="meta-line">
              <strong>Size:</strong> {originalInfo.size}
            </p>
            <p className="meta-line">
              <strong>Resolution:</strong> {originalInfo.dim.width} x {originalInfo.dim.height}
            </p>
            <p className="meta-line">
              <strong>Format:</strong> {originalInfo.type}
            </p>
          </div>
          <img className="original-preview" src={original} alt="original" />
        </section>
      )}

      <div className="result-grid">
        {results.map((item, index) => {
          let label = "";
          let badgeClass = "";

          if (item.quality >= 70) {
            label = "Recommended";
            badgeClass = "badge-recommended";
          } else if (item.quality >= 50) {
            label = "Balanced";
            badgeClass = "badge-balanced";
          } else {
            label = "High Compression";
            badgeClass = "badge-high";
          }

          return (
            <article className="result-card" key={index}>
              <div className="result-head">
                <h4>{item.quality}% Quality</h4>
                <span className={`quality-badge ${badgeClass}`}>{label}</span>
              </div>

              <img className="result-image" src={item.url} alt="compressed" />

              <p className="meta-line">
                <strong>Size:</strong> {item.size}
              </p>
              <p className="meta-line">
                <strong>Resolution:</strong> {item.dim.width} x {item.dim.height}
              </p>
              <p className="meta-line">
                <strong>Format:</strong> {item.type}
              </p>
              <p className="meta-line">
                <strong>Savings:</strong> {item.savings}%
              </p>
              <p className="meta-line">
                <strong>Time:</strong> {item.time} ms
              </p>

              <a
                className="download-link"
                href={item.url}
                download={`compressed_${item.quality}.jpg`}
              >
                Download This Version
              </a>
            </article>
          );
        })}
      </div>

      {/* {results.length > 0 && (
        <button
          className="submit-flow-btn"
          onClick={() => handleSubmitFlow(results.map((r) => r.file || r))}
        >
          Submit Flow with Compressed Files
        </button>
      )} */}
    </section>
  );
}
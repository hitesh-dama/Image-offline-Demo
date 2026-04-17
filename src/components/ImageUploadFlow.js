import React, { useState } from "react";
import { handleSubmitFlow } from "../utils/uploadFlow";
import { compressImage } from "../utils/compress";
import "./ImageUploadFlow.css";

export default function ImageUploadFlow() {
  const [images, setImages] = useState([]);
  const [fixtureType, setFixtureType] = useState("");
  const [fixtureWattage, setFixtureWattage] = useState("");
  const [fixtureId, setFixtureId] = useState("");
  const [poleHeight, setPoleHeight] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("No images selected");

  const formatSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setSelectedFileName(
      files.length === 1 ? files[0].name : `${files.length} files selected`
    );

    const updated = [];

    for (let file of files) {
      const compressed = await compressImage(file);

      updated.push({
        originalFile: file,
        compressedFile: compressed,
        preview: URL.createObjectURL(file),
        originalSize: file.size,
        compressedSize: compressed.size,
      });
    }

    setImages((prev) => [...prev, ...updated]);
  };

  const isFormValid = () => {
    return (
      fixtureType &&
      fixtureWattage &&
      fixtureId &&
      poleHeight &&
      images.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert("Please complete all fixture details and upload Ubicell images.");
      return;
    }

    const files = images.map((img) => img.compressedFile);

    const fixtureDetails = {
      fixtureType,
      fixtureWattage,
      fixtureId,
      poleHeight,
    };

    await handleSubmitFlow(files, fixtureDetails);
  };

  return (
    <section className="upload-shell">
      <header className="upload-hero">
        <p className="upload-kicker">Field Submission Demo</p>
        <h2 className="upload-title">Low Network Upload</h2>
        <p className="upload-subtitle">
          Capture fixture details and submit Ubicell images reliably even on unstable networks.
        </p>
      </header>

      <div className="fixture-form-grid">
        <label className="field-block">
          <span>Fixture Type</span>
          <select
            value={fixtureType}
            onChange={(e) => setFixtureType(e.target.value)}
          >
            <option value="">Select Fixture Type</option>
            <option value="Street Light">Street Light</option>
            <option value="Flood Light">Flood Light</option>
            <option value="High Mast">High Mast</option>
            <option value="Tunnel Light">Tunnel Light</option>
          </select>
        </label>

        <label className="field-block">
          <span>Fixture Wattage</span>
          <input
            type="text"
            placeholder="Example: 90W"
            value={fixtureWattage}
            onChange={(e) => setFixtureWattage(e.target.value)}
          />
        </label>

        <label className="field-block">
          <span>Fixture ID</span>
          <input
            type="text"
            placeholder="Example: FL-IND-2941"
            value={fixtureId}
            onChange={(e) => setFixtureId(e.target.value)}
          />
        </label>

        <label className="field-block">
          <span>Pole Height</span>
          <select
            value={poleHeight}
            onChange={(e) => setPoleHeight(e.target.value)}
          >
            <option value="">Select Pole Height</option>
            <option value="4m">4m</option>
            <option value="6m">6m</option>
            <option value="8m">8m</option>
            <option value="10m">10m</option>
            <option value="12m">12m</option>
          </select>
        </label>
      </div>

      <section className="image-upload-panel">
        <h3>Ubicell Images</h3>
        <p>Upload fixture images for offline-safe submission.</p>
        <label className="image-upload-btn" htmlFor="ubicell-image-input">
          Upload Ubicell Images
        </label>
        <input
          id="ubicell-image-input"
          className="hidden-file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
        <p className="selected-upload-file">{selectedFileName}</p>
      </section>

      <div className="upload-result-grid">
        {images.map((img, index) => {
          const savings = (
            ((img.originalSize - img.compressedSize) /
              img.originalSize) *
            100
          ).toFixed(2);

          return (
            <article className="upload-result-card" key={index}>
              <img
                className="upload-preview-image"
                src={img.preview}
                alt="preview"
              />

              <p className="upload-meta-line">
                <strong>Original:</strong> {formatSize(img.originalSize)}
              </p>
              <p className="upload-meta-line">
                <strong>Compressed:</strong> {formatSize(img.compressedSize)}
              </p>
              <p className="upload-meta-line">
                <strong>Savings:</strong> {savings}%
              </p>
            </article>
          );
        })}
      </div>

      <button
        className="upload-submit-btn"
        disabled={!isFormValid()}
        onClick={handleSubmit}
      >
        Submit Fixture & Ubicell Images
      </button>

      {!isFormValid() && (
        <p className="upload-helper-note">
          Complete all fields and upload at least one image to proceed.
        </p>
      )}
    </section>
  );
}
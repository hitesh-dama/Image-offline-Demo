import React, { useState } from "react";
import { handleSubmitFlowRetry } from "../utils/uploadFlowRetry";
import { compressImage } from "../utils/compress";

export default function RetryUploadFlow() {
  const [images, setImages] = useState([]);

  const formatSize = (bytes) =>
    (bytes / 1024 / 1024).toFixed(2) + " MB";

  const handleChange = async (e) => {
    const files = Array.from(e.target.files);

    const updated = [];

    for (let file of files) {
      const compressed = await compressImage(file);

      updated.push({
        preview: URL.createObjectURL(file),
        compressedFile: compressed,
        originalSize: file.size,
        compressedSize: compressed.size,
      });
    }

    setImages((prev) => [...prev, ...updated]);
  };

  const handleSubmit = async () => {
    const files = images.map((i) => i.compressedFile);
    await handleSubmitFlowRetry(files);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Retry Upload (Production Approach)</h2>

      <input type="file" multiple onChange={handleChange} />

      <div style={{ marginTop: 20 }}>
        {images.map((img, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <img src={img.preview} width={80} alt="" />
            <p>
              {formatSize(img.originalSize)} →{" "}
              {formatSize(img.compressedSize)}
            </p>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit}>Submit Flow</button>
    </div>
  );
}
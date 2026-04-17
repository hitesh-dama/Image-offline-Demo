import React, { useState } from "react";
import { handleSubmitLow } from "../utils/uploadFlowLow";
import { handleSubmitRetry } from "../utils/uploadFlowRetry";

export default function MultiModeUpload({ mode }) {
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files);

    const updated = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      status: "ready",
    }));

    setImages((prev) => [...prev, ...updated]);
  };

  const handleSubmit = async () => {
    if (mode === "low") {
      await handleSubmitLow(images, setImages);
    } else {
      await handleSubmitRetry(images, setImages);
    }
  };

  return (
    <div>
      <h2>{mode === "low" ? "Low Network Mode" : "Retry Mode"}</h2>

      <input type="file" multiple onChange={handleChange} />

      {images.map((img, i) => (
        <div key={i}>
          <img src={img.preview} width={80} alt="" />
          <p>
            {img.status === "ready" && "🟡 Ready"}
            {img.status === "uploading" && "🔄 Uploading"}
            {img.status === "uploaded" && "✅ Uploaded"}
            {img.status === "queued" && "⏳ Queued"}
          </p>
        </div>
      ))}

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
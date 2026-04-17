import React, { useEffect, useState } from "react";
import ImageCompressor from "./components/ImageCompressor"; // your old POC
import ImageUploadFlow from "./components/ImageUploadFlow"; // new flow
import { processQueue } from "./utils/sync";
import { subscribeToNetworkChanges } from "./utils/network";
import "./App.css";

function App() {
  const [mode, setMode] = useState(null);
  // null | "compression" | "upload"

  // background sync (only for upload flow, but safe globally)
  useEffect(() => {
    const interval = setInterval(() => {
      processQueue();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkChanges();
    return unsubscribe;
  }, []);

  return (
    <div className="app-shell">
      {mode === null ? (
        <section className="landing-card">
          {/* <p className="landing-kicker">Client Demo Showcase</p> */}
          <h1 className="landing-title">Welcome to Image Handling Demo</h1>
          <p className="landing-copy">
            Please select the demo you want to explore.
          </p>

          <div className="demo-actions">
            <button
              className="demo-btn demo-btn-compression"
              onClick={() => setMode("compression")}
            >
              Compression Demo
            </button>
            <button
              className="demo-btn demo-btn-upload"
              onClick={() => setMode("upload")}
            >
              Low Network Upload Demo
            </button>
          </div>
        </section>
      ) : (
        <main className="demo-view">
          <div className="demo-topbar">
            <button className="back-btn" onClick={() => setMode(null)}>
              Back to Demo Selection
            </button>
            <p className="demo-active-label">
              {mode === "compression"
                ? "Now Showing: Compression Demo"
                : "Now Showing: Low Network Upload Demo"}
            </p>
          </div>

          {mode === "compression" ? (
            <ImageCompressor />
          ) : (
            <ImageUploadFlow />
          )}
        </main>
      )}
    </div>
  );
}

export default App;
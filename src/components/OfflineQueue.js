import React, { useEffect, useState } from "react";
import { addToQueue, getQueue } from "../utils/queue";
import { processQueue } from "../utils/sync"; // ✅ CORRECT

export default function OfflineQueue() {
  const [queue, setQueue] = useState([]);

  const refreshQueue = async () => {
    const data = await getQueue();
    setQueue(data);
  };

  useEffect(() => {
    refreshQueue();

    window.addEventListener("online", async () => {
      await processQueue();
      refreshQueue();
    });
  }, []);

  const handleUpload = async () => {
    const payload = {
      message: "Test upload",
      time: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      await addToQueue({
        url: "https://jsonplaceholder.typicode.com/posts",
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Offline - added to queue");
      refreshQueue();
      return;
    }

    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    alert("Uploaded successfully");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Offline Queue POC</h2>

      <button onClick={handleUpload}>Upload (Simulated)</button>

      <h4>Queued Items: {queue.length}</h4>

      <ul>
        {queue.map((item, index) => (
          <li key={index}>{item.body}</li>
        ))}
      </ul>
    </div>
  );
}
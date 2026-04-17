import { addToQueue } from "./queue";
import { isOnline } from "./network";

const UPLOAD_TIMEOUT_MS = 2000;

// 🔹 Replace with real API
const uploadImageAPI = async (file, id, signal) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", id);

  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: formData,
    signal,
  });
};

const uploadWithTimeout = async (file, id, timeoutMs = UPLOAD_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await uploadImageAPI(file, id, controller.signal);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// 🔹 Replace with real API
const submitFinalAPI = async (data) => {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
};

export const handleSubmitFlow = async (images, details = null, options = {}) => {
  const { onStatusChange, onImageIdAssigned } = options;

  if (!isOnline()) {
    alert("No internet. Please try again.");
    return;
  }

  const imageIds = [];
  let queuedCount = 0;

  for (let index = 0; index < images.length; index++) {
    const file = images[index];
    const id = Date.now() + Math.random();
    imageIds.push(id);
    onImageIdAssigned?.(index, id);
    onStatusChange?.(index, "processing");

    try {
      // Try immediate upload first; queue on timeout/failure.
      await uploadWithTimeout(file, id);
      onStatusChange?.(index, "uploaded");
    } catch (err) {
      await addToQueue({
        id,
        file,
        status: "pending",
      });
      queuedCount += 1;
      onStatusChange?.(index, "queued");
    }
  }

  // ✅ final API always immediate
  await submitFinalAPI({ imageIds, details });

  alert(
    queuedCount > 0
      ? `Submitted. ${queuedCount} image(s) queued and will retry in background.`
      : "Submitted successfully."
  );
};
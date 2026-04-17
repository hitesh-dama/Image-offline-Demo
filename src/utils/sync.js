import { getQueue, updateQueue } from "./queue";

const RETRY_TIMEOUT_MS = 8000;

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

const uploadWithTimeout = async (file, id, timeoutMs = RETRY_TIMEOUT_MS) => {
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

export const processQueue = async () => {
  if (!navigator.onLine) {
    console.log("[Queue Sync] waiting for online status");
    return;
  }

  const queue = await getQueue();

  if (!queue.length) return;

  console.log(`[Queue Sync] processing ${queue.length} queued image(s)`);
  const remaining = [];
  const uploadedIds = [];

  for (let item of queue) {
    try {
      await uploadWithTimeout(item.file, item.id);
      uploadedIds.push(item.id);
    } catch (err) {
      remaining.push(item); // retry later
    }
  }

  await updateQueue(remaining);

  if (uploadedIds.length) {
    window.dispatchEvent(
      new CustomEvent("queue-images-uploaded", {
        detail: { uploadedIds },
      })
    );
  }

  if (!remaining.length) {
    console.log("[Queue Sync] all queued images uploaded");
  }
};
import { addToQueue } from "./queue";
import { isOnline, isSlowNetwork } from "./network";
import { compressImage } from "./compress";

// 🔹 Replace with real API
const uploadImageAPI = async (file, id) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", id);

  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: formData,
  });
};

// 🔹 Replace with real API
const submitFinalAPI = async (data) => {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
};

export const handleSubmitFlow = async (images, details = null) => {
  if (!isOnline()) {
    alert("No internet. Please try again.");
    return;
  }

  const slow = isSlowNetwork();
  const imageIds = [];

  for (let file of images) {
    const id = Date.now() + Math.random();
    imageIds.push(id);

    // ✅ compress silently
    const compressedFile = await compressImage(file);

    if (slow) {
      // 🐢 queue
      await addToQueue({
        id,
        file: compressedFile,
        status: "pending",
      });
    } else {
      // 🚀 upload immediately
      await uploadImageAPI(compressedFile, id);
    }
  }

  // ✅ final API always immediate
  await submitFinalAPI({ imageIds, details });

  alert(
    slow
      ? "Submitted. Images will upload in background."
      : "Submitted successfully."
  );
};
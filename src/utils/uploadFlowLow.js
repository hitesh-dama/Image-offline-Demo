import { addToQueue } from "./queue";
import { isOnline, isSlowNetwork } from "./network";
import { compressImage } from "./compress";

// mock upload API (replace later)
const uploadImageAPI = async (file, id) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", id);

  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: formData,
  });
};

const submitFinalAPI = async (data) => {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
};

export const handleSubmitLow = async (images, setImages) => {
  if (!isOnline()) {
    alert("No internet");
    return;
  }

  const updatedImages = [...images];
  const isSlowAtSubmit = isSlowNetwork();
  const imageIds = [];

  for (let i = 0; i < updatedImages.length; i++) {
    const img = updatedImages[i];
    imageIds.push(img.id);

    try {
      // Use one network decision for the whole submit to avoid status flips.
      if (!isSlowAtSubmit) {
        updatedImages[i].status = "uploading";
        setImages([...updatedImages]);
      }

      const compressedFile = await compressImage(img.file);

      if (isSlowAtSubmit) {
        // 🐢 force queue
        updatedImages[i].status = "queued";
        setImages([...updatedImages]);

        await addToQueue({
          id: img.id,
          file: compressedFile,
        });
      } else {
        // 🚀 upload directly
        await uploadImageAPI(compressedFile, img.id);

        updatedImages[i].status = "uploaded";
        setImages([...updatedImages]);
      }
    } catch (err) {
      // fallback (just in case)
      updatedImages[i].status = "queued";
      setImages([...updatedImages]);

      await addToQueue({
        id: img.id,
        file: img.file,
      });
    }
  }

  await submitFinalAPI({ imageIds });

  alert(
    isSlowAtSubmit
      ? "Submitted. Images queued and will upload on stable network."
      : "Submitted (Low Network Mode)"
  );
};
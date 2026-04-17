import { addToQueue } from "./queue";
import { isOnline } from "./network";
import { compressImage } from "./compress";

const uploadImageAPI = async (file, id) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", id);

  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: formData,
  });
};

const uploadWithTimeout = async (file, id, timeout = 5000) => {
  return Promise.race([
    uploadImageAPI(file, id),
    new Promise((_, reject) =>
      setTimeout(() => reject("timeout"), timeout)
    ),
  ]);
};

export const handleSubmitRetry = async (images, setImages) => {
  if (!isOnline()) {
    alert("No internet");
    return;
  }

  const updated = [...images];

  for (let i = 0; i < updated.length; i++) {
    const img = updated[i];

    const compressed = await compressImage(img.file);

    try {
      updated[i].status = "uploading";
      setImages([...updated]);

      await uploadWithTimeout(compressed, img.id);

      updated[i].status = "uploaded";
      setImages([...updated]);
    } catch {
      updated[i].status = "queued";
      setImages([...updated]);

      await addToQueue({ id: img.id, file: compressed });
    }
  }

  alert("Submitted (Retry Mode)");
};
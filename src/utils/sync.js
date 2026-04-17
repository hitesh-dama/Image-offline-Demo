import { getQueue, updateQueue } from "./queue";
import { isStableNetwork } from "./network";

const uploadImageAPI = async (file, id) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", id);

  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: formData,
  });
};

export const processQueue = async () => {
  if (!isStableNetwork()) {
    console.log("[Queue Sync] waiting for stable network");
    return;
  }

  const queue = await getQueue();

  if (!queue.length) return;

  console.log(`[Queue Sync] processing ${queue.length} queued image(s)`);
  const remaining = [];

  for (let item of queue) {
    try {
      await uploadImageAPI(item.file, item.id);
    } catch (err) {
      remaining.push(item); // retry later
    }
  }

  await updateQueue(remaining);

  if (!remaining.length) {
    console.log("[Queue Sync] all queued images uploaded");
  }
};
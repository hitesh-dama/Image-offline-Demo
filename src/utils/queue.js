import localforage from "localforage";

const KEY = "imageQueue";

export const addToQueue = async (item) => {
  const queue = (await localforage.getItem(KEY)) || [];
  queue.push(item);
  await localforage.setItem(KEY, queue);
};

export const getQueue = async () => {
  return (await localforage.getItem(KEY)) || [];
};

export const updateQueue = async (queue) => {
  await localforage.setItem(KEY, queue);
};
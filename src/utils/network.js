export const isOnline = () => navigator.onLine;

export const getNetworkSnapshot = () => {
  const connection = navigator.connection;

  if (!connection) {
    return {
      supported: false,
      effectiveType: "unknown",
      downlink: null,
      rtt: null,
      saveData: false,
    };
  }

  const { effectiveType, downlink, rtt, saveData } = connection;

  return {
    supported: true,
    effectiveType,
    downlink,
    rtt,
    saveData,
  };
};

export const logNetworkSnapshot = (label = "Network") => {
  const snap = getNetworkSnapshot();

  if (!snap.supported) {
    console.log(`[${label}] Network Information API not supported`);
    return snap;
  }

  console.log(
    `[${label}] type=${snap.effectiveType}, speed=${snap.downlink} Mb/s, rtt=${snap.rtt} ms, saveData=${snap.saveData}`
  );

  return snap;
};

export const subscribeToNetworkChanges = () => {
  const connection = navigator.connection;

  if (!connection || !connection.addEventListener) {
    logNetworkSnapshot("Network Init");
    return () => {};
  }

  const onConnectionChange = () => logNetworkSnapshot("Network Change");
  const onOnline = () => console.log("[Network Status] online");
  const onOffline = () => console.log("[Network Status] offline");

  logNetworkSnapshot("Network Init");

  connection.addEventListener("change", onConnectionChange);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    connection.removeEventListener("change", onConnectionChange);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
};

export const isSlowNetwork = () => {
  const { supported, effectiveType, downlink, rtt } = getNetworkSnapshot();

  if (!supported) return false;

  logNetworkSnapshot("Network Check");

  // ✅ fallback using effectiveType
  const isSlowType =
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g";

  // ✅ real detection using speed
  const hasDownlink = typeof downlink === "number";
  const isSlowSpeed = hasDownlink && downlink < 1.5;

  // RTT fallback helps when downlink does not reflect DevTools throttling.
  const hasRtt = typeof rtt === "number";
  const isSlowRtt = hasRtt && rtt > 700;

  return isSlowType || isSlowSpeed || isSlowRtt;
};

export const isStableNetwork = () => isOnline() && !isSlowNetwork();
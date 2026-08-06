"use client";

import { useEffect, useState } from "react";

export default function PwaRuntime() {
  const [isOffline, setIsOffline] = useState(false);
  const [blockedSubmit, setBlockedSubmit] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    }
  }, []);

  useEffect(() => {
    const syncNetworkState = () => {
      setIsOffline(!navigator.onLine);
      if (navigator.onLine) {
        setBlockedSubmit(false);
      }
    };

    const blockOfflineSubmit = (event: SubmitEvent) => {
      if (navigator.onLine) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setBlockedSubmit(true);
      setIsOffline(true);
    };

    syncNetworkState();
    window.addEventListener("online", syncNetworkState);
    window.addEventListener("offline", syncNetworkState);
    document.addEventListener("submit", blockOfflineSubmit, true);

    return () => {
      window.removeEventListener("online", syncNetworkState);
      window.removeEventListener("offline", syncNetworkState);
      document.removeEventListener("submit", blockOfflineSubmit, true);
    };
  }, []);

  if (!isOffline && !blockedSubmit) {
    return null;
  }

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      {blockedSubmit
        ? "You are offline. Reconnect to continue."
        : "You are offline. Some actions are unavailable."}
    </div>
  );
}

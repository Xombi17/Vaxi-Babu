"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "[Vaxi Babu] Service Worker registered:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.error(
            "[Vaxi Babu] Service Worker registration failed:",
            error,
          );
        });
    }
  }, []);

  return null;
}

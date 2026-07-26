"use client";

import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    (async () => {
      try {
        const registration =
          await navigator.serviceWorker.register("/sw.js");

        registration.update();

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            window.location.reload();
          }
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return null;
}
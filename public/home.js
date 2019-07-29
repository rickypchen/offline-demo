const App = () => {
  const ready = () => {
    let offlineNotify = document.getElementById("connectivity-status");

    let isOnline = ("onLine" in navigator) && navigator.onLine;
    if (!isOnline) {
      offlineNotify.classList.remove("hidden");
    }

    window.addEventListener("online", () => {
      offlineNotify.classList.add("hidden");
      navigator.serviceWorker.controller.postMessage({ isOnline: true });
      isOnline = true;
    }, false);
    window.addEventListener("offline",() => {
      offlineNotify.classList.remove("hidden");
      navigator.serviceWorker.controller.postMessage({ isOnline: false });
      isOnline = false;
    }, false);
  }

  const initServiceWorker = async () => {
    const swRegistration = await navigator.serviceWorker.register("/serviceWorker.js",{
      updateViaCache: "none",
    });

    let svcworker = swRegistration.installing || swRegistration.waiting || swRegistration.active;

    // listen for new service worker to take over
    navigator.serviceWorker.addEventListener("controllerchange", async () => {
      svcworker = navigator.serviceWorker.controller;
    });
  }

  if ("serviceWorker" in navigator) {
    initServiceWorker()
  }

  document.addEventListener("DOMContentLoaded",ready,false);
};

App();

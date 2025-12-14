/**
 * Firebase config (sin duplicados)
 */

const firebaseConfig = {
  apiKey: "AIzaSyC0hXc8Goumy9cDht82fXGMewi1wggfC5E",
  authDomain: "soycampesino2025.firebasestorage.app",
  projectId: "soycampesino2025",
  storageBucket: "soycampesino2025.firebasestorage.app",
  messagingSenderId: "9297095496",
  appId: "1:9297095496:web:8cb47e48ae54512b8ca17d",
  measurementId: "G-339YNTB0WW",
};

(async function () {
  "use strict";
  try {
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
    );
    const { getFirestore, collection, addDoc } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );
    const { getAnalytics, logEvent } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js"
    );

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const analytics = getAnalytics(app);

    window.firebaseDB = db;
    window.firebaseCollection = collection;
    window.firebaseAddDoc = addDoc;
    window.firebaseAnalytics = analytics;
    window.logFirebaseEvent = (eventName, params = {}) =>
      logEvent(analytics, eventName, params);

    console.log("Firebase inicializado");
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    window.firebaseDB = { mock: true };
    window.firebaseCollection = (db, name) => ({ db, name, mock: true });
    window.firebaseAddDoc = async (col, data) => {
      console.log("[MOCK] Guardando en Firebase:", { col, data });
      return { id: "mock-id" };
    };
    window.logFirebaseEvent = (eventName, params) =>
      console.log(`[MOCK] Evento: ${eventName}`, params);
  }
})();

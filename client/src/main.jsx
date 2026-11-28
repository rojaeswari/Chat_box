import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";


// Handle revoked login sessions
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "SESSION_REVOKED"
    ) {
      window.dispatchEvent(
        new Event("session-revoked")
      );
    }

    return Promise.reject(error);
  }
);
ReactDOM.createRoot(document.getElementById("root")).render(
  
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("Service Worker Registered");
      })
      .catch((err) => {
        console.log("Service Worker Error:", err);
      });
  });
}
// main.jsx — the entry point of the app.
// It finds the <div id="root"> in index.html and renders the <App /> component into it.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css"; // global styles for the whole app

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

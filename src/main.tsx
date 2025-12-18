import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./app.css";

import HomePage from "./pages/Home";
import EditorPage from "./pages/Editor";
import RuntimePage from "./pages/Runtime";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/runtime" element={<RuntimePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

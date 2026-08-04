import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard & DSA Portal */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Monaco IDE Workspace */}
        <Route path="/workspace" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
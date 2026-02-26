import { BrowserRouter, Routes, Route } from "react-router-dom";

import Upload from "./pages/Upload";
import Admin from "./pages/Admin";
import UserCheck from "./pages/UserCheck";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* USER UPLOAD PAGE */}
        <Route path="/" element={<Upload />} />

        {/* ADMIN DASHBOARD */}
        <Route path="/admin" element={<Admin />} />

        {/* USER CHECK INVOICE */}
        <Route path="/check" element={<UserCheck />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
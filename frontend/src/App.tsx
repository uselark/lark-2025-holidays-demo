import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Authenticate } from "./auth/Authenticate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authenticate" element={<Authenticate />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { GenerationResult } from "./pages/GenerationResult";
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
        <Route
          path="/generation/:id"
          element={
            <ProtectedRoute>
              <GenerationResult />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { GenerationResult } from "./pages/GenerationResult";
import { Authenticate } from "./auth/Authenticate";
import { Plans } from "./pages/Plans";

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
        <Route path="/generation/:id" element={<GenerationResult />} />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

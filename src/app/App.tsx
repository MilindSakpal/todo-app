import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./Dashboard";
import Register from "./components/Register";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          token ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuthStore, useThemeStore } from "./stores";
import { Navbar } from "./components";
import {
  HomePage,
  LoginPage,
  SignUpPage,
  ProfilePage,
  SettingsPage,
} from "./pages";

import "./index.css";

function App() {
  const { authUser, checkAuth, isCheckingAuth, connectSocket } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      connectSocket();
    }
  }, [authUser, connectSocket]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Router>
        <div className="min-h-screen bg-base-200">
          <Navbar />

          <Routes>
            <Route
              path="/"
              element={authUser ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/settings"
              element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            />
          </Routes>

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--fallback-b1, oklch(var(--b1)))",
                color: "var(--fallback-bc, oklch(var(--bc)))",
                border: "1px solid var(--fallback-b3, oklch(var(--b3)))",
              },
            }}
          />
        </div>
      </Router>
    </div>
  );
}

export default App;

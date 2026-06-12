import { StyledEngineProvider } from "@mui/material";
import { Box } from "@mui/material";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { OnBoarding } from "./pages/OnBoarding";
import { AuthPage } from "./pages/Auth";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CalendarPage } from "./pages/Calendar/Calendar";

const AppLayout = () => (
  <Box sx={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Outlet />
    </Box>
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnBoarding />} />
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/Calendar" element={<CalendarPage />} />
            </Route>
          </Route>
        </Routes>
      </StyledEngineProvider>
    </BrowserRouter>
  );
}

export default App;

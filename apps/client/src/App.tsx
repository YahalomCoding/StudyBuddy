import { StyledEngineProvider } from "@mui/material";
import { Box } from "@mui/material";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { OnBoarding } from "./pages/OnBoarding";
import { Sidebar } from "./components/Sidebar/Sidebar";

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
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<OnBoarding />} />
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            {/* Add more pages here and they'll automatically get the sidebar */}
          </Route>
        </Routes>
      </StyledEngineProvider>
    </BrowserRouter>
  );
}

export default App;
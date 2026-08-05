import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import {
  Box,
  Drawer,
  IconButton,
  StyledEngineProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { SyllabusImport } from "./pages/SyllabusImport";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { AssignmentsPage } from "./pages/Assignments";
import { AuthPage } from "./pages/Auth";
import { CalendarPage } from "./pages/Calendar/Calendar";
import { GradesPage } from "./pages/Grades";
import { Home } from "./pages/Home";
import { OnBoarding } from "./pages/OnBoarding";
import { SettingsPage } from "./pages/Settings/SettingsPage";

const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isMobile) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            height: 56,
            px: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 1200,
          }}
        >
          <IconButton
            aria-label="פתח תפריט"
            onClick={() => setMobileNavOpen(true)}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography fontSize={15} fontWeight={700}>
            StudyBuddy
          </Typography>
          <Box sx={{ width: 40 }} />
        </Box>

        <Drawer
          anchor="right"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        >
          <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
        </Drawer>

        <Box sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

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
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/syllabus" element={<SyllabusImport />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/grades" element={<GradesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </StyledEngineProvider>
    </BrowserRouter>
  );
}

export default App;

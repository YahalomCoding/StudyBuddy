import { StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { OnBoarding } from "./pages/OnBoarding";

function App() {
  return (
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<OnBoarding />} />
        </Routes>
      </StyledEngineProvider>
    </BrowserRouter>
  );
}

export default App;

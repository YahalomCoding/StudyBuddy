import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme.ts";
import { LoadingProvider } from "./contexts/LoadingContext.tsx";
import { QueryClientWrapper } from "./contexts/QueryClientWrapper.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { AiFeaturesProvider } from "./contexts/AiFeaturesContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <ThemeProvider theme={theme}>
        <LoadingProvider>
          <QueryClientWrapper>
            <AuthProvider>
              <AiFeaturesProvider>
                <CssBaseline />
                <App />
              </AiFeaturesProvider>
            </AuthProvider>
          </QueryClientWrapper>
        </LoadingProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);

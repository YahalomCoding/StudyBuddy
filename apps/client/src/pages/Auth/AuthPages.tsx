import { GoogleLogin } from "@react-oauth/google";
import { Alert, Box, Button, Link, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const redirectAfterAuth = (hasCompletedOnboarding: boolean) =>
  hasCompletedOnboarding ? "/home" : "/onboarding";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = mode === "login"
        ? await login(email, password)
        : await register(username, email, password);
      navigate(redirectAfterAuth(user.hasCompletedOnboarding), { replace: true });
    } catch {
      setError(mode === "login" ? "אימייל או סיסמה לא נכונים" : "לא ניתן ליצור משתמש. בדקי את הפרטים");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafc", p: 3 }}>
      <Paper elevation={0} sx={{ width: "100%", maxWidth: 430, p: 4, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
        <Stack gap={3}>
          <Box textAlign="center">
            <Typography fontSize={30}>🎒</Typography>
            <Typography variant="h5" fontWeight={800}>StudyBuddy</Typography>
            <Typography color="text.secondary" fontSize={14}>כניסה למערכת וניהול משתמשים</Typography>
          </Box>

          <Tabs value={mode} onChange={(_, value) => setMode(value)} variant="fullWidth">
            <Tab value="login" label="כניסה" />
            <Tab value="register" label="הרשמה" />
          </Tabs>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack gap={2}>
            {mode === "register" && (
              <TextField label="שם משתמש" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
            )}
            <TextField label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField label="סיסמה" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            <Button variant="contained" disabled={isSubmitting} onClick={handleSubmit} sx={{ py: 1.2, borderRadius: 2, bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}>
              {mode === "login" ? "כניסה" : "הרשמה"}
            </Button>
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (!credentialResponse.credential) return;
                const user = await googleLogin(credentialResponse.credential);
                navigate(redirectAfterAuth(user.hasCompletedOnboarding), { replace: true });
              }}
              onError={() => setError("התחברות עם Google נכשלה")}
            />
          </Box>

          <Typography textAlign="center" fontSize={13} color="text.secondary">
            {mode === "login" ? "אין לך חשבון? " : "כבר יש לך חשבון? "}
            <Link component="button" onClick={() => setMode(mode === "login" ? "register" : "login")}> 
              {mode === "login" ? "להרשמה" : "לכניסה"}
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

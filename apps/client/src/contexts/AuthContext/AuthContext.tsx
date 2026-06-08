import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type AuthResponse, type AuthUser } from "../../api/auth";

const TOKEN_KEY = "studybuddy_access_token";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (username: string, email: string, password: string) => Promise<AuthUser>;
  googleLogin: (idToken: string) => Promise<AuthUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const saveSession = (response: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, response.accessToken);
  return response.user;
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isLoading, setIsLoading] = useState(Boolean(getAccessToken()));

  const refreshMe = async () => {
    const currentToken = getAccessToken();
    setToken(currentToken);
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshMe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login: async (email, password) => {
      const response = await authApi.login({ email, password });
      const loggedInUser = saveSession(response);
      setToken(response.accessToken);
      setUser(loggedInUser);
      return loggedInUser;
    },
    register: async (username, email, password) => {
      const response = await authApi.register({ username, email, password });
      const registeredUser = saveSession(response);
      setToken(response.accessToken);
      setUser(registeredUser);
      return registeredUser;
    },
    googleLogin: async (idToken) => {
      const response = await authApi.googleLogin(idToken);
      const googleUser = saveSession(response);
      setToken(response.accessToken);
      setUser(googleUser);
      return googleUser;
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    },
    refreshMe,
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

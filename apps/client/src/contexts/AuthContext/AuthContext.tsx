import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type AuthResponse, type AuthUser } from "../../api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (username: string, email: string, password: string) => Promise<AuthUser>;
  googleLogin: (idToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getUserFromAuthResponse = (response: AuthResponse) => response.user;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const { user: currentUser } = await authApi.userinfo();
      setUser(currentUser);
    } catch {
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
    isAuthenticated: Boolean(user),
    isLoading,
    login: async (email, password) => {
      const response = await authApi.login({ email, password });
      const loggedInUser = getUserFromAuthResponse(response);
      setUser(loggedInUser);
      return loggedInUser;
    },
    register: async (username, email, password) => {
      const response = await authApi.register({ username, email, password });
      const registeredUser = getUserFromAuthResponse(response);
      setUser(registeredUser);
      return registeredUser;
    },
    googleLogin: async (idToken) => {
      const response = await authApi.googleLogin(idToken);
      const googleUser = getUserFromAuthResponse(response);
      setUser(googleUser);
      return googleUser;
    },
    logout: async () => {
      try {
        await authApi.logout();
      } catch {
        // Clear local auth state even if logout request fails.
      }
      setUser(null);
    },
    refreshMe,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

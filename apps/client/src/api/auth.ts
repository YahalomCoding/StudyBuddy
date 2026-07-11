import baseApi from "./baseApi";

export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  authProvider: string;
  profileImage: string | null;
  hasCompletedOnboarding: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  register: async (payload: { username: string; email: string; password: string }) => {
    const { data } = await baseApi.post<AuthResponse>("/auth/register", payload);
    return data;
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await baseApi.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  googleLogin: async (idToken: string) => {
    const { data } = await baseApi.post<AuthResponse>("/auth/google", { idToken });
    return data;
  },
  me: async () => {
    const { data } = await baseApi.get<AuthUser>("/auth/me");
    return data;
  },
};

import baseApi from "./baseApi";

export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  authProvider: string;
  profileImage: string | null;
  hasCompletedOnboarding: boolean;
  studentId: string | null;
}

export interface AuthResponse {
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
  userinfo: async () => {
    const { data } = await baseApi.get<AuthResponse>("/auth/userinfo");
    return data;
  },
  logout: async () => {
    await baseApi.post("/auth/logout", {});
  }
};

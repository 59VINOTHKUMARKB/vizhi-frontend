"use client";

export type AuthUser = {
  id: string;
  email: string;
  email_verified: boolean;
  name: string;
  avatar_url: string;
};

export type AuthSession = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

const TOKEN_KEY = "vizhi_access_token";
const USER_KEY = "vizhi_user";

export function saveSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

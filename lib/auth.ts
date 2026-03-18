export const AUTH_COOKIE = "linkmind_session";

export type UserRole = "founder" | "team" | "viewer";

export type AuthUser = {
  email: string;
  name: string;
  role: UserRole;
};

export const demoUser: AuthUser = {
  email: "hello@linkmind.ai",
  name: "Jaehyeok",
  role: "founder",
};

export const loginHints = [
  "Start with email and password now, then swap in OAuth or Supabase/Auth.js later.",
  "Protected routes use a cookie key so the flow can be replaced by a real token or session.",
  "Role metadata is already shaped for founder, team member, and read-only viewer access."
];


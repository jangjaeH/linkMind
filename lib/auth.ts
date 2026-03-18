export const AUTH_COOKIE = "linkmind_session";

export type UserRole = "founder" | "team" | "viewer";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthUserRecord = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
};

export const demoUser: AuthUser = {
  id: "demo-user",
  username: "system",
  email: "system@linkmind.ai",
  name: "System User",
  role: "founder",
};

export const loginHints = [
  "Docker Postgres 위에 실제 회원가입과 로그인 API를 연결하는 구조입니다.",
  "테스트 계정은 id `system`, password `1234` 입니다.",
  "세션은 httpOnly 쿠키로 저장되어 워크스페이스 라우트 보호에 사용됩니다."
];

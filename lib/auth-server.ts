import { randomUUID } from "crypto";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { AUTH_COOKIE, AuthUser, AuthUserRecord } from "@/lib/auth";
import { db } from "@/lib/db";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function toAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.full_name,
    role: user.role
  };
}

export async function findUserByIdentifier(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  const result = await db.query<AuthUserRecord & { password_hash: string }>(
    `
      SELECT id, username, email, full_name, role, password_hash
      FROM users
      WHERE LOWER(username) = $1 OR LOWER(email) = $1
      LIMIT 1
    `,
    [normalized]
  );

  return result.rows[0] ?? null;
}

export async function createUser(input: {
  username: string;
  email: string;
  name: string;
  password: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const result = await db.query<AuthUserRecord>(
    `
      INSERT INTO users (username, email, full_name, password_hash, role)
      VALUES ($1, $2, $3, $4, 'team')
      RETURNING id, username, email, full_name, role
    `,
    [input.username.trim(), input.email.trim().toLowerCase(), input.name.trim(), passwordHash]
  );

  return result.rows[0];
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(userId: string) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.query(
    `
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES ($1, $2, $3)
    `,
    [userId, token, expiresAt]
  );

  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function clearSession() {
  const token = cookies().get(AUTH_COOKIE)?.value;

  if (token) {
    await db.query("DELETE FROM user_sessions WHERE session_token = $1", [token]);
  }

  cookies().set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const result = await db.query<AuthUserRecord>(
    `
      SELECT u.id, u.username, u.email, u.full_name, u.role
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.session_token = $1 AND s.expires_at > NOW()
      LIMIT 1
    `,
    [token]
  );

  return result.rows[0] ? toAuthUser(result.rows[0]) : null;
}

export function mapDbUser(user: AuthUserRecord) {
  return toAuthUser(user);
}


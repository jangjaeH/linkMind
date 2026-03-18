import { NextResponse } from "next/server";

import { createSession, createUser, findUserByIdentifier, mapDbUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    email?: string;
    name?: string;
    password?: string;
  };

  const username = body.username?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const name = body.name?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !email || !name || !password) {
    return NextResponse.json({ message: "모든 회원가입 항목을 입력해 주세요." }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ message: "비밀번호는 최소 4자 이상이어야 합니다." }, { status: 400 });
  }

  const existingByUsername = await findUserByIdentifier(username);

  if (existingByUsername) {
    return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
  }

  const existingEmail = await db.query("SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [email]);

  if (existingEmail.rowCount) {
    return NextResponse.json({ message: "이미 사용 중인 이메일입니다." }, { status: 409 });
  }

  const user = await createUser({ username, email, name, password });
  await createSession(user.id);

  return NextResponse.json({ user: mapDbUser(user) }, { status: 201 });
}


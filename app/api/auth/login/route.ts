import { NextResponse } from "next/server";

import { createSession, findUserByIdentifier, mapDbUser, verifyPassword } from "@/lib/auth-server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    identifier?: string;
    password?: string;
  };

  const identifier = body.identifier?.trim() ?? "";
  const password = body.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "아이디 또는 이메일과 비밀번호를 입력해 주세요." },
      { status: 400 }
    );
  }

  const user = await findUserByIdentifier(identifier);

  if (!user) {
    return NextResponse.json({ message: "존재하지 않는 계정입니다." }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ user: mapDbUser(user) });
}


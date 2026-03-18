import { NextResponse } from "next/server";

import { createInterest, getInterests, getScrapedItems } from "@/lib/interest-scraper";

export async function GET() {
  const [interests, items] = await Promise.all([getInterests(), getScrapedItems()]);

  return NextResponse.json({ interests, items });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    keyword?: string;
    promptHint?: string;
  };

  const keyword = body.keyword?.trim() ?? "";

  if (!keyword) {
    return NextResponse.json({ message: "관심사 키워드를 입력해 주세요." }, { status: 400 });
  }

  const interest = await createInterest({
    keyword,
    promptHint: body.promptHint
  });

  return NextResponse.json({ interest }, { status: 201 });
}


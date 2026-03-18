import { NextResponse } from "next/server";

import { runInterestScrape } from "@/lib/interest-scraper";

export async function POST() {
  const result = await runInterestScrape();
  return NextResponse.json(result);
}


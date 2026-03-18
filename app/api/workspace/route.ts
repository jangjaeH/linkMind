import { NextResponse } from "next/server";

import { getWorkspaceSnapshotFromDb } from "@/lib/workspace-queries";

export async function GET() {
  return NextResponse.json(await getWorkspaceSnapshotFromDb());
}

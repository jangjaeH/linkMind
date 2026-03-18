import { NextResponse } from "next/server";

import { getWorkspaceSnapshotFromDb } from "@/lib/workspace-queries";

export async function GET() {
  const workspace = await getWorkspaceSnapshotFromDb();
  return NextResponse.json(workspace.inbox);
}

import { NextResponse } from "next/server";

import { getGraphNodesByProjectFromDb, getProjectBySlugFromDb } from "@/lib/workspace-queries";

type ProjectRouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(
  _request: Request,
  { params }: ProjectRouteContext
) {
  const project = await getProjectBySlugFromDb(params.slug);

  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...project,
    nodes: await getGraphNodesByProjectFromDb(params.slug)
  });
}

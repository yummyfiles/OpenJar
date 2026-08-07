import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { projectSchema } from "@/lib/validations";
import { createProject } from "@/server/services/content";

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const input = projectSchema.parse(await readJson(req));
    const project = await createProject(user.id, {
      name: input.name,
      slug: input.slug ?? undefined,
      description: input.description ?? undefined,
      repoUrl: input.repoUrl ?? undefined,
      website: input.website ?? undefined,
      tags: input.tags
    });
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { projectSchema } from "@/lib/validations";
import { createProject, updateProject, deleteProject } from "@/server/services/content";

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const input = projectSchema.partial().parse(await readJson(req));
    const project = await updateProject(user.id, id, input as never);
    return NextResponse.json({ data: project });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    await deleteProject(user.id, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}

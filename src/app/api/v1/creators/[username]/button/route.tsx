import { ImageResponse } from "next/og";
import { findCreatorByUsername } from "@/server/services/creators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const creator = await findCreatorByUsername(username);
  if (!creator || !creator.isCreator) {
    return Response.json({ error: { message: "Creator not found" } }, { status: 404 });
  }

  const accent = /^#[0-9a-fA-F]{6}$/.test(String(creator.accent ?? "")) ? (creator.accent as string) : "#a3e635";

  const image = new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0e0e11",
        borderRadius: 32,
        border: "1px solid #26262b",
        fontFamily: "monospace"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 14, height: 14, borderRadius: 9999, backgroundColor: accent }} />
        <div style={{ fontSize: 18, color: "#ffffff", fontWeight: 600, whiteSpace: "nowrap" }}>Support me on OpenJar</div>
      </div>
    </div>,
    { width: 300, height: 64 }
  );

  return new Response(image.body, {
    status: image.status,
    headers: {
      "Content-Type": image.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}

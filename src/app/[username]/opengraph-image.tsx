import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cascadia = {
  regular: readFileSync(join(process.cwd(), "src/app/fonts/CascadiaMono-Regular.ttf")),
  bold: readFileSync(join(process.cwd(), "src/app/fonts/CascadiaMono-Bold.ttf"))
};

export default async function CreatorOpenGraphImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { displayName: true, name: true, bio: true, image: true }
  });

  const title = (user?.displayName ?? user?.name ?? username).slice(0, 60);
  const bio = (user?.bio ?? "Open support for open creators").slice(0, 140);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        backgroundColor: "#0a0a0a",
        color: "#ffffff",
        fontFamily: "Cascadia Mono"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#9ca3af", fontSize: 28 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "9999px",
              backgroundColor: "#a3e635",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "#0a0a0a"
            }}
          >
            ●
          </span>
          OpenJar
        </span>
        <span style={{ color: "#4b5563" }}>·</span>
        <span>@{username}</span>
      </div>

      <div style={{ marginTop: 40, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
      <div style={{ marginTop: 24, fontSize: 30, color: "#9ca3af", lineHeight: 1.4, maxWidth: 900 }}>{bio}</div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Cascadia Mono", data: cascadia.regular, weight: 400, style: "normal" },
        { name: "Cascadia Mono", data: cascadia.bold, weight: 700, style: "normal" }
      ]
    }
  );
}

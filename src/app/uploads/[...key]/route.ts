import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { LOCAL_UPLOAD_DIR } from "@/server/storage";

// serves local uploads with the right content type + long cache headers.
// prod builds use S3 and never hit this route.
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".md": "text/markdown"
};

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const rel = key.join("/");

  // dont let anyone path-traverse out of the uploads dir
  const abs = path.join(LOCAL_UPLOAD_DIR, rel);
  if (!abs.startsWith(LOCAL_UPLOAD_DIR) || rel.includes("..")) {
    return new NextResponse("not found", { status: 404 });
  }

  try {
    const data = await fs.readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}

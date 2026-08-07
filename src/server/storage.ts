import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import path from "path";
import { promises as fs } from "fs";
import { ApiError } from "@/lib/api";

// Storage abstraction: local disk during development, any S3-compatible bucket
// in production. Swap by setting S3_* env vars — no app code changes.

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
  "text/markdown",
  "audio/mpeg",
  "audio/ogg",
  "video/mp4"
]);
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25mb

export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT && process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
  );
}

export async function saveUpload(file: File, folder = "uploads"): Promise<{ url: string; key: string }> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new ApiError(400, `File type ${file.type || "unknown"} is not allowed`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, "File is too large (max 25mb)");
  }

  const ext = path.extname(file.name || "").toLowerCase().slice(0, 10) || mimeExt(file.type);
  const key = `${folder}/${new Date().toISOString().slice(0, 10)}/${randomBytes(12).toString("hex")}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isS3Configured()) {
    return saveToS3(key, bytes, file.type);
  }
  return saveToLocal(key, bytes, file.type);
}

async function saveToLocal(key: string, bytes: Buffer, contentType: string) {
  const abs = path.join(LOCAL_UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, bytes);
  const url = `/uploads/${key}`;
  // keep a sidecar so the serving route knows the content type
  await fs.writeFile(`${abs}.json`, JSON.stringify({ contentType }));
  return { url, key };
}

async function saveToS3(key: string, bytes: Buffer, contentType: string) {
  const client = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
    },
    forcePathStyle: true
  });

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: contentType
    })
  );

  const base = process.env.S3_PUBLIC_BASE_URL ?? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`;
  return { url: `${base.replace(/\/$/, "")}/${key}`, key };
}

function mimeExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
    "application/pdf": ".pdf",
    "text/markdown": ".md",
    "audio/mpeg": ".mp3",
    "video/mp4": ".mp4"
  };
  return map[mime] ?? ".bin";
}

export { LOCAL_UPLOAD_DIR };

import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Save base64 data URL image to /public/uploads and return the public path.
 * Supports data URLs like: data:image/jpeg;base64,xxxxx
 */
export async function saveBase64Image(
  dataUrl: string,
  prefix = "img"
): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL");

  const mime = match[1];
  const ext = mime.split("/")[1].replace("jpeg", "jpg");
  const data = match[2];
  const buffer = Buffer.from(data, "base64");

  // 5MB limit
  const maxBytes = 5 * 1024 * 1024;
  if (buffer.length > maxBytes) throw new Error("Ukuran foto maksimal 5MB");

  const filename = `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}

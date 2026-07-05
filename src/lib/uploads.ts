import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validateImageFile(file: File): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return "Image file is required.";
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, WebP, or GIF images are allowed.";
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return "Each image must be 5 MB or smaller.";
  }

  return null;
}

export async function saveUploadedImage(
  file: File,
  subdir = "uploads",
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const filename = `${subdir}/${Date.now()}-${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", subdir);
  await mkdir(uploadsDir, { recursive: true });
  const localFilename = path.basename(filename);
  await writeFile(path.join(uploadsDir, localFilename), buffer);

  return `/${subdir}/${localFilename}`;
}

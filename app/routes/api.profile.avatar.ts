import { db } from "~/db/db.server";
import { users } from "~/db/schema";
import { requireUser } from "~/utils/auth.server";
import { buildPublicStorageUrl, ensureFolder, uploadPrivateFile } from "~/services/storage.server";
import { eq } from "drizzle-orm";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);

  if (request.method !== "POST") {
    return Response.json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ success: false, error: "Avatar file is required." }, { status: 400 });
    }

    if (file.size <= 0) {
      return Response.json({ success: false, error: "Avatar file is empty." }, { status: 400 });
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return Response.json(
        { success: false, error: "Avatar file must be 5MB or smaller." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        { success: false, error: "Avatar must be an image file." },
        { status: 400 },
      );
    }

    const rootFolder = await ensureFolder("profile-assets");
    const userFolder = await ensureFolder(user.id, rootFolder.id);
    const uploaded = await uploadPrivateFile({
      filename: sanitizeFilename(file.name || "avatar"),
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      folderId: userFolder.id,
      file,
    });

    const fallbackUrl = buildPublicStorageUrl(uploaded.id);
    const avatarUrl = fallbackUrl ?? uploaded.id;

    await db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return Response.json({
      success: true,
      avatarUrl,
      fileId: uploaded.id,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload avatar.",
      },
      { status: 500 },
    );
  }
}

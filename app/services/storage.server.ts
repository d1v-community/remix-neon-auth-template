import { env, hasStorageConfig } from "~/utils/env.server";

type StorageSuccess<T> = T & { success?: boolean };

async function storageRequest<T>(path: string, init?: RequestInit): Promise<StorageSuccess<T>> {
  if (!hasStorageConfig()) {
    throw new Error(
      "Storage is not configured. Set STORAGE_BASE_URL and STORAGE_API_KEY. Docs: https://storage.d1v.ai/docs",
    );
  }

  const response = await fetch(`${env.STORAGE_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.STORAGE_API_KEY}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as
    | (StorageSuccess<T> & { error?: string })
    | null;

  if (!response.ok || data?.success === false) {
    throw new Error(data?.error || `Storage request failed: ${response.status}`);
  }

  if (!data) {
    throw new Error("Storage returned an empty response.");
  }

  return data;
}

export async function ensureFolder(name: string, parentId?: string | null) {
  const payload = await storageRequest<{
    folder: {
      id: string;
      name: string;
      parentId: string | null;
    };
  }>("/api/folders", {
    method: "POST",
    body: JSON.stringify({
      name,
      parentId: parentId ?? null,
    }),
  });

  return payload.folder;
}

export async function uploadPrivateFile(params: {
  filename: string;
  mimeType: string;
  size: number;
  folderId?: string;
  file: Blob;
}) {
  const init = await storageRequest<{
    sessionId: string;
    fileId: string;
    uploadUrl: string;
  }>("/api/files/upload/init", {
    method: "POST",
    body: JSON.stringify({
      filename: params.filename,
      size: params.size,
      mimeType: params.mimeType,
      visibility: "private",
      folderId: params.folderId,
    }),
  });

  const uploadResponse = await fetch(init.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": params.mimeType || "application/octet-stream",
    },
    body: params.file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Storage direct upload failed: ${uploadResponse.status}`);
  }

  const completed = await storageRequest<{
    file: {
      id: string;
      name: string;
      size: number;
      visibility: "private" | "public";
    };
  }>("/api/files/upload/complete", {
    method: "POST",
    body: JSON.stringify({
      sessionId: init.sessionId,
    }),
  });

  return completed.file;
}

export function buildPublicStorageUrl(fileId: string): string | null {
  if (!env.STORAGE_PUBLIC_BASE_URL) {
    return null;
  }

  return `${env.STORAGE_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${fileId}`;
}

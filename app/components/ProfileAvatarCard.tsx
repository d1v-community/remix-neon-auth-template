import { useRef, useState } from "react";

type ProfileAvatarCardProps = {
  user: {
    displayName?: string | null;
    username?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  storageEnabled: boolean;
  storageWarning?: string | null;
  onAvatarUpdated: (nextUrl: string) => void;
};

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileAvatarCard({
  user,
  storageEnabled,
  storageWarning,
  onAvatarUpdated,
}: ProfileAvatarCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const displayName = user?.displayName || user?.username || user?.email || "User";
  const initials = getInitials(displayName) || "U";

  if (!user) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data?.success || !data?.avatarUrl) {
        throw new Error(data?.error || "Failed to upload avatar.");
      }

      onAvatarUpdated(String(data.avatarUrl));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload avatar.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${displayName} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Profile
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {displayName}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={!storageEnabled || uploading}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {uploading ? "Uploading..." : "Upload file"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Docs: https://storage.d1v.ai/docs
          </p>
        </div>
      </div>

      {!storageEnabled && storageWarning ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {storageWarning}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </section>
  );
}

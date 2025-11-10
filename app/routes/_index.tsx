import { useLoaderData, Link } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getUserFromRequest } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Home - Remix + Neon Auth" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromRequest(request);
  return { user };
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      try { localStorage.removeItem("auth-token"); } catch {}
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full border-b">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-end">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-medium text-gray-900">hello world</h1>
      </main>

      <footer className="w-full border-t">
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm text-gray-500">
          develop with d1v
        </div>
      </footer>
    </div>
  );
}

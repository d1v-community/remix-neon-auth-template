import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { MetaFunction, LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
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

type LoaderData = SerializeFrom<typeof loader>;

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [clientUser, setClientUser] = useState<LoaderData["user"]>(user);

  useEffect(() => {
    // Ensure client reflects latest auth state (token/cookie changes)
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.authenticated) setClientUser(d.user);
        else setClientUser(null);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      try { localStorage.removeItem("auth-token"); } catch {}
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full border-b">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-end">
            {(clientUser ?? user) ? (
              <div className="relative group">
                <div className="text-sm text-gray-700 group-hover:text-gray-900 cursor-default">
                  {(clientUser ?? user)!.displayName || (clientUser ?? user)!.username || (clientUser ?? user)!.email}
                </div>
                <div className="absolute right-0 mt-2 hidden group-hover:block">
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm text-white bg-gray-800 rounded shadow hover:bg-gray-900"
                  >
                    Logout
                  </button>
                </div>
              </div>
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

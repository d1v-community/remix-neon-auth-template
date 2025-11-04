import { useLoaderData, Link } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/db/db.server";
import { sql } from "drizzle-orm";
import { getUserFromRequest } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Home - Remix + Neon Auth" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = await db.execute(sql`select version() as version`);
  const version = (response.rows?.[0]?.version as string) ?? "unknown";
  const user = await getUserFromRequest(request);

  return { version, user };
};

export default function Index() {
  const { version, user } = useLoaderData<typeof loader>();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Remix + Neon</h1>
            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Email Verification Login
            </h2>
            <p className="text-gray-600">Built with Remix, Neon, and Tailwind CSS</p>
          </div>

          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Database:</strong> {version}
              </p>
            </div>
          </div>

          <div className="mt-8">
            {user ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Welcome, {user.displayName || user.username}! 🎉
                </h3>
                <p className="text-green-800 mb-4">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-green-700">
                  You are successfully logged in via email verification.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                  You are not logged in
                </h3>
                <p className="text-yellow-800 mb-4">
                  Sign in to your account using email verification.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Verification</p>
                  <p className="text-sm text-gray-600">Secure login via email codes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">JWT Authentication</p>
                  <p className="text-sm text-gray-600">Stateless token-based auth</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Neon Database</p>
                  <p className="text-sm text-gray-600">Serverless Postgres</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tailwind CSS</p>
                  <p className="text-sm text-gray-600">Beautiful, responsive UI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

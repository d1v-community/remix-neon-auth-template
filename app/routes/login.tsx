import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUserFromRequest } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  if (user) {
    return redirect("/");
  }
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [info, setInfo] = useState("");

  // Client-side guard: if token exists and is valid, redirect
  useEffect(() => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => {
          if (d?.authenticated) {
            navigate("/", { replace: true });
          }
        })
        .catch(() => {
          // noop: 静默处理网络错误
        });
    } catch {
      // noop: 静默处理初始化错误
    }
  }, [navigate]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to send code");
      }

      // Show development code or success info
      if (data.dev && data.code) {
        setDevCode(String(data.code));
        setInfo("Development mode: your verification code is shown below.");
      } else {
        setDevCode(null);
        setInfo("Verification code sent. Please check your email.");
      }

      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Invalid code");
      }

      localStorage.setItem("auth-token", data.token);

      // Attempt to request Storage Access for third-party iframes (Safari/Chrome SAA)
      try {
        if (typeof document.hasStorageAccess === "function") {
          const hasAccess = await document.hasStorageAccess();
          if (!hasAccess && typeof document.requestStorageAccess === "function") {
            await document.requestStorageAccess();
          }
        }
      } catch {
        // ignore SAA failures
      }

      // Sync server cookie from Authorization if cookies were previously blocked
      try {
        await fetch("/api/auth/sync-cookie", { method: "POST" });
      } catch {
        // noop: 静默处理同步 cookie 失败
      }

      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
    setInfo("");
    setDevCode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We&apos;ve sent a verification code to
                </p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              {info && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                  {info}
                </div>
              )}

              {devCode && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg">
                  <p className="mb-1 font-medium">Development mode</p>
                  <p>
                    Your verification code is: <span className="font-mono font-semibold">{devCode}</span>
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendCode}
                className="w-full text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Didn&apos;t receive code? Resend
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Secure email verification login</p>
          </div>
        </div>
      </div>
    </div>
  );
}

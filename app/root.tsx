import { Links, Meta, Outlet, Scripts, ScrollRestoration, Link, isRouteErrorResponse, useRouteError, useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import tailwindStyles from "./tailwind.css?url";

export const links = () => [
  { rel: "stylesheet", href: tailwindStyles },
];

export const meta = () => {
  return [
    { title: "replace with your app name" },
    { name: "description", content: "Email verification login with Remix and Neon" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const revalidator = useRevalidator();

  // If SSR didn't include auth cookie (e.g., iframe 3PC blocked)
  // but localStorage has a token, refresh route loaders with Authorization.
  useEffect(() => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      fetch("/api/auth/me")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d && d.authenticated) {
            revalidator.revalidate();
          }
        })
        .catch(() => {});
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
          <title>{`${error.status} ${error.statusText}`}</title>
        </head>
        <body>
          <h1>{error.status} {error.statusText}</h1>
          <p>{error.data as any}</p>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>App Error</title>
      </head>
      <body>
        <h1>Something went wrong</h1>
        <pre>{String(error)}</pre>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

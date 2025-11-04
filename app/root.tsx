import { Links, Meta, Outlet, Scripts, ScrollRestoration, Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import tailwindStyles from "./tailwind.css?url";

export const links = () => [
  { rel: "stylesheet", href: tailwindStyles },
];

export const meta = () => {
  return [
    { title: "Remix + Neon Auth" },
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

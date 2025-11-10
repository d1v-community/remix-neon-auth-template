import type { LoaderFunctionArgs } from "@remix-run/node";

// Generate a minimal OpenAPI-style document by scanning API route modules.
// Convention: any file matching `app/routes/api.*.ts` is treated as an API route.
// - If it exports `loader`, the route supports GET.
// - If it exports `action`, the route supports POST.
// Path mapping: `api.auth.verify-login.ts` -> `/api/auth/verify-login`

export async function loader(_args: LoaderFunctionArgs) {
  // Note: import.meta.glob is resolved at build time by Vite/Remix.
  const modules = import.meta.glob("./api.*.ts", { eager: true }) as Record<string, any>;

  const paths: Record<string, any> = {};

  for (const [file, mod] of Object.entries(modules)) {
    // Skip this file itself and any non-API helpers accidentally matched
    if (file.includes("openapi")) continue;

    // Derive the HTTP methods from exported handlers
    const methods: Record<string, any> = {};
    if (mod && typeof mod.loader === "function") methods["get"] = { summary: "GET" };
    if (mod && typeof mod.action === "function") methods["post"] = { summary: "POST" };
    if (Object.keys(methods).length === 0) continue;

    // Derive the route path from the file name
    // e.g., "./api.auth.verify-login.ts" -> "/api/auth/verify-login"
    const name = file.replace(/^\.\//, "").replace(/\.tsx?$/, "");
    const routePath = "/" + name.replace(/\./g, "/");

    paths[routePath] = methods;
  }

  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Remix API",
      version: "1.0.0",
      description: "Auto-generated from file-based routes",
    },
    paths,
  };

  return Response.json(spec, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  // Return a 204 No Content response for favicon requests
  // This prevents the "No route matches" error
  return new Response(null, { status: 204 });
}

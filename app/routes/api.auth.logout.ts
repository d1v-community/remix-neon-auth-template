import type { ActionFunctionArgs } from "@remix-run/node";
import { createLogoutHeaders } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const headers = createLogoutHeaders();

  return Response.json(
    { success: true, message: "Logged out successfully" },
    { status: 200, headers }
  );
}

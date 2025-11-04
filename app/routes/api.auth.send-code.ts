import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { generateVerificationCode, sendVerificationEmail } from "~/services/verification.server";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    const code = await generateVerificationCode(email);
    await sendVerificationEmail(email, code);

    return json(
      { success: true, message: "Verification code sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send code error:", error);

    if (error instanceof z.ZodError) {
      return json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    return json(
      { success: false, error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

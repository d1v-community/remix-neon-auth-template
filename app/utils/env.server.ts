import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url().default("http://localhost:5173"),
  LOG_LEVEL: z.string().default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Only error out if DATABASE_URL is missing; others can be optional based on feature usage
  const issues = parsed.error.issues;
  const missingDb = issues.find((i) => i.path[0] === "DATABASE_URL");
  if (missingDb) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("DATABASE_URL is required");
  }
}

export const env = {
  NODE_ENV: parsed.success ? parsed.data.NODE_ENV : (process.env.NODE_ENV as any) ?? "development",
  DATABASE_URL: process.env.DATABASE_URL!,
  APP_URL: parsed.success ? parsed.data.APP_URL : process.env.APP_URL ?? "http://localhost:5173",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
};

export const isProd = env.NODE_ENV === "production";

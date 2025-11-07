// Local structural type to avoid requiring drizzle-kit types during tsc
type DrizzleConfig = {
  schema: string;
  out?: string;
  driver?: string;
  dbCredentials?: any;
};

export default {
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies DrizzleConfig;

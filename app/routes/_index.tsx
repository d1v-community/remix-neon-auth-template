import { useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/db/db.server";
import { sql } from "drizzle-orm";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = await db.execute(sql`select version() as version`);
  const version = (response.rows?.[0]?.version as string) ?? "unknown";
  return { version };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{ padding: 24 }}>
      <h1>Remix + Neon</h1>
      <p>Postgres: {data.version}</p>
      {/* Authentication UI removed */}
    </div>
  );
}

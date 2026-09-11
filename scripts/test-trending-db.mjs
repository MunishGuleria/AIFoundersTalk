import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

function getDbUrl() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      const val = trimmed.slice("DATABASE_URL=".length).trim();
      return val.replace(/^["']|["']$/g, "").trim();
    }
  }
  return null;
}

async function checkTrending() {
  const dbUrl = getDbUrl();
  if (!dbUrl) {
    console.error("No DATABASE_URL found");
    return;
  }

  const sql = neon(dbUrl);

  try {
    console.log("=== Checking Neon trending_items ===");
    const allRows = await sql`
      SELECT source, count(*) as count
      FROM trending_items
      GROUP BY source
    `;
    console.log("Rows by source:", allRows);

    const phRows = await sql`
      SELECT source, external_id, name, url, score, fetched_at
      FROM trending_items
      WHERE source = 'Product Hunt'
      ORDER BY fetched_at DESC
      LIMIT 5;
    `;
    console.log("Sample Product Hunt rows:", phRows);

    const hnRows = await sql`
      SELECT source, external_id, name, url, score, fetched_at
      FROM trending_items
      WHERE source = 'Hacker News'
      ORDER BY fetched_at DESC
      LIMIT 5;
    `;
    console.log("Sample Hacker News rows:", hnRows);
  } catch (err) {
    console.error("Database query error:", err);
  }
}

checkTrending();

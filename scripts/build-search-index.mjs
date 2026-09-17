import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_PATH = path.join(process.cwd(), "public", "search-index.json");

const types = [
  { dir: "articles", type: "article" },
  { dir: "interviews", type: "interview" },
  { dir: "resources", type: "resource" },
];

const items = [];

for (const { dir, type } of types) {
  const dirPath = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".mdx"));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    items.push({
      title: data.title || "Untitled",
      slug: file.replace(/\.mdx$/, ""),
      pillar: data.pillar || "",
      excerpt: data.excerpt || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      type,
      publishedAt: data.publishedAt || "",
    });
  }
}

// Sort by publishedAt descending
items.sort((a, b) => {
  if (a.publishedAt < b.publishedAt) return 1;
  if (a.publishedAt > b.publishedAt) return -1;
  return 0;
});

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(items, null, 2) + "\n", "utf8");
console.log(`[build-search-index] Generated ${items.length} items at ${OUTPUT_PATH}`);

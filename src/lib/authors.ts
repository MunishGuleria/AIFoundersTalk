import fs from "fs";
import path from "path";

export interface Author {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  links: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

let authorsCache: Record<string, Author> | null = null;

export function getAuthors(): Record<string, Author> {
  if (authorsCache) return authorsCache;

  const filePath = path.join(process.cwd(), "content", "authors", "authors.json");
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  authorsCache = JSON.parse(raw);
  return authorsCache!;
}

export function getAuthor(id: string): Author | null {
  const authors = getAuthors();
  return authors[id] || null;
}

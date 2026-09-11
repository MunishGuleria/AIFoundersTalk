import { TrendingItem } from "./fetchHackerNews";

/**
 * ============================================================================
 * Product Hunt API Sourcing & Normalization Layer (v2 GraphQL)
 * ============================================================================
 * Endpoint: https://api.producthunt.com/v2/api/graphql
 * Authentication: Bearer token (Developer Token or OAuth Client Credentials Token)
 *
 * COMMERCIAL-USE / COMPLIANCE NOTICE:
 * Product Hunt API v2 requires an active developer token or OAuth application.
 * In accordance with Product Hunt API Terms of Service, all items displayed in
 * AI Founders Talk maintain direct source links back to their canonical Product
 * Hunt launch URLs. Usage rights and commercial permissions must be reviewed
 * before deploying for commercial production operations.
 * ============================================================================
 */

export async function fetchProductHuntTrending(limit = 20): Promise<TrendingItem[]> {
  const rawToken = process.env.PRODUCT_HUNT_TOKEN;
  const token = rawToken ? rawToken.replace(/^["']|["']$/g, "").trim() : "";

  if (!token || token === "your-product-hunt-developer-token" || token.includes("example")) {
    console.warn("[fetchProductHunt] Valid PRODUCT_HUNT_TOKEN not configured. Skipping Product Hunt sync.");
    return [];
  }

  // Primary Query: Filter by artificial-intelligence topic
  const primaryQuery = `
    query GetTrendingAIPosts($first: Int!) {
      posts(order: VOTES, topic: "artificial-intelligence", first: $first) {
        edges {
          node {
            id
            name
            tagline
            url
            votesCount
            topics(first: 3) {
              edges {
                node {
                  name
                }
              }
            }
            createdAt
          }
        }
      }
    }
  `;

  // Fallback Query: General top posts if topic slug is not supported by account scope
  const fallbackQuery = `
    query GetTopPosts($first: Int!) {
      posts(order: VOTES, first: $first) {
        edges {
          node {
            id
            name
            tagline
            url
            votesCount
            topics(first: 3) {
              edges {
                node {
                  name
                }
              }
            }
            createdAt
          }
        }
      }
    }
  `;

  try {
    let res = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "AIFoundersTalk/1.0",
      },
      body: JSON.stringify({
        query: primaryQuery,
        variables: { first: limit },
      }),
      next: { revalidate: 3600 },
    });

    let data = await res.json().catch(() => null);

    // If primary query failed with GraphQL errors, try fallback general query
    if (!res.ok || data?.errors) {
      if (res.status === 401 || res.status === 403) {
        const errDesc = data?.errors?.[0]?.error_description || data?.errors?.[0]?.message || "Unauthorized";
        console.warn(`[fetchProductHunt] Authorization failed (HTTP ${res.status}): ${errDesc}`);
        return [];
      }

      // Try fallback query
      res = await fetch("https://api.producthunt.com/v2/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "User-Agent": "AIFoundersTalk/1.0",
        },
        body: JSON.stringify({
          query: fallbackQuery,
          variables: { first: limit },
        }),
        next: { revalidate: 3600 },
      });

      data = await res.json().catch(() => null);
    }

    if (!res.ok || !data?.data?.posts?.edges) {
      if (data?.errors) {
        console.warn("[fetchProductHunt] GraphQL errors returned:", data.errors[0]?.message || data.errors);
      }
      return [];
    }

    const edges = data.data.posts.edges;

    return edges.map((edge: {
      node: {
        id: string | number;
        name: string;
        tagline?: string;
        url: string;
        votesCount?: number;
        topics?: { edges: Array<{ node: { name: string } }> };
        createdAt?: string;
      };
    }) => {
      const node = edge.node;
      const primaryTopic = node.topics?.edges?.[0]?.node?.name || "AI Launch";

      return {
        source: "Product Hunt" as const,
        external_id: String(node.id),
        name: node.name,
        url: node.url, // Canonical Product Hunt launch URL
        tagline: node.tagline || "",
        category: primaryTopic,
        score: node.votesCount || 0,
        fetched_at: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error("[fetchProductHunt] Network or unexpected error during Product Hunt fetch:", err instanceof Error ? err.message : String(err));
    return [];
  }
}

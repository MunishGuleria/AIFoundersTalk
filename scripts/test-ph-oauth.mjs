import fs from "fs";
import path from "path";

function getEnvVars() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = fs.readFileSync(envPath, "utf-8");
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      vars[key] = val;
    }
  }
  return vars;
}

async function testOAuthExchange() {
  const env = getEnvVars();
  const token = env["PRODUCT_HUNT_TOKEN"];
  const clientId = env["PRODUCT_HUNT_CLIENT_ID"] || env["PH_CLIENT_ID"];
  const clientSecret = env["PRODUCT_HUNT_CLIENT_SECRET"] || env["PH_CLIENT_SECRET"];

  console.log("Token length:", token ? token.length : 0);
  console.log("Client ID configured:", Boolean(clientId));
  console.log("Client Secret configured:", Boolean(clientSecret));

  // Test 1: If client_id and client_secret are provided
  if (clientId && clientSecret) {
    try {
      const res = await fetch("https://api.producthunt.com/v2/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
      });

      console.log("Client Credentials Exchange Status:", res.status);
      const data = await res.json();
      console.log("Client Credentials Result:", data.access_token ? "SUCCESS: access_token received" : data);
    } catch (err) {
      console.error("Exchange error:", err.message);
    }
  }
}

testOAuthExchange();

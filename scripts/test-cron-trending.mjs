async function testCron() {
  console.log("=== Testing /api/cron/trending (Run 1) ===");
  try {
    const res1 = await fetch("http://localhost:3000/api/cron/trending");
    console.log("Status:", res1.status);
    const json1 = await res1.json();
    console.log("Response 1:", JSON.stringify(json1, null, 2));
  } catch (err) {
    console.error("Run 1 error:", err.message);
  }

  console.log("\n=== Testing /api/cron/trending (Run 2 - Deduplication Check) ===");
  try {
    const res2 = await fetch("http://localhost:3000/api/cron/trending");
    console.log("Status:", res2.status);
    const json2 = await res2.json();
    console.log("Response 2:", JSON.stringify(json2, null, 2));
  } catch (err) {
    console.error("Run 2 error:", err.message);
  }
}

testCron();

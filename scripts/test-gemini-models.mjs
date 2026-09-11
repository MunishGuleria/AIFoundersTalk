const apiKey = "AQ.Ab8RN6KlM1Ecn2eOYotygZrQX8gve0Q-BrxmMgVQin0TnmFTXg";

async function testModels() {
  const models = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-flash",
    "gemini-3.6-flash"
  ];

  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello, reply with 1 word." }] }]
        })
      });
      console.log(`Model ${m}: HTTP ${res.status}`);
      if (res.ok) {
        const d = await res.json();
        console.log(`  -> Response: ${d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
      } else {
        const t = await res.text();
        console.log(`  -> Error: ${t.slice(0, 150)}`);
      }
    } catch (e) {
      console.log(`Model ${m} failed: ${e.message}`);
    }
  }
}

testModels();

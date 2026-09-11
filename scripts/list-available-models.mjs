const apiKey = "AQ.Ab8RN6KlM1Ecn2eOYotygZrQX8gve0Q-BrxmMgVQin0TnmFTXg";

async function listModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const d = await res.json();
  console.log("Models:", d.models?.map(m => m.name));
}

listModels();

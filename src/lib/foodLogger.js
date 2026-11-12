/**
 * Mock / LLM API placeholder to parse unstructured food descriptions in Hebrew/English
 * and estimate Calories and Protein grams.
 * Can be connected to a real backend endpoint or LLM API (e.g., Gemini) in the future.
 */
export async function parseCustomFood(text) {
  // Simulate network latency of 300ms
  await new Promise((resolve) => setTimeout(resolve, 300));

  const trimmed = text.trim().toLowerCase();
  if (!trimmed) {
    return { name: "ארוחה מותאמת אישית", calories: 250, protein: 15 };
  }

  // Check for explicit numbers if user typed something like "סלט 350 קלוריות 25 חלבון"
  const calMatch = trimmed.match(/(\d+)\s*(קקל|קלוריות|kcal|cal)/i);
  const protMatch = trimmed.match(
    /(\d+)\s*(גרם\s*חלבון|חלבון|g\s*protein|protein)/i,
  );

  let estimatedCalories = calMatch ? parseInt(calMatch[1], 10) : 0;
  let estimatedProtein = protMatch ? parseInt(protMatch[1], 10) : 0;

  // Keyword dictionary for food items in Hebrew
  const foodKeywords = [
    { key: "ביצה", cals: 75, prot: 7 },
    { key: "ביצים", cals: 150, prot: 14 },
    { key: "חביתה", cals: 180, prot: 14 },
    { key: "טונה", cals: 130, prot: 26 },
    { key: "סלמון", cals: 250, prot: 28 },
    { key: "טופו", cals: 160, prot: 18 },
    { key: "יוגורט", cals: 120, prot: 15 },
    { key: "קוטג", cals: 140, prot: 18 },
    { key: "גבינה צהובה", cals: 80, prot: 7 },
    { key: "מוצרלה", cals: 90, prot: 8 },
    { key: "לחם", cals: 80, prot: 3 },
    { key: "לחמניה", cals: 160, prot: 6 },
    { key: "לחמנייה", cals: 160, prot: 6 },
    { key: "צנים", cals: 80, prot: 3 },
    { key: "אורז", cals: 140, prot: 3 },
    { key: "קינואה", cals: 130, prot: 5 },
    { key: "בטטה", cals: 110, prot: 2 },
    { key: "תפוח אדמה", cals: 110, prot: 3 },
    { key: "סלט", cals: 90, prot: 2 },
    { key: "ירקות", cals: 60, prot: 2 },
    { key: "שוקולד", cals: 110, prot: 1 },
    { key: "עוגה", cals: 180, prot: 3 },
    { key: "עוגיה", cals: 90, prot: 2 },
    { key: "עוגייה", cals: 90, prot: 2 },
    { key: "גלידה", cals: 160, prot: 15 },
    { key: "שייק", cals: 200, prot: 25 },
    { key: "קפה", cals: 45, prot: 3 },
    { key: "חלב", cals: 60, prot: 3 },
    { key: "חטיף", cals: 130, prot: 2 },
  ];

  if (!estimatedCalories || !estimatedProtein) {
    let matchedCals = 0;
    let matchedProt = 0;
    let hits = 0;

    foodKeywords.forEach((item) => {
      if (trimmed.includes(item.key)) {
        matchedCals += item.cals;
        matchedProt += item.prot;
        hits += 1;
      }
    });

    if (hits > 0) {
      if (!estimatedCalories) estimatedCalories = matchedCals;
      if (!estimatedProtein) estimatedProtein = matchedProt;
    } else {
      // Default heuristic estimate based on word length / moderate healthy meal
      estimatedCalories = estimatedCalories || 280;
      estimatedProtein = estimatedProtein || 18;
    }
  }

  return {
    name: text.trim(),
    calories: Math.max(20, estimatedCalories),
    protein: Math.max(1, estimatedProtein),
  };
}

// Smart nutrition parser: Gemini AI (when API key is set) -> Open Food Facts API -> Hebrew local fallback.

const LOCAL_FOODS = [
  { keys: ["ביצה קשה", "ביצת עין", "ביצה"], cals: 75, prot: 6.5, unit: "יחידה" },
  { keys: ["חביתה", "מקושקשת", "אומלט"], cals: 180, prot: 13, unit: "מנה (2 ביצים)" },
  { keys: ["טונה"], cals: 130, prot: 26, unit: "קופסה" },
  { keys: ["סלמון"], cals: 260, prot: 28, unit: "מנה (150ג׳)" },
  { keys: ["אמנון", "דג", "חזה עוף", "שניצל"], cals: 220, prot: 28, unit: "מנה" },
  { keys: ["טופו"], cals: 160, prot: 17, unit: "מנה (150ג׳)" },
  { keys: ["יוגורט פרו", "יוגורט חלבון", "דנונה פרו", "פרו 20"], cals: 130, prot: 20, unit: "גביע" },
  { keys: ["יוגורט"], cals: 110, prot: 10, unit: "גביע" },
  { keys: ["קוטג"], cals: 140, prot: 18, unit: "חצי גביע" },
  { keys: ["גבינה צהובה", "צהובה"], cals: 85, prot: 7, unit: "פרוסה" },
  { keys: ["גבינת עיזים", "לבנה", "גבינה לבנה", "בולגרית", "פטה"], cals: 70, prot: 4, unit: "כף" },
  { keys: ["מוצרלה"], cals: 90, prot: 8, unit: "מנה" },
  { keys: ["לחם מחמצת", "לחם שיפון", "לחם מלא", "לחם", "פרוסת לחם", "צנים", "טוסט"], cals: 80, prot: 3, unit: "פרוסה" },
  { keys: ["לחמניה", "לחמנייה", "פיתה", "בייגל"], cals: 170, prot: 6, unit: "יחידה" },
  { keys: ["פריכית", "קרקר"], cals: 35, prot: 1, unit: "יחידה" },
  { keys: ["אורז", "פסטה", "פתיתים", "קוסקוס"], cals: 150, prot: 3.5, unit: "כוס מבושל" },
  { keys: ["קינואה", "עדשים", "חומוס גרגרים"], cals: 150, prot: 7, unit: "כוס מבושל" },
  { keys: ["בטטה", "תפוח אדמה"], cals: 115, prot: 2.5, unit: "יחידה בינונית" },
  { keys: ["שיבולת שועל", "דייסה"], cals: 150, prot: 5, unit: "חצי כוס" },
  { keys: ["סלט", "ירקות"], cals: 80, prot: 2, unit: "קערה" },
  { keys: ["אבוקדו"], cals: 120, prot: 1.5, unit: "חצי אבוקדו" },
  { keys: ["טחינה", "חומוס", "שמן זית", "חמאת בוטנים"], cals: 90, prot: 2.5, unit: "כף" },
  { keys: ["שקדים", "אגוזים", "קשיו", "אגוזי מלך"], cals: 160, prot: 5, unit: "חופן (25ג׳)" },
  { keys: ["תפוח", "בננה", "תמר", "פרי", "תותים", "ענבים"], cals: 85, prot: 1, unit: "מנה" },
  { keys: ["שוקולד", "חטיף", "וופל"], cals: 130, prot: 2, unit: "יחידה" },
  { keys: ["עוגה", "עוגיה", "עוגייה", "מאפה"], cals: 170, prot: 3, unit: "מנה" },
  { keys: ["גלידה"], cals: 160, prot: 4, unit: "מנה" },
  { keys: ["שייק חלבון", "שייק"], cals: 190, prot: 25, unit: "כוס" },
  { keys: ["קפה הפוך", "לאטה", "קפה", "נס קפה"], cals: 55, prot: 3, unit: "כוס" },
  { keys: ["חלב"], cals: 60, prot: 3.5, unit: "חצי כוס" },
];

function extractQuantity(chunk) {
  const numMatch = chunk.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) return Math.min(20, Math.max(0.25, parseFloat(numMatch[1])));
  if (/חצי/.test(chunk)) return 0.5;
  if (/רבע/.test(chunk)) return 0.25;
  if (/(שתי|שני|זוג)/.test(chunk)) return 2;
  if (/שלוש/.test(chunk)) return 3;
  if (/ארבע/.test(chunk)) return 4;
  return 1;
}

async function queryGeminiAI(text, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const prompt = `אתה תזונאי קליני מדויק. חשב קלוריות (kcal) וחלבון (גרם) עבור תיאור הארוחה הבא בעברית/אנגלית.
החזר אך ורק JSON תקני במבנה:
{"name":"שם קצר ונקי של הארוחה","calories":number,"protein":number,"breakdown":"פירוט קצר של הרכיבים"}
תיאור הארוחה: "${text.trim()}"`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty Gemini response");

  const parsed = JSON.parse(rawText);
  return {
    name: parsed.name || text.trim(),
    calories: Math.max(10, Math.round(Number(parsed.calories) || 0)),
    protein: Math.max(0, Math.round(Number(parsed.protein) || 0)),
    breakdown: parsed.breakdown || "",
    source: "ai",
  };
}

async function queryOpenFoodFacts(term) {
  const clean = term
    .replace(/(\d+(?:\.\d+)?|כף|כפות|כוס|כוסות|פרוסה|פרוסות|גרם|ג׳|יחידה|יחידות|קופסה|גביע|חצי|שני|שתי|עם|של)/g, " ")
    .trim();
  if (clean.length < 2) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(clean)}&search_simple=1&action=process&json=1&page_size=3&fields=product_name,nutriments`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const product = (data.products || []).find(
      (p) => p.nutriments && p.nutriments["energy-kcal_100g"] > 0,
    );
    if (!product) return null;

    const kcal100 = Number(product.nutriments["energy-kcal_100g"]) || 0;
    const prot100 = Number(product.nutriments["proteins_100g"]) || 0;
    // Assume ~100g standard serving if no explicit grams given
    return {
      name: product.product_name || clean,
      cals: Math.round(kcal100),
      prot: Math.round(prot100),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function parseCustomFood(text, geminiApiKey = "") {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      name: "ארוחה מותאמת אישית",
      calories: 250,
      protein: 15,
      breakdown: "",
      source: "local",
    };
  }

  // 1. Try Gemini AI if user provided an API key
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      return await queryGeminiAI(trimmed, geminiApiKey);
    } catch {
      // Fall through cleanly to Open Food Facts + local parser
    }
  }

  // 2. Explicit numbers override if user wrote e.g. "סלט 350 קק״ל 25 חלבון"
  const calMatch = trimmed.match(/(\d+)\s*(קק״ל|קקל|קלוריות|kcal|cal)/i);
  const protMatch = trimmed.match(
    /(\d+)\s*(גרם\s*חלבון|ג׳\s*חלבון|חלבון|g\s*protein|protein)/i,
  );
  if (calMatch && protMatch) {
    return {
      name: trimmed,
      calories: parseInt(calMatch[1], 10),
      protein: parseInt(protMatch[1], 10),
      breakdown: "חישוב לפי הערכים שהוזנו",
      source: "local",
    };
  }

  // 3. Split sentence into food chunks & match local dictionary + Open Food Facts DB
  const chunks = trimmed
    .split(/[,+\n]|(?:\s+ו(?=[א-ת]))/)
    .map((c) => c.trim())
    .filter(Boolean);

  let totalCals = 0;
  let totalProt = 0;
  let usedDb = false;
  const details = [];

  for (const chunk of chunks) {
    const lower = chunk.toLowerCase();
    const qty = extractQuantity(lower);
    const gramsMatch = lower.match(/(\d+)\s*(?:גרם|ג׳|g\b)/);

    const localHit = LOCAL_FOODS.find((f) =>
      f.keys.some((k) => lower.includes(k)),
    );

    if (localHit) {
      const factor = gramsMatch ? parseInt(gramsMatch[1], 10) / 100 : qty;
      const c = Math.round(localHit.cals * factor);
      const p = Math.round(localHit.prot * factor);
      totalCals += c;
      totalProt += p;
      details.push(`${chunk} (~${c} קק״ל, ${p}ג׳ חלבון)`);
    } else {
      const dbHit = await queryOpenFoodFacts(lower);
      if (dbHit) {
        usedDb = true;
        const factor = gramsMatch ? parseInt(gramsMatch[1], 10) / 100 : qty;
        const c = Math.round(dbHit.cals * factor);
        const p = Math.round(dbHit.prot * factor);
        totalCals += c;
        totalProt += p;
        details.push(`${dbHit.name} (~${c} קק״ל, ${p}ג׳ חלבון)`);
      }
    }
  }

  if (totalCals === 0) {
    totalCals = calMatch ? parseInt(calMatch[1], 10) : 260;
    totalProt = protMatch ? parseInt(protMatch[1], 10) : 16;
  } else {
    if (calMatch) totalCals = parseInt(calMatch[1], 10);
    if (protMatch) totalProt = parseInt(protMatch[1], 10);
  }

  return {
    name: trimmed,
    calories: Math.max(20, totalCals),
    protein: Math.max(1, totalProt),
    breakdown: details.join(" • "),
    source: usedDb ? "db" : "local",
  };
}

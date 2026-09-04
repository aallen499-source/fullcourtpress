import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// The landing page is a static file, so its camp and questionnaire counts used
// to be hand-edited every time data was added — and drifted every time someone
// forgot. The file now carries {{CAMP_COUNT}} / {{QUESTIONNAIRE_COUNT}}
// placeholders that get filled from the database at serve time, so the numbers
// can't go stale again.
//
// Revalidated hourly rather than per-request: these are marketing figures, not
// live inventory, and the homepage shouldn't wait on a query.
export const revalidate = 3600;

const FALLBACK = { camps: "230", questionnaires: "560", campSports: "9" };

async function counts() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const [{ count: camps }, { count: approved }, { data: sportRows }] = await Promise.all([
      supabase.from("camps").select("id", { count: "exact", head: true }),
      supabase
        .from("questionnaire_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      // "7 sports" was hardcoded here and had drifted to 9 as camps were added
      // for lacrosse and dance. A number on the homepage that nobody owns is a
      // number that goes stale, so this counts the real thing. The sport column
      // stores "basketball-men" style slugs; the sport is the part before the
      // dash, so men's and women's camps aren't counted as two sports.
      supabase.from("camps").select("sport"),
    ]);
    const campSports = new Set(
      (sportRows || []).map((r) => String(r.sport || "").split("-")[0]).filter(Boolean)
    ).size;
    const { QUESTIONNAIRES } = await import("@/lib/questionnaires");
    return {
      camps: camps ? String(camps) : FALLBACK.camps,
      // Curated file plus anything approved into the shared list — the same
      // total the in-app finder shows.
      questionnaires: String(QUESTIONNAIRES.length + (approved || 0)),
      campSports: campSports ? String(campSports) : FALLBACK.campSports,
    };
  } catch {
    // A homepage with slightly stale numbers beats a homepage that 500s.
    return FALLBACK;
  }
}

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "recruitgrid-app.html");
  const [html, n] = await Promise.all([readFile(filePath, "utf-8"), counts()]);
  const filled = html
    .replaceAll("{{CAMP_COUNT}}", n.camps)
    .replaceAll("{{QUESTIONNAIRE_COUNT}}", n.questionnaires)
    .replaceAll("{{CAMP_SPORTS}}", n.campSports);
  return new Response(filled, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

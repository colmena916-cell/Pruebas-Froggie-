// ============================================================
//  supabase.js  —  cliente único para toda la app
//  Importa este archivo en cualquier página que lo necesite.
//  NUNCA vuelvas a poner SUPABASE_URL o SUPABASE_KEY en otro lugar.
// ============================================================

const SUPABASE_URL = "https://asjrvkzigdtcwweounjp.supabase.co";
const SUPABASE_KEY = "sb_publishable_iV0aCpKClYk4B5WUVWJxtA_NYfh_uen";

export const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


export function imgUrl(url) {
    return url || "";
}

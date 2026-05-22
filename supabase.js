// ============================================================
//  supabase.js  —  cliente único para toda la app
//  Importa este archivo en cualquier página que lo necesite.
//  NUNCA vuelvas a poner SUPABASE_URL o SUPABASE_KEY en otro lugar.
// ============================================================

const SUPABASE_URL = "https://jqfbrrbewdtmhjsaifhi.supabase.co";
const SUPABASE_KEY = "sb_publishable_000Yr23ozkpp-ovO2a4S5Q_tTnj8bL8";

export const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

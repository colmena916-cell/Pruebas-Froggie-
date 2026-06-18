// ============================================================
//  supabase.js  —  cliente único para toda la app
//  Importa este archivo en cualquier página que lo necesite.
//  NUNCA vuelvas a poner SUPABASE_URL o SUPABASE_KEY en otro lugar.
// ============================================================

const SUPABASE_URL = "https://asjrvkzigdtcwweounjp.supabase.co";
const SUPABASE_KEY = "sb_publishable_sb_publishable_iV0aCpKClYk4B5WUVWJxtA_NYfh_uen";

export const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Proxy de imágenes via Cloudflare Worker ──────────────────
// Las imágenes se cachean 30 días en Cloudflare.
// Supabase solo entrega cada imagen UNA vez, no una por usuario.
const WORKER_URL  = "https://froggie-img.colmena916.workers.dev";
const STORAGE_BASE = "https://jqfbrrbewdtmhjsaifhi.supabase.co/storage/v1/object/public";

export function imgUrl(url) {
    if (!url) return "";
    if (!url.startsWith(STORAGE_BASE)) return url;
    return url.replace(STORAGE_BASE, `${WORKER_URL}/img`);
}

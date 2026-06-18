// ============================================================
//  pages/store.js  —  Tienda de cosméticos (gastar monedas 🪷)
//  Muestra el catálogo desde la base, agrupado por tipo.
//  La COMPRA real se conecta en el siguiente paso (función segura
//  en la base que descuenta monedas y agrega el cosmético al clóset).
// ============================================================

import { _supabase, imgUrl } from '../supabase.js';
import { Auth }   from '../auth.js';
import { Router } from '../router.js';

// Nombres bonitos y orden de las categorías
const TYPE_LABELS = { skin: 'Skins', frame: 'Marcos', cover: 'Fondos', font: 'Tipografías' };
const TYPE_ORDER  = ['skin', 'frame', 'cover', 'font'];
const TYPE_ICON   = { skin: '🎨', frame: '🖼️', cover: '🏞️', font: '🔤' };

export function render() {
    return `
    <style>
        .store-wrap { max-width: 760px; margin: 0 auto; padding: 16px 14px 90px; }
        .store-top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:6px; }
        .store-back { background:none; border:none; cursor:pointer; color:var(--text-dark); display:flex; align-items:center; gap:4px; font-size:0.95rem; opacity:0.75; padding:0; font-family:inherit; }
        .store-back svg { width:22px; height:22px; fill:currentColor; }
        .store-coins { display:flex; align-items:center; gap:6px; font-weight:700; background:var(--bg-accent); border:1px solid rgba(62,83,43,0.12); border-radius:20px; padding:6px 14px; color:var(--text-dark); }
        .store-coins .lotus { font-size:1.2rem; line-height:1; }
        .store-title { font-family: var(--font-serif); font-size:1.6rem; font-weight:700; color:var(--text-dark); display:flex; align-items:center; gap:8px; margin:8px 0 4px; }
        .store-sub { opacity:0.6; font-size:0.9rem; margin-bottom:10px; }
        .store-section-title { font-family: var(--font-serif); font-size:1.15rem; font-weight:600; color:var(--text-dark); margin:24px 0 12px; opacity:0.9; }
        .store-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:14px; }
        .store-card { background:var(--bg-accent); border:1px solid rgba(62,83,43,0.12); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:10px; }
        .store-card-preview { width:100%; aspect-ratio:1/1; border-radius:10px; background:rgba(62,83,43,0.06); display:flex; align-items:center; justify-content:center; font-size:2rem; overflow:hidden; background-size:cover; background-position:center; }
        .store-card-name { font-family: var(--font-serif); font-weight:600; color:var(--text-dark); font-size:1rem; }
        .store-card-price { display:flex; align-items:center; gap:5px; font-weight:700; font-size:0.95rem; color:var(--text-dark); }
        .store-buy-btn { margin-top:auto; border:none; border-radius:10px; padding:9px; cursor:pointer; font-family:inherit; font-weight:600; background:var(--btn-color); color:#fff; transition:filter 0.15s, transform 0.1s; }
        .store-buy-btn:hover  { filter:brightness(1.06); }
        .store-buy-btn:active { transform:scale(0.97); }
        .store-buy-btn.owned  { background:transparent; color:var(--text-dark); border:1px solid rgba(62,83,43,0.25); cursor:default; opacity:0.65; }
        .store-empty { opacity:0.6; padding:30px 0; text-align:center; }
    </style>
    <main class="store-wrap">
        <div class="store-top">
            <button class="store-back" id="storeBack">
                <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Back
            </button>
            <div class="store-coins"><span class="lotus">🪷</span><span id="storeCoins">0</span></div>
        </div>
        <div class="store-title">🪷 Store</div>
        <p class="store-sub">Unlock skins, frames and more with your coins.</p>
        <div id="storeBody"><p class="store-empty">Loading the shelves…</p></div>
    </main>
    `;
}

export async function init() {
    if (!Auth.requireSession()) return;

    document.getElementById('storeBack').onclick = () => Router.go('dashboard');
    // Mostrar las monedas que ya tenemos en memoria (rápido)
    document.getElementById('storeCoins').textContent = (Auth.coins ?? 0).toLocaleString();

    const body = document.getElementById('storeBody');

    try {
        // En paralelo: catálogo, lo que el usuario YA posee, y su saldo real.
        const [catRes, ownedRes, walletRes] = await Promise.all([
            _supabase.from('cosmetics').select('*').eq('is_for_sale', true).order('type'),
            _supabase.from('user_cosmetics').select('cosmetic_id').eq('user_id', Auth.userId),
            _supabase.from('wallets').select('coins').eq('user_id', Auth.userId).maybeSingle()
        ]);

        // Saldo real (y de paso lo sincronizamos en memoria)
        const coins = walletRes.data?.coins ?? Auth.coins ?? 0;
        Auth.coins = coins;
        document.getElementById('storeCoins').textContent = coins.toLocaleString();

        const catalog = catRes.data || [];
        const owned   = new Set((ownedRes.data || []).map(r => r.cosmetic_id));

        if (catalog.length === 0) {
            body.innerHTML = `<p class="store-empty">The shop is empty for now. 🐸</p>`;
            return;
        }

        // Agrupar por tipo
        const byType = {};
        catalog.forEach(c => { (byType[c.type] = byType[c.type] || []).push(c); });

        let html = '';
        TYPE_ORDER.forEach(type => {
            const items = byType[type];
            if (!items || !items.length) return;
            html += `<h3 class="store-section-title">${TYPE_LABELS[type] || type}</h3>`;
            html += `<div class="store-grid">`;
            items.forEach(c => {
                const isOwned = owned.has(c.id);
                const preview = c.preview_url ? `style="background-image:url('${c.preview_url}')"` : '';
                const icon    = TYPE_ICON[type] || '✨';
                html += `
                    <div class="store-card">
                        <div class="store-card-preview" ${preview}>${c.preview_url ? '' : icon}</div>
                        <div class="store-card-name">${c.name}</div>
                        <div class="store-card-price"><span>🪷</span>${c.price}</div>
                        <button class="store-buy-btn ${isOwned ? 'owned' : ''}" data-id="${c.id}" data-price="${c.price}" ${isOwned ? 'disabled' : ''}>
                            ${isOwned ? 'Owned' : 'Buy'}
                        </button>
                    </div>`;
            });
            html += `</div>`;
        });

        body.innerHTML = html;

        // Compra: por ahora solo avisa. En el siguiente paso conectamos la
        // función segura de la base (descontar monedas + meter al clóset).
        body.querySelectorAll('.store-buy-btn:not(.owned)').forEach(btn => {
            btn.onclick = () => {
                alert('🪷 La compra se activa en el siguiente paso. ¡Ya casi!');
            };
        });

    } catch (e) {
        console.error(e);
        body.innerHTML = `<p class="store-empty">Something went wrong loading the store. Try again.</p>`;
    }
}

// ============================================================
//  pages/favorites.js  —  Personajes favoritos del usuario
//  Requiere sesión.
// ============================================================

import { _supabase } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

export function render() {
    return `
    <style>
        .page-title    { font-size: 1.6rem; font-weight: normal; margin-bottom: 6px; opacity: 0.95; }
        .page-subtitle { font-size: 0.9rem; opacity: 0.55; margin-bottom: 25px; font-style: italic; }

        .character-card {
            display: flex; align-items: center; gap: 14px;
            padding: 14px 16px; border-radius: 12px;
            border: 1px solid rgba(62,83,43,0.12);
            background-color: rgba(62,83,43,0.02);
            margin-bottom: 10px; cursor: pointer;
            transition: background-color 0.2s, border-color 0.2s;
        }
        .character-card:hover { background-color: rgba(62,83,43,0.06); border-color: rgba(62,83,43,0.22); }

        .char-avatar {
            width: 54px; height: 54px; border-radius: 50%;
            background-color: var(--bg-accent);
            border: 1px solid rgba(62,83,43,0.15);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.1rem; font-weight: bold; flex-shrink: 0;
            background-size: cover; background-position: center;
        }

        .char-info    { display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
        .char-name    { font-size: 1.05rem; font-weight: normal; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .char-subtitle { font-size: 0.85rem; opacity: 0.55; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    </style>

    <header>
        <a href="#" onclick="Router.go('dashboard'); return false;" class="brand">
            <img src="ranita.png" alt="Froggie Logo">
            <span>Froggie AI</span>
        </a>
        <div class="header-right">
            <button class="btn-logout" id="logoutBtn" style="display:none;">
                <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                <span>Log Out</span>
            </button>
            <button class="menu-trigger" onclick="UI.toggleMenu(event)">
                <svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            </button>
        </div>
    </header>

    <main>
        <h2 class="page-title">Favorites</h2>
        <p class="page-subtitle">Your pinned library...</p>
        <div id="favoritesContainer">
            <p style="opacity:0.5; font-style:italic;">Loading your library...</p>
        </div>
    </main>
    `;
}

export async function init() {
    if (!Auth.requireSession()) return;

    // Botón logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.style.display = 'flex';
        logoutBtn.onclick = () => Auth.signOut();
    }

    await loadFavorites(Auth.userId);
}

async function loadFavorites(userId) {
    const container = document.getElementById('favoritesContainer');

    const { data: favs, error } = await _supabase
        .from('favorites')
        .select('character_id')
        .eq('user_id', userId);

    if (error || !favs || favs.length === 0) {
        container.innerHTML = `
            <p class="empty-state">
                Your library is silent.<br>
                <span style="font-size:0.85rem;opacity:0.7;">Mark characters with a heart in the archive to pin them here.</span>
            </p>`;
        return;
    }

    const ids = favs.map(f => f.character_id);
    const { data: characters, error: charError } = await _supabase
        .from('characters')
        .select('id, name, subtitle, photo_url')
        .in('id', ids);

    if (charError || !characters || characters.length === 0) {
        container.innerHTML = `<p class="empty-state">Could not load characters.</p>`;
        return;
    }

    container.innerHTML = '';
    characters.forEach(char => {
        const avatarStyle = char.photo_url
            ? `background-image:url('${char.photo_url}');background-size:cover;background-position:center;`
            : '';
        const initials = char.photo_url ? '' : char.name.substring(0, 2).toUpperCase();

        const card = document.createElement('div');
        card.className = 'character-card';
        card.onclick = () => Router.go('character-profile', { id: char.id, from: 'favorites' });
        card.innerHTML = `
            <div class="char-avatar" style="${avatarStyle}">${initials}</div>
            <div class="char-info">
                <h3 class="char-name">${char.name}</h3>
                <p class="char-subtitle">${char.subtitle || 'Fictional Archetype'}</p>
            </div>`;
        container.appendChild(card);
    });
}

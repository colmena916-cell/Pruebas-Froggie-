// ============================================================
//  pages/mycharacters.js  —  Mis personajes creados
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
        .chars-grid    { display: flex; flex-direction: column; gap: 12px; }

        .char-card {
            background-color: rgba(62,83,43,0.03);
            border: 1px solid rgba(62,83,43,0.08);
            border-radius: 14px; padding: 16px;
            display: flex; flex-direction: column; gap: 10px;
            cursor: pointer; transition: background-color 0.2s, border-color 0.2s;
        }
        .char-card:hover { background-color: rgba(62,83,43,0.06); border-color: var(--btn-color); }
        .char-card-header { display: flex; align-items: center; gap: 12px; }

        .char-avatar {
            width: 42px; height: 42px;
            background-color: var(--bg-accent); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 0.95rem;
            border: 1px solid rgba(62,83,43,0.1);
            background-size: cover; background-position: center;
            flex-shrink: 0;
        }
        .char-info h4   { font-size: 1.05rem; font-weight: normal; }
        .char-info span { font-size: 0.88rem; opacity: 0.6; }
        .char-creator   { font-size: 0.75rem; opacity: 0.38; margin-top: 1px; }
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
        <h2 class="page-title">My Creations</h2>
        <p class="page-subtitle">The souls you gave shape to...</p>
        <div class="chars-grid" id="charactersContainer">
            <div class="empty-state">Consulting the codex...</div>
        </div>
    </main>
    `;
}

export async function init() {
    if (!Auth.requireSession()) return;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) { logoutBtn.style.display = 'flex'; logoutBtn.onclick = () => Auth.signOut(); }

    await fetchMyCharacters(Auth.userId);
}

async function fetchMyCharacters(userId) {
    const container = document.getElementById('charactersContainer');
    try {
        const { data: characters, error } = await _supabase
            .from('characters')
            .select('id, name, subtitle, photo_url, visibility')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false });

        if (error || !characters || characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    You haven't written any characters yet.<br>
                    Click on the <b>Create</b> button to breathe life into your first creation.
                </div>`;
            return;
        }

        const { data: profile } = await _supabase
            .from('profiles').select('username').eq('id', userId).single();
        const username = profile?.username || '';

        container.innerHTML = '';
        characters.forEach(char => {
            const avatarStyle = char.photo_url
                ? `background-image:url('${char.photo_url}');background-size:cover;background-position:center;`
                : '';
            const initials = char.photo_url ? '' : char.name.substring(0, 2).toUpperCase();
            const badge    = char.visibility === 'private'
                ? `<span style="font-size:0.7rem;opacity:0.45;margin-left:6px;">🔒 Private</span>` : '';
            const creator  = username ? `<p class="char-creator">@${username}</p>` : '';

            const card = document.createElement('div');
            card.className = 'char-card';
            card.onclick = () => Router.go('room', { id: char.id });
            card.innerHTML = `
                <div class="char-card-header">
                    <div class="char-avatar" style="${avatarStyle}">${initials}</div>
                    <div class="char-info">
                        <h4>${char.name}${badge}</h4>
                        <span>${char.subtitle || 'Character'}</span>
                        ${creator}
                    </div>
                </div>`;
            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="empty-state" style="color:red;">Failed to retrieve your characters.</p>`;
    }
}

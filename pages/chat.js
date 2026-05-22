// ============================================================
//  pages/chat.js  —  Active Chronicles (historial de chats)
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

        .chat-history-list { display: flex; flex-direction: column; gap: 12px; }

        .chat-history-item {
            background-color: rgba(62,83,43,0.03);
            border: 1px solid rgba(62,83,43,0.08);
            border-radius: 14px; padding: 14px 16px;
            display: flex; align-items: center; gap: 14px;
            cursor: pointer;
            transition: background-color 0.2s, border-color 0.2s;
        }
        .chat-history-item:hover { background-color: rgba(62,83,43,0.06); border-color: var(--btn-color); }

        .chat-avatar {
            width: 44px; height: 44px;
            background-color: var(--bg-accent);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 0.95rem;
            border: 1px solid rgba(62,83,43,0.1);
            flex-shrink: 0;
            background-size: cover; background-position: center;
        }

        .chat-item-content { flex-grow: 1; display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
        .chat-item-meta    { display: flex; justify-content: space-between; align-items: center; }
        .chat-item-meta h4 { font-size: 1.05rem; font-weight: normal; }
        .chat-time         { font-size: 0.75rem; opacity: 0.45; }
        .chat-last-message { font-size: 0.86rem; opacity: 0.65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
        <h2 class="page-title">Active Chronicles</h2>
        <p class="page-subtitle">Pick up the quill where you left your threads hanging...</p>
        <div class="chat-history-list" id="chatsContainer">
            <div class="empty-state">Reading active scrolls...</div>
        </div>
    </main>
    `;
}

export async function init() {
    if (!Auth.requireSession()) return;

    // Marcar botón activo en el bottom nav
    document.querySelector('[data-route="chat"]')?.classList.add('active');

    // Mostrar botón logout y conectar
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.style.display = 'flex';
        logoutBtn.onclick = () => Auth.signOut();
    }

    await fetchActiveChats(Auth.userId);
}

async function fetchActiveChats(userId) {
    const container = document.getElementById('chatsContainer');
    try {
        const { data: activeChats, error } = await _supabase
            .from('conversations')
            .select('id, character_id, updated_at, characters(name, photo_url)')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error || !activeChats || activeChats.length === 0) {
            container.innerHTML = `<p class="empty-state">No active story threads yet. Choose a character on Home to begin writing.</p>`;
            return;
        }

        container.innerHTML = '';
        activeChats.forEach(chat => {
            const charName  = chat.characters?.name || 'Unknown';
            const charPhoto = chat.characters?.photo_url || '';
            const timeStr   = new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const avatarStyle = charPhoto
                ? `background-image:url('${charPhoto}');background-size:cover;background-position:center;`
                : '';
            const initials = charPhoto ? '' : charName.substring(0, 2).toUpperCase();

            const item = document.createElement('div');
            item.className = 'chat-history-item';
            item.onclick = () => Router.go('room', { id: chat.character_id });
            item.innerHTML = `
                <div class="chat-avatar" style="${avatarStyle}">${initials}</div>
                <div class="chat-item-content">
                    <div class="chat-item-meta">
                        <h4>${charName}</h4>
                        <span class="chat-time">${timeStr}</span>
                    </div>
                    <p class="chat-last-message">Continue the story...</p>
                </div>`;
            container.appendChild(item);
        });

    } catch {
        container.innerHTML = `<p class="empty-state">No active story threads yet. Choose a character on Home to begin writing.</p>`;
    }
}

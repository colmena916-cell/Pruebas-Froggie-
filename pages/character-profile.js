// ============================================================
//  pages/character-profile.js  —  Perfil público de un personaje
//  Accesible sin sesión (modo lectura). Requiere sesión para likes/comentarios.
// ============================================================

import { _supabase, imgUrl } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

export function render() {
    return `
    <style>
        .container { max-width: 680px; width: 100%; margin: 0 auto; padding: 20px 16px 80px; }

        .btn-back { background:none; border:none; cursor:pointer; color:var(--text-dark); display:flex; align-items:center; padding:6px; border-radius:50%; transition:background-color 0.2s; }
        .btn-back:hover { background-color: rgba(62,83,43,0.08); }

        .profile-card { background: rgba(62,83,43,0.02); border: 1px solid rgba(62,83,43,0.12); border-radius: 18px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; margin-bottom: 20px; }
        .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background-color: var(--bg-accent); border: 2px solid rgba(62,83,43,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: bold; background-size: cover; background-position: center; }
        .profile-info h2 { font-size: 1.5rem; font-weight: normal; margin-bottom: 4px; }
        .profile-info p  { font-size: 0.9rem; opacity: 0.6; margin-bottom: 4px; }
        .profile-creator { font-size: 0.85rem; opacity: 0.5; cursor: pointer; transition: opacity 0.2s; }
        .profile-creator:hover { opacity: 0.9; text-decoration: underline; }

        .action-bar { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 6px; }
        .btn-main    { background-color: var(--btn-color); color: #fff; border: none; border-radius: 20px; padding: 9px 20px; font-family: var(--font-serif); font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background-color 0.2s; }
        .btn-main:hover { background-color: var(--btn-hover); }
        .btn-outline { background: none; border: 1px solid rgba(62,83,43,0.25); border-radius: 20px; padding: 9px 18px; font-family: var(--font-serif); font-size: 0.9rem; color: var(--text-dark); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background-color 0.2s, border-color 0.2s; }
        .btn-outline:hover { background-color: rgba(62,83,43,0.05); }
        .btn-outline.active { border-color: var(--btn-color); color: var(--btn-color); }

        .icon-svg { width: 18px; height: 18px; fill: currentColor; }

        .section-box { background: rgba(62,83,43,0.02); border: 1px solid rgba(62,83,43,0.1); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
        .section-box h3 { font-size: 1rem; font-weight: normal; opacity: 0.6; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; font-size: 0.78rem; }
        .description-text { font-size: 0.95rem; line-height: 1.65; opacity: 0.85; }

        .comment-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .comment-form textarea { width: 100%; height: 80px; padding: 12px; border: 1px solid rgba(62,83,43,0.2); border-radius: 12px; background-color: rgba(62,83,43,0.02); color: var(--text-dark); font-family: var(--font-serif); font-size: 0.95rem; outline: none; resize: none; }
        .comment-form textarea:focus { border-color: var(--btn-color); }
        .comment-form button { align-self: flex-end; }

        .comments-list { display: flex; flex-direction: column; gap: 16px; }
        .comment-item { background: rgba(62,83,43,0.03); padding: 12px 16px; border-radius: 12px; border-left: 3px solid var(--btn-color); }
        .comment-meta { display: flex; justify-content: space-between; font-size: 0.8rem; opacity: 0.6; margin-bottom: 6px; }
        .comment-user { font-weight: bold; cursor: pointer; }
        .comment-user:hover { text-decoration: underline; }
        .comment-content { font-size: 0.95rem; line-height: 1.4; }
        .empty-comments { text-align: center; font-style: italic; opacity: 0.5; font-size: 0.9rem; padding: 20px; }
    </style>

    <header>
        <button class="btn-back" id="backBtn">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <span style="font-size:0.9rem;opacity:0.7;">Character Info</span>
    </header>

    <main class="container">
        <section class="profile-card">
            <div class="profile-avatar" id="botAvatar">--</div>
            <div class="profile-info">
                <h2 id="botName">Loading...</h2>
                <p id="botSubtitle">...</p>
                <span class="profile-creator" id="botCreator">By @...</span>
            </div>
            <div class="action-bar">
                <button class="btn-main" id="chatBtn">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                    Chat
                </button>
                <button class="btn-outline" id="likeBtn">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span id="likeTxt">fav</span>
                </button>
                <button class="btn-outline" id="shareBtn">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    Share
                </button>
            </div>
        </section>

        <section class="section-box">
            <h3>Background &amp; Personality</h3>
            <p class="description-text" id="botDescription">Loading character context...</p>
        </section>

        <section class="section-box">
            <h3>Community Reviews</h3>
            <div class="comment-form">
                <textarea id="newCommentInput" placeholder="Share your experience writing with this character..."></textarea>
                <button class="btn-main" id="postCommentBtn">Post Review</button>
            </div>
            <div class="comments-list" id="commentsContainer">
                <div class="empty-comments">No reviews yet. Be the first to leave a mark!</div>
            </div>
        </section>
    </main>
    `;
}

export async function init(params) {
    const characterId = params.id;
    const from        = params.from || 'dashboard';
    let botCreatorId  = '';
    let isLiked       = false;

    if (!characterId) { Router.go('dashboard'); return; }

    // ── Back button ───────────────────────────────────────────
    document.getElementById('backBtn').onclick = () => {
        if (from === 'room')         Router.go('room', { id: characterId });
        else if (from === 'favorites')   Router.go('favorites');
        else if (from === 'mycharacters') Router.go('mycharacters');
        else if (from === 'user-profile') history.back();
        else Router.go('dashboard');
    };

    // ── Cargar personaje ──────────────────────────────────────
    try {
        const { data: char, error } = await _supabase.from('characters').select('*').eq('id', characterId).single();
        if (error || !char) throw new Error('Not found');

        botCreatorId = char.creator_id;
        document.getElementById('botName').textContent        = char.name;
        document.getElementById('botSubtitle').textContent    = char.subtitle || 'Fictional Archetype';
        document.getElementById('botDescription').textContent = char.description || 'No context provided.';

        const avatar = document.getElementById('botAvatar');
        if (char.photo_url) { avatar.style.backgroundImage = `url('${imgUrl(char.photo_url)}')`; avatar.textContent = ''; }
        else avatar.textContent = char.name.substring(0, 2).toUpperCase();

        if (char.creator_id) {
            const { data: profileData } = await _supabase.from('profiles').select('username').eq('id', char.creator_id).single();
            document.getElementById('botCreator').textContent = `By @${profileData?.username || 'creator'}`;
        }
    } catch {
        document.getElementById('botName').textContent = 'Unknown Identity';
    }

    // ── Botones de acción ─────────────────────────────────────
    document.getElementById('botCreator').onclick = () => {
        if (botCreatorId) Router.go('user-profile', { id: botCreatorId, from: 'character-profile' });
    };

    document.getElementById('chatBtn').onclick = () => {
        if (!Auth.userId) { window.UI.showLoginPopup('Join Froggie AI to start chatting!'); return; }
        Router.go('room', { id: characterId });
    };

    document.getElementById('shareBtn').onclick = () => {
        const url = `${window.location.origin}${window.location.pathname}#character-profile?id=${characterId}`;
        navigator.clipboard.writeText(url)
            .then(() => alert('Character link copied to clipboard!'))
            .catch(() => alert('Failed to copy link automatically.'));
    };

    // ── Like ──────────────────────────────────────────────────
    if (Auth.userId) {
        let likeData = null;
        try {
            const { data } = await _supabase.from('favorites').select('*').eq('character_id', characterId).eq('user_id', Auth.userId).maybeSingle();
            likeData = data;
        } catch {}
        // fix: use try/catch instead
        if (likeData) { isLiked = true; document.getElementById('likeBtn').classList.add('active'); document.getElementById('likeTxt').textContent = 'Liked'; }
    }

    document.getElementById('likeBtn').onclick = async () => {
        if (!Auth.userId) { window.UI.showLoginPopup('Join Froggie AI to save your favorites!'); return; }
        isLiked = !isLiked;
        const btn = document.getElementById('likeBtn');
        const txt = document.getElementById('likeTxt');
        if (isLiked) {
            btn.classList.add('active'); txt.textContent = 'Liked';
            await _supabase.from('favorites').insert([{ character_id: characterId, user_id: Auth.userId }]);
        } else {
            btn.classList.remove('active'); txt.textContent = 'fav';
            await _supabase.from('favorites').delete().eq('character_id', characterId).eq('user_id', Auth.userId);
        }
    };

    // ── Comentarios ───────────────────────────────────────────
    const escapeHTML = (str) => str.replace(/[&<>']/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;' }[t] || t));

    const loadComments = async () => {
        const container = document.getElementById('commentsContainer');
        try {
            const { data: comments, error } = await _supabase.from('comments').select('*').eq('character_id', characterId).order('created_at', { ascending: false });
            if (error || !comments || comments.length === 0) { container.innerHTML = `<div class="empty-comments">No reviews yet. Be the first to leave a mark!</div>`; return; }
            container.innerHTML = '';
            comments.forEach(c => {
                const date = new Date(c.created_at).toLocaleDateString();
                const item = document.createElement('div');
                item.className = 'comment-item';
                item.innerHTML = `
                    <div class="comment-meta">
                        <span class="comment-user" data-uid="${c.user_id}">@${c.username || 'anonymous'}</span>
                        <span>${date}</span>
                    </div>
                    <p class="comment-content">${escapeHTML(c.content)}</p>`;
                item.querySelector('.comment-user').onclick = () => Router.go('user-profile', { id: c.user_id, from: 'character-profile' });
                container.appendChild(item);
            });
        } catch {
            container.innerHTML = `<div class="empty-comments">Review wall is ready. Setup 'comments' table in Supabase to sync.</div>`;
        }
    };

    document.getElementById('postCommentBtn').onclick = async () => {
        if (!Auth.userId) { window.UI.showLoginPopup('Join Froggie AI to post reviews!'); return; }
        const input = document.getElementById('newCommentInput');
        const text  = input.value.trim();
        if (!text) return;
        try {
            const { data: prof } = await _supabase.from('profiles').select('username').eq('id', Auth.userId).single();
            await _supabase.from('comments').insert([{ character_id: characterId, user_id: Auth.userId, username: prof?.username || 'user', content: text, created_at: new Date().toISOString() }]);
            input.value = '';
            await loadComments();
        } catch { alert("Could not post review. Ensure your 'comments' table exists."); }
    };

    await loadComments();
}

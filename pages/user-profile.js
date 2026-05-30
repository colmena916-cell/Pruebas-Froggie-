// ============================================================
//  pages/user-profile.js  —  Perfil público de otro usuario
//  Accesible sin sesión. Sesión requerida para follow/unfollow.
// ============================================================

import { _supabase, imgUrl } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

export function render() {
    return `
    <style>
        .profile-container { max-width: 680px; width: 100%; margin: 0 auto; padding: 20px 16px 80px; }

        .btn-back { background:none; border:none; cursor:pointer; color:var(--text-dark); display:flex; align-items:center; padding:6px; border-radius:50%; transition:background-color 0.2s; }
        .btn-back:hover { background-color: rgba(62,83,43,0.08); }

        .profile-card { background: rgba(62,83,43,0.02); border: 1px solid rgba(62,83,43,0.12); border-radius: 18px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; margin-bottom: 20px; }
        .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background-color: var(--bg-accent); border: 2px solid rgba(62,83,43,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: bold; background-size: cover; background-position: center; }
        .profile-details h2    { font-size: 1.4rem; font-weight: normal; }
        .profile-username      { font-size: 0.85rem; opacity: 0.55; display: block; margin-bottom: 4px; }
        .profile-bio           { font-size: 0.9rem; opacity: 0.75; line-height: 1.5; max-width: 340px; }
        .profile-stats         { display: flex; gap: 20px; margin-top: 10px; justify-content: center; flex-wrap: wrap; }
        .stat-item             { font-size: 0.88rem; opacity: 0.7; }
        .stat-item strong      { display: block; font-size: 1.1rem; opacity: 1; }

        .profile-actions { display: none; margin-top: 8px; }
        .btn-follow { background: none; border: 1px solid rgba(62,83,43,0.3); border-radius: 20px; padding: 8px 22px; font-family: var(--font-serif); font-size: 0.9rem; color: var(--text-dark); cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
        .btn-follow:hover { background-color: rgba(62,83,43,0.06); }
        .btn-follow.following { border-color: var(--btn-color); color: var(--btn-color); }

        .own-profile-hint { font-size: 0.85rem; opacity: 0.55; display: none; margin-top: 4px; }
        .btn-go-myprofile { color: var(--btn-color); text-decoration: none; cursor: pointer; background: none; border: none; font-family: var(--font-serif); font-size: 0.85rem; }

        .tabs-navigation { display: flex; gap: 24px; border-bottom: 1px solid rgba(62,83,43,0.15); margin-bottom: 16px; }
        .tab-nav-btn { background: none; border: none; font-family: var(--font-serif); font-size: 1.05rem; color: var(--text-dark); padding: 8px 4px; cursor: pointer; opacity: 0.5; position: relative; transition: opacity 0.2s; }
        .tab-nav-btn.active { opacity: 1; }
        .tab-nav-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background-color: var(--btn-color); }
        .tab-content-panel        { display: none; }
        .tab-content-panel.active { display: block; }

        .character-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 100%)); gap: 16px; margin-top: 12px; }
        .char-card { background: rgba(62,83,43,0.02); border: 1px solid rgba(62,83,43,0.12); border-radius: 14px; padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 10px; transition: background-color 0.2s, border-color 0.2s; }
        .char-card:hover { background: rgba(62,83,43,0.06); border-color: var(--btn-color); }
        .char-card-header { display: flex; align-items: center; gap: 12px; }
        .char-avatar { width: 44px; height: 44px; border-radius: 50%; background-color: var(--bg-accent); display: flex; align-items: center; justify-content: center; font-weight: bold; background-size: cover; background-position: center; flex-shrink: 0; }
        .char-info h4   { font-weight: normal; font-size: 1.1rem; }
        .char-info span { font-size: 0.88rem; opacity: 0.6; }
        .char-creator   { font-size: 0.75rem; opacity: 0.38; display: block; }

        .comments-list { display: flex; flex-direction: column; gap: 14px; }
        .comment-item  { background: rgba(62,83,43,0.02); padding: 12px 16px; border-radius: 12px; border-left: 3px solid var(--btn-color); }
        .comment-meta  { display: flex; justify-content: space-between; font-size: 0.8rem; opacity: 0.6; margin-bottom: 6px; }
        .comment-char-link { cursor: pointer; color: var(--btn-color); }
        .comment-char-link:hover { text-decoration: underline; }
        .comment-content { font-size: 0.95rem; line-height: 1.4; }

        .skeleton { height: 80px; background: rgba(62,83,43,0.06); border-radius: 12px; margin-bottom: 12px; animation: pulse 1.4s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .empty-state { text-align: center; font-style: italic; opacity: 0.5; padding: 32px; font-size: 0.95rem; }

        .toast { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%) translateY(20px); background: rgba(62,83,43,0.9); color: #fff; padding: 10px 20px; border-radius: 20px; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s, transform 0.3s; pointer-events: none; z-index: 9999; white-space: nowrap; }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    </style>

    <header>
        <button class="btn-back" id="backBtn">
            <svg style="width:22px;height:22px;fill:currentColor;" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <span id="headerTitle" style="font-size:0.9rem;opacity:0.7;">Author Profile</span>
    </header>

    <main class="profile-container">
        <section class="profile-card">
            <div class="profile-avatar" id="userAvatar">--</div>
            <div class="profile-details">
                <h2 id="profileName">Loading...</h2>
                <span class="profile-username" id="profileUsername">@username</span>
                <p class="profile-bio" id="profileBio">Gathering ink and thoughts...</p>
                <div class="profile-stats">
                    <span class="stat-item"><strong id="botCountLabel">0</strong> Characters</span>
                    <span class="stat-item"><strong id="followersCountLabel">0</strong> Followers</span>
                    <span class="stat-item"><strong id="followingCountLabel">0</strong> Following</span>
                </div>
                <div class="profile-actions" id="profileActions">
                    <button class="btn-follow" id="followBtn" disabled>
                        <span id="followBtnText">Follow</span>
                    </button>
                </div>
                <p class="own-profile-hint" id="ownHint">
                    This is your own profile.
                    <button class="btn-go-myprofile" id="goMyProfileBtn">Go to My Profile →</button>
                </p>
            </div>
        </section>

        <nav class="tabs-navigation">
            <button class="tab-nav-btn active" id="tabCreations">Creations</button>
            <button class="tab-nav-btn" id="tabReviews">Reviews</button>
        </nav>

        <div class="tab-content-panel active" id="charactersTab">
            <div id="charsLoading">
                <div class="skeleton"></div>
                <div class="skeleton"></div>
            </div>
            <div class="character-grid" id="charactersContainer" style="display:none;"></div>
        </div>

        <div class="tab-content-panel" id="reviewsTab">
            <div id="reviewsLoading" style="display:none;">
                <div class="skeleton"></div>
                <div class="skeleton"></div>
            </div>
            <div class="comments-list" id="reviewsContainer">
                <p class="empty-state">No reviews written yet.</p>
            </div>
        </div>
    </main>

    <div class="toast" id="toast"></div>
    `;
}

export async function init(params) {
    const targetUserId  = params.id;
    const from          = params.from || 'dashboard';
    const currentUserId = Auth.userId;

    if (!targetUserId) { Router.go('dashboard'); return; }

    let isFollowing  = false;
    let reviewsLoaded = false;

    // ── Back button ───────────────────────────────────────────
    document.getElementById('backBtn').onclick = () => {
        if (from === 'character-profile' || from === 'room') history.back();
        else Router.go('dashboard');
    };

    // ── Toast ─────────────────────────────────────────────────
    let toastTimer;
    const showToast = (msg) => {
        const el = document.getElementById('toast');
        el.textContent = msg; el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
    };

    const escapeHTML = (str) => {
        if (!str) return '';
        return str.replace(/[&<>']/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;' }[t] || t));
    };

    // ── Propio perfil o ajeno ─────────────────────────────────
    if (currentUserId && targetUserId === currentUserId) {
        document.getElementById('ownHint').style.display = 'block';
        document.getElementById('headerTitle').textContent = 'Your Profile';
        document.getElementById('goMyProfileBtn').onclick = () => Router.go('myprofile');
    } else {
        document.getElementById('profileActions').style.display = 'flex';
        document.getElementById('followBtn').disabled = false;
    }

    // ── Tabs ──────────────────────────────────────────────────
    document.getElementById('tabCreations').onclick = function() {
        document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('charactersTab').classList.add('active');
        this.classList.add('active');
    };
    document.getElementById('tabReviews').onclick = function() {
        document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('reviewsTab').classList.add('active');
        this.classList.add('active');
        loadReviews();
    };

    // ── Cargar metadatos del perfil ───────────────────────────
    const loadProfile = async () => {
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', targetUserId).single();
        if (!profile) { document.getElementById('profileName').textContent = 'Unknown Author'; return; }
        const name = profile.display_name || profile.username || 'Author';
        document.getElementById('profileName').textContent     = name;
        document.getElementById('profileUsername').textContent = `@${profile.username || ''}`;
        document.getElementById('profileBio').textContent      = profile.bio || 'No biography written yet.';
        document.title = `${name} — Froggie AI`;
        const avatar = document.getElementById('userAvatar');
        if (profile.avatar_url) { avatar.style.backgroundImage = `url('${profile.avatar_url}')`; avatar.textContent = ''; }
        else avatar.textContent = name.substring(0, 1).toUpperCase();
    };

    // ── Follow counts ─────────────────────────────────────────
    const loadFollowCounts = async () => {
        const [followersRes, followingRes] = await Promise.all([
            _supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
            _supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId)
        ]);
        document.getElementById('followersCountLabel').textContent = followersRes.count ?? 0;
        document.getElementById('followingCountLabel').textContent = followingRes.count ?? 0;
    };

    // ── Follow status ─────────────────────────────────────────
    const updateFollowBtn = () => {
        const btn  = document.getElementById('followBtn');
        const text = document.getElementById('followBtnText');
        if (isFollowing) {
            btn.classList.add('following'); text.textContent = 'Following ✓';
            btn.onmouseenter = () => { text.textContent = 'Unfollow'; };
            btn.onmouseleave = () => { text.textContent = 'Following ✓'; };
        } else {
            btn.classList.remove('following'); text.textContent = 'Follow';
            btn.onmouseenter = null; btn.onmouseleave = null;
        }
    };

    if (currentUserId && targetUserId !== currentUserId) {
        let followData = null;
        try {
            const { data } = await _supabase.from('follows').select('id').eq('follower_id', currentUserId).eq('following_id', targetUserId).maybeSingle();
            followData = data;
        } catch {}
        isFollowing = !!followData;
        updateFollowBtn();
    }

    document.getElementById('followBtn').onclick = async () => {
        if (!currentUserId) { window.UI.showLoginPopup('Join Froggie AI to follow authors!'); return; }
        const btn = document.getElementById('followBtn');
        btn.disabled = true;
        try {
            if (isFollowing) {
                await _supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', targetUserId);
                isFollowing = false; showToast('Unfollowed.');
            } else {
                await _supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId });
                isFollowing = true; showToast('Following!');
            }
            updateFollowBtn();
            await loadFollowCounts();
        } catch { showToast('Something went wrong. Try again.'); }
        finally { btn.disabled = false; }
    };

    // ── Cargar personajes ─────────────────────────────────────
    const loadCharacters = async () => {
        const container = document.getElementById('charactersContainer');
        const loading   = document.getElementById('charsLoading');
        const { data: characters } = await _supabase.from('characters').select('id, name, subtitle, photo_url').eq('creator_id', targetUserId).eq('visibility', 'public').order('created_at', { ascending: false });
        loading.style.display = 'none'; container.style.display = 'grid';
        if (!characters || characters.length === 0) { container.innerHTML = `<p class="empty-state" style="grid-column:1/-1;">No public characters yet.</p>`; document.getElementById('botCountLabel').textContent = '0'; return; }
        const { data: cp } = await _supabase.from('profiles').select('username').eq('id', targetUserId).single();
        const creator = cp?.username || '';
        document.getElementById('botCountLabel').textContent = characters.length;
        container.innerHTML = '';
        characters.forEach(char => {
            const avatarStyle = char.photo_url ? `background-image:url('${imgUrl(char.photo_url)}');background-size:cover;background-position:center;` : '';
            const initials = char.photo_url ? '' : char.name.substring(0, 2).toUpperCase();
            const card = document.createElement('div');
            card.className = 'char-card';
            card.onclick = () => Router.go('character-profile', { id: char.id, from: 'user-profile' });
            card.innerHTML = `<div class="char-card-header"><div class="char-avatar" style="${avatarStyle}">${initials}</div><div class="char-info"><h4>${escapeHTML(char.name)}</h4><span>${escapeHTML(char.subtitle || 'Character')}</span>${creator ? `<span class="char-creator">@${escapeHTML(creator)}</span>` : ''}</div></div>`;
            container.appendChild(card);
        });
    };

    // ── Cargar reviews (lazy) ─────────────────────────────────
    const loadReviews = async () => {
        if (reviewsLoaded) return;
        reviewsLoaded = true;
        const container = document.getElementById('reviewsContainer');
        const loading   = document.getElementById('reviewsLoading');
        loading.style.display = 'flex'; container.innerHTML = '';
        try {
            const { data: comments } = await _supabase.from('comments').select('*, characters(name, id)').eq('user_id', targetUserId).order('created_at', { ascending: false }).limit(30);
            loading.style.display = 'none';
            if (!comments || comments.length === 0) { container.innerHTML = `<p class="empty-state">No reviews written yet.</p>`; return; }
            container.innerHTML = '';
            comments.forEach(c => {
                const date    = new Date(c.created_at).toLocaleDateString();
                const charName = c.characters ? c.characters.name : 'Unknown Character';
                const charId   = c.characters ? c.characters.id   : null;
                const item = document.createElement('div');
                item.className = 'comment-item';
                item.innerHTML = `<div class="comment-meta"><span>On ${charId ? `<span class="comment-char-link" data-cid="${charId}">${escapeHTML(charName)}</span>` : escapeHTML(charName)}</span><span>${date}</span></div><p class="comment-content">${escapeHTML(c.content)}</p>`;
                if (charId) item.querySelector('.comment-char-link').onclick = () => Router.go('character-profile', { id: charId, from: 'user-profile' });
                container.appendChild(item);
            });
        } catch {
            loading.style.display = 'none';
            container.innerHTML = `<p class="empty-state">Reviews tab requires the 'comments' table in Supabase.</p>`;
        }
    };

    await Promise.all([loadProfile(), loadFollowCounts(), loadCharacters()]);
}

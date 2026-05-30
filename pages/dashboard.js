// ============================================================
//  pages/dashboard.js  —  Dashboard principal con carruseles y búsqueda
//  Accesible sin sesión (modo invitado).
// ============================================================

import { _supabase, imgUrl } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

export function render() {
    return `
    <style>
        /* Playfair Display para títulos de sección */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');

        .dashboard-section { margin-bottom: 36px; }
        .section-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
        .section-title { font-size: 1.25rem; font-weight: 400; opacity: 0.9; font-family: 'Playfair Display', Georgia, serif; font-style: italic; letter-spacing: 0.01em; }
        .section-subtitle { font-size: 0.75rem; opacity: 0.4; font-style: italic; }

        .carousel-wrapper { position: relative; }
        .chars-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; -ms-overflow-style: none; }
        .chars-row::-webkit-scrollbar { display: none; }

        .char-card { background-color: rgba(62,83,43,0.03); border: 1px solid rgba(62,83,43,0.08); border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: row; align-items: center; gap: 12px; cursor: pointer; color: var(--text-dark); transition: background-color 0.2s, border-color 0.2s; flex-shrink: 0; width: 220px; min-height: 80px; text-decoration: none; }
        .char-card:hover { background-color: rgba(62,83,43,0.06); border-color: var(--btn-color); }

        .char-avatar { width: 52px; height: 52px; background-color: var(--bg-accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; border: 1px solid rgba(62,83,43,0.1); flex-shrink: 0; background-size: cover; background-position: center; }
        .char-card-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex-grow: 1; }
        .char-name { font-size: 0.95rem; font-weight: normal; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .char-creator { font-size: 0.68rem; opacity: 0.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
        .char-subtitle-text { font-size: 0.78rem; opacity: 0.55; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }

        .carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; background-color: var(--bg-main); border: 1px solid rgba(62,83,43,0.18); color: var(--text-dark); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.7; transition: opacity 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.08); flex-shrink: 0; }
        .carousel-arrow:hover { opacity: 1; }
        .carousel-arrow.hidden { opacity: 0; pointer-events: none; }
        .carousel-arrow svg { width: 16px; height: 16px; fill: currentColor; }
        .carousel-arrow-left  { left: -16px; }
        .carousel-arrow-right { right: -16px; }
        @media (max-width: 580px) { .carousel-arrow-left { left: 0; } .carousel-arrow-right { right: 0; } }

        /* Search results */
        #searchResults { display: flex; flex-direction: column; gap: 12px; }
        .search-result-card { background-color: rgba(62,83,43,0.03); border: 1px solid rgba(62,83,43,0.08); border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; color: var(--text-dark); transition: background-color 0.2s, border-color 0.2s; }
        .search-result-card:hover { background-color: rgba(62,83,43,0.06); border-color: var(--btn-color); }
        .search-result-card .char-avatar { margin: 0; width: 44px; height: 44px; font-size: 0.9rem; }
        .search-result-info { flex-grow: 1; min-width: 0; }
        .search-result-info h4 { font-size: 1rem; font-weight: normal; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .search-result-info span { font-size: 0.78rem; opacity: 0.45; }
        .search-result-title { font-size: 1rem; opacity: 0.55; font-style: italic; margin-bottom: 14px; }
        .search-tab-btn { background: none; border: 1px solid rgba(62,83,43,0.2); border-radius: 20px; padding: 6px 16px; font-family: var(--font-serif); font-size: 0.88rem; color: var(--text-dark); cursor: pointer; opacity: 0.55; transition: all 0.2s; }
        .search-tab-btn:hover { opacity: 0.85; }
        .search-tab-btn.active-tab { background-color: var(--btn-color); color: #fff; border-color: var(--btn-color); opacity: 1; }
    </style>

    <header>
        <a href="#" onclick="Router.go('dashboard'); return false;" class="brand">
            <img src="ranita.png" alt="Froggie Logo">
            <span>Froggie AI</span>
        </a>
        <div class="search-bar">
            <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" placeholder="Search chronicles..." id="searchInput">
        </div>
        <div class="header-right">
            <button class="btn-logout" id="logoutBtn" style="display:none;">
                <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                <span>Log Out</span>
            </button>
            <button class="btn-logout" id="joinBtn" style="display:none; background:var(--btn-color); color:var(--bg-main); border:none; padding:7px 16px; border-radius:16px; cursor:pointer; font-family:var(--font-serif); font-size:0.9rem;">
                Join 🐸
            </button>
            <button class="menu-trigger" onclick="UI.toggleMenu(event)">
                <svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            </button>
        </div>
    </header>

    <main>
        <div id="supportBanner" style="display:none; background:rgba(62,83,43,0.06); border:1px dashed rgba(62,83,43,0.2); border-radius:12px; padding:12px 16px; margin-bottom:16px; align-items:center; justify-content:space-between; gap:10px;">
            <span style="font-size:0.88rem; line-height:1.5;">🐸 Froggie AI es un proyecto independiente hecho con mucho cariño. Si disfrutas la plataforma y deseas apoyarla, <a href="https://ko-fi.com/beemena" target="_blank" style="color:var(--btn-color); font-weight:bold;">te lo agradecería muchísimo ✨</a></span>
            <button onclick="document.getElementById('supportBanner').style.display='none'; localStorage.setItem('froggie_support_dismissed','1');" style="background:none;border:none;cursor:pointer;opacity:0.4;font-size:1rem;color:var(--text-dark);flex-shrink:0;">✕</button>
        </div>
        <!-- Resultados de búsqueda -->
        <div id="searchResultsWrapper" style="display:none;">
            <div style="display:flex;gap:8px;margin-bottom:14px;">
                <button id="tabCharacters" class="search-tab-btn active-tab">✨ Characters</button>
                <button id="tabUsers" class="search-tab-btn">👤 Users</button>
            </div>
            <p class="search-result-title" id="searchResultTitle">Results for ""</p>
            <div id="searchResults"></div>
        </div>

        <!-- Secciones del dashboard -->
        <div id="dashboardSections">
            <div class="dashboard-section">
                <div class="section-header">
                    <h2 class="section-title">For You</h2>
                    <span class="section-subtitle">freshly conjured</span>
                </div>
                <div class="carousel-wrapper">
                    <button class="carousel-arrow carousel-arrow-left" data-row="forYouRow"><svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg></button>
                    <div class="chars-row" id="forYouRow"><div class="empty-state">Consulting the codex...</div></div>
                    <button class="carousel-arrow carousel-arrow-right" data-row="forYouRow"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>
                </div>
            </div>

            <div class="dashboard-section">
                <div class="section-header">
                    <h2 class="section-title">Most Popular</h2>
                    <span class="section-subtitle">everyone's talking to them</span>
                </div>
                <div class="carousel-wrapper">
                    <button class="carousel-arrow carousel-arrow-left" data-row="popularRow"><svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg></button>
                    <div class="chars-row" id="popularRow"><div class="empty-state">Consulting the codex...</div></div>
                    <button class="carousel-arrow carousel-arrow-right" data-row="popularRow"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>
                </div>
            </div>

            <div class="dashboard-section">
                <div class="section-header">
                    <h2 class="section-title">Canon</h2>
                    <span class="section-subtitle">from books, series, anime & more</span>
                </div>
                <div class="carousel-wrapper">
                    <button class="carousel-arrow carousel-arrow-left" data-row="canonRow"><svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg></button>
                    <div class="chars-row" id="canonRow"><div class="empty-state">Consulting the codex...</div></div>
                    <button class="carousel-arrow carousel-arrow-right" data-row="canonRow"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>
                </div>
            </div>

            <div class="dashboard-section">
                <div class="section-header">
                    <h2 class="section-title">Original Characters</h2>
                    <span class="section-subtitle">born from imagination</span>
                </div>
                <div class="carousel-wrapper">
                    <button class="carousel-arrow carousel-arrow-left" data-row="ocRow"><svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg></button>
                    <div class="chars-row" id="ocRow"><div class="empty-state">Consulting the codex...</div></div>
                    <button class="carousel-arrow carousel-arrow-right" data-row="ocRow"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>
                </div>
            </div>
        </div>
    </main>
    `;
}

export async function init() {
    // Marcar Home activo en bottom nav
    document.querySelector('[data-route="dashboard"]')?.classList.add('active');

    // Mostrar banner de apoyo una vez (hasta que lo cierren)
    if (!localStorage.getItem('froggie_support_dismissed')) {
        document.getElementById('supportBanner').style.display = 'flex';
    }

    // Auth UI
    const logoutBtn = document.getElementById('logoutBtn');
    const joinBtn   = document.getElementById('joinBtn');
    if (Auth.userId) {
        if (logoutBtn) { logoutBtn.style.display = 'flex'; logoutBtn.onclick = () => Auth.signOut(); }
        if (joinBtn)   joinBtn.style.display = 'none';
    } else {
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (joinBtn)   { joinBtn.style.display = 'flex'; joinBtn.onclick = () => Router.go('registro'); }
    }

    // ── Flechas de carrusel ───────────────────────────────────
    document.querySelectorAll('.carousel-arrow').forEach(btn => {
        const rowId    = btn.dataset.row;
        const isLeft   = btn.classList.contains('carousel-arrow-left');
        btn.onclick = () => {
            const row = document.getElementById(rowId);
            if (row) row.scrollBy({ left: (isLeft ? -1 : 1) * 240, behavior: 'smooth' });
        };
    });

    // ── Búsqueda ──────────────────────────────────────────────
    let searchTimeout = null;
    let activeSearchTab = 'characters';

    const setSearchTab = (tab) => {
        activeSearchTab = tab;
        document.getElementById('tabCharacters').classList.toggle('active-tab', tab === 'characters');
        document.getElementById('tabUsers').classList.toggle('active-tab', tab === 'users');
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
            if (tab === 'characters') searchCharacters(query);
            else searchUsers(query);
        }
    };

    document.getElementById('tabCharacters').onclick = () => setSearchTab('characters');
    document.getElementById('tabUsers').onclick      = () => setSearchTab('users');

    const searchInput = document.getElementById('searchInput');

    // Al dar Enter: buscar y ocultar teclado
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur(); // oculta el teclado en móvil
            const query = this.value.trim();
            if (!query) return;
            if (activeSearchTab === 'users') searchUsers(query.replace(/^@/, ''));
            else searchCharacters(query);
        }
    });

    // Al escribir: solo cambiar tab si empieza con @ y limpiar resultados si borra todo
    // NO buscar hasta que el usuario presione Enter
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        // Si empieza con @, cambiar a tab de usuarios automáticamente
        if (query.startsWith('@')) {
            activeSearchTab = 'users';
            document.getElementById('tabCharacters').classList.remove('active-tab');
            document.getElementById('tabUsers').classList.add('active-tab');
        }

        // Si borraron todo, volver al dashboard
        if (!query) {
            document.getElementById('searchResultsWrapper').style.display = 'none';
            document.getElementById('dashboardSections').style.display = 'block';
            return;
        }

        // Mostrar el wrapper con las tabs pero sin resultados todavía
        // así el usuario ve que hay algo esperando su búsqueda
        const wrapper = document.getElementById('searchResultsWrapper');
        if (wrapper.style.display === 'none') {
            document.getElementById('dashboardSections').style.display = 'none';
            wrapper.style.display = 'block';
            document.getElementById('searchResults').innerHTML = '';
            document.getElementById('searchResultTitle').textContent = '';
        }
    });

    // ── Cargar secciones ──────────────────────────────────────
    await loadDashboard();

    // ── News modal (solo para usuarios con sesión) ────────────
    if (Auth.userId && !localStorage.getItem('froggie_news_v2')) {
        const modal = document.getElementById('newsModal');
        if (modal) { modal.style.display = 'flex'; requestAnimationFrame(() => modal.classList.add('visible')); }
    }
}

// ── Helpers ───────────────────────────────────────────────────
function buildCard(char, creatorUsername) {
    const avatarStyle = char.photo_url
        ? `background-image:url('${imgUrl(char.photo_url)}');background-size:cover;background-position:center;border-radius:10px;`
        : '';
    const initials = char.photo_url ? '' : char.name.substring(0, 2).toUpperCase();
    const creator  = creatorUsername ? `<span class="char-creator">@${creatorUsername}</span>` : '';
    const card     = document.createElement('div');
    card.className = 'char-card';
    card.onclick   = () => Router.go('room', { id: char.id });
    card.innerHTML = `
        <div class="char-avatar" style="${avatarStyle}">${initials}</div>
        <div class="char-card-body">
            <p class="char-name">${char.name}</p>
            ${creator}
            <p class="char-subtitle-text">${char.subtitle || ''}</p>
        </div>`;
    return card;
}

async function renderRow(containerId, characters) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!characters || characters.length === 0) {
        container.innerHTML = `<p class="empty-state" style="padding:20px 0;">Nothing here yet — be the first! 🐸</p>`;
        return;
    }
    const creatorIds = [...new Set(characters.map(c => c.creator_id).filter(Boolean))];
    const creatorMap = {};
    if (creatorIds.length > 0) {
        const { data: profiles } = await _supabase.from('profiles').select('id, username').in('id', creatorIds);
        if (profiles) profiles.forEach(p => { creatorMap[p.id] = p.username; });
    }
    container.innerHTML = '';
    characters.forEach(c => container.appendChild(buildCard(c, c.creator_id ? creatorMap[c.creator_id] : null)));
}

async function loadDashboard() {
    const base = { select: 'id, name, subtitle, photo_url, tags, category, chat_count, creator_id', visibility: 'public' };

    const [allPublic, popular, canon, oc] = await Promise.all([
        // For You: traemos todos los públicos y los mezclamos aleatoriamente
        _supabase.from('characters').select(base.select).eq('visibility', base.visibility).limit(100),
        _supabase.from('characters').select(base.select).eq('visibility', base.visibility).order('chat_count',  { ascending: false }).limit(31),
        _supabase.from('characters').select(base.select).eq('visibility', base.visibility).eq('category', 'canon').order('chat_count', { ascending: false }).limit(31),
        _supabase.from('characters').select(base.select).eq('visibility', base.visibility).eq('category', 'oc').order('chat_count',   { ascending: false }).limit(31),
    ]);

    // Mezcla aleatoria para "For You" — diferente cada vez que recargas
    const shuffled = (allPublic.data || []).sort(() => Math.random() - 0.5);

    await Promise.all([
        renderRow('forYouRow',  shuffled),
        renderRow('popularRow', popular.data),
        renderRow('canonRow',   canon.data),
        renderRow('ocRow',      oc.data),
    ]);
}

async function searchCharacters(query) {
    document.getElementById('dashboardSections').style.display = 'none';
    const wrapper   = document.getElementById('searchResultsWrapper');
    const container = document.getElementById('searchResults');
    wrapper.style.display = 'block';
    document.getElementById('searchResultTitle').textContent = `Results for "${query}"`;
    container.innerHTML = '<p class="empty-state">Searching...</p>';

    try {
        // Full Text Search — encuentra resultados similares, no solo exactos
        const { data: characters, error } = await _supabase
            .from('characters').select('id, name, subtitle, photo_url, creator_id')
            .eq('visibility', 'public')
            .textSearch('fts', query.trim().split(/\s+/).join(' | '))
            .limit(30);

        if (error) throw error;
        if (!characters || characters.length === 0) {
            container.innerHTML = `<p class="empty-state">No characters found for "<em>${query}</em>". Croac...</p>`;
            return;
        }

        const creatorIds = [...new Set(characters.map(c => c.creator_id).filter(Boolean))];
        const creatorMap = {};
        if (creatorIds.length > 0) {
            const { data: profiles } = await _supabase.from('profiles').select('id, username').in('id', creatorIds);
            if (profiles) profiles.forEach(p => { creatorMap[p.id] = p.username; });
        }

        container.innerHTML = '';
        characters.forEach(char => {
            const avatarStyle = char.photo_url ? `background-image:url('${imgUrl(char.photo_url)}');background-size:cover;` : '';
            const initials    = char.photo_url ? '' : char.name.substring(0, 2).toUpperCase();
            const creator     = char.creator_id ? (creatorMap[char.creator_id] || 'creator') : 'creator';
            const card = document.createElement('div');
            card.className = 'search-result-card';
            card.onclick   = () => Router.go('room', { id: char.id });
            card.innerHTML = `
                <div class="char-avatar" style="${avatarStyle}">${initials}</div>
                <div class="search-result-info">
                    <h4>${char.name}</h4>
                    <span>${char.subtitle || ''} · @${creator}</span>
                </div>`;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="empty-state">Search failed. Try again.</p>`;
    }
}

async function searchUsers(query) {
    document.getElementById('dashboardSections').style.display = 'none';
    const wrapper   = document.getElementById('searchResultsWrapper');
    const container = document.getElementById('searchResults');
    wrapper.style.display = 'block';
    document.getElementById('searchResultTitle').textContent = `Users matching "${query}"`;
    container.innerHTML = '<p class="empty-state">Searching...</p>';

    try {
        const { data: users, error } = await _supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, bio')
            .ilike('username', `%${query}%`)
            .limit(20);

        if (error) throw error;
        if (!users || users.length === 0) {
            container.innerHTML = `<p class="empty-state">No users found for "<em>@${query}</em>". Croac...</p>`;
            return;
        }

        container.innerHTML = '';
        users.forEach(user => {
            const name        = user.display_name || user.username || 'User';
            const avatarStyle = user.avatar_url ? `background-image:url('${user.avatar_url}');background-size:cover;` : '';
            const initials    = user.avatar_url ? '' : name.substring(0, 1).toUpperCase();
            const card = document.createElement('div');
            card.className = 'search-result-card';
            card.onclick   = () => Router.go('user-profile', { id: user.id, from: 'dashboard' });
            card.innerHTML = `
                <div class="char-avatar" style="border-radius:50%;${avatarStyle}">${initials}</div>
                <div class="search-result-info">
                    <h4>${name}</h4>
                    <span>@${user.username || ''} ${user.bio ? '· ' + user.bio.substring(0, 40) + (user.bio.length > 40 ? '...' : '') : ''}</span>
                </div>`;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="empty-state">User search failed. Try again.</p>`;
    }
}

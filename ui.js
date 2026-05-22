// ============================================================
//  ui.js  —  componentes HTML compartidos
//
//  Header, sidebar, bottom nav, login popup, news modal.
//  Se escriben UNA SOLA VEZ aquí.
//  Cada página llama UI.renderShell() o UI.renderAuthShell().
// ============================================================

import { Auth, Theme } from './auth.js';
import { Router }      from './router.js';

export const UI = {

    // ── Popup de login (para usuarios no registrados) ───────
    showLoginPopup(msg = 'Join Froggie AI to unlock this!') {
        document.getElementById('loginPopupMsg').textContent = msg;
        document.getElementById('loginPopupOverlay').style.display = 'flex';
    },

    closeLoginPopup() {
        document.getElementById('loginPopupOverlay').style.display = 'none';
    },

    // ── Modal de novedades (se muestra una sola vez por versión) ──
    showNewsModal() {
        if (localStorage.getItem('froggie_news_v2')) return;
        const modal = document.getElementById('newsModal');
        if (!modal) return;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('visible'));
    },

    closeNewsModal() {
        const modal = document.getElementById('newsModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => { modal.style.display = 'none'; }, 250);
        localStorage.setItem('froggie_news_v2', '1');
    },

    // ── Menú lateral ────────────────────────────────────────
    toggleMenu(event) {
        if (event) event.stopPropagation();
        const menu    = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        const popover = document.getElementById('createPopover');
        if (popover) popover.classList.remove('show');
        menu.classList.toggle('open');
        if (menu.classList.contains('open')) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
            const drop = document.getElementById('appearanceDropdown');
            if (drop) drop.classList.remove('show');
        }
    },

    toggleAppearanceDropdown(event) {
        event.stopPropagation();
        document.getElementById('appearanceDropdown').classList.toggle('show');
    },

    closeAllPanels() {
        const ids = ['sideMenu', 'createPopover', 'appearanceDropdown'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('open', 'show');
        });
        document.getElementById('menuOverlay').classList.remove('show');
    },

    toggleCreateMenu(event) {
        event.stopPropagation();
        document.getElementById('createPopover').classList.toggle('show');
    },

    // ── Actualizar header según sesión ──────────────────────
    updateAuthUI() {
        const logoutBtn = document.getElementById('logoutBtn');
        const joinBtn   = document.getElementById('joinBtn');
        if (!logoutBtn || !joinBtn) return;
        if (Auth.userId) {
            logoutBtn.style.display = 'flex';
            joinBtn.style.display   = 'none';
        } else {
            logoutBtn.style.display = 'none';
            joinBtn.style.display   = 'flex';
        }
    },

    // ── Marcar el botón activo en el bottom nav ─────────────
    setActiveNav(routeName) {
        document.querySelectorAll('.nav-link-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.route === routeName);
        });
    },

    // ── HTML: Login popup (se inyecta una vez en index.html) ──
    loginPopupHTML() {
        return `
        <div id="loginPopupOverlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:9999; align-items:center; justify-content:center;">
            <div style="background:var(--bg-main); border:1px solid rgba(62,83,43,0.2); border-radius:18px; padding:36px 32px; max-width:360px; width:90%; text-align:center; box-shadow:0 12px 40px rgba(0,0,0,0.15); font-family:var(--font-serif);">
                <div style="font-size:2.4rem; margin-bottom:12px;">🐸</div>
                <h3 id="loginPopupMsg" style="font-size:1.25rem; font-weight:normal; color:var(--text-dark); margin-bottom:10px;">Join Froggie AI to unlock this!</h3>
                <p style="font-size:0.88rem; opacity:0.6; margin-bottom:24px;">Create your free account and start chatting, creating characters, and more.</p>
                <button onclick="Router.go('registro')" style="background:var(--btn-color); color:var(--bg-main); border:none; padding:12px 32px; border-radius:20px; font-family:var(--font-serif); font-size:1rem; cursor:pointer; width:100%; margin-bottom:10px;">Create account →</button>
                <button onclick="UI.closeLoginPopup()" style="background:none; border:none; color:var(--text-dark); opacity:0.5; cursor:pointer; font-family:var(--font-serif); font-size:0.9rem; padding:6px;">Maybe later</button>
            </div>
        </div>`;
    },

    // ── HTML: Modal de novedades ────────────────────────────
    newsModalHTML() {
        return `
        <div class="news-modal-overlay" id="newsModal" style="display:none;">
            <div class="news-modal">
                <button class="news-modal-close" onclick="UI.closeNewsModal()" aria-label="Close">✕</button>
                <div class="news-modal-frog">🐸</div>
                <h2>¡Bienvenidos de vuelta!</h2>
                <p class="news-tagline">...croac. Hay algunas cositas nuevas por aquí.</p>

                <div class="news-item">
                    <span class="news-item-icon">🙈</span>
                    <div class="news-item-text">
                        <strong>La descripción ya no es pública</strong>
                        La descripción de los personajes ahora es solo visible en su perfil de personaje — ya no aparece en el feed ni en las fichas del inicio.
                    </div>
                </div>
                <div class="news-item">
                    <span class="news-item-icon">🏷️</span>
                    <div class="news-item-text">
                        <strong>Categorías y etiquetas</strong>
                        Ahora puedes clasificar tus personajes con una categoría (Canon u OC) y hasta 3 etiquetas.
                    </div>
                </div>
                <div class="news-item">
                    <span class="news-item-icon">✏️</span>
                    <div class="news-item-text">
                        <strong>Recomendamos actualizar tus personajes</strong>
                        Si ya tienes personajes creados, ve a "Edit Character" para agregar categoría y tags.
                    </div>
                </div>
                <div class="news-item">
                    <span class="news-item-icon">🎨</span>
                    <div class="news-item-text">
                        <strong>Puedes cambiar la apariencia</strong>
                        Menú (esquina superior derecha) → <em>Appearance</em>. Hay modo oscuro y colores personalizados.
                    </div>
                </div>

                <hr class="news-modal-divider">
                <p class="news-modal-footer">Gracias por seguir aquí con nosotros. 🐸<br>— El equipo de Froggie AI</p>
                <button class="news-modal-btn" onclick="UI.closeNewsModal()">¡Entendido, croac! 🐸</button>
            </div>
        </div>`;
    },

    // ── HTML: Header completo ───────────────────────────────
    headerHTML({ showSearch = false } = {}) {
        const searchBar = showSearch ? `
            <div class="search-bar">
                <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                <input type="text" placeholder="Search chronicles..." id="searchInput">
            </div>` : '';

        return `
        <header>
            <a href="#" onclick="Router.go('dashboard'); return false;" class="brand">
                <img src="ranita.png" alt="Froggie Logo">
                <span>Froggie AI</span>
            </a>
            ${searchBar}
            <div class="header-right">
                <button class="btn-logout" id="logoutBtn" style="display:none;">
                    <svg class="icon-svg" style="width:18px;height:18px;" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                    <span>Log Out</span>
                </button>
                <button class="btn-logout" id="joinBtn" style="display:none; background:var(--btn-color); color:var(--bg-main); border:none; padding:7px 16px; border-radius:16px; cursor:pointer; font-family:var(--font-serif); font-size:0.9rem;" onclick="Router.go('registro')">
                    Join 🐸
                </button>
                <button class="menu-trigger" onclick="UI.toggleMenu(event)">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                </button>
            </div>
        </header>`;
    },

    // ── HTML: Sidebar / menú lateral ────────────────────────
    sidebarHTML() {
        return `
        <div class="overlay" id="menuOverlay" onclick="UI.closeAllPanels()"></div>
        <aside class="side-menu" id="sideMenu">
            <div class="side-menu-header">
                <h3>Options</h3>
                <button class="btn-close-menu" onclick="UI.toggleMenu(event)">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
            </div>

            <p class="menu-section-label">Your Space</p>
            <ul class="menu-options">
                <li>
                    <button class="menu-btn" onclick="Auth.requireLogin(() => Router.go('myprofile'))">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                        My Profile
                    </button>
                </li>
                <li>
                    <button class="menu-btn" onclick="Auth.requireLogin(() => Router.go('mycharacters'))">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        My Characters
                    </button>
                </li>
                <li>
                    <button class="menu-btn" onclick="Auth.requireLogin(() => Router.go('favorites'))">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        Favorites
                    </button>
                </li>
            </ul>

            <hr class="menu-divider">
            <p class="menu-section-label">Settings</p>
            <ul class="menu-options">
                <li>
                    <button class="menu-btn" onclick="UI.toggleAppearanceDropdown(event)">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
                        Appearance
                    </button>
                    <div class="appearance-dropdown" id="appearanceDropdown" onclick="event.stopPropagation()">
                        <button class="theme-sub-btn" onclick="Theme.apply('classic')">🟢 Froggie Classic</button>
                        <button class="theme-sub-btn" onclick="Theme.apply('dark')">🟤 Goth Novelist</button>
                        <div class="custom-picker-row">
                            <span>🎨 Background</span>
                            <input type="color" id="customBgInput" onchange="Theme.saveCustom(this.value, document.getElementById('customTextInput').value)">
                        </div>
                        <div class="custom-picker-row">
                            <span>✍️ Text</span>
                            <input type="color" id="customTextInput" value="#3E532B" onchange="Theme.saveCustom(document.getElementById('customBgInput').value, this.value)">
                        </div>
                    </div>
                </li>
                <li>
                    <button class="menu-btn" onclick="Auth.requireLogin(() => Router.go('api-settings'))">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12.65 11.65c-.43.54-1.08.85-1.75.85-.35 0-.68-.08-.99-.23l-4.22 4.22v1.51h1.51l4.22-4.22c.31.25.69.37 1.08.37.81 0 1.54-.52 1.81-1.29l5.22-5.22c.19-.19.19-.51 0-.71l-1.79-1.79c-.2-.2-.51-.2-.71 0l-5.38 5.38z"/></svg>
                        API Key
                    </button>
                </li>
            </ul>

            <hr class="menu-divider">
            <p class="menu-section-label">Support</p>
            <ul class="menu-options">
                <li>
                    <button class="menu-btn" onclick="Router.go('possible-doubts')">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                        Help Center
                    </button>
                </li>
                <li>
                    <button class="menu-btn" onclick="window.open('https://ko-fi.com/beemena','_blank')">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        Donations
                    </button>
                </li>
                <li>
                    <button class="menu-btn" onclick="window.open('https://discord.gg/9GN3AEVb7V','_blank')">
                        <svg class="icon-svg" viewBox="0 0 127.14 96.36"><path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.18,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a74.37,74.37,0,0,0,6.71-11,68.6,68.6,0,0,1-10.64-5.12c.91-.66,1.8-1.34,2.65-2a75.58,75.58,0,0,0,72.86,0c.85.69,1.74,1.37,2.65,2a68.45,68.45,0,0,1-10.64,5.12,74.65,74.65,0,0,0,6.71,11,105.73,105.73,0,0,0,31-18.83C129,50.7,122.64,27.78,107.7,8.07Z"/></svg>
                        Discord
                    </button>
                </li>
            </ul>
        </aside>`;
    },

    // ── HTML: Bottom navigation ─────────────────────────────
    bottomNavHTML() {
        return `
        <div class="create-popover" id="createPopover" onclick="event.stopPropagation()">
            <button onclick="Auth.requireLogin(() => Router.go('create-character'))">
                ✨ New Character
            </button>
        </div>
        <nav class="bottom-nav">
            <button class="nav-link-btn" data-route="dashboard" onclick="Router.go('dashboard')">
                <svg class="icon-svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                <span>Home</span>
            </button>
            <button class="nav-link-btn" data-route="create" onclick="UI.toggleCreateMenu(event)">
                <svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                <span>Create</span>
            </button>
            <button class="nav-link-btn" data-route="chat" onclick="Router.go('chat')">
                <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                <span>Chats</span>
            </button>
        </nav>`;
    }
};

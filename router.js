// ============================================================
//  router.js  —  navegación SPA sin recargar la página
//
//  Uso desde cualquier lugar:
//    Router.go('dashboard')
//    Router.go('room', { id: 'abc123' })
//    Router.go('character-profile', { id: 'xyz', from: 'dashboard' })
//
//  Equivalentes a tus window.location.href actuales:
//    'dashboard'         → dashboard.html
//    'registro'          → registro.html
//    'room'              → room.html?id=...
//    'myprofile'         → myprofile.html
//    'mycharacters'      → mycharacters.html
//    'favorites'         → favorites.html
//    'chat'              → chat.html
//    'api-settings'      → api-settings.html
//    'create-character'  → create-character.html
//    'edit-character'    → edit-character.html
//    'character-profile' → character-profile.html
//    'user-profile'      → user-profile.html
//    'possible-doubts'   → possible-doubts.html
//    'index'             → index.html
//    'reset-password'    → reset-password.html
// ============================================================

import { Auth, Theme } from './auth.js';

// Mapa: nombre de ruta → función importadora del módulo de página
const ROUTES = {
    'index':              () => import('./pages/index.js'),
    'dashboard':          () => import('./pages/dashboard.js'),
    'registro':           () => import('./pages/registro.js'),
    'reset-password':     () => import('./pages/reset-password.js'),
    'myprofile':          () => import('./pages/myprofile.js'),
    'mycharacters':       () => import('./pages/mycharacters.js'),
    'favorites':          () => import('./pages/favorites.js'),
    'chat':               () => import('./pages/chat.js'),
    'room':               () => import('./pages/room.js'),
    'api-settings':       () => import('./pages/api-settings.js'),
    'create-character':   () => import('./pages/create-character.js'),
    'edit-character':     () => import('./pages/edit-character.js'),
    'character-profile':  () => import('./pages/character-profile.js'),
    'user-profile':       () => import('./pages/user-profile.js'),
    'possible-doubts':    () => import('./pages/possible-doubts.js'),
};

export const Router = {
    // ── Navegar a una ruta ──────────────────────────────────
    // params = { id: '...', from: '...' }  (equivalente a ?id=...&from=...)
    go(routeName, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url   = query ? `#${routeName}?${query}` : `#${routeName}`;
        history.pushState({ routeName, params }, '', url);
        Router._load(routeName, params);
    },

    // ── Leer la ruta actual desde la URL ────────────────────
    current() {
        const hash = window.location.hash.slice(1); // quita el #
        if (!hash) return { name: 'dashboard', params: {} };
        const [name, qs] = hash.split('?');
        const params = qs ? Object.fromEntries(new URLSearchParams(qs)) : {};
        return { name, params };
    },

    // ── Cargar la página correspondiente ───────────────────
    async _load(routeName, params = {}) {
        const loader = ROUTES[routeName] || ROUTES['dashboard'];
        const app    = document.getElementById('app');

        // Cerrar popover de create al navegar
        document.getElementById('createPopover')?.classList.remove('show');

        // Limpiar clases que la landing pone al sidebar/overlay
        document.getElementById('sideMenu')?.classList.remove('landing-hidden');
        document.getElementById('menuOverlay')?.classList.remove('landing-hidden');

        // Ocultar bottom nav en páginas de auth y room, restaurar en el resto
        const hideNav = ['registro', 'reset-password', 'room'].includes(routeName);
        const bottomNav = document.getElementById('bottomNav');
        if (bottomNav) bottomNav.style.display = hideNav ? 'none' : 'flex';

        // Indicador de carga suave
        app.style.opacity = '0.6';
        app.style.transition = 'opacity 0.15s';

        try {
            const module = await loader();
            if (module.render) {
                app.innerHTML = module.render(params);
            }
            Theme.restore();
            if (module.init) {
                await module.init(params);
            }
        } catch (err) {
            console.error(`[Router] Error cargando "${routeName}":`, err);
            app.innerHTML = `<p style="padding:40px;text-align:center;opacity:0.5;">
                Algo salió mal cargando esta página. 🐸</p>`;
        }

        app.style.opacity = '1';
        window.scrollTo({ top: 0, behavior: 'instant' });
    },

    // ── Inicializar: escuchar popstate (botón atrás/adelante) ──
    init() {
        window.addEventListener('popstate', () => {
            const { name, params } = Router.current();
            Router._load(name, params);
        });

        // Cargar la ruta inicial
        const { name, params } = Router.current();
        Router._load(name, params);
    }
};

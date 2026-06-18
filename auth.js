// ============================================================
//  auth.js  —  sesión, guards de ruta y tema
//  Se ejecuta UNA SOLA VEZ al cargar la app.
//  Todas las páginas leen `Auth.userId` y llaman `Auth.requireLogin()`.
// ============================================================

import { _supabase } from './supabase.js';

// ─── Estado global de sesión ────────────────────────────────
export const Auth = {
    userId:  null,
    session: null,

    // Datos de la cuenta cargados desde la base (cartera + cosméticos).
    coins:   0,
    equipped: { skin: null, frame: null, cover: null },

    // ── Inicializar: restaura sesión guardada en localStorage ──
    async init() {
        // Restaurar tokens guardados (tu patrón actual)
        const storedAccess  = localStorage.getItem('froggie_access_token');
        const storedRefresh = localStorage.getItem('froggie_refresh_token');
        if (storedAccess && storedRefresh) {
            await _supabase.auth.setSession({
                access_token:  storedAccess,
                refresh_token: storedRefresh
            });
        }

        const { data: { session } } = await _supabase.auth.getSession();
        if (session) {
            Auth.session = session;
            Auth.userId  = session.user.id;
            localStorage.setItem('froggie_uid',           session.user.id);
            localStorage.setItem('froggie_access_token',  session.access_token);
            localStorage.setItem('froggie_refresh_token', session.refresh_token);
        } else {
            Auth.session = null;
            Auth.userId  = null;
        }

        // Cargar cartera + cosméticos en segundo plano (no frena el arranque).
        // Cuando lleguen, se aplica la skin equipada en tu cuenta.
        Auth.loadAccountData();

        return Auth.session;
    },

    // ── Cargar de la base: monedas (cartera) y qué tienes equipado ──
    async loadAccountData() {
        if (!Auth.userId) {
            Auth.coins = 0;
            Auth.equipped = { skin: null, frame: null, cover: null };
            return;
        }
        try {
            // Las dos consultas en paralelo (más rápido)
            const [walletRes, profileRes] = await Promise.all([
                _supabase.from('wallets')
                    .select('coins')
                    .eq('user_id', Auth.userId)
                    .maybeSingle(),
                _supabase.from('profiles')
                    .select('equipped_skin_id, equipped_frame_id, equipped_cover_id')
                    .eq('id', Auth.userId)
                    .maybeSingle()
            ]);

            Auth.coins = walletRes.data?.coins ?? 0;
            Auth.equipped = {
                skin:  profileRes.data?.equipped_skin_id  ?? null,
                frame: profileRes.data?.equipped_frame_id ?? null,
                cover: profileRes.data?.equipped_cover_id ?? null
            };

            // La base manda: aplicamos tu skin equipada (sin volver a guardarla).
            if (Auth.equipped.skin) Theme.applySkin(Auth.equipped.skin, { save: false });
            else                    Theme.clearSkin({ save: false });

            // Avisar a la app que ya hay monedas (por si hay un contador escuchando)
            document.dispatchEvent(new CustomEvent('coins-updated', { detail: Auth.coins }));
        } catch (e) {
            console.warn('No se pudo cargar tu cartera/cosméticos:', e);
        }
    },

    // ── Cerrar sesión ──────────────────────────────────────────
    async signOut() {
        await _supabase.auth.signOut();
        localStorage.removeItem('froggie_access_token');
        localStorage.removeItem('froggie_refresh_token');
        localStorage.removeItem('froggie_uid');
        Auth.session = null;
        Auth.userId  = null;
        Auth.coins   = 0;
        Auth.equipped = { skin: null, frame: null, cover: null };
        Router.go('dashboard');
    },

    // ── Guard: ejecuta `action` si hay sesión, si no muestra popup ──
    requireLogin(action) {
        if (Auth.userId) {
            action && action();
        } else {
            UI.showLoginPopup();
        }
    },

    // ── Guard de ruta: redirige al dashboard si NO hay sesión ──
    // Úsalo al inicio de páginas que requieren login (myprofile, room, etc.)
    requireSession() {
        if (!Auth.userId) {
            Router.go('registro');
            return false;
        }
        return true;
    }
};


// ============================================================
//  Theme.js  —  sistema de temas + skins (dentro de auth.js por tamaño)
//  Classic / Dark / Custom + Skins (Jardín Dorado, etc.)
//  Se aplica antes de renderizar.
//
//  NOTA sobre el parámetro { save }:
//    - Las acciones del USUARIO (elegir skin/tema en el menú) GUARDAN
//      el cambio en su cuenta (save: true, por defecto).
//    - Cuando la app aplica algo cargado DESDE la base, usa save: false
//      para no volver a escribir lo mismo.
// ============================================================

export const Theme = {
    // Aplicar lo guardado en localStorage (pintado instantáneo al arrancar).
    // No guarda en la base: solo pinta rápido. La base se sincroniza aparte.
    restore() {
        const skin = localStorage.getItem('user-skin');
        if (skin) { Theme.applySkin(skin, { save: false }); return; }

        const saved = localStorage.getItem('user-theme');
        if (saved === 'dark')        Theme.apply('dark', { save: false });
        else if (saved === 'custom') Theme.applyCustom({ save: false });
        // 'classic' o null → no hace nada (los CSS vars por defecto son classic)
    },

    apply(name, opts = {}) {
        Theme._removeSkinClasses();           // un tema normal quita cualquier skin
        localStorage.removeItem('user-skin');
        document.body.removeAttribute('style');
        document.body.classList.toggle('theme-dark', name === 'dark');
        localStorage.setItem('user-theme', name);
        if (opts.save !== false) Theme._saveEquippedSkin(null);  // tema normal = sin skin
    },

    applyCustom(opts = {}) {
        Theme._removeSkinClasses();
        localStorage.removeItem('user-skin');
        document.body.classList.remove('theme-dark');
        const bg  = localStorage.getItem('custom-bg')   || '#FFFDF9';
        const txt = localStorage.getItem('custom-text') || '#3E532B';
        document.body.style.setProperty('--bg-main',    bg);
        document.body.style.setProperty('--text-dark',  txt);
        document.body.style.setProperty('--btn-color',  txt);
        document.body.style.setProperty('--bg-accent',  Theme._adjustBrightness(bg, -12));
        localStorage.setItem('user-theme', 'custom');
        // Sincronizar los color pickers si están presentes en el DOM
        const bgInput  = document.getElementById('customBgInput');
        const txtInput = document.getElementById('customTextInput');
        if (bgInput)  bgInput.value  = bg;
        if (txtInput) txtInput.value = txt;
        if (opts.save !== false) Theme._saveEquippedSkin(null);  // tema normal = sin skin
    },

    saveCustom(bg, txt) {
        localStorage.setItem('custom-bg',   bg);
        localStorage.setItem('custom-text', txt);
        Theme.applyCustom();
    },

    // ── SKINS ──────────────────────────────────────────────────
    // Una skin define un look COMPLETO (fondo, barras, marco, fuente).
    // Se activa poniendo la clase  body.skin-<id>  y el CSS de la skin
    // (que debes enlazar en index.html) hace el resto.
    applySkin(id, opts = {}) {
        if (!id) { Theme.clearSkin(opts); return; }
        Theme._removeSkinClasses();
        document.body.style.removeProperty('--bg-main');   // limpiar restos de "custom"
        document.body.style.removeProperty('--text-dark');
        document.body.style.removeProperty('--btn-color');
        document.body.style.removeProperty('--bg-accent');
        document.body.classList.remove('theme-dark');      // la skin trae su propio look
        document.body.classList.add('skin-' + id);
        localStorage.setItem('user-skin', id);
        if (opts.save !== false) Theme._saveEquippedSkin(id);   // guardar en la cuenta
    },

    // Quitar la skin y volver al tema guardado (classic / dark / custom)
    clearSkin(opts = {}) {
        Theme._removeSkinClasses();
        localStorage.removeItem('user-skin');
        const saved = localStorage.getItem('user-theme');
        // Restaurar el tema visual SIN reescribir la base (eso lo hace la línea de abajo)
        if (saved === 'dark')        Theme.apply('dark', { save: false });
        else if (saved === 'custom') Theme.applyCustom({ save: false });
        if (opts.save !== false) Theme._saveEquippedSkin(null);  // dejar "sin skin" en la cuenta
    },

    _removeSkinClasses() {
        [...document.body.classList].forEach(c => {
            if (c.startsWith('skin-')) document.body.classList.remove(c);
        });
    },

    // Guarda en TU perfil qué skin tienes equipada (o null si ninguna).
    // Si no hay sesión, no hace nada (queda solo en el navegador).
    _saveEquippedSkin(id) {
        if (!Auth.userId) return;
        _supabase.from('profiles')
            .update({ equipped_skin_id: id })
            .eq('id', Auth.userId)
            .then(({ error }) => {
                if (error) console.warn('No se guardó la skin equipada:', error.message);
                else Auth.equipped.skin = id;
            });
    },

    _adjustBrightness(hex, pct) {
        let n = parseInt(hex.replace('#',''), 16), a = Math.round(2.55 * pct);
        let R = (n >> 16) + a, G = (n >> 8 & 0xFF) + a, B = (n & 0xFF) + a;
        const clamp = v => Math.max(0, Math.min(255, v));
        return '#' + (0x1000000 + clamp(R)*0x10000 + clamp(G)*0x100 + clamp(B)).toString(16).slice(1);
    }
};

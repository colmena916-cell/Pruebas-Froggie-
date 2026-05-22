// ============================================================
//  pages/reset-password.js  —  Nueva contraseña
//  Se activa cuando Supabase redirige con token en el hash URL.
// ============================================================

import { _supabase } from '../supabase.js';
import { Router }    from '../router.js';

export function render() {
    return `
    <style>
        .auth-page { background-color: var(--bg-accent); min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; }
        .frog-logo { width: 48px; height: auto; margin-bottom: 12px; }
        .auth-card h2 { font-size: 1.9rem; font-weight: normal; margin-bottom: 6px; letter-spacing: 1px; }
        .auth-card .subtitle { font-size: 0.9rem; opacity: 0.7; margin-bottom: 28px; font-style: italic; }

        .reset-form { display: flex; flex-direction: column; gap: 18px; }
        .form-group { text-align: left; }
        .form-group label { display: block; font-size: 0.9rem; font-style: italic; margin-bottom: 6px; opacity: 0.85; }

        .password-wrapper { position: relative; display: flex; align-items: center; }
        .password-wrapper input {
            width: 100%; padding: 11px 42px 11px 14px;
            border: 1px solid rgba(62,83,43,0.35); border-radius: 7px;
            background-color: var(--bg-main); color: var(--text-dark);
            font-family: var(--font-serif); font-size: 1rem; outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .password-wrapper input:focus { border-color: var(--btn-color); box-shadow: 0 0 0 3px rgba(93,112,56,0.12); }
        .toggle-pw {
            position: absolute; right: 12px; background: none; border: none;
            cursor: pointer; padding: 0; display: flex; align-items: center;
            color: var(--text-dark); opacity: 0.45; transition: opacity 0.2s;
        }
        .toggle-pw:hover { opacity: 0.85; }
        .toggle-pw svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

        .btn-submit {
            background-color: var(--btn-color); color: #fff; border: none;
            width: 100%; padding: 13px; font-family: var(--font-serif);
            font-size: 1.05rem; border-radius: 30px; cursor: pointer;
            margin-top: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            transition: background-color 0.2s, transform 0.1s;
        }
        .btn-submit:hover { background-color: var(--btn-hover); }
        .btn-submit:active { transform: scale(0.98); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-message { font-size: 0.88rem; padding: 10px 14px; border-radius: 6px; display: none; text-align: left; }
        .form-message.error   { display: block; background-color: rgba(180,60,60,0.08); border: 1px solid rgba(180,60,60,0.3); color: #8b2e2e; }
        .form-message.success { display: block; background-color: rgba(62,83,43,0.08); border: 1px solid rgba(62,83,43,0.3); color: var(--btn-color); }

        .invalid-state { display: none; flex-direction: column; gap: 16px; align-items: center; }
        .invalid-state p { font-size: 0.95rem; opacity: 0.8; line-height: 1.5; }

        .back-link { display: inline-block; margin-top: 22px; color: var(--text-dark); text-decoration: none; font-size: 0.9rem; opacity: 0.6; transition: opacity 0.2s; background: none; border: none; font-family: var(--font-serif); cursor: pointer; }
        .back-link:hover { opacity: 1; }
    </style>

    <div class="auth-page">
        <div class="auth-card">
            <img src="ranita.png" alt="Froggie Logo" class="frog-logo">
            <h2>New Password</h2>
            <p class="subtitle">Choose something you won't forget this time.</p>

            <div class="reset-form" id="resetForm">
                <div class="form-message" id="resetMsg"></div>

                <div class="form-group">
                    <label for="new-password">New Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="new-password" placeholder="••••••••" required minlength="6">
                        <button type="button" class="toggle-pw" id="toggleNewPw" aria-label="Show password">
                            <svg id="eye-new-open" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg id="eye-new-closed" viewBox="0 0 24 24" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirm-password">Confirm Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="confirm-password" placeholder="••••••••" required minlength="6">
                        <button type="button" class="toggle-pw" id="toggleConfirmPw" aria-label="Show password">
                            <svg id="eye-confirm-open" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg id="eye-confirm-closed" viewBox="0 0 24 24" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                </div>

                <button class="btn-submit" id="resetBtn">Update Password</button>
            </div>

            <!-- Estado de enlace inválido/expirado -->
            <div class="invalid-state" id="invalidState">
                <p>This link has expired or is invalid. Please request a new one from the login page.</p>
                <button class="btn-submit" id="backToLoginBtn">Back to Log In</button>
            </div>

            <button class="back-link" id="backLink">← Return to log in</button>
        </div>
    </div>
    `;
}

export function init() {
    // Ocultar layout global
    document.getElementById('bottomNav').style.display   = 'none';
    document.getElementById('sideMenu').style.display    = 'none';
    document.getElementById('menuOverlay').style.display = 'none';

    let sessionReady = false;

    // Supabase detecta el token de recovery en el hash automáticamente
    _supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') sessionReady = true;
    });

    // Si no hay token en el hash, mostrar estado inválido
    setTimeout(() => {
        const hash = window.location.hash;
        if (!hash.includes('access_token') && !hash.includes('type=recovery') && !sessionReady) {
            document.getElementById('resetForm').style.display  = 'none';
            document.getElementById('backLink').style.display   = 'none';
            document.getElementById('invalidState').style.display = 'flex';
        }
    }, 500);

    // ── Helpers ──────────────────────────────────────────────
    const showMsg = (text, type) => {
        const el = document.getElementById('resetMsg');
        el.textContent = text;
        el.className = `form-message ${type}`;
        el.style.display = 'block';
    };

    const togglePw = (inputId, openId, closedId, btn) => {
        const input   = document.getElementById(inputId);
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        document.getElementById(openId).style.display   = showing ? 'block' : 'none';
        document.getElementById(closedId).style.display = showing ? 'none'  : 'block';
        btn.style.opacity = showing ? '0.45' : '0.85';
    };

    // ── Password toggles ──────────────────────────────────────
    document.getElementById('toggleNewPw').onclick = function() {
        togglePw('new-password', 'eye-new-open', 'eye-new-closed', this);
    };
    document.getElementById('toggleConfirmPw').onclick = function() {
        togglePw('confirm-password', 'eye-confirm-open', 'eye-confirm-closed', this);
    };

    // ── Submit ────────────────────────────────────────────────
    document.getElementById('resetBtn').onclick = async () => {
        const newPw     = document.getElementById('new-password').value;
        const confirmPw = document.getElementById('confirm-password').value;
        const btn       = document.getElementById('resetBtn');

        if (newPw !== confirmPw) { showMsg("Passwords don't match. Please try again.", 'error'); return; }
        if (newPw.length < 6)   { showMsg("Password must be at least 6 characters.", 'error'); return; }

        btn.textContent = 'Updating...';
        btn.disabled = true;

        const { error } = await _supabase.auth.updateUser({ password: newPw });

        if (error) {
            showMsg(
                error.message.includes('expired') || error.message.includes('invalid')
                    ? 'This link has expired. Please request a new password reset.'
                    : 'Something went wrong. Please try again.',
                'error'
            );
            btn.textContent = 'Update Password';
            btn.disabled = false;
        } else {
            showMsg('Password updated successfully! Redirecting to log in...', 'success');
            await _supabase.auth.signOut();
            setTimeout(() => Router.go('registro'), 1800);
        }
    };

    // ── Navegación ────────────────────────────────────────────
    document.getElementById('backLink').onclick       = () => Router.go('registro');
    document.getElementById('backToLoginBtn').onclick = () => Router.go('registro');
}

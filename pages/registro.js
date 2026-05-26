// ============================================================
//  pages/registro.js  —  Login / Sign Up / Forgot Password
//  Página de autenticación — no requiere sesión previa.
// ============================================================

import { _supabase } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

const USER_LIMIT = 1000;

export function render() {
    return `
    <style>
        .auth-page {
            background-color: var(--bg-accent);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .frog-logo { width: 48px; height: auto; margin-bottom: 12px; }
        .auth-card h2 { font-size: 2rem; font-weight: normal; margin-bottom: 6px; letter-spacing: 1px; }
        .auth-card .subtitle { font-size: 0.9rem; opacity: 0.7; margin-bottom: 28px; font-style: italic; }

        .tab-switcher { display: flex; border-bottom: 1px solid rgba(62,83,43,0.2); margin-bottom: 28px; }
        .tab-btn {
            flex: 1; background: none; border: none; padding: 10px 0;
            font-family: var(--font-serif); font-size: 1rem;
            color: var(--text-dark); opacity: 0.5; cursor: pointer;
            position: relative; transition: opacity 0.2s;
        }
        .tab-btn.active { opacity: 1; font-weight: bold; }
        .tab-btn.active::after {
            content: ''; position: absolute; bottom: -1px; left: 0;
            width: 100%; height: 2px; background-color: var(--btn-color);
        }

        .auth-form { display: none; flex-direction: column; gap: 18px; }
        .auth-form.active { display: flex; }

        .form-group { text-align: left; }
        .form-group label { display: block; font-size: 0.9rem; font-style: italic; margin-bottom: 6px; opacity: 0.85; }
        .form-group input {
            width: 100%; padding: 11px 14px;
            border: 1px solid rgba(62,83,43,0.35); border-radius: 7px;
            background-color: var(--bg-main); color: var(--text-dark);
            font-family: var(--font-serif); font-size: 1rem; outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-group input:focus { border-color: var(--btn-color); box-shadow: 0 0 0 3px rgba(93,112,56,0.12); }

        .password-wrapper { position: relative; display: flex; align-items: center; }
        .password-wrapper input { padding: 11px 42px 11px 14px; }
        .toggle-pw {
            position: absolute; right: 12px; background: none; border: none;
            cursor: pointer; padding: 0; display: flex; align-items: center;
            color: var(--text-dark); opacity: 0.4; transition: opacity 0.2s;
        }
        .toggle-pw:hover { opacity: 0.8; }
        .toggle-pw svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }

        .forgot-link {
            display: block; margin-top: 7px; font-size: 0.82rem; font-style: italic;
            color: var(--text-dark); opacity: 0.55; cursor: pointer;
            background: none; border: none; font-family: var(--font-serif);
            width: 100%; text-align: right; transition: opacity 0.2s;
        }
        .forgot-link:hover { opacity: 1; }

        .forgot-panel { display: none; flex-direction: column; gap: 16px; padding-top: 4px; }
        .forgot-panel.visible { display: flex; }
        .forgot-panel .panel-title { font-size: 0.95rem; font-style: italic; opacity: 0.8; text-align: left; line-height: 1.4; }
        .back-to-login {
            font-size: 0.82rem; font-style: italic; color: var(--text-dark);
            opacity: 0.55; background: none; border: none;
            font-family: var(--font-serif); cursor: pointer; text-align: left; transition: opacity 0.2s;
        }
        .back-to-login:hover { opacity: 1; }

        .btn-submit {
            background-color: var(--btn-color); color: #fff; border: none;
            width: 100%; padding: 13px; font-family: var(--font-serif);
            font-size: 1.05rem; border-radius: 30px; cursor: pointer;
            margin-top: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            transition: background-color 0.2s, transform 0.1s;
        }
        .btn-submit:hover { background-color: var(--btn-hover); }
        .btn-submit:active { transform: scale(0.98); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .form-message { font-size: 0.88rem; padding: 10px 14px; border-radius: 6px; display: none; text-align: left; }
        .form-message.error   { display: block; background-color: rgba(180,60,60,0.08); border: 1px solid rgba(180,60,60,0.3); color: #8b2e2e; }
        .form-message.success { display: block; background-color: rgba(62,83,43,0.08); border: 1px solid rgba(62,83,43,0.3); color: var(--btn-color); }

        .back-link { display: inline-block; margin-top: 22px; color: var(--text-dark); text-decoration: none; font-size: 0.9rem; opacity: 0.6; transition: opacity 0.2s; background: none; border: none; font-family: var(--font-serif); cursor: pointer; }
        .back-link:hover { opacity: 1; }
    </style>

    <div class="auth-page">
        <div class="auth-card">
            <img src="ranita.png" alt="Froggie Logo" class="frog-logo">
            <h2>Enter the Pond</h2>
            <p class="subtitle">Your stories are waiting.</p>

            <div class="tab-switcher">
                <button class="tab-btn active" id="tabLogin">Log In</button>
                <button class="tab-btn" id="tabRegister">Sign Up</button>
            </div>

            <!-- Login -->
            <form class="auth-form active" id="loginForm">
                <div class="form-message" id="loginMsg"></div>
                <div class="form-group">
                    <label for="login-email">Email Address</label>
                    <input type="email" id="login-email" placeholder="your.email@example.com" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="login-password" placeholder="••••••••" required>
                        <button type="button" class="toggle-pw" id="toggleLoginPw" aria-label="Show password">
                            <svg id="eye-login-open" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg id="eye-login-closed" viewBox="0 0 24 24" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                    <button type="button" class="forgot-link" id="forgotLink">Forgot your password?</button>
                </div>
                <button type="submit" class="btn-submit" id="loginBtn">Log In</button>
            </form>

            <!-- Forgot password panel -->
            <div class="forgot-panel" id="forgotPanel">
                <div class="form-message" id="forgotMsg"></div>
                <p class="panel-title">Enter your email and we'll send you a link to reset your password.</p>
                <div class="form-group">
                    <label for="forgot-email">Email Address</label>
                    <input type="email" id="forgot-email" placeholder="your.email@example.com">
                </div>
                <button type="button" class="btn-submit" id="forgotBtn">Send Reset Link</button>
                <button type="button" class="back-to-login" id="backToLogin">← Back to log in</button>
            </div>

            <!-- Register -->
            <form class="auth-form" id="registerForm">
                <div class="form-message" id="registerMsg"></div>
                <div class="form-group">
                    <label for="reg-email">Email Address</label>
                    <input type="email" id="reg-email" placeholder="your.email@example.com" required>
                </div>
                <div class="form-group">
                    <label for="reg-password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="reg-password" placeholder="••••••••" required>
                        <button type="button" class="toggle-pw" id="toggleRegPw" aria-label="Show password">
                            <svg id="eye-reg-open" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg id="eye-reg-closed" viewBox="0 0 24 24" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                </div>
                <button type="submit" class="btn-submit" id="registerBtn">Create Account</button>
                <p style="text-align:center;font-size:0.78rem;opacity:0.55;margin-top:10px;font-family:var(--font-serif);line-height:1.5;">
                    By signing up you agree to our
                    <button type="button" style="background:none;border:none;color:var(--text-dark);font-family:var(--font-serif);font-size:0.78rem;cursor:pointer;text-decoration:underline;text-underline-offset:2px;" id="termsLink">Terms & Community Guidelines</button>.
                </p>
            </form>

            <button class="back-link" id="backHome">← Return to home</button>
        </div>
    </div>
    `;
}

export async function init() {
    // Si ya hay sesión activa, ir directo al dashboard
    if (Auth.userId) { Router.go('dashboard'); return; }

    // Ocultar elementos de layout que no aplican aquí
    document.getElementById('bottomNav').style.display  = 'none';
    document.getElementById('sideMenu').style.display   = 'none';
    document.getElementById('menuOverlay').style.display = 'none';

    // ── Helpers locales ──────────────────────────────────────
    const showMsg = (id, text, type) => {
        const el = document.getElementById(id);
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
        btn.style.opacity = showing ? '0.4' : '0.8';
    };

    const switchTab = (tab) => {
        document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
        document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
        document.getElementById('loginForm').classList.toggle('active', tab === 'login');
        document.getElementById('registerForm').classList.toggle('active', tab === 'register');
        hideForgotPanel();
        document.getElementById('loginMsg').style.display    = 'none';
        document.getElementById('registerMsg').style.display = 'none';
    };

    const showForgotPanel = () => {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('forgotPanel').classList.add('visible');
        const email = document.getElementById('login-email').value;
        if (email) document.getElementById('forgot-email').value = email;
    };

    const hideForgotPanel = () => {
        document.getElementById('forgotPanel').classList.remove('visible');
        document.getElementById('loginForm').style.display = '';
        document.getElementById('forgotMsg').style.display = 'none';
    };

    // ── Tabs ─────────────────────────────────────────────────
    document.getElementById('tabLogin').onclick    = () => switchTab('login');
    document.getElementById('tabRegister').onclick = () => switchTab('register');

    // ── Password toggles ─────────────────────────────────────
    document.getElementById('toggleLoginPw').onclick = function() {
        togglePw('login-password', 'eye-login-open', 'eye-login-closed', this);
    };
    document.getElementById('toggleRegPw').onclick = function() {
        togglePw('reg-password', 'eye-reg-open', 'eye-reg-closed', this);
    };

    // ── Forgot password ──────────────────────────────────────
    document.getElementById('forgotLink').onclick   = showForgotPanel;
    document.getElementById('backToLogin').onclick  = hideForgotPanel;

    document.getElementById('forgotBtn').onclick = async () => {
        const email = document.getElementById('forgot-email').value.trim();
        const btn   = document.getElementById('forgotBtn');
        if (!email) { showMsg('forgotMsg', 'Please enter your email address.', 'error'); return; }

        btn.textContent = 'Sending...';
        btn.disabled = true;

        const { error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });

        showMsg('forgotMsg',
            error ? 'Something went wrong. Please try again.'
                  : 'Check your inbox — we sent you a reset link. (It may take a minute.)',
            error ? 'error' : 'success'
        );
        btn.textContent = 'Send Reset Link';
        btn.disabled = false;
    };

    // ── Login ─────────────────────────────────────────────────
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const email    = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn      = document.getElementById('loginBtn');

        btn.textContent = 'Entering...';
        btn.disabled = true;

        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

        if (error) {
            showMsg('loginMsg',
                error.message.includes('confirm')
                    ? 'Please check your email to confirm your account first.'
                    : 'Invalid email or password. Please try again.',
                'error'
            );
            btn.textContent = 'Log In';
            btn.disabled = false;
        } else {
            showMsg('loginMsg', 'Welcome back! Redirecting...', 'success');
            // Actualizar Auth global con la nueva sesión
            Auth.userId  = data.user.id;
            Auth.session = data.session;
            localStorage.setItem('froggie_uid',           data.user.id);
            localStorage.setItem('froggie_access_token',  data.session.access_token);
            localStorage.setItem('froggie_refresh_token', data.session.refresh_token);
            setTimeout(() => Router.go('dashboard'), 800);
        }
    };

    // ── Registro ──────────────────────────────────────────────
    document.getElementById('registerForm').onsubmit = async (e) => {
        e.preventDefault();
        const email    = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const btn      = document.getElementById('registerBtn');

        btn.textContent = 'Checking availability...';
        btn.disabled = true;

        const { count, error: countError } = await _supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true });

        if (countError) {
            showMsg('registerMsg', 'Could not verify availability. Try again.', 'error');
            btn.textContent = 'Create Account';
            btn.disabled = false;
            return;
        }

        if (count >= USER_LIMIT) {
            const el = document.getElementById('registerMsg');
            el.innerHTML = '🐸 Froggie AI is currently at full capacity. Follow us to know when spots open up! <a href="https://discord.gg/9GN3AEVb7V" target="_blank" style="color:inherit;font-weight:bold;">Discord</a> · <a href="https://www.tiktok.com/@beemena_" target="_blank" style="color:inherit;font-weight:bold;">TikTok</a>';
            el.className = 'form-message error';
            el.style.display = 'block';
            btn.textContent = 'Create Account';
            btn.disabled = false;
            return;
        }

        btn.textContent = 'Creating account...';

        const { error } = await _supabase.auth.signUp({ email, password });

        if (error) {
            showMsg('registerMsg', error.message, 'error');
            btn.textContent = 'Create Account';
            btn.disabled = false;
        } else {
            showMsg('registerMsg', 'Account created! Switching to login...', 'success');
            document.getElementById('login-email').value = email;
            setTimeout(() => {
                switchTab('login');
                showMsg('loginMsg', 'Now enter your password to log in. (Check your email inbox to confirm your account if login fails.)', 'success');
                btn.textContent = 'Create Account';
                btn.disabled = false;
            }, 2000);
        }
    };

    // ── Navegación ────────────────────────────────────────────
    document.getElementById('backHome').onclick  = () => Router.go('index');
    document.getElementById('termsLink').onclick = () => Router.go('possible-doubts');
}

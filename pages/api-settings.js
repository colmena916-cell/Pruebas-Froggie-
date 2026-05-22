// ============================================================
//  pages/api-settings.js  —  Configuración de API key
//  Requiere sesión.
// ============================================================

import { _supabase } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

const PROVIDERS = {
    openai:      { label: 'OpenAI API Key',          placeholder: 'sk-...',          hint: 'OpenAI gives you access to GPT-4o, GPT-4o mini and other models. Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" class="help-link">platform.openai.com ↗</a>' },
    openrouter:  { label: 'OpenRouter API Key',      placeholder: 'sk-or-v1-...',    hint: 'OpenRouter lets you access many models (MythoMax, Claude, Mistral and more). Get yours at <a href="https://openrouter.ai/keys" target="_blank" class="help-link">openrouter.ai ↗</a>' },
    anthropic:   { label: 'Anthropic API Key',       placeholder: 'sk-ant-...',      hint: 'Access Claude models. Get your key at <a href="https://console.anthropic.com/settings/keys" target="_blank" class="help-link">console.anthropic.com ↗</a>' },
    gemini:      { label: 'Google AI Studio API Key',placeholder: 'AIza...',         hint: 'Free tier available. Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" class="help-link">aistudio.google.com ↗</a>' },
    other:       { label: 'API Key',                 placeholder: 'Your API key...', hint: 'Use any OpenAI-compatible endpoint. Provide the full URL and model name below.' }
};

export function render() {
    return `
    <style>
        .help-banner {
            background-color: rgba(62,83,43,0.06);
            border-bottom: 1px solid rgba(62,83,43,0.12);
            padding: 10px 22px; font-size: 0.88rem;
            display: flex; align-items: center; gap: 8px;
        }
        .help-banner a { color: var(--btn-color); }

        .page-title    { font-size: 1.6rem; font-weight: normal; margin-bottom: 6px; }
        .page-subtitle { font-size: 0.9rem; opacity: 0.55; margin-bottom: 24px; font-style: italic; }

        .provider-grid { display: grid; gap: 10px; margin-bottom: 10px; }

        .provider-btn {
            background: none; border: 1px solid rgba(62,83,43,0.2);
            border-radius: 10px; padding: 12px 10px;
            font-family: var(--font-serif); font-size: 0.9rem;
            color: var(--text-dark); cursor: pointer;
            display: flex; align-items: center; gap: 8px;
            transition: background-color 0.2s, border-color 0.2s;
        }
        .provider-btn:hover   { background-color: rgba(62,83,43,0.05); }
        .provider-btn.selected { background-color: rgba(62,83,43,0.08); border-color: var(--btn-color); font-weight: bold; }
        .provider-icon { font-size: 1.1rem; }

        .settings-card {
            background: rgba(62,83,43,0.02);
            border: 1px solid rgba(62,83,43,0.1);
            border-radius: 14px; padding: 20px;
            display: flex; flex-direction: column; gap: 16px;
            margin-bottom: 20px;
        }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-group label { font-size: 0.88rem; opacity: 0.75; font-style: italic; }
        .field-hint  { font-size: 0.82rem; opacity: 0.65; line-height: 1.5; }
        .field-hint a { color: var(--btn-color); }
        .help-link  { color: var(--btn-color); }

        .key-input-wrapper { position: relative; display: flex; align-items: center; }
        .key-input-wrapper input {
            width: 100%; padding: 11px 42px 11px 14px;
            border: 1px solid rgba(62,83,43,0.3); border-radius: 8px;
            background: var(--bg-main); color: var(--text-dark);
            font-family: var(--font-serif); font-size: 0.95rem; outline: none;
            transition: border-color 0.2s;
        }
        .key-input-wrapper input:focus { border-color: var(--btn-color); }
        .toggle-visibility {
            position: absolute; right: 10px;
            background: none; border: none; cursor: pointer;
            color: var(--text-dark); opacity: 0.5; transition: opacity 0.2s;
        }
        .toggle-visibility:hover { opacity: 0.9; }

        .field-group input[type="text"] {
            width: 100%; padding: 10px 14px;
            border: 1px solid rgba(62,83,43,0.3); border-radius: 8px;
            background: var(--bg-main); color: var(--text-dark);
            font-size: 0.95rem; outline: none; transition: border-color 0.2s;
        }
        .field-group input[type="text"]:focus { border-color: var(--btn-color); }

        .model-field { display: none; }
        .model-field.visible { display: flex; }

        .btn-save {
            background-color: var(--btn-color); color: #fff; border: none;
            padding: 13px; border-radius: 30px; width: 100%;
            font-family: var(--font-serif); font-size: 1rem; cursor: pointer;
            transition: background-color 0.2s;
        }
        .btn-save:hover { background-color: var(--btn-hover); }

        .status-msg { font-size: 0.88rem; padding: 8px 12px; border-radius: 6px; display: none; }
        .status-msg.success { display: block; background: rgba(62,83,43,0.08); border: 1px solid rgba(62,83,43,0.3); color: var(--btn-color); }
        .status-msg.error   { display: block; background: rgba(180,60,60,0.08); border: 1px solid rgba(180,60,60,0.3); color: #8b2e2e; }

        .security-note {
            display: flex; align-items: flex-start; gap: 10px;
            font-size: 0.82rem; opacity: 0.6; line-height: 1.5;
            background: rgba(62,83,43,0.03); border-radius: 10px; padding: 14px;
        }

        /* Modal de ayuda */
        .api-help-modal {
            position: fixed; inset: 0; background: rgba(0,0,0,0.45);
            z-index: 500; display: flex; align-items: center;
            justify-content: center; padding: 20px;
        }
        .api-help-inner {
            background: var(--bg-main); border: 1px solid rgba(62,83,43,0.2);
            border-radius: 18px; padding: 28px 24px 24px;
            max-width: 400px; width: 100%; position: relative;
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        .api-help-close {
            position: absolute; top: 14px; right: 16px;
            background: none; border: none; cursor: pointer;
            color: var(--text-dark); opacity: 0.5; font-size: 1.3rem;
        }
        .api-help-close:hover { opacity: 1; }
        .api-help-btn {
            display: block; width: 100%; text-align: center;
            background-color: var(--btn-color); color: #fff; border: none;
            padding: 11px; font-family: var(--font-serif); font-size: 0.95rem;
            border-radius: 30px; cursor: pointer; transition: background-color 0.2s;
        }
        .api-help-btn:hover { background-color: var(--btn-hover); }
        .api-help-skip {
            display: block; width: 100%; margin-top: 10px;
            background: none; border: none; font-family: var(--font-serif);
            font-size: 0.88rem; opacity: 0.5; cursor: pointer; color: var(--text-dark);
        }
    </style>

    <!-- Modal de ayuda -->
    <div class="api-help-modal" id="apiHelpModal">
        <div class="api-help-inner">
            <button class="api-help-close" id="apiHelpClose">✕</button>
            <div style="font-size:2rem;text-align:center;margin-bottom:10px;">🔑</div>
            <h3 style="font-weight:normal;font-size:1.2rem;text-align:center;margin-bottom:8px;">Setting up your API key?</h3>
            <p style="font-size:0.9rem;line-height:1.6;opacity:0.8;margin-bottom:14px;text-align:center;">If you're not sure what to put here, the <strong>Help Center</strong> has everything you need — including a step-by-step guide with links to connect for free in minutes.</p>
            <p style="font-size:0.85rem;line-height:1.55;opacity:0.7;margin-bottom:20px;text-align:center;">👉 If you're new, look for the <em>Custom API</em> section — <strong>at the bottom</strong> you'll find the full tutorial.</p>
            <button class="api-help-btn" id="apiHelpGoBtn">Go to Help Center →</button>
            <button class="api-help-skip" id="apiHelpSkip">I already know what I'm doing</button>
        </div>
    </div>

    <div class="help-banner">
        <svg style="width:15px;height:15px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
        Not sure what to put here? <a href="#" id="helpBannerLink">Check the Help Center ↗</a>
    </div>

    <header>
        <button class="btn-back" onclick="history.back()" style="background:none;border:none;cursor:pointer;color:var(--text-dark);display:flex;align-items:center;padding:6px;border-radius:50%;">
            <svg style="width:22px;height:22px;fill:currentColor;" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
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
        <h2 class="page-title">AI Engine</h2>
        <p class="page-subtitle">Connect your own API key to power the characters.</p>

        <div class="provider-grid" style="grid-template-columns:1fr 1fr 1fr;">
            <button class="provider-btn selected" id="provider-openai"><span class="provider-icon">⚡</span>OpenAI</button>
            <button class="provider-btn" id="provider-openrouter"><span class="provider-icon">🔀</span>OpenRouter</button>
            <button class="provider-btn" id="provider-anthropic"><span class="provider-icon">🤖</span>Claude</button>
        </div>
        <div class="provider-grid" style="grid-template-columns:1fr 1fr;margin-bottom:24px;">
            <button class="provider-btn" id="provider-gemini"><span class="provider-icon">✦</span>Gemini</button>
            <button class="provider-btn" id="provider-other"><span class="provider-icon">🔧</span>Custom</button>
        </div>

        <div class="settings-card">
            <p class="field-hint" id="providerHint"></p>

            <div class="field-group">
                <label id="keyLabel">API Key</label>
                <div class="key-input-wrapper">
                    <input type="password" id="apiKeyField" placeholder="sk-...">
                    <button class="toggle-visibility" id="toggleKeyBtn" title="Show / hide key">
                        <svg style="width:18px;height:18px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </button>
                </div>
            </div>

            <div class="field-group model-field" id="modelField">
                <label>Model</label>
                <input type="text" id="modelInput" placeholder="e.g. gryphe/mythomax-l2-13b" style="font-family:monospace;">
                <p class="field-hint" id="modelHint">Find model names at <a href="https://openrouter.ai/models" target="_blank" class="help-link">openrouter.ai/models ↗</a></p>
            </div>

            <div class="field-group model-field" id="customUrlField">
                <label>API Endpoint URL</label>
                <input type="text" id="customUrl" placeholder="https://your-endpoint.com/v1/chat/completions" style="font-family:monospace;">
                <p class="field-hint">Must be compatible with the OpenAI chat completions format.</p>
            </div>

            <div class="field-group model-field" id="customModelField">
                <label>Model name</label>
                <input type="text" id="customModel" placeholder="model-name" style="font-family:monospace;">
            </div>

            <button class="btn-save" id="saveBtn">Save Settings</button>
            <p class="status-msg" id="statusLabel"></p>
        </div>

        <div class="security-note">
            <svg style="width:18px;height:18px;fill:currentColor;opacity:0.6;flex-shrink:0;" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z"/></svg>
            <span>Your API key is stored securely in your account and never shared. It is only used to make requests on your behalf while you chat.</span>
        </div>
    </main>
    `;
}

export async function init() {
    if (!Auth.requireSession()) return;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) { logoutBtn.style.display = 'flex'; logoutBtn.onclick = () => Auth.signOut(); }

    // ── Modal de ayuda ────────────────────────────────────────
    const closeModal = () => { document.getElementById('apiHelpModal').style.display = 'none'; };
    document.getElementById('apiHelpClose').onclick = closeModal;
    document.getElementById('apiHelpSkip').onclick  = closeModal;
    document.getElementById('apiHelpGoBtn').onclick = () => { closeModal(); Router.go('possible-doubts'); };
    document.getElementById('helpBannerLink').onclick = (e) => { e.preventDefault(); Router.go('possible-doubts'); };

    // ── Selector de proveedor ─────────────────────────────────
    let currentProvider = 'openai';

    const selectProvider = (provider) => {
        currentProvider = provider;
        document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById(`provider-${provider}`).classList.add('selected');

        const cfg = PROVIDERS[provider];
        document.getElementById('keyLabel').textContent      = cfg.label;
        document.getElementById('apiKeyField').placeholder   = cfg.placeholder;
        document.getElementById('providerHint').innerHTML    = cfg.hint;

        const showModel  = ['openrouter', 'anthropic', 'gemini'].includes(provider);
        const showCustom = provider === 'other';
        document.getElementById('modelField').classList.toggle('visible', showModel);
        document.getElementById('customUrlField').classList.toggle('visible', showCustom);
        document.getElementById('customModelField').classList.toggle('visible', showCustom);

        const modelHint = document.getElementById('modelHint');
        if (provider === 'anthropic') modelHint.innerHTML = 'Available: claude-sonnet-4-5, claude-haiku-4-5, claude-opus-4-5';
        else if (provider === 'gemini') modelHint.innerHTML = 'Recommended: <strong>gemini-2.0-flash</strong> (free) · also: gemini-1.5-pro, gemini-1.5-flash';
        else modelHint.innerHTML = 'Find model names at <a href="https://openrouter.ai/models" target="_blank" class="help-link">openrouter.ai/models ↗</a>';
    };

    Object.keys(PROVIDERS).forEach(p => {
        document.getElementById(`provider-${p}`).onclick = () => selectProvider(p);
    });

    // ── Toggle visibilidad de key ─────────────────────────────
    document.getElementById('toggleKeyBtn').onclick = () => {
        const input = document.getElementById('apiKeyField');
        input.type = input.type === 'password' ? 'text' : 'password';
    };

    // ── Guardar ───────────────────────────────────────────────
    const showStatus = (text, type) => {
        const el = document.getElementById('statusLabel');
        el.textContent = text;
        el.className = `status-msg ${type}`;
    };

    document.getElementById('saveBtn').onclick = async () => {
        const key = document.getElementById('apiKeyField').value.trim();
        if (!key) { showStatus('API key cannot be empty.', 'error'); return; }

        const payload = { user_id: Auth.userId, provider: currentProvider, api_key: key, model: '', custom_url: '' };
        if (currentProvider === 'openrouter') payload.model = document.getElementById('modelInput').value.trim() || 'gryphe/mythomax-l2-13b';
        if (currentProvider === 'anthropic')  payload.model = document.getElementById('modelInput').value.trim() || 'claude-haiku-4-5';
        if (currentProvider === 'gemini')     payload.model = document.getElementById('modelInput').value.trim() || 'gemini-2.0-flash';
        if (currentProvider === 'other') {
            payload.custom_url = document.getElementById('customUrl').value.trim();
            payload.model      = document.getElementById('customModel').value.trim();
        }

        const { error } = await _supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' });
        showStatus(error ? 'Could not save. Check your Supabase table setup.' : 'Settings saved successfully.', error ? 'error' : 'success');
    };

    // ── Cargar settings guardados ─────────────────────────────
    selectProvider('openai'); // default visual
    const { data } = await _supabase.from('user_settings').select('*').eq('user_id', Auth.userId).single();
    if (data) {
        selectProvider(data.provider || 'openai');
        document.getElementById('apiKeyField').value = data.api_key || '';
        if (data.model)      document.getElementById('modelInput').value = data.model;
        if (data.custom_url) document.getElementById('customUrl').value  = data.custom_url;
    }
}

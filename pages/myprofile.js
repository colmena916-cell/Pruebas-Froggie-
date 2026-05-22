// ============================================================
//  pages/myprofile.js  —  Perfil de usuario (propio o ajeno)
//  Requiere sesión para ver el propio. Sin sesión muestra vista pública.
// ============================================================

import { _supabase } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

export function render() {
    return `
    <style>
        .profile-container { max-width: 680px; width: 100%; margin: 0 auto; padding: 20px; }

        .btn-back { background:none; border:none; cursor:pointer; color:var(--text-dark); display:flex; align-items:center; padding:6px; border-radius:50%; transition:background-color 0.2s; }
        .btn-back:hover { background-color: rgba(62,83,43,0.08); }

        .profile-card {
            background: rgba(62,83,43,0.02); border: 1px solid rgba(62,83,43,0.12);
            border-radius: 18px; padding: 24px; display: flex;
            flex-direction: column; align-items: center; gap: 12px;
            text-align: center; margin-bottom: 20px;
        }
        .profile-avatar {
            width: 80px; height: 80px; border-radius: 50%;
            background-color: var(--bg-accent);
            border: 2px solid rgba(62,83,43,0.2);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.8rem; font-weight: bold;
            background-size: cover; background-position: center;
        }
        .profile-details h2    { font-size: 1.4rem; font-weight: normal; }
        .profile-username      { font-size: 0.85rem; opacity: 0.55; display: block; margin-bottom: 4px; }
        .profile-bio           { font-size: 0.9rem; opacity: 0.75; line-height: 1.5; max-width: 340px; }
        .profile-stats         { display: flex; gap: 24px; margin-top: 8px; justify-content: center; }
        .stat-item             { font-size: 0.88rem; opacity: 0.7; }
        .stat-item strong      { display: block; font-size: 1.1rem; opacity: 1; }

        .btn-action {
            background: none; border: 1px solid rgba(62,83,43,0.3);
            border-radius: 20px; padding: 7px 18px;
            font-family: var(--font-serif); font-size: 0.88rem;
            color: var(--text-dark); cursor: pointer; transition: background-color 0.2s;
        }
        .btn-action:hover { background-color: rgba(62,83,43,0.06); }
        .btn-action.primary { background-color: var(--btn-color); color: #fff; border-color: var(--btn-color); }
        .btn-action.primary:hover { background-color: var(--btn-hover); }

        .tabs-navigation {
            display: flex; gap: 24px; border-bottom: 1px solid rgba(62,83,43,0.15);
            margin-bottom: 16px; padding: 0 4px;
        }
        .tab-nav-btn {
            background: none; border: none; font-family: var(--font-serif);
            font-size: 1.05rem; color: var(--text-dark); padding: 8px 4px;
            cursor: pointer; opacity: 0.5; position: relative; transition: opacity 0.2s;
        }
        .tab-nav-btn.active { opacity: 1; }
        .tab-nav-btn.active::after {
            content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
            height: 2px; background-color: var(--btn-color);
        }
        .tab-content-panel        { display: none; }
        .tab-content-panel.active { display: block; }

        .character-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 100%)); gap: 16px; margin-top: 12px; }
        .char-card { background: rgba(62,83,43,0.02); border: 1px solid rgba(62,83,43,0.12); border-radius: 14px; padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 10px; transition: background-color 0.2s, border-color 0.2s; }
        .char-card:hover { background: rgba(62,83,43,0.06); border-color: var(--btn-color); }
        .char-card-header { display: flex; align-items: center; gap: 12px; }
        .char-avatar { width: 44px; height: 44px; border-radius: 50%; background-color: var(--bg-accent); display: flex; align-items: center; justify-content: center; font-weight: bold; background-size: cover; background-position: center; flex-shrink: 0; }
        .char-info h4 { font-weight: normal; font-size: 1.1rem; }
        .char-info span { font-size: 0.88rem; opacity: 0.6; }
        .char-creator { font-size: 0.75rem; opacity: 0.38; display: block; margin-top: 1px; }

        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
        .modal.show { display: flex; }
        .modal-content { background: var(--bg-main); padding: 24px; border-radius: 16px; max-width: 450px; width: 100%; display: flex; flex-direction: column; gap: 12px; border: 1px solid rgba(62,83,43,0.15); }
        .modal-content input, .modal-content textarea { width: 100%; padding: 10px; border: 1px solid rgba(62,83,43,0.2); border-radius: 8px; background: transparent; color: var(--text-dark); font-family: var(--font-serif); font-size: 0.95rem; outline: none; }
        .modal-content input:focus, .modal-content textarea:focus { border-color: var(--btn-color); }

        .avatar-preview-row   { display: flex; align-items: center; gap: 16px; }
        .avatar-preview-circle { width: 64px; height: 64px; border-radius: 50%; background-color: var(--bg-accent); border: 2px solid var(--btn-color); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: bold; flex-shrink: 0; background-size: cover; background-position: center; overflow: hidden; }
        .avatar-file-label    { display: inline-block; padding: 7px 14px; border: 1px solid var(--btn-color); border-radius: 14px; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s; }
        .avatar-file-label:hover { background-color: rgba(93,112,56,0.08); }
        #avatarFileInput { display: none; }

        .save-msg { font-size: 0.85rem; padding: 8px 12px; border-radius: 6px; display: none; }
        .save-msg.success { display: block; background: rgba(62,83,43,0.08); border: 1px solid rgba(62,83,43,0.3); color: var(--btn-color); }
        .save-msg.error   { display: block; background: rgba(180,60,60,0.08); border: 1px solid rgba(180,60,60,0.3); color: #8b2e2e; }

        .persona-description { display: block; font-size: 0.88rem; opacity: 0.75; line-height: 1.4; }
        .empty-state { text-align: center; font-style: italic; opacity: 0.5; padding: 32px; font-size: 0.95rem; }
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
                    <span class="stat-item"><strong id="botCountLabel">0</strong> Bots</span>
                    <span class="stat-item"><strong id="followersCountLabel">0</strong> Followers</span>
                </div>
            </div>
            <div class="profile-actions">
                <button class="btn-action primary" id="editProfileBtn" style="display:none;">Edit Profile</button>
                <button class="btn-action primary" id="followBtn" style="display:none;">+ Follow</button>
            </div>
        </section>

        <nav class="tabs-navigation">
            <button class="tab-nav-btn active" id="tabCreations">Creations</button>
            <button class="tab-nav-btn" id="tabPersonas" style="display:none;">My Personas</button>
        </nav>

        <div class="tab-content-panel active" id="charactersTab">
            <div class="character-grid" id="charactersContainer">
                <p class="empty-state">No characters brought to life yet.</p>
            </div>
        </div>

        <div class="tab-content-panel" id="personasTab">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-size:0.9rem;opacity:0.6;">Tus alter-egos y personajes para interactuar en los chats.</span>
                <button class="btn-action" id="newPersonaBtn" style="padding:4px 12px;font-size:0.8rem;">+ New Persona</button>
            </div>
            <div class="character-grid" id="personasContainer">
                <p class="empty-state">No has diseñado ninguna Persona aún.</p>
            </div>
        </div>
    </main>

    <!-- Modal editar perfil -->
    <div class="modal" id="editModal">
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3 style="font-weight:normal;">Update Profile Info</h3>
            <div class="avatar-preview-row">
                <div class="avatar-preview-circle" id="avatarPreview"></div>
                <div>
                    <label class="avatar-file-label" for="avatarFileInput">Choose photo</label>
                    <input type="file" id="avatarFileInput" accept="image/jpeg,image/png,image/webp">
                    <p style="font-size:0.75rem;opacity:0.5;margin-top:4px;">JPG, PNG or WEBP · Max 2MB</p>
                </div>
            </div>
            <label style="font-size:0.85rem;opacity:0.7;">Display Name</label>
            <input type="text" id="editNameInput" placeholder="Your name...">
            <label style="font-size:0.85rem;opacity:0.7;margin-top:8px;display:block;">Username (@)</label>
            <input type="text" id="editUsernameInput" placeholder="Tu identificador único...">
            <p id="usernameWarning" style="font-size:0.75rem;font-weight:bold;margin-top:2px;">Cargando intentos...</p>
            <label style="font-size:0.85rem;opacity:0.7;margin-top:8px;display:block;">Short Biography</label>
            <textarea id="editBioInput" rows="3" placeholder="A few words about you..."></textarea>
            <div class="save-msg" id="saveMsg"></div>
            <button class="btn-action primary" id="saveProfileBtn">Save Changes</button>
        </div>
    </div>

    <!-- Modal nueva persona -->
    <div class="modal" id="personaModal">
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3 style="font-weight:normal;">New Roleplay Persona</h3>
            <label style="font-size:0.85rem;opacity:0.7;">Roleplay Name</label>
            <input type="text" id="personaNameInput" placeholder="Ej: Sam, Noa, Audrey...">
            <label style="font-size:0.85rem;opacity:0.7;">Description / Lore</label>
            <textarea id="personaBioInput" rows="5" placeholder="Apariencia, actitud, secretos..."></textarea>
            <button class="btn-action primary" id="savePersonaBtn">Create Persona</button>
        </div>
    </div>
    `;
}

export async function init(params) {
    if (!Auth.requireSession()) return;

    let targetUserId  = params.id || Auth.userId;
    const currentUserId = Auth.userId;
    const isOwner     = targetUserId === currentUserId;
    let usernameAttemptsLeft = 2;

    // ── Header y navegación ───────────────────────────────────
    document.getElementById('backBtn').onclick = () => history.back();
    if (isOwner) {
        document.getElementById('headerTitle').textContent = 'My Profile';
        document.getElementById('editProfileBtn').style.display = 'block';
        document.getElementById('tabPersonas').style.display    = 'block';
    } else {
        document.getElementById('followBtn').style.display = 'block';
    }

    // ── Tabs ──────────────────────────────────────────────────
    const switchTab = (tabId, btn) => {
        document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        btn.classList.add('active');
    };
    document.getElementById('tabCreations').onclick = function() { switchTab('charactersTab', this); };
    document.getElementById('tabPersonas').onclick  = function() { switchTab('personasTab', this); };

    // ── Modales ───────────────────────────────────────────────
    const openModal  = (id) => document.getElementById(id).classList.add('show');
    const closeModal = (id) => document.getElementById(id).classList.remove('show');

    document.getElementById('editProfileBtn').onclick = () => openModal('editModal');
    document.getElementById('editModal').onclick      = (e) => { if (e.target.id === 'editModal') closeModal('editModal'); };
    document.getElementById('personaModal').onclick   = (e) => { if (e.target.id === 'personaModal') closeModal('personaModal'); };
    document.getElementById('newPersonaBtn').onclick  = () => openModal('personaModal');

    // ── Avatar preview ────────────────────────────────────────
    document.getElementById('avatarFileInput').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showSaveMsg('Image exceeds 2MB limit.', 'error'); e.target.value = ''; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const p = document.getElementById('avatarPreview');
            p.style.backgroundImage = `url('${ev.target.result}')`;
            p.textContent = '';
        };
        reader.readAsDataURL(file);
    };

    // ── Helpers ───────────────────────────────────────────────
    const showSaveMsg = (text, type) => {
        const el = document.getElementById('saveMsg');
        el.textContent = text; el.className = `save-msg ${type}`;
    };

    // ── Cargar perfil ─────────────────────────────────────────
    const loadProfile = async () => {
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', targetUserId).single();
        if (!profile) return;

        const name = profile.display_name || profile.username || 'User';
        document.getElementById('profileName').textContent     = name;
        document.getElementById('profileUsername').textContent = `@${profile.username || ''}`;
        document.getElementById('profileBio').textContent      = profile.bio || 'No biography written yet.';

        const avatar = document.getElementById('userAvatar');
        if (profile.avatar_url) { avatar.style.backgroundImage = `url('${profile.avatar_url}')`; avatar.textContent = ''; }
        else avatar.textContent = name.substring(0, 1).toUpperCase();

        if (isOwner) {
            document.getElementById('editNameInput').value     = profile.display_name || '';
            document.getElementById('editBioInput').value      = profile.bio || '';
            document.getElementById('editUsernameInput').value = profile.username || '';

            const preview = document.getElementById('avatarPreview');
            if (profile.avatar_url) { preview.style.backgroundImage = `url('${profile.avatar_url}')`; preview.textContent = ''; }
            else preview.textContent = name.substring(0, 1).toUpperCase();

            const isDefaultEmail = profile.username?.includes('@');
            usernameAttemptsLeft = (!profile.username || isDefaultEmail) ? 2 : 1;
            const warn = document.getElementById('usernameWarning');
            if (usernameAttemptsLeft === 2) {
                warn.textContent = '✨ Intentos de cambio restantes: 2'; warn.style.color = 'var(--btn-color)';
            } else {
                warn.textContent = '⚠️ Último intento disponible. Intentos restantes: 1'; warn.style.color = '#d9a711';
            }
        }
    };

    // ── Guardar perfil ────────────────────────────────────────
    document.getElementById('saveProfileBtn').onclick = async () => {
        const name     = document.getElementById('editNameInput').value.trim();
        const bio      = document.getElementById('editBioInput').value.trim();
        const usernameInput = document.getElementById('editUsernameInput');
        const btn      = document.getElementById('saveProfileBtn');
        if (!name) { showSaveMsg('Display name cannot be empty.', 'error'); return; }

        btn.disabled = true; btn.textContent = 'Saving...';

        let avatarUrl = null;
        const fileInput = document.getElementById('avatarFileInput');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const ext  = file.name.split('.').pop().toLowerCase();
            const path = `${currentUserId}/avatar.${ext}`;
            const { data: existing } = await _supabase.storage.from('user-avatars').list(currentUserId);
            if (existing?.length > 0) await _supabase.storage.from('user-avatars').remove(existing.map(f => `${currentUserId}/${f.name}`));
            const { error: uploadError } = await _supabase.storage.from('user-avatars').upload(path, file, { upsert: true, contentType: file.type });
            if (uploadError) { showSaveMsg('Could not upload image.', 'error'); btn.disabled = false; btn.textContent = 'Save Changes'; return; }
            const { data: urlData } = _supabase.storage.from('user-avatars').getPublicUrl(path);
            avatarUrl = urlData.publicUrl + '?t=' + Date.now();
        }

        const updates = { display_name: name, bio };
        if (avatarUrl) updates.avatar_url = avatarUrl;

        if (!usernameInput.disabled) {
            const newUsername = usernameInput.value.trim().replace('@', '');
            if (newUsername.length < 3) { showSaveMsg('El username debe tener al menos 3 caracteres.', 'error'); btn.disabled = false; btn.textContent = 'Save Changes'; return; }
            if (!/^[a-zA-Z0-9_.]+$/.test(newUsername)) { showSaveMsg('El username solo puede contener letras, números, puntos o guiones bajos.', 'error'); btn.disabled = false; btn.textContent = 'Save Changes'; return; }
            updates.username = newUsername;
        }

        const { error } = await _supabase.from('profiles').update(updates).eq('id', currentUserId);
        btn.disabled = false; btn.textContent = 'Save Changes';
        if (error) {
            showSaveMsg(error.message.includes('unique') ? 'Ese username ya está siendo utilizado.' : `Could not save: ${error.message}`, 'error');
        } else {
            showSaveMsg('Profile updated!', 'success');
            fileInput.value = '';
            await loadProfile();
            setTimeout(() => closeModal('editModal'), 1200);
        }
    };

    // ── Cargar personajes ─────────────────────────────────────
    const loadCharacters = async () => {
        const container = document.getElementById('charactersContainer');
        const { data: characters } = await _supabase.from('characters').select('id, name, subtitle, photo_url').eq('creator_id', targetUserId).order('created_at', { ascending: false });
        if (!characters || characters.length === 0) { container.innerHTML = `<p class="empty-state">No characters created yet.</p>`; document.getElementById('botCountLabel').textContent = '0'; return; }
        const { data: cp } = await _supabase.from('profiles').select('username').eq('id', targetUserId).single();
        const creator = cp?.username || '';
        document.getElementById('botCountLabel').textContent = characters.length;
        container.innerHTML = '';
        characters.forEach(char => {
            const avatarStyle = char.photo_url ? `background-image:url('${char.photo_url}');background-size:cover;background-position:center;` : '';
            const initials = char.photo_url ? '' : char.name.substring(0, 2).toUpperCase();
            const card = document.createElement('div');
            card.className = 'char-card';
            card.onclick = () => Router.go('room', { id: char.id });
            card.innerHTML = `<div class="char-card-header"><div class="char-avatar" style="${avatarStyle}">${initials}</div><div class="char-info"><h4>${char.name}</h4><span>${char.subtitle || 'Character'}</span>${creator ? `<span class="char-creator">@${creator}</span>` : ''}</div></div>`;
            container.appendChild(card);
        });
    };

    // ── Cargar personas ───────────────────────────────────────
    const loadPersonas = async () => {
        if (!isOwner) return;
        const container = document.getElementById('personasContainer');
        const { data: personas } = await _supabase.from('user_personas').select('*').eq('user_id', currentUserId);
        if (!personas || personas.length === 0) { container.innerHTML = `<p class="empty-state">No has diseñado ninguna Persona aún.</p>`; return; }
        container.innerHTML = '';
        personas.forEach(p => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.style.borderStyle = 'dashed';
            card.innerHTML = `
                <div class="char-card-header">
                    <div class="char-avatar" style="background-color:#cce3de;">${p.avatar_letter || p.name.substring(0,1).toUpperCase()}</div>
                    <div class="char-info">
                        <h4>${p.name} ${p.is_default ? '<small style="opacity:0.5;">(Default)</small>' : ''}</h4>
                        <span>Roleplay Persona</span>
                    </div>
                </div>
                <p class="persona-description">${p.description}</p>
                <div style="display:flex;gap:8px;margin-top:4px;">
                    ${!p.is_default ? `<button class="btn-action" style="font-size:0.75rem;padding:4px 10px;" data-set-default="${p.id}">Set as Default</button>` : '<span style="font-size:0.75rem;opacity:0.5;padding:4px 0;">Default persona</span>'}
                    <button class="btn-action" style="font-size:0.75rem;padding:4px 10px;border-color:#c97171;color:#c97171;" data-delete-persona="${p.id}">Delete</button>
                </div>`;
            container.appendChild(card);
        });
        container.querySelectorAll('[data-set-default]').forEach(btn => {
            btn.onclick = async () => {
                await _supabase.from('user_personas').update({ is_default: false }).eq('user_id', currentUserId);
                await _supabase.from('user_personas').update({ is_default: true }).eq('id', btn.dataset.setDefault);
                await loadPersonas();
            };
        });
        container.querySelectorAll('[data-delete-persona]').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm('Delete this persona?')) return;
                await _supabase.from('user_personas').delete().eq('id', btn.dataset.deletePersona);
                await loadPersonas();
            };
        });
    };

    // ── Guardar nueva persona ─────────────────────────────────
    document.getElementById('savePersonaBtn').onclick = async () => {
        const name = document.getElementById('personaNameInput').value.trim();
        const desc = document.getElementById('personaBioInput').value.trim();
        if (!name || !desc) return;
        const { data: existing } = await _supabase.from('user_personas').select('id').eq('user_id', currentUserId);
        if (existing && existing.length >= 3) { alert('You can only have up to 3 personas. Delete one first.'); return; }
        await _supabase.from('user_personas').insert({ user_id: currentUserId, name, description: desc, avatar_letter: name.substring(0,1).toUpperCase() });
        closeModal('personaModal');
        document.getElementById('personaNameInput').value = '';
        document.getElementById('personaBioInput').value  = '';
        await loadPersonas();
    };

    // ── Followers ─────────────────────────────────────────────
    const loadFollowers = async () => {
        const { count } = await _supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', targetUserId);
        document.getElementById('followersCountLabel').textContent = count || 0;
    };

    // ── Iniciar todo ──────────────────────────────────────────
    await Promise.all([loadProfile(), loadCharacters(), loadPersonas(), loadFollowers()]);
}

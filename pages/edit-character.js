// ============================================================
//  pages/edit-character.js  —  Editar personaje existente
//  Requiere sesión y ser el creador del personaje.
// ============================================================

import { _supabase } from '../supabase.js';
import { Auth }      from '../auth.js';
import { Router }    from '../router.js';

const TAGS = ['Fantasy','Romance','Action','Drama','Horror','Sci-Fi','Comedy','Mystery','Slice of Life','Adventure','Historical','Psychological','Villain','Hero','Anime','Video Game','Books','TV Series','Film'];

export function render() {
    const tagChips = TAGS.map(t => `<button class="tag-chip" data-tag="${t}">${t}</button>`).join('');

    return `
    <style>
        header { background-color: var(--bg-accent); padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(62,83,43,0.2); position: sticky; top: 0; z-index: 100; }
        header h1 { font-size: 1.15rem; font-weight: normal; }
        .btn-back { background: none; border: none; cursor: pointer; color: var(--text-dark); display: flex; align-items: center; gap: 6px; font-family: var(--font-serif); font-size: 0.9rem; opacity: 0.7; transition: opacity 0.2s; }
        .btn-back:hover { opacity: 1; }

        main { max-width: 640px; width: 100%; margin: 0 auto; padding: 20px 20px 120px; }

        .form-section { border-bottom: 1px dashed rgba(62,83,43,0.15); padding: 28px 0; }
        .form-section:last-of-type { border-bottom: none; }
        .section-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.8px; opacity: 0.45; margin-bottom: 18px; }

        .photo-upload-area { display: flex; align-items: center; gap: 22px; }
        .photo-preview { width: 90px; height: 90px; border-radius: 50%; background-color: var(--bg-accent); border: 2px dashed rgba(62,83,43,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; cursor: pointer; transition: border-color 0.2s; background-size: cover; background-position: center; }
        .photo-preview:hover { border-color: var(--btn-color); }
        .upload-icon { display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0.45; font-size: 0.78rem; text-align: center; }
        .photo-upload-info { font-size: 0.88rem; line-height: 1.6; opacity: 0.7; }
        .photo-upload-info span { display: block; font-size: 0.78rem; opacity: 0.6; margin-top: 4px; }
        .btn-upload { display: inline-block; margin-top: 10px; padding: 7px 18px; background: none; border: 1px solid rgba(62,83,43,0.2); border-radius: 20px; color: var(--text-dark); font-family: var(--font-serif); font-size: 0.85rem; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
        .btn-upload:hover { background-color: var(--bg-accent); border-color: var(--btn-color); }
        #photoInput { display: none; }

        .field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .field-group:last-child { margin-bottom: 0; }
        .field-label { font-size: 0.9rem; font-style: italic; opacity: 0.8; display: flex; justify-content: space-between; align-items: baseline; }
        .char-counter { font-size: 0.78rem; opacity: 0.45; font-style: normal; }
        .char-counter.warning { color: #b85c38; opacity: 1; }
        .field-group input, .field-group textarea { width: 100%; padding: 11px 14px; border: 1px solid rgba(62,83,43,0.2); border-radius: 8px; background-color: var(--bg-main); color: var(--text-dark); font-family: var(--font-serif); font-size: 0.97rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; resize: none; line-height: 1.55; }
        .field-group input:focus, .field-group textarea:focus { border-color: var(--btn-color); box-shadow: 0 0 0 3px rgba(93,112,56,0.1); }
        .field-hint { font-size: 0.78rem; opacity: 0.45; font-style: italic; line-height: 1.4; }

        .category-toggle, .visibility-toggle { display: flex; gap: 10px; margin-bottom: 10px; }
        .cat-btn, .vis-btn { flex: 1; background: none; border: 1px solid rgba(62,83,43,0.2); border-radius: 10px; padding: 12px 10px; font-family: var(--font-serif); font-size: 0.9rem; color: var(--text-dark); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background-color 0.2s, border-color 0.2s; }
        .cat-btn:hover, .vis-btn:hover { background-color: rgba(62,83,43,0.05); }
        .cat-btn.selected, .vis-btn.selected { background-color: rgba(62,83,43,0.08); border-color: var(--btn-color); font-weight: bold; }

        .tags-label { font-size: 0.9rem; font-style: italic; opacity: 0.8; display: flex; justify-content: space-between; margin-bottom: 12px; }
        .tags-counter { font-size: 0.78rem; opacity: 0.45; font-style: normal; }
        .tags-counter.full { color: var(--btn-color); opacity: 1; }
        .tags-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-chip { background: none; border: 1px solid rgba(62,83,43,0.2); border-radius: 20px; padding: 5px 13px; font-family: var(--font-serif); font-size: 0.85rem; color: var(--text-dark); cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
        .tag-chip:hover { background-color: rgba(62,83,43,0.05); }
        .tag-chip.selected { background-color: var(--bg-accent); border-color: var(--btn-color); font-weight: bold; }
        .tag-chip.disabled { opacity: 0.35; cursor: not-allowed; }

        /* Danger zone */
        .danger-zone { border: 1px dashed rgba(180,60,60,0.3); border-radius: 12px; padding: 18px; margin-top: 8px; }
        .danger-zone h3 { font-size: 0.9rem; color: #8b2e2e; font-weight: normal; margin-bottom: 8px; }
        .danger-zone p  { font-size: 0.82rem; opacity: 0.6; margin-bottom: 14px; }
        .btn-delete { background: none; border: 1px solid rgba(180,60,60,0.4); color: #8b2e2e; border-radius: 20px; padding: 8px 18px; font-family: var(--font-serif); font-size: 0.88rem; cursor: pointer; transition: background-color 0.2s; }
        .btn-delete:hover { background-color: rgba(180,60,60,0.06); }

        .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg-main); border-top: 1px solid rgba(62,83,43,0.15); padding: 12px 20px; display: flex; align-items: center; gap: 12px; z-index: 100; }
        .save-message { flex: 1; font-size: 0.88rem; }
        .save-message.error   { color: #8b2e2e; }
        .save-message.success { color: var(--btn-color); }
        .btn-cancel { background: none; border: 1px solid rgba(62,83,43,0.2); border-radius: 20px; padding: 9px 18px; font-family: var(--font-serif); font-size: 0.9rem; color: var(--text-dark); cursor: pointer; }
        .btn-save { background-color: var(--btn-color); color: #fff; border: none; border-radius: 20px; padding: 10px 22px; font-family: var(--font-serif); font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s; }
        .btn-save:hover { background-color: var(--btn-hover); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Delete modal */
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
        .modal.show { display: flex; }
        .modal-content { background: var(--bg-main); padding: 28px 24px; border-radius: 16px; max-width: 380px; width: 100%; display: flex; flex-direction: column; gap: 14px; border: 1px solid rgba(62,83,43,0.15); }
        .modal-content h3 { font-weight: normal; font-size: 1.2rem; }
        .modal-content p { font-size: 0.9rem; opacity: 0.7; line-height: 1.5; }
        .modal-actions { display: flex; gap: 10px; }
        .btn-cancel-modal { flex: 1; background: none; border: 1px solid rgba(62,83,43,0.2); border-radius: 20px; padding: 10px; font-family: var(--font-serif); font-size: 0.9rem; color: var(--text-dark); cursor: pointer; }
        .btn-confirm-delete { flex: 1; background: #8b2e2e; color: #fff; border: none; border-radius: 20px; padding: 10px; font-family: var(--font-serif); font-size: 0.9rem; cursor: pointer; transition: background-color 0.2s; }
        .btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
    </style>

    <header>
        <button class="btn-back" id="backBtn">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Back
        </button>
        <h1>Edit Character</h1>
    </header>

    <main>
        <div class="form-section">
            <p class="section-label">Identity</p>
            <div class="photo-upload-area">
                <div class="photo-preview" id="photoPreview">
                    <div class="upload-icon" id="uploadIcon">
                        <svg style="width:28px;height:28px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        <span>Photo</span>
                    </div>
                </div>
                <div class="photo-upload-info">
                    Update your character's portrait.
                    <span>JPG, PNG or WEBP · Max 2MB</span>
                    <button class="btn-upload" id="choosePhotoBtn">Choose image</button>
                </div>
            </div>
            <input type="file" id="photoInput" accept="image/jpeg,image/png,image/webp">
        </div>

        <div class="form-section">
            <p class="section-label">Presentation</p>
            <div class="field-group">
                <label class="field-label">Name <span class="char-counter" id="nameCounter">0 / 50</span></label>
                <input type="text" id="charName" maxlength="50">
            </div>
            <div class="field-group">
                <label class="field-label">Subtitle <span class="char-counter" id="subtitleCounter">0 / 80</span></label>
                <input type="text" id="charSubtitle" maxlength="80">
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">Description</p>
            <div class="field-group">
                <label class="field-label">Character Description <span class="char-counter" id="descCounter">0 / 400</span></label>
                <textarea id="charDesc" rows="4" maxlength="400"></textarea>
                <p class="field-hint">🔒 Only visible on the character's profile page.</p>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">Category &amp; Tags</p>
            <p class="field-label" style="margin-bottom:10px;">Category</p>
            <div class="category-toggle">
                <button class="cat-btn" id="cat-canon">📚 Canon</button>
                <button class="cat-btn" id="cat-oc">✨ Original Character</button>
            </div>
            <div class="tags-label" style="margin-top:20px;">Tags <span class="tags-counter" id="tagsCounter">0 / 3 selected</span></div>
            <div class="tags-chips" id="tagsChips">${tagChips}</div>
        </div>

        <div class="form-section">
            <p class="section-label">Definition — Private Prompt</p>
            <div class="field-group">
                <label class="field-label">Character Definition <span class="char-counter" id="defCounter">0 / 18000</span></label>
                <textarea id="charDefinition" rows="10" maxlength="18000"></textarea>
                <p class="field-hint">Not visible to users.</p>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">First Message</p>
            <div class="field-group">
                <label class="field-label">Opening <span class="char-counter" id="firstMsgCounter">0 / 5000</span></label>
                <textarea id="charFirstMsg" rows="6" maxlength="5000"></textarea>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">Visibility</p>
            <div class="visibility-toggle">
                <button class="vis-btn" id="vis-public">
                    <svg style="width:18px;height:18px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    Public
                </button>
                <button class="vis-btn" id="vis-private">
                    <svg style="width:18px;height:18px;fill:currentColor;" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                    Private
                </button>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">Danger Zone</p>
            <div class="danger-zone">
                <h3>⚠️ Delete this character</h3>
                <p>This action is permanent. The character and all its associated chats will be removed.</p>
                <button class="btn-delete" id="deleteBtn">Delete character</button>
            </div>
        </div>
    </main>

    <div class="bottom-bar">
        <span class="save-message" id="saveMessage"></span>
        <button class="btn-cancel" id="cancelBtn">Cancel</button>
        <button class="btn-save" id="saveBtn">Save Changes</button>
    </div>

    <!-- Delete confirm modal -->
    <div class="modal" id="deleteModal">
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>Are you sure?</h3>
            <p>This will permanently delete the character and all its chats. This cannot be undone.</p>
            <div class="modal-actions">
                <button class="btn-cancel-modal" id="cancelDeleteBtn">Cancel</button>
                <button class="btn-confirm-delete" id="confirmDeleteBtn">Yes, delete</button>
            </div>
        </div>
    </div>
    `;
}

export async function init(params) {
    if (!Auth.requireSession()) return;

    const characterId = params.id;
    if (!characterId) { Router.go('dashboard'); return; }

    document.getElementById('bottomNav').style.display = 'none';

    let selectedVisibility = 'public';
    let selectedCategory   = 'canon';
    let selectedTags       = [];
    let uploadedPhotoFile  = null;
    let currentPhotoUrl    = null;
    const MAX_TAGS = 3;

    // ── Navegación ────────────────────────────────────────────
    document.getElementById('backBtn').onclick   = () => Router.go('character-profile', { id: characterId });
    document.getElementById('cancelBtn').onclick = () => Router.go('character-profile', { id: characterId });

    // ── Helpers ───────────────────────────────────────────────
    const showSaveMsg = (text, type) => {
        const el = document.getElementById('saveMessage');
        el.textContent = text; el.className = `save-message ${type}`;
    };

    const updateCounter = (inputId, counterId, max) => {
        const val = document.getElementById(inputId).value.length;
        const el  = document.getElementById(counterId);
        el.textContent = `${val} / ${max}`;
        el.classList.toggle('warning', val >= max * 0.9);
    };

    const setValue = (inputId, value, counterId, max) => {
        document.getElementById(inputId).value = value;
        updateCounter(inputId, counterId, max);
    };

    ['charName:nameCounter:50','charSubtitle:subtitleCounter:80','charDesc:descCounter:400','charDefinition:defCounter:18000','charFirstMsg:firstMsgCounter:5000'].forEach(s => {
        const [id, counter, max] = s.split(':');
        document.getElementById(id).oninput = () => updateCounter(id, counter, parseInt(max));
    });

    // ── Foto ──────────────────────────────────────────────────
    const photoInput = document.getElementById('photoInput');
    document.getElementById('photoPreview').onclick   = () => photoInput.click();
    document.getElementById('choosePhotoBtn').onclick = () => photoInput.click();
    photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Image is too large. Maximum size is 2MB.'); return; }
        uploadedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const preview = document.getElementById('photoPreview');
            preview.style.backgroundImage = `url('${ev.target.result}')`;
            preview.style.fontSize = '0';
            const icon = document.getElementById('uploadIcon');
            if (icon) icon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    };

    // ── Categoría ─────────────────────────────────────────────
    const selectCategory = (val) => {
        selectedCategory = val;
        document.getElementById('cat-canon').classList.toggle('selected', val === 'canon');
        document.getElementById('cat-oc').classList.toggle('selected', val === 'oc');
    };
    document.getElementById('cat-canon').onclick = () => selectCategory('canon');
    document.getElementById('cat-oc').onclick    = () => selectCategory('oc');

    // ── Visibilidad ───────────────────────────────────────────
    const selectVisibility = (val) => {
        selectedVisibility = val;
        document.getElementById('vis-public').classList.toggle('selected', val === 'public');
        document.getElementById('vis-private').classList.toggle('selected', val === 'private');
    };
    document.getElementById('vis-public').onclick  = () => selectVisibility('public');
    document.getElementById('vis-private').onclick = () => selectVisibility('private');

    // ── Tags ──────────────────────────────────────────────────
    const updateTagsUI = () => {
        const counter = document.getElementById('tagsCounter');
        counter.textContent = `${selectedTags.length} / ${MAX_TAGS} selected`;
        counter.classList.toggle('full', selectedTags.length >= MAX_TAGS);
        document.querySelectorAll('.tag-chip').forEach(chip => {
            if (!chip.classList.contains('selected')) chip.classList.toggle('disabled', selectedTags.length >= MAX_TAGS);
        });
    };
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.onclick = () => {
            if (chip.classList.contains('disabled')) return;
            const tag = chip.dataset.tag;
            if (chip.classList.contains('selected')) { chip.classList.remove('selected'); selectedTags = selectedTags.filter(t => t !== tag); }
            else if (selectedTags.length < MAX_TAGS)  { chip.classList.add('selected'); selectedTags.push(tag); }
            updateTagsUI();
        };
    });

    // ── Cargar datos del personaje ────────────────────────────
    const { data: char, error } = await _supabase.from('characters').select('*').eq('id', characterId).single();
    if (error || !char) { showSaveMsg('Character not found.', 'error'); return; }
    if (char.creator_id !== Auth.userId) {
        showSaveMsg('You are not the creator of this character.', 'error');
        setTimeout(() => Router.go('dashboard'), 1800);
        return;
    }

    setValue('charName', char.name, 'nameCounter', 50);
    setValue('charSubtitle', char.subtitle || '', 'subtitleCounter', 80);
    setValue('charDesc', char.description || '', 'descCounter', 400);
    setValue('charDefinition', char.definition || '', 'defCounter', 18000);
    setValue('charFirstMsg', char.first_message || '', 'firstMsgCounter', 5000);

    selectVisibility(char.visibility || 'public');
    selectCategory(char.category || 'canon');

    if (Array.isArray(char.tags)) {
        char.tags.forEach(tag => {
            document.querySelectorAll('.tag-chip').forEach(chip => {
                if (chip.dataset.tag === tag) { chip.classList.add('selected'); selectedTags.push(tag); }
            });
        });
        updateTagsUI();
    }

    currentPhotoUrl = char.photo_url || null;
    if (currentPhotoUrl) {
        const preview = document.getElementById('photoPreview');
        preview.style.backgroundImage = `url('${currentPhotoUrl}')`;
        preview.style.fontSize = '0';
        document.getElementById('uploadIcon').style.display = 'none';
    }

    // ── Guardar cambios ───────────────────────────────────────
    document.getElementById('saveBtn').onclick = async () => {
        const name         = document.getElementById('charName').value.trim();
        const subtitle     = document.getElementById('charSubtitle').value.trim();
        const description  = document.getElementById('charDesc').value.trim();
        const definition   = document.getElementById('charDefinition').value.trim();
        const firstMessage = document.getElementById('charFirstMsg').value.trim();
        const btn          = document.getElementById('saveBtn');

        if (!name) { showSaveMsg('Name is required.', 'error'); return; }
        if (!/^[A-Za-zÑñ0-9 ]+$/.test(name)) { showSaveMsg('The name can only contain letters, numbers, and spaces.', 'error'); return; }
        if (!definition)   { showSaveMsg('Character definition cannot be empty.', 'error'); return; }
        if (!firstMessage) { showSaveMsg('First message cannot be empty.', 'error'); return; }

        btn.disabled = true; btn.textContent = 'Saving...';

        let photoUrl = currentPhotoUrl;
        if (uploadedPhotoFile) {
            if (currentPhotoUrl) {
                try {
                    const bucketBase = _supabase.storage.from('character-images').getPublicUrl('').data.publicUrl;
                    const oldPath    = currentPhotoUrl.replace(bucketBase, '');
                    if (oldPath) await _supabase.storage.from('character-images').remove([oldPath]);
                } catch {}
            }
            const ext      = uploadedPhotoFile.name.split('.').pop();
            const fileName = `${Auth.userId}_${Date.now()}.${ext}`;
            const { error: uploadError } = await _supabase.storage.from('character-images').upload(fileName, uploadedPhotoFile);
            if (!uploadError) {
                const { data: urlData } = _supabase.storage.from('character-images').getPublicUrl(fileName);
                photoUrl = urlData.publicUrl;
            }
        }

        const { error: saveError } = await _supabase.from('characters').update({
            name, subtitle, description, definition, first_message: firstMessage,
            visibility: selectedVisibility, category: selectedCategory, tags: selectedTags,
            photo_url: photoUrl, updated_at: new Date().toISOString()
        }).eq('id', characterId).eq('creator_id', Auth.userId);

        btn.disabled = false; btn.textContent = 'Save Changes';

        if (saveError) { showSaveMsg('Could not save changes. Try again.', 'error'); }
        else { showSaveMsg('Saved!', 'success'); setTimeout(() => Router.go('character-profile', { id: characterId }), 1000); }
    };

    // ── Borrar personaje ──────────────────────────────────────
    document.getElementById('deleteBtn').onclick    = () => document.getElementById('deleteModal').classList.add('show');
    document.getElementById('cancelDeleteBtn').onclick = () => document.getElementById('deleteModal').classList.remove('show');
    document.getElementById('deleteModal').onclick  = (e) => { if (e.target.id === 'deleteModal') document.getElementById('deleteModal').classList.remove('show'); };

    document.getElementById('confirmDeleteBtn').onclick = async () => {
        const btn = document.getElementById('confirmDeleteBtn');
        btn.textContent = 'Deleting...'; btn.disabled = true;

        if (currentPhotoUrl) {
            try {
                const bucketBase = _supabase.storage.from('character-images').getPublicUrl('').data.publicUrl;
                const oldPath    = currentPhotoUrl.replace(bucketBase, '');
                if (oldPath) await _supabase.storage.from('character-images').remove([oldPath]);
            } catch {}
        }

        await _supabase.from('chats').delete().eq('character_id', characterId);
        const { error: delError } = await _supabase.from('characters').delete().eq('id', characterId).eq('creator_id', Auth.userId);

        if (delError) { btn.textContent = 'Yes, delete'; btn.disabled = false; alert('Could not delete. Try again.'); }
        else Router.go('dashboard');
    };
}

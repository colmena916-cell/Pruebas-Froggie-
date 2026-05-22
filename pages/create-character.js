// ============================================================
//  pages/create-character.js  —  Crear nuevo personaje
//  Requiere sesión.
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

        .help-hint-banner { display: flex; align-items: center; gap: 8px; background: rgba(235,242,155,0.35); border: 1px dashed rgba(62,83,43,0.25); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; font-size: 0.88rem; color: var(--text-dark); cursor: pointer; opacity: 0.8; transition: opacity 0.2s, background-color 0.2s; text-decoration: none; }
        .help-hint-banner:hover { opacity: 1; background-color: rgba(235,242,155,0.6); }

        .form-section { border-bottom: 1px dashed rgba(62,83,43,0.15); padding: 28px 0; }
        .form-section:last-of-type { border-bottom: none; }
        .section-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.8px; opacity: 0.45; margin-bottom: 18px; }

        .photo-upload-area { display: flex; align-items: center; gap: 22px; }
        .photo-preview { width: 90px; height: 90px; border-radius: 50%; background-color: var(--bg-accent); border: 2px dashed rgba(62,83,43,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; cursor: pointer; transition: border-color 0.2s; }
        .photo-preview:hover { border-color: var(--btn-color); }
        .photo-preview img { width: 100%; height: 100%; object-fit: cover; display: none; }
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

        .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg-main); border-top: 1px solid rgba(62,83,43,0.15); padding: 12px 20px; display: flex; align-items: center; gap: 12px; z-index: 100; }
        .save-message { flex: 1; font-size: 0.88rem; }
        .save-message.error   { color: #8b2e2e; }
        .save-message.success { color: var(--btn-color); }
        .btn-cancel { background: none; border: 1px solid rgba(62,83,43,0.2); border-radius: 20px; padding: 9px 18px; font-family: var(--font-serif); font-size: 0.9rem; color: var(--text-dark); cursor: pointer; text-decoration: none; }
        .btn-save { background-color: var(--btn-color); color: #fff; border: none; border-radius: 20px; padding: 10px 22px; font-family: var(--font-serif); font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s; }
        .btn-save:hover { background-color: var(--btn-hover); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    </style>

    <header>
        <button class="btn-back" id="backBtn">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Back
        </button>
        <h1>New Character</h1>
    </header>

    <main>
        <a href="#" class="help-hint-banner" id="helpBanner">
            <svg style="width:15px;height:15px;fill:currentColor;flex-shrink:0;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
            First time creating a character? See examples and tips →
        </a>

        <div class="form-section">
            <p class="section-label">Identity</p>
            <div class="photo-upload-area">
                <div class="photo-preview" id="photoPreview">
                    <img id="previewImg" alt="Character photo">
                    <div class="upload-icon" id="uploadIcon">
                        <svg style="width:28px;height:28px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        <span>Photo</span>
                    </div>
                </div>
                <div class="photo-upload-info">
                    Add a portrait for your character.
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
                <input type="text" id="charName" placeholder="The Wandering Bard" maxlength="50">
            </div>
            <div class="field-group">
                <label class="field-label">Subtitle <span class="char-counter" id="subtitleCounter">0 / 80</span></label>
                <input type="text" id="charSubtitle" placeholder="Brooding Victorian poet with a secret" maxlength="80">
                <p class="field-hint">One line shown under the name on character cards.</p>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">Description</p>
            <div class="field-group">
                <label class="field-label">Character Description <span class="char-counter" id="descCounter">0 / 400</span></label>
                <textarea id="charDesc" rows="4" placeholder="Write a brief summary — appearance, personality, the vibe they give off." maxlength="400"></textarea>
                <p class="field-hint">🔒 Only visible on your character's profile page — not in the public feed.</p>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">Category &amp; Tags</p>
            <p class="field-label" style="margin-bottom:10px;">Category</p>
            <div class="category-toggle">
                <button class="cat-btn selected" id="cat-canon">📚 Canon</button>
                <button class="cat-btn" id="cat-oc">✨ Original Character</button>
            </div>
            <p class="field-hint" style="margin-bottom:20px;">Canon: from a book, series, anime, game, film, etc. OC: your original creation.</p>
            <div class="tags-label">Tags <span class="tags-counter" id="tagsCounter">0 / 3 selected</span></div>
            <div class="tags-chips" id="tagsChips">${tagChips}</div>
            <p class="field-hint" style="margin-top:10px;">Choose up to 3 tags. They help others find your character.</p>
        </div>

        <div class="form-section">
            <p class="section-label">Definition — Private Prompt</p>
            <div class="field-group">
                <label class="field-label">Character Definition <span class="char-counter" id="defCounter">0 / 18000</span></label>
                <textarea id="charDefinition" rows="10" placeholder="Only the AI reads this. Write who your character is in depth: personality, speech patterns, backstory, fears, how they address the user..." maxlength="18000"></textarea>
                <p class="field-hint">Not visible to users. Write in second or third person — e.g. "You are..." or "{{char}} is..."</p>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">First Message</p>
            <div class="field-group">
                <label class="field-label">Opening <span class="char-counter" id="firstMsgCounter">0 / 5000</span></label>
                <textarea id="charFirstMsg" rows="6" placeholder="The first thing your character says when a chat begins. Set the scene, the mood, the hook." maxlength="5000"></textarea>
                <p class="field-hint">Written in character voice. Use *asterisks* for actions if you prefer that style.</p>
            </div>
        </div>

        <div class="form-section">
            <p class="section-label">Visibility</p>
            <p class="field-hint" style="margin-bottom:14px;">Who can find and chat with this character?</p>
            <div class="visibility-toggle">
                <button class="vis-btn selected" id="vis-public">
                    <svg style="width:18px;height:18px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    Public
                </button>
                <button class="vis-btn" id="vis-private">
                    <svg style="width:18px;height:18px;fill:currentColor;" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                    Private
                </button>
            </div>
            <p class="field-hint" style="margin-top:10px;">Private characters only appear in your own chats.</p>
        </div>
    </main>

    <div class="bottom-bar">
        <span class="save-message" id="saveMessage"></span>
        <button class="btn-cancel" id="cancelBtn">Cancel</button>
        <button class="btn-save" id="saveBtn">Create Character</button>
    </div>
    `;
}

export async function init() {
    if (!Auth.requireSession()) return;

    // Ocultar bottom nav global (esta página tiene su propio bottom bar)
    document.getElementById('bottomNav').style.display = 'none';

    let selectedVisibility = 'public';
    let selectedCategory   = 'canon';
    let selectedTags       = [];
    let uploadedPhotoFile  = null;

    // ── Navegación ────────────────────────────────────────────
    document.getElementById('backBtn').onclick    = () => Router.go('dashboard');
    document.getElementById('cancelBtn').onclick  = () => Router.go('dashboard');
    document.getElementById('helpBanner').onclick = (e) => { e.preventDefault(); Router.go('possible-doubts'); };

    // ── Contadores de caracteres ──────────────────────────────
    const updateCounter = (inputId, counterId, max) => {
        const val = document.getElementById(inputId).value.length;
        const el  = document.getElementById(counterId);
        el.textContent = `${val} / ${max}`;
        el.classList.toggle('warning', val >= max * 0.9);
    };
    ['charName:nameCounter:50','charSubtitle:subtitleCounter:80','charDesc:descCounter:400','charDefinition:defCounter:18000','charFirstMsg:firstMsgCounter:5000'].forEach(s => {
        const [id, counter, max] = s.split(':');
        document.getElementById(id).oninput = () => updateCounter(id, counter, parseInt(max));
    });

    // ── Foto ──────────────────────────────────────────────────
    const photoInput = document.getElementById('photoInput');
    document.getElementById('photoPreview').onclick  = () => photoInput.click();
    document.getElementById('choosePhotoBtn').onclick = () => photoInput.click();
    photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Image is too large. Maximum size is 2MB.'); return; }
        uploadedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = document.getElementById('previewImg');
            img.src = ev.target.result; img.style.display = 'block';
            document.getElementById('uploadIcon').style.display = 'none';
        };
        reader.readAsDataURL(file);
    };

    // ── Categoría ─────────────────────────────────────────────
    document.getElementById('cat-canon').onclick = () => { selectedCategory = 'canon'; document.getElementById('cat-canon').classList.add('selected'); document.getElementById('cat-oc').classList.remove('selected'); };
    document.getElementById('cat-oc').onclick    = () => { selectedCategory = 'oc';    document.getElementById('cat-oc').classList.add('selected'); document.getElementById('cat-canon').classList.remove('selected'); };

    // ── Visibilidad ───────────────────────────────────────────
    document.getElementById('vis-public').onclick  = () => { selectedVisibility = 'public';  document.getElementById('vis-public').classList.add('selected'); document.getElementById('vis-private').classList.remove('selected'); };
    document.getElementById('vis-private').onclick = () => { selectedVisibility = 'private'; document.getElementById('vis-private').classList.add('selected'); document.getElementById('vis-public').classList.remove('selected'); };

    // ── Tags ──────────────────────────────────────────────────
    const MAX_TAGS = 3;
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

    // ── Guardar ───────────────────────────────────────────────
    const showSaveMsg = (text, type) => {
        const el = document.getElementById('saveMessage');
        el.textContent = text; el.className = `save-message ${type}`;
    };

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

        let photoUrl = null, uploadedFileName = null;
        if (uploadedPhotoFile) {
            const ext = uploadedPhotoFile.name.split('.').pop();
            uploadedFileName = `${Auth.userId}_${Date.now()}.${ext}`;
            const { error: uploadError } = await _supabase.storage.from('character-images').upload(uploadedFileName, uploadedPhotoFile);
            if (uploadError) { showSaveMsg('Image upload failed. Try without a photo first.', 'error'); btn.disabled = false; btn.textContent = 'Create Character'; return; }
            const { data: urlData } = _supabase.storage.from('character-images').getPublicUrl(uploadedFileName);
            photoUrl = urlData.publicUrl;
        }

        const { error } = await _supabase.from('characters').insert({
            name, subtitle, description, definition, first_message: firstMessage,
            visibility: selectedVisibility, category: selectedCategory, tags: selectedTags,
            photo_url: photoUrl, creator_id: Auth.userId, created_at: new Date().toISOString()
        });

        if (error) {
            if (uploadedFileName) await _supabase.storage.from('character-images').remove([uploadedFileName]);
            showSaveMsg('Could not save. Check your Supabase table setup.', 'error');
            btn.disabled = false; btn.textContent = 'Create Character';
        } else {
            showSaveMsg('Character created!', 'success');
            setTimeout(() => Router.go('dashboard'), 1200);
        }
    };
}

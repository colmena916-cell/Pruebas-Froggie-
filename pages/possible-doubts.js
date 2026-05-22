// ============================================================
//  pages/possible-doubts.js  —  Help Center & FAQ
//  Página estática — no requiere sesión ni Supabase.
// ============================================================

export function render() {
    return `
    <style>
        html { scroll-behavior: smooth; }

        .faq-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 1px solid rgba(62,83,43,0.15);
            background-color: var(--bg-main);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .btn-back {
            background: none; border: none; cursor: pointer;
            color: var(--text-dark); display: flex; align-items: center;
            padding: 6px; border-radius: 50%; transition: background-color 0.2s;
        }
        .btn-back:hover { background-color: rgba(62,83,43,0.08); }
        .faq-header-title { font-size: 1.2rem; font-weight: normal; }

        .faq-nav {
            display: flex; justify-content: center; gap: 12px;
            padding: 12px; background-color: rgba(62,83,43,0.03);
            border-bottom: 1px solid rgba(62,83,43,0.15);
            position: sticky; top: 61px; z-index: 99;
            backdrop-filter: blur(4px); flex-wrap: wrap;
        }
        .faq-nav a {
            text-decoration: none; color: var(--text-dark);
            font-size: 0.9rem; padding: 6px 12px;
            border-radius: 12px; border: 1px solid transparent;
            transition: all 0.2s;
        }
        .faq-nav a:hover { background-color: var(--bg-accent); border-color: rgba(62,83,43,0.15); }

        .faq-content {
            max-width: 800px; width: 100%;
            margin: 0 auto; padding: 32px 16px 80px;
            display: flex; flex-direction: column; gap: 48px;
        }
        .faq-content section {
            padding-top: 40px; margin-top: -40px;
            border-bottom: 1px dashed rgba(62,83,43,0.15);
            padding-bottom: 32px;
        }
        .faq-content section:last-of-type { border-bottom: none; }

        .faq-content h2 {
            font-size: 1.6rem; font-weight: normal;
            margin-bottom: 16px; color: var(--btn-color);
            display: flex; align-items: center; gap: 8px;
        }
        .faq-content h3 { font-size: 1.2rem; font-weight: normal; margin-top: 20px; margin-bottom: 8px; opacity: 0.9; }
        .faq-content p { margin-bottom: 16px; opacity: 0.95; text-align: justify; line-height: 1.6; }
        .faq-content ul, .faq-content ol { margin-left: 24px; margin-bottom: 16px; opacity: 0.95; }
        .faq-content li { margin-bottom: 6px; line-height: 1.6; }

        .highlight-box {
            background-color: rgba(235,242,155,0.25);
            border-left: 4px solid var(--btn-color);
            padding: 16px; border-radius: 0 12px 12px 0;
            margin: 16px 0; font-style: italic;
        }
        .api-card {
            background-color: rgba(62,83,43,0.02);
            border: 1px solid rgba(62,83,43,0.15);
            border-radius: 12px; padding: 16px; margin-top: 14px;
        }
        .api-badge {
            display: inline-block; font-family: sans-serif;
            font-size: 0.75rem; font-weight: bold;
            padding: 2px 8px; border-radius: 6px; margin-bottom: 6px;
        }
        .api-badge.active   { background-color: #d2e7d6; color: #2e6930; }
        .api-badge.disabled { background-color: #f7d6d6; color: #a63232; }

        .guide-step {
            margin-top: 24px;
            background-color: rgba(62,83,43,0.01);
            border: 1px solid rgba(62,83,43,0.15);
            border-radius: 16px; padding: 20px;
        }
        .image-container {
            margin: 14px 0; text-align: center;
            background: rgba(255,255,255,0.6); border: 1px solid rgba(62,83,43,0.15);
            border-radius: 8px; padding: 8px;
        }
        .image-container img { max-width: 100%; height: auto; border-radius: 6px; display: block; margin: 0 auto; }
        .image-caption { font-size: 0.8rem; opacity: 0.6; margin-top: 6px; font-family: sans-serif; }
        .prompt-box {
            background-color: rgba(93,112,56,0.06);
            border-left: 3px solid var(--btn-color);
            padding: 12px 16px; border-radius: 6px;
            font-style: italic; font-size: 0.95rem; margin-top: 8px;
        }
        .faq-footer {
            text-align: center; padding: 24px;
            border-top: 1px solid rgba(62,83,43,0.15);
            font-size: 0.85rem; opacity: 0.5;
        }
    </style>

    <header class="faq-header">
        <button class="btn-back" id="faqBack">
            <svg style="width:22px;height:22px;fill:currentColor;" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <span class="faq-header-title">Help Center & FAQ</span>
    </header>

    <nav class="faq-nav">
        <a href="#about-project">🐸 About the Project</a>
        <a href="#api-keys">🔑 Connecting APIs</a>
        <a href="#create-bot">✨ Character Creation</a>
        <a href="#terms">⚖️ Terms</a>
    </nav>

    <main class="faq-content">

        <section id="about-project">
            <h2>About Froggie AI 🐸🌟</h2>
            <p>Hello! It is an absolute joy to have you here exploring the backend of our little digital pond. The very first thing you should know is that <strong>Froggie AI is a completely independent, homemade project</strong> built from scratch by a single creator: an amateur "programmer" who often spends way more time fighting curly brackets <code>{}</code> than actually sleeping! 👩‍💻✨</p>
            <p>To be perfectly honest, my current technical knowledge is quite limited—I am learning entirely on the go through sheer curiosity, lots of coffee, and internet tutorials! 📚☕ However, my main goal is to actively keep learning and improving this website so we can all have a beautiful, cozy space to write, interact, and roleplay.</p>
            <div class="highlight-box">
                <strong>Reality Check / Spoiler Alert:</strong> Due to regular adult life challenges (balancing a day job, limited free time, and the actual hosting costs of keeping servers alive 💸⏱️), there is a natural possibility that continuing the project might get tricky at times. But let's not get discouraged! If our little frog receives enough love, support, and a nice community base, I will do everything humanly possible to complete the project and expand the features. 💚
            </div>
            <p>Since this is a brand new platform built entirely by one person, you will definitely stumble upon a weird behavior or a stray bug here and there 🐞 (just think of them as special custom features of the house!). I am completely open to hearing everyone's opinions, bug reports, suggestions, or even just a warm hello to help keep polishing the app. Let's make this pond grow together! 💬🤝</p>
        </section>

        <section id="api-keys">
            <h2>Under the Hood: Connection & Intelligence (API Keys) 🔑🤖</h2>
            <p>Currently, Froggie AI does not host its own large language model due to the high costs of server infrastructure. Instead, the platform acts as a bridge, utilizing <strong>API Keys</strong> that you provide to connect with some of the best AI models on the market.</p>

            <div class="api-card">
                <span class="api-badge active">✓ Recommended</span>
                <h3>1. OpenRouter (Advanced Roleplay Models)</h3>
                <p>This is the absolute star of the house if you are looking for an immersive narrative experience. It allows you to invoke amazing models like <em>Mythomax</em> or <em>Anthropic's Claude</em> variants. To set it up:</p>
                <ul>
                    <li>Create an account at <a href="https://openrouter.ai" target="_blank" style="color:var(--btn-color);">openrouter.ai</a>.</li>
                    <li>Generate a new API Key in your dashboard and paste it into the designated field inside Froggie AI.</li>
                    <li>Don't forget to type the exact model identifier you want to call (e.g., <code>gryphe/mythomax-l2-13b</code>) in your settings panel.</li>
                </ul>
            </div>

            <div class="api-card">
                <span class="api-badge active">✓ Available</span>
                <h3>2. OpenAI (GPT-3.5 / GPT-4)</h3>
                <p>Perfect for fast, highly structured responses with great logic. It requires you to generate a token (starting with <code>sk-...</code>) from your OpenAI developer console and ensure your billing account has an active balance.</p>
            </div>

            <div class="api-card">
                <span class="api-badge disabled">⚠ Currently Unavailable</span>
                <h3>3. Google Gemini (Under Maintenance)</h3>
                <p>While you will see the visual fields ready to receive Google Gemini keys, <strong>this model is currently not active within the chat rooms</strong>. We are restructuring our backend code to integrate it properly. We'll let you know as soon as it's ready!</p>
            </div>

            <div class="api-card">
                <span class="api-badge" style="background-color:rgba(93,112,56,0.12);color:var(--btn-color);">🔧 Flexible</span>
                <h3>4. Custom API (Advanced Users)</h3>
                <p>This option lets you connect any compatible AI provider by entering a custom base URL and its corresponding API key. If you are unsure about the exact URL your provider uses, ask any AI assistant: <em>"What is the base API URL for [provider name]?"</em> 🤖💡</p>
            </div>

            <div class="highlight-box" style="margin-top:28px;">
                <strong>🛠️ Don't know where to start? Here's the setup I personally use and recommend:</strong>
            </div>

            <div class="guide-step">
                <h3>📌 Step 1 — Get your free API Key from Groq</h3>
                <p>The model I personally use and recommend is <strong>Groq</strong>: it's fast, free, and works beautifully with Froggie AI.</p>
                <ul>
                    <li>Open the Groq console: <a href="https://console.groq.com/home" target="_blank" style="color:var(--btn-color);">console.groq.com/home</a> 🌐</li>
                    <li>Sign up — using your <strong>Google account is highly recommended</strong> (only two clicks).</li>
                    <li>Go to <strong>"API Keys"</strong> in the sidebar, generate a new key, give it a name, save it, and copy it.</li>
                </ul>
            </div>

            <div class="guide-step">
                <h3>📌 Step 2 — Configure Froggie AI</h3>
                <p>Open the dropdown menu (☰ top right), navigate to <strong>API Key</strong>, select <strong>"Custom"</strong> and fill in:</p>
                <ul>
                    <li>🔑 <strong>API Key:</strong> Paste the key you copied from Groq.</li>
                    <li>🌐 <strong>API Endpoint URL:</strong> <code>https://api.groq.com/openai/v1/chat/completions</code></li>
                    <li>🤖 <strong>Model name:</strong> <code>llama-3.1-8b-instant</code></li>
                </ul>
                <p style="margin-top:12px;">Hit <strong>Save</strong> and that's it! 🎭✨</p>
            </div>

            <div class="guide-step">
                <h3>💡 Want to try a different provider?</h3>
                <p>Same steps for any platform. Ask any AI assistant:</p>
                <div class="prompt-box">
                    "I am configuring an OpenAI-compatible AI client. I need to connect the provider [Insert provider name]. What is the exact API Endpoint URL for chat/completions and the exact Model Name for the free or basic model?"
                </div>
            </div>

            <p style="margin-top:8px;font-style:italic;text-align:center;font-size:0.95rem;">🐸 If you get stuck on any step, don't hesitate to reach out — we'll figure it out together!</p>
        </section>

        <section id="create-bot">
            <h2>Step-by-Step Guide: Bringing a Character to Life 🎨✍️</h2>
            <p>Designing a bot on Froggie AI is a magical process, but it requires structure to help the AI accurately capture the exact persona you have in mind.</p>

            <div class="guide-step">
                <h3>Step 1: Basic Identity & Visuals</h3>
                <p>The very first thing other users will see. Define your character's avatar or photo (we recommend a direct, stable image URL), their name, and a brief subtitle summarizing who they are in a single sentence.</p>
                <div class="image-container">
                    <img src="primera parte del bot.png" alt="Basic Identity Form Area">
                    <div class="image-caption">Reference Image: primera parte del bot.png</div>
                </div>
            </div>

            <div class="guide-step">
                <h3>Step 2: Public Description</h3>
                <p>A <strong>compact summary of who your character is</strong> — key physical appearance and most defining personality traits. Be <strong>clear, direct, and concise</strong>. This is also visible to the public, so it doubles as the first impression readers get of your creation!</p>
                <div class="image-container">
                    <img src="segunda parte.png" alt="Public Description Area">
                    <div class="image-caption">Reference Image: segunda parte.png</div>
                </div>
            </div>

            <div class="guide-step">
                <h3>Step 3: Deep System Definition (The Soul of the Bot)</h3>
                <p>The most critical and hidden part. Your writing needs to be <strong>extremely clear, direct, and detailed</strong>. Use explicit attributes and lore traits to guide the AI on how to act, its backstory, relationship to the user, speech mannerisms, and psychological traits.</p>
                <div class="image-container">
                    <img src="tercera parte.png" alt="System Definition Part 1" style="margin-bottom:8px;">
                    <img src="cuarta parte.png" alt="System Definition Part 2" style="margin-bottom:8px;">
                    <img src="quinta parte.png" alt="System Definition Part 3">
                    <div class="image-caption">Sequential Reference Images: tercera parte.png, cuarta parte.png, and quinta parte.png</div>
                </div>
            </div>

            <div class="guide-step">
                <h3>Step 4: First Message & Visibility</h3>
                <p>Write the bot's <strong>First Message / Greeting</strong>. This triggers the roleplay session and subtly dictates the writing style to the AI (whether to use asterisks <code>*actions*</code> or quotation marks for dialogue).</p>
                <p>Then select: <strong>Public</strong> (appears on the global feed) or <strong>Private</strong> (only accessible from your profile).</p>
                <div class="image-container">
                    <img src="ultima parte.png" alt="First Message and Privacy Options">
                    <div class="image-caption">Reference Image: ultima parte.png</div>
                </div>
            </div>

            <p style="margin-top:20px;font-style:italic;text-align:center;">💡 <strong>Quick Pro-Tip:</strong> While this structure is highly recommended, Froggie AI is all about creative freedom — experiment with different styles and discover unique interactions!</p>
        </section>

        <section id="terms">
            <h2>Terms &amp; Conditions ⚖️💚</h2>
            <p><strong>1. Acceptance</strong><br>By registering and using Froggie AI, you confirm that you have read, understood, and accepted these terms.</p>
            <p><strong>2. Age Requirement</strong><br>Froggie AI contains mature and uncensored narrative content. You must be at least 18 years old to create an account. By registering, you declare under your own responsibility that you meet this requirement.</p>
            <p><strong>3. Nature of the Service</strong><br>Froggie AI is an independent, personal, and non-profit project for interactive creative writing. Responses are generated by AI models whose behavior is unpredictable. All content is fiction.</p>
            <p><strong>4. Acceptable Use</strong><br>The following are strictly <strong>prohibited</strong>:</p>
            <ul>
                <li>Generating sexual content involving minors (CSAM), in any form or fictional context.</li>
                <li>Producing real hate speech, threats, or harassment directed at real people.</li>
                <li>Planning, facilitating, or inciting illegal activities in the real world.</li>
                <li>Impersonating real individuals with intent to damage their reputation.</li>
                <li>Attempting to extract technical information from the system through malicious means.</li>
            </ul>
            <p>Adult content between fictional adult characters is permitted within the creative spirit of the platform.</p>
            <p><strong>5. Intellectual Property &amp; Training Data</strong><br>You retain full ownership of your original characters, prompts, and lore. Froggie AI claims no rights over your creative writing.</p>
            <p><strong>6. Privacy &amp; Data</strong><br>Conversations are stored on the platform's servers for technical reasons. Your personal data will not be sold or shared with third parties for commercial purposes.</p>
            <p><strong>7. Disclaimer on Generated Content</strong><br>Froggie AI is not responsible for the content produced by the bots, nor for any decisions made by users based on said content. Use of the platform is entirely at the user's own risk.</p>
            <p><strong>8. Service Availability</strong><br>As a solo, non-profit project, Froggie AI does not guarantee continuous availability. It may be modified, paused, or shut down at any time, ideally with prior notice to the community.</p>
            <p><strong>9. Changes to These Terms</strong><br>Substantial changes will be communicated through the project's official channels (Discord and/or a visible notice within the platform).</p>
            <p><strong>10. Jurisdiction</strong><br>These terms are governed by the laws applicable in the country where the project operates.</p>
            <div class="highlight-box" style="border-left-color:#c97171;background-color:rgba(201,113,113,0.05);margin-top:28px;">
                🚨 <strong>Friendly Beta Reminder:</strong> You are participating in a very enclosed and basic closed beta phase. Many features will be continuously built, modified, or temporarily broken as I learn more advanced software development. Thank you so much for your incredible patience! 🐸
            </div>
        </section>

    </main>

    <footer class="faq-footer">
        Froggie AI · Made with love, amateur code, and little frog legs 🐸
    </footer>
    `;
}

export function init() {
    // Botón de volver atrás
    document.getElementById('faqBack').onclick = () => history.back();

    // Ocultar el bottom nav en esta página (es una página de detalle)
    document.getElementById('bottomNav').style.display = 'none';
}

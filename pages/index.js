// ============================================================
//  pages/index.js  —  Landing page / Home pública
//  Si el usuario ya tiene sesión, redirige al dashboard.
//  No requiere sidebar ni bottom nav.
// ============================================================

import { Auth }   from '../auth.js';
import { Router } from '../router.js';

export function render() {
    return `
    <style>
        .landing-body {
            background-color: var(--bg-accent);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            /* Estas páginas no usan bottom nav */
            padding-bottom: 20px;
        }

        .landing-nav {
            width: 100%; max-width: 800px;
            text-align: center; margin-bottom: 20px;
            position: sticky; top: 0;
            background-color: var(--bg-accent);
            padding: 10px 0; z-index: 1000;
        }
        .landing-nav-links {
            display: flex; justify-content: center;
            gap: 30px; list-style: none; flex-wrap: wrap;
        }
        .landing-nav-links a {
            color: var(--text-dark); text-decoration: none;
            font-size: 1.2rem; transition: opacity 0.2s;
        }
        .landing-nav-links a:hover { opacity: 0.7; }
        .landing-divider {
            border: 0; border-top: 1px solid var(--text-dark);
            opacity: 0.5; max-width: 350px; margin: 10px auto 0;
        }

        .hero-section {
            min-height: 90vh; display: flex;
            flex-direction: column; justify-content: center;
            align-items: center; text-align: center; width: 100%;
        }
        .logo-area { margin-bottom: 35px; }
        .frog-logo { width: 90px; height: auto; margin-bottom: 5px; display: inline-block; }
        .logo-area h1 {
            font-size: 4rem; letter-spacing: 2px;
            font-weight: normal; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .beta-badge {
            margin-top: 15px; font-size: 0.95rem;
            font-style: italic; opacity: 0.75; letter-spacing: 0.5px;
        }

        .btn-action {
            background-color: var(--btn-color); color: #fff;
            border: none; padding: 14px 50px;
            font-family: var(--font-serif); font-size: 1.1rem;
            border-radius: 30px; cursor: pointer;
            text-decoration: none; display: inline-flex;
            align-items: center; gap: 10px;
            transition: background-color 0.2s, transform 0.1s;
        }
        .btn-action:hover { background-color: var(--btn-hover); }
        .btn-action:active { transform: scale(0.98); }

        .btn-action-outline {
            background-color: transparent; color: var(--btn-color);
            border: 2px solid var(--btn-color); padding: 12px 50px;
            font-family: var(--font-serif); font-size: 1.1rem;
            border-radius: 30px; cursor: pointer; text-decoration: none;
            display: inline-flex; align-items: center; gap: 10px;
            transition: background-color 0.2s, transform 0.1s;
        }
        .btn-action-outline:hover { background-color: rgba(93,112,56,0.08); }
        .btn-action-outline:active { transform: scale(0.98); }

        .hero-btns {
            display: flex; gap: 14px;
            flex-wrap: wrap; justify-content: center; margin-bottom: 16px;
        }

        .api-hint-box {
            margin-top: 32px;
            background-color: rgba(93,112,56,0.08);
            border: 1px dashed rgba(93,112,56,0.35);
            border-radius: 14px; padding: 16px 24px;
            max-width: 520px; text-align: center;
        }
        .api-hint-box p { margin-bottom: 6px; font-size: 1rem; }
        .api-hint-box p:last-of-type { font-size: 0.92rem; opacity: 0.8; margin-bottom: 10px; }

        .info-section {
            width: 100%; max-width: 700px;
            padding: 160px 20px 60px; text-align: justify;
        }
        .info-section h2 {
            font-size: 2rem; font-weight: normal;
            margin-bottom: 25px;
            border-bottom: 1px dashed var(--text-dark);
            padding-bottom: 5px; color: var(--text-dark);
        }
        .info-section p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px; opacity: 0.9; }
        .info-section ul { margin-left: 24px; margin-bottom: 20px; font-size: 1.05rem; line-height: 1.8; opacity: 0.9; }

        .center-btn { text-align: center; margin-top: 30px; }
        .center-btn-flex { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-top: 30px; }

        .landing-footer {
            width: 100%; max-width: 800px;
            text-align: center; margin-top: 180px;
            padding-top: 20px;
            border-top: 1px solid rgba(62,83,43,0.2);
            padding-bottom: 40px;
        }
        .notice-text { font-size: 0.9rem; line-height: 1.5; opacity: 0.8; max-width: 700px; margin: 0 auto; }

        @media (max-width: 600px) {
            .logo-area h1 { font-size: 2.5rem; }
            .landing-nav-links { gap: 15px; }
            .landing-nav-links a { font-size: 1.1rem; }
            .btn-action { width: 100%; max-width: 280px; justify-content: center; }
            .info-section { padding: 100px 20px 40px; }
            .info-section h2 { font-size: 1.6rem; }
            .info-section p { font-size: 1rem; }
        }
    </style>

    <div class="landing-body">
        <nav class="landing-nav">
            <ul class="landing-nav-links">
                <li><a href="#about">About</a></li>
                <li><a href="#donations">Donations</a></li>
                <li><a href="#terms">Terms</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#" id="landingHelp">Help</a></li>
            </ul>
            <hr class="landing-divider">
        </nav>

        <section class="hero-section">
            <div class="logo-area">
                <img src="ranita.png" alt="Froggie Logo" class="frog-logo">
                <h1>FROGGIE.AI</h1>
            </div>

            <div class="hero-btns">
                <button class="btn-action" id="landingVisit">Visit</button>
                <button class="btn-action-outline" id="landingJoin">Join</button>
            </div>
            <p class="beta-badge">[ Open beta — limited spots available ]</p>

            <div class="api-hint-box">
                <p>🔑 <strong>Not sure how to set up your API key?</strong></p>
                <p>Step-by-step guide available — free, no technical experience needed.</p>
                <a href="#" id="landingHelpLink" style="color:var(--btn-color);font-weight:bold;font-size:0.93rem;text-decoration:underline;">Visit the Help Center →</a>
            </div>
        </section>

        <section class="info-section" id="about">
            <h2>About Froggie AI</h2>
            <p>Froggie AI was born out of a clear need: to rescue the true essence of roleplay and interactive creative writing. On an internet full of commercial platforms that limit your imagination with rigid filters and memories that forget your story within a few paragraphs, this space proposes the opposite.</p>
            <p>This is a handmade project, focused on bringing to life deep psychological profiles, text rich in narrative, and absolute freedom for your stories. Here, you have control over the aesthetics and the direction of your characters.</p>
        </section>

        <section class="info-section" id="donations">
            <h2>Support the Project</h2>
            <p>Froggie AI is built entirely from scratch, out of passion and a deep love for free storytelling. If you love this space and want to help keep it alive, independent, and growing, your support makes a world of difference. Every donation directly funds the servers that make these minds run.</p>
            <div class="center-btn">
                <a href="https://ko-fi.com/beemena" target="_blank" class="btn-action">Make a donation</a>
            </div>
        </section>

        <section class="info-section" id="contact">
            <h2>Get in Touch</h2>
            <p>Whether you want to share feedback, report a bug, suggest features, or simply connect with other beta creators and share your stories, this is where you can find me. Welcome to the pond.</p>
            <div class="center-btn-flex">
                <a href="https://discord.gg/9GN3AEVb7V" target="_blank" class="btn-action">
                    <svg style="width:20px;height:20px;fill:currentColor;" viewBox="0 0 127.14 96.36"><path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.18,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a74.37,74.37,0,0,0,6.71-11,68.6,68.6,0,0,1-10.64-5.12c.91-.66,1.8-1.34,2.65-2a75.58,75.58,0,0,0,72.86,0c.85.69,1.74,1.37,2.65,2a68.45,68.45,0,0,1-10.64,5.12,74.65,74.65,0,0,0,6.71,11,105.73,105.73,0,0,0,31-18.83C129,50.7,122.64,27.78,107.7,8.07Z"/></svg>
                    Discord
                </a>
                <a href="https://www.tiktok.com/@beemena_" target="_blank" class="btn-action">
                    <svg style="width:20px;height:20px;fill:currentColor;" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
                    TikTok
                </a>
            </div>
        </section>

        <section class="info-section" id="terms">
            <h2>Terms &amp; Conditions</h2>
            <p><strong>1. Acceptance</strong><br>By registering and using Froggie AI, you confirm that you have read, understood, and accepted these terms.</p>
            <p><strong>2. Age Requirement</strong><br>You must be at least 18 years old to create an account. By registering, you declare under your own responsibility that you meet this requirement.</p>
            <p><strong>3. Nature of the Service</strong><br>Froggie AI is an independent, personal, and non-profit project for interactive creative writing. All content is fiction.</p>
            <p><strong>4. Acceptable Use</strong><br>The following are strictly <strong>prohibited</strong>:</p>
            <ul>
                <li>Generating sexual content involving minors (CSAM), in any form or fictional context.</li>
                <li>Producing real hate speech, threats, or harassment directed at real people.</li>
                <li>Planning, facilitating, or inciting illegal activities in the real world.</li>
                <li>Impersonating real individuals with intent to damage their reputation.</li>
                <li>Attempting to extract technical information from the system through malicious means.</li>
            </ul>
            <p>Adult content between fictional adult characters is permitted within the creative spirit of the platform.</p>
            <p><strong>5–10.</strong> Full terms available in the <a href="#" id="termsFullLink" style="color:var(--btn-color);">Help Center</a>.</p>
        </section>

        <footer class="landing-footer">
            <p class="notice-text">
                <strong>Notice:</strong> Froggie AI is a personal, independent, handmade, and non-profit project. It was born out of frustration with commercial platforms and the desire to create a safe, uncensored space for our stories. As a closed beta managed by a single person, I deeply appreciate your patience, your feedback, and your love for the craft.
            </p>
        </footer>
    </div>
    `;
}

export async function init() {
    // Si ya hay sesión, ir directo al dashboard (igual que el original)
    if (Auth.userId) {
        Router.go('dashboard');
        return;
    }

    // Ocultar solo el bottom nav — la landing tiene su propio nav
    document.getElementById('bottomNav').style.display = 'none';

    // Botones de navegación
    document.getElementById('landingVisit').onclick = () => Router.go('dashboard');
    document.getElementById('landingJoin').onclick  = () => Router.go('registro');
    document.getElementById('landingHelp').onclick     = (e) => { e.preventDefault(); Router.go('possible-doubts'); };
    document.getElementById('landingHelpLink').onclick = (e) => { e.preventDefault(); Router.go('possible-doubts'); };
    document.getElementById('termsFullLink').onclick   = (e) => { e.preventDefault(); Router.go('possible-doubts'); };
}

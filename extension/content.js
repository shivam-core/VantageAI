// ═══════════════════════════════════════════════════════════════
// VANTAGE AI - FINAL PRODUCTION BUILD
// Smart Capture + Multi-Line Apply Fix
// ═══════════════════════════════════════════════════════════════

(function () {
    'use strict';

    console.log('⚡ VantageAI Production Build loaded');

    let observer = null;
    let currentTypewriterInterval = null;
    let pendingText = "";
    let lastActiveInput = null;

    // ═══════════════════════════════════════════════════════════════
    // 1. SMART TEXT CAPTURE
    // ═══════════════════════════════════════════════════════════════

    function getActiveInput() {
        if (document.activeElement &&
            (document.activeElement.getAttribute('contenteditable') === 'true' ||
                document.activeElement.tagName === 'TEXTAREA' ||
                document.activeElement.tagName === 'INPUT')) {
            return document.activeElement;
        }

        if (lastActiveInput && document.body.contains(lastActiveInput)) {
            return lastActiveInput;
        }

        const boxes = document.querySelectorAll('div[contenteditable="true"], textarea');
        for (let box of boxes) {
            const rect = box.getBoundingClientRect();
            if (rect.height > 20 && rect.width > 100) {
                return box;
            }
        }
        return null;
    }

    document.addEventListener('focusin', (e) => {
        if (e.target.getAttribute('contenteditable') === 'true' ||
            e.target.tagName === 'TEXTAREA') {
            lastActiveInput = e.target;
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // 2. FLOATING BUTTON
    // ═══════════════════════════════════════════════════════════════

    function injectFloatingButton() {
        if (document.getElementById('vantage-floating-btn')) return;

        const input = getActiveInput();
        if (!input) return;

        const btn = document.createElement('button');
        btn.id = 'vantage-floating-btn';

        // Use logo.png instead of text
        const logoUrl = chrome.runtime.getURL('icons/logo.png');
        btn.innerHTML = `<img src="${logoUrl}" alt="V" style="width: 20px; height: 20px; border-radius: 4px;">`;
        btn.title = 'Optimize with VantageAI (Ctrl+Shift+X)';

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const activeInput = getActiveInput();
            const text = activeInput ? (activeInput.innerText || activeInput.value || "") : "";

            if (!text || text.trim().length < 2) {
                alert("VantageAI: Please type a prompt first!");
                return;
            }

            lastActiveInput = activeInput;
            analyzeText(text.trim());
        };

        document.body.appendChild(btn);
        positionFloatingButton();
    }

    function positionFloatingButton() {
        const btn = document.getElementById('vantage-floating-btn');
        const input = getActiveInput();
        if (!btn || !input) return;

        const rect = input.getBoundingClientRect();
        btn.style.position = 'fixed';
        btn.style.top = (rect.top + rect.height / 2 - 16) + 'px';
        btn.style.left = (rect.right - 90) + 'px';
        btn.style.zIndex = '2147483646';
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. OBSERVER
    // ═══════════════════════════════════════════════════════════════

    function startObserver() {
        if (observer) observer.disconnect();
        observer = new MutationObserver(() => {
            injectFloatingButton();
            positionFloatingButton();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('scroll', positionFloatingButton);
    window.addEventListener('resize', positionFloatingButton);

    setTimeout(() => {
        startObserver();
        injectFloatingButton();
    }, 1500);

    // ═══════════════════════════════════════════════════════════════
    // 4. HUD INJECTION
    // ═══════════════════════════════════════════════════════════════

    function injectHUD() {
        if (document.getElementById('vantage-hud-overlay')) return;

        const logoUrl = chrome.runtime.getURL('icons/logo.png');

        const hudHTML = `
        <div id="vantage-hud-overlay">
            <div class="vantage-card">
                <div class="vantage-header">
                    <div class="vantage-logo">
                        <img src="${logoUrl}" alt="V" class="vantage-logo-img">
                        <span>VantageAI</span>
                        <span class="vantage-badge">PRO</span>
                    </div>
                    <button id="vantage-close-btn" class="vantage-close">×</button>
                </div>

                <div class="vantage-controls-row">
                    <select id="sel-app" class="vantage-select">
                        <option value="gemini" selected>Gemini</option>
                        <option value="chatgpt">ChatGPT</option>
                        <option value="claude">Claude</option>
                    </select>

                    <select id="sel-model" class="vantage-select">
                        <!-- Models populated dynamically -->
                    </select>

                    <select id="sel-usecase" class="vantage-select">
                        <option value="general" selected>General</option>
                        <option value="coding">Coding</option>
                        <option value="study">Study</option>
                        <option value="creative">Creative</option>
                        <option value="reasoning">Reasoning</option>
                    </select>
                </div>

                <div class="vantage-body">
                    <button id="vantage-run-btn" class="vantage-action-btn">OPTIMIZE PROMPT</button>
                    <div class="vantage-diagnosis">
                        <div class="vantage-section-label">Status</div>
                        <div id="vantage-diagnosis-text">Ready to optimize...</div>
                    </div>
                    <div class="vantage-result-container">
                        <div class="vantage-section-label">Optimized Prompt</div>
                        <div id="vantage-result-text" class="vantage-result-box"></div>
                    </div>
                </div>

                <div class="vantage-footer">
                    <div class="vantage-score-pill" id="vantage-score">--/10</div>
                    <div style="flex:1"></div>
                    <button class="vantage-btn vantage-btn-secondary" id="vantage-dismiss-btn">Dismiss</button>
                    <button class="vantage-btn vantage-btn-primary" id="vantage-apply-btn">Apply Fix</button>
                </div>
            </div>
        </div>
        `;

        if (!document.getElementById('vantage-styles')) {
            const styleLink = document.createElement('link');
            styleLink.id = 'vantage-styles';
            styleLink.rel = 'stylesheet';
            styleLink.href = chrome.runtime.getURL('styles.css');
            document.head.appendChild(styleLink);
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = hudHTML;
        document.body.appendChild(wrapper.firstElementChild);

        document.getElementById('vantage-close-btn').onclick = removeHUD;
        document.getElementById('vantage-dismiss-btn').onclick = removeHUD;
        document.getElementById('vantage-apply-btn').onclick = applyFix;
        document.getElementById('vantage-run-btn').onclick = runOptimization;

        // Dynamic model selection based on AI app (Updated January 2026)
        const modelsByApp = {
            gemini: [
                // Flagship & Frontier
                { value: 'gemini-3-pro', label: 'Gemini 3 Pro (Preview)' },
                { value: 'gemini-3-flash', label: 'Gemini 3 Flash' },
                // Stable & Efficient
                { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
                { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
                // Specialized
                { value: 'gemini-2.5-flash-audio', label: '2.5 Flash Native Audio' }
            ],
            chatgpt: [
                // Flagship (GPT-5 Series)
                { value: 'gpt-5.2', label: 'GPT-5.2' },
                { value: 'gpt-5.2-pro', label: 'GPT-5.2 Pro' },
                { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
                { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
                // Reasoning & Research
                { value: 'o3-deep-research', label: 'o3 Deep Research' },
                { value: 'o3-pro', label: 'o3 Pro' },
                // Legacy (Retiring Feb 2026)
                { value: 'gpt-4o', label: 'GPT-4o (Legacy)' },
                { value: 'gpt-4.1', label: 'GPT-4.1 (Legacy)' }
            ],
            claude: [
                // Flagship (Opus Line)
                { value: 'claude-opus-4.5', label: 'Claude Opus 4.5' },
                { value: 'claude-opus-4.1', label: 'Claude Opus 4.1' },
                // Balanced (Sonnet Line)
                { value: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
                { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
                // Speed (Haiku Line)
                { value: 'claude-haiku-4.5', label: 'Claude Haiku 4.5' },
                // Legacy
                { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Legacy)' }
            ]
        };

        function populateModels(app) {
            const modelSelect = document.getElementById('sel-model');
            modelSelect.innerHTML = '';
            const models = modelsByApp[app] || modelsByApp.gemini;
            models.forEach((model, index) => {
                const option = document.createElement('option');
                option.value = model.value;
                option.textContent = model.label;
                if (index === 0) option.selected = true;
                modelSelect.appendChild(option);
            });
        }

        // Initialize models for default app (Gemini)
        populateModels('gemini');

        // Update models when app changes
        document.getElementById('sel-app').addEventListener('change', (e) => {
            populateModels(e.target.value);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. ANALYZE & OPTIMIZE
    // ═══════════════════════════════════════════════════════════════

    function analyzeText(text) {
        pendingText = text;
        injectHUD();
        const preview = text.length > 40 ? text.substring(0, 40) + "..." : text;
        document.getElementById('vantage-diagnosis-text').innerText = `✅ Captured: "${preview}"`;
    }

    async function runOptimization() {
        const app = document.getElementById('sel-app').value;
        const model = document.getElementById('sel-model').value;
        const useCase = document.getElementById('sel-usecase').value;

        const diagBox = document.getElementById('vantage-diagnosis-text');
        const resBox = document.getElementById('vantage-result-text');
        const runBtn = document.getElementById('vantage-run-btn');
        const scorePill = document.getElementById('vantage-score');

        diagBox.innerText = `🔄 Analyzing for ${model}...`;
        resBox.innerText = "";
        scorePill.innerText = "--/10";
        runBtn.disabled = true;
        runBtn.innerText = "PROCESSING...";

        try {
            const response = await fetch('https://vantageai.onrender.com/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    raw_text: pendingText,
                    app: app,
                    model: model,
                    use_case: useCase
                })
            });

            const data = await response.json();
            if (data.success) {
                updateUI(data.data);
            } else {
                diagBox.innerText = "❌ Error: " + (data.error || "Unknown");
            }
        } catch (e) {
            diagBox.innerText = "❌ Connection Failed. Is Backend running on port 8000?";
        }

        runBtn.disabled = false;
        runBtn.innerText = "OPTIMIZE PROMPT";
    }

    function updateUI(data) {
        const diagBox = document.getElementById('vantage-diagnosis-text');
        const scorePill = document.getElementById('vantage-score');

        diagBox.innerText = data.diagnosis || "Analysis complete.";

        const score = data.score || 5;
        scorePill.innerText = score + "/10";
        scorePill.className = 'vantage-score-pill';
        if (score <= 3) scorePill.classList.add('score-low');
        else if (score >= 7) scorePill.classList.add('score-high');
        else scorePill.classList.add('score-medium');

        typewriterEffect(document.getElementById('vantage-result-text'), data.optimized_prompt || "");
    }

    function typewriterEffect(element, text) {
        if (currentTypewriterInterval) clearTimeout(currentTypewriterInterval);
        element.innerText = "";
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                element.scrollTop = element.scrollHeight;
                i++;
                currentTypewriterInterval = setTimeout(type, 1);
            }
        }
        type();
    }

    function removeHUD() {
        const el = document.getElementById('vantage-hud-overlay');
        if (el) el.remove();
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. APPLY FIX - MULTI-LINE SUPPORT
    // ═══════════════════════════════════════════════════════════════

    function applyFix() {
        const newText = document.getElementById('vantage-result-text').innerText;
        const input = lastActiveInput || getActiveInput();

        if (input) {
            input.focus();

            // For contentEditable (Gemini uses this)
            if (input.isContentEditable || input.getAttribute('contenteditable') === 'true') {
                // Clear existing content
                input.innerHTML = '';

                // Convert newlines to proper HTML for contentEditable
                // This preserves multi-line text
                const lines = newText.split('\n');
                lines.forEach((line, index) => {
                    if (index > 0) {
                        // Add line break before each line except the first
                        input.appendChild(document.createElement('br'));
                    }
                    input.appendChild(document.createTextNode(line));
                });

                // Trigger input event for React/Vue
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // For textarea/input
            else {
                const nativeSetter = Object.getOwnPropertyDescriptor(
                    input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
                    'value'
                )?.set;

                if (nativeSetter) {
                    nativeSetter.call(input, newText);
                } else {
                    input.value = newText;
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }

            console.log('✅ VantageAI: Applied', newText.length, 'characters');
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(newText).then(() => {
                alert("✅ Copied to clipboard! Paste with Ctrl+V");
            });
        }

        removeHUD();
    }

    // ═══════════════════════════════════════════════════════════════
    // 7. KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
            e.preventDefault();
            const input = getActiveInput();
            if (input) {
                lastActiveInput = input;
                const text = input.innerText || input.value || "";
                if (text.trim().length >= 2) {
                    analyzeText(text.trim());
                } else {
                    alert("VantageAI: Please type a prompt first!");
                }
            }
        }
        if (e.key === 'Escape') {
            removeHUD();
        }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'TRIGGER_VANTAGE') {
            const input = getActiveInput();
            if (input) {
                lastActiveInput = input;
                analyzeText(input.innerText || input.value || "");
            }
        }
    });

})();

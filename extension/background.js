// VantageAI Background Service Worker
// Handles API communication between content script and backend

const API_BASE_URL = 'http://localhost:8000';

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
    if (command === 'execute_vantage') {
        // Send message to active tab's content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'TRIGGER_VANTAGE' });
            }
        });
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ANALYZE_PROMPT') {
        console.log('📨 Received ANALYZE_PROMPT request:', request.payload);

        // Extract payload with target_url
        const payload = {
            raw_text: request.payload.raw_text,
            target_url: request.payload.target_url || 'generic'
        };

        // Log target info for debugging
        console.log('🎯 Target URL:', payload.target_url);
        console.log('🌐 Platform:', request.payload.platform);

        analyzePrompt(payload)
            .then(response => {
                console.log('✅ API Response:', response);
                sendResponse({ success: true, data: response });
            })
            .catch(error => {
                console.error('❌ API Error:', error);
                sendResponse({ success: false, error: error.message });
            });

        // Return true to indicate async response
        return true;
    }

    if (request.type === 'HEALTH_CHECK') {
        checkHealth()
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function analyzePrompt(payload) {
    console.log('🚀 Sending to backend:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Backend response:', data);

    return data;
}

async function checkHealth() {
    const response = await fetch(`${API_BASE_URL}/`);

    if (!response.ok) {
        throw new Error('Backend is not responding');
    }

    return response.json();
}

console.log('🚀 VantageAI Background Service Worker initialized');
console.log('⌨️  Keyboard shortcut: Ctrl+Shift+X (Mac: MacCtrl+Shift+X)');
console.log('🔗 Backend URL:', API_BASE_URL);

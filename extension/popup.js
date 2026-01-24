// VantageAI Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const promptsAnalyzed = document.getElementById('prompts-analyzed');
    const avgScore = document.getElementById('avg-score');

    // Check backend status
    try {
        const response = await chrome.runtime.sendMessage({ type: 'HEALTH_CHECK' });

        if (response.success) {
            statusDot.classList.add('online');
            statusText.textContent = 'Online';
        } else {
            statusText.textContent = 'Offline';
        }
    } catch (error) {
        statusText.textContent = 'Error';
    }

    // Load stats from storage
    chrome.storage.local.get(['promptsAnalyzed', 'totalScore', 'analysisCount'], (data) => {
        const count = data.analysisCount || 0;
        promptsAnalyzed.textContent = count;

        if (count > 0 && data.totalScore) {
            avgScore.textContent = (data.totalScore / count).toFixed(1);
        }
    });
});

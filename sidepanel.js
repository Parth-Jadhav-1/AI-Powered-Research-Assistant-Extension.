document.addEventListener('DOMContentLoaded', () => {
    // Load saved notes
    chrome.storage.local.get(['researchNotes'], function(result) {
        if (result.researchNotes) {
            document.getElementById('notes').value = result.researchNotes;
        } 
    });

    // Button event listeners
    document.getElementById('summarizeBtn').addEventListener('click', summarizeText);
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
    document.getElementById('suggestBtn').addEventListener('click', suggestText); 
});


async function summarizeText() {
    await processSelectedText("summarize");
}


async function suggestText() {
    await processSelectedText("suggest");
}


async function processSelectedText(operationType) {
    try {
// Get selected text from active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        if (!result) {
            showResult('Please select some text first');
            return;
        }

        // Send request to backend
        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: result, operation: operationType })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));

    } catch (error) {
        showResult('Error: ' + error.message);
    }
}""

// Save notes to local storage
async function saveNotes() {
    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({ 'researchNotes': notes }, function() {
        alert('Notes saved successfully');
    });
}

// Display result in the side panel
function showResult(content) {
    document.getElementById('results').innerHTML = 
        `<div class="result-item"><div class="result-content">${content}</div></div>`;
}

const processButton = document.getElementById("processArticle");
const loadingDiv = document.getElementById("loading");
const resultDiv = document.getElementById("result");
const outputText = document.getElementById("outputText");

// Event listener for the Process Article button
processButton.addEventListener("click", () => {
    // Show loading indicator
    loadingDiv.classList.remove("hidden");
    resultDiv.classList.add("hidden");

    // Send message to background script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "extractContent" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("[ERROR] Could not connect to content script:", chrome.runtime.lastError.message);
                loadingDiv.classList.add("hidden");
                return;
            }

            console.log("[DEBUG] Extracted content:", response);
            chrome.runtime.sendMessage(
                { action: "processArticle", data: response.content },
                (backgroundResponse) => {
                    if (chrome.runtime.lastError) {
                        console.error("[ERROR] Background script error:", chrome.runtime.lastError.message);
                        loadingDiv.classList.add("hidden");
                        return;
                    }

                    // Display result
                    loadingDiv.classList.add("hidden");
                    resultDiv.classList.remove("hidden");
                    outputText.textContent = backgroundResponse.result;
                }
            );
        });
    });
});

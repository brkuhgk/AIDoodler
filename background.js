

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "processArticle") {
        queryHuggingFaceAPI({ inputs: message.data })
            .then((response) => {
                const summary = response[0]?.summary_text || "Could not summarize the text.";
                chrome.tabs.sendMessage(sender.tab.id, { action: "highlightText", data: summary });
            })
            .catch((error) => console.error("Error:", error));
    }
});

// Function to query Hugging Face API
async function queryHuggingFaceAPI(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer hf_XXXXXX`, // Replace hf_XXXXXX with your Hugging Face API token
                "Content-Type": "application/json",
                "x-use-cache": "false", // Ensure fresh results
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
}

// Extract article content (paragraphs, headers) from the webpage
const extractArticleContent = () => {
    const elements = document.querySelectorAll("p");
    const content = Array.from(elements).map(el => el.textContent).join("\n");
    return content;
};

// Listen for a message from the popup to extract content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractContent") {
        console.log("[DEBUG] Extracting content from the webpage...");
        const articleContent = extractArticleContent();
        sendResponse({ content: articleContent });
    } else if (message.action === "highlightContent") {
        console.log("[DEBUG] Highlighting processed content...");
        // Highlight the processed text on the webpage
        const processedText = message.data
            .split("\n")
            .map(line => `<p style="background-color: yellow; padding: 5px;">${line}</p>`)
            .join("");

        // Replace the webpage content with the processed and highlighted text
        document.body.innerHTML = `<div style="padding: 20px; font-family: Arial, sans-serif;">${processedText}</div>`;
    }
});

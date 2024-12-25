// Extract article content (paragraphs, headers) from the webpage
const extractArticleContent = () => {
    const elements = document.querySelectorAll("p, h1, h2, h3");
    const content = Array.from(elements).map(el => el.textContent).join("\n");
    return content;
};

// Send the extracted content to the background script
const articleContent = extractArticleContent();
chrome.runtime.sendMessage({ action: "processArticle", data: articleContent });


// Listen for a response from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "highlightText") {
        // Highlight the processed text on the webpage
        const processedText = message.data
            .split("\n")
            .map(line => `<p style="background-color: yellow; padding: 5px;">${line}</p>`)
            .join("");

        // Replace the webpage content with the processed and highlighted text
        document.body.innerHTML = `<div style="padding: 20px; font-family: Arial, sans-serif;">${processedText}</div>`;
    }
});

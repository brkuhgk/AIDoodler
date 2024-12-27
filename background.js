
// Set your API key here
const API_KEY = ""; // API key

// Number of chunks to divide the content into
const CHUNK_SIZE = 1024; // Max input tokens for @HuggingFace BERT model

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[DEBUG] Received message:", message);

    if (message.action === "processArticle") {
        const articleParts = splitIntoChunks(message.data, CHUNK_SIZE);
        console.log("[DEBUG] Article content split into chunks:");

        processChunksSequentially(API_KEY, articleParts)
            .then((processedParts) => {
                console.log("[DEBUG] All chunks processed successfully:");
                const combinedResponse = processedParts.join("\n");

                // Send the response back to the sender (popup or content script)
                sendResponse({ result: combinedResponse });
            })
            .catch((error) => {
                console.error("[ERROR] Error processing chunks:", error);
                sendResponse({ result: "Error processing the article." });
            });

        // Required to indicate sendResponse will be called asynchronously
        return true;
    }
});

// Function to split content into chunks based on a fixed size
function splitIntoChunks(content, chunkSize ) {
    console.log(`[DEBUG] Splitting content into chunks of size ${chunkSize}...`);
    const chunks = [];

    for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize); // Slice content by chunk size
        chunks.push(chunk);
    }

    return chunks;
}

// Function to process chunks sequentially
async function processChunksSequentially(apiKey, chunks) {
    console.log("[DEBUG] Starting sequential processing of chunks...");
    const processedParts = [];

    for (const [index, chunk] of chunks.entries()) {
        console.log(`[DEBUG] Processing chunk ${index + 1}/${chunks.length}:`, chunk);
        try {
            const response = await queryHuggingFaceAPI(apiKey, { inputs: chunk });
            const summary = response[0]?.summary_text || "[ERROR] Could not process this chunk.";
            console.log(`[DEBUG] Response for chunk ${index + 1}:`, summary);
            processedParts.push(summary);
        } catch (error) {
            console.error(`[ERROR] Failed to process chunk ${index + 1}:`, error);
            processedParts.push("[ERROR] Failed to process this part.");
        }
    }

    return processedParts;
}

// Function to query Hugging Face API
async function queryHuggingFaceAPI(apiKey, data) {
    console.log("[DEBUG] Sending request to Hugging Face API with data:");
    const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "x-use-cache": "false",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error(`[HTTP ERROR] Status: ${response.status}, Message: ${await response.text()}`);
    }

    const result = await response.json();
    console.log("[DEBUG] API Response:", result);
    return result;
}

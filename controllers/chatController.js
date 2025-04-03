const model = require('../config/geminiConfig');

const travelChat = async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const formattedPrompt = `
            You are a travel assistant. Provide clear, concise information.
            Rules:
            - Use numbered points only for lists of places, attractions, or steps
            - Each point should be on a new line
            - For general information or descriptions, use regular text without points
            - Keep all responses brief and engaging
            - Remove any asterisks or special formatting
            - End with a simple, relevant follow-up question

            User question: ${prompt}
        `;

        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.6,
                topP: 0.8,
                topK: 40,
            },
        });

        const result = await chat.sendMessage(formattedPrompt);
        let text = result.response.text();
        
        // Clean up the text
        text = text.replace(/\*/g, '');
        text = text.replace(/^\s*(\d+\.)\s*/gm, '$1 '); // Ensure space after number for points
        text = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        // Ensure each numbered point is on a new line
        text = text.replace(/(\d+\..+?)(\d+\.)/g, '$1\n$2');

        // Output the modified text
        res.json({ message: text });
    } catch (error) {
        console.error("Error in travel chat:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
};

module.exports = { travelChat };
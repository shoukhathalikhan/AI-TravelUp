const model = require('../config/geminiConfig');

const getRecommendations = async (req, res) => {
    try {
        const { region, state, activity, subActivity } = req.body;
        
        let fullPrompt = `You are an AI travel planner. Based on the user's inputs, generate a detailed travel recommendation plan. 

User's Inputs:
- Region: ${region}
- State: ${state}
- Activity Type: ${activity}
- Specific Activity: ${subActivity}

The recommendation should include the following details:

1. **Destination Overview**: A brief description of the destination and why it's a great choice for this activity.
2. **Top Attractions**: A list of must-visit places or experiences related to the selected activity.
3. **Travel Itinerary**: A suggested itinerary for 3-5 days, including daily highlights.
4. **Best Time to Visit**: The ideal time of the year for this trip and weather information.
5. **Local Cuisine**: Popular dishes and dining recommendations.
6. **Additional Tips**: Include packing suggestions, safety tips, and any relevant cultural insights.

The output should be structured in JSON format as follows:

{
  "destination_overview": "Description of the destination and its unique features.",
  "top_attractions": [
    {"name": "Attraction 1", "description": "Brief description."},
    {"name": "Attraction 2", "description": "Brief description."}
  ],
  "travel_itinerary": [
    {"day": 1, "activities": ["Activity 1", "Activity 2"]},
    {"day": 2, "activities": ["Activity 3", "Activity 4"]}
  ],
  "best_time_to_visit": "Season or months with the best weather for this trip.",
  "local_cuisine": ["Dish 1", "Dish 2"],
  "additional_tips": ["Tip 1", "Tip 2"]
}

Please provide clear, structured, and engaging recommendations tailored to the user's inputs. Return ONLY the JSON object without any additional text or formatting.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = await response.text();

        console.log('Raw response from model:', text);  // Log the raw response for debugging

        // Clean the response by removing unwanted characters and finding the JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in the response");
        }
        const cleanedText = jsonMatch[0].replace(/\\n/g, '').replace(/\s+/g, ' ').trim();
        console.log('Cleaned response:', cleanedText);  // Log the cleaned response

        // Parse the cleaned text into JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedText);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return res.status(500).json({ error: "Failed to parse recommendation response." });
        }

        // Send the parsed response back to the frontend
        res.json(parsedResponse);
    } catch (error) {
        console.error("Error in trip recommendations:", error);
        res.status(500).json({ error: error.message || "Failed to generate recommendations" });
    }
};

module.exports = { getRecommendations };


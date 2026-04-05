const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Free vision model from OpenRouter
const VISION_MODEL = 'google/gemma-3-27b-it:free';

/**
 * Analyze an image using OpenRouter's free vision model.
 * @param {string} imageBase64 - Base64 data URL of the image (e.g. "data:image/jpeg;base64,...")
 * @param {string} prompt - Text prompt describing what to analyze
 * @returns {Promise<string>} - Raw AI response text
 */
export const analyzeImage = async (imageBase64, prompt) => {
  if (!API_KEY) {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'OpticEdge Eye Screening',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

/**
 * Parse AI JSON response, handling markdown code blocks
 */
export const parseAIResponse = (raw) => {
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
};

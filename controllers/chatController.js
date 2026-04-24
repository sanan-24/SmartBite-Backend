const axios = require('axios');
const Food = require('../models/Food');
require('../models/Category');

/**
 * @desc    Chat with AI Advisor using Groq (Llama 3)
 * @route   POST /api/chat
 * @access  Public
 */
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, reply: 'Please send a message.' });
    }

    // 1. Fetch available food items for context
    let foods = [];
    try {
      // We populate category to give the AI context about food types
      foods = await Food.find({ isAvailable: true })
        .select('name description price rating category')
        .populate('category', 'name');
    } catch (dbErr) {
      console.error('Database fetch error:', dbErr.message);
    }

    // Prepare food context for the AI
    const foodContext = foods.length > 0
      ? foods.map(f => `- ${f.name} (${f.category?.name || 'Food'}): ${f.description}. Price: $${f.price}. Rating: ${f.rating}/5`).join('\n')
      : "Currently no items are listed in the menu.";

    // Identify trending items (Rating > 4.5)
    const trendingItems = foods
      .filter(f => f.rating >= 4.5)
      .map(f => f.name)
      .join(', ');

    // 2. Groq API Details
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.json({
        success: false,
        reply: "AI Advisor is currently offline (API key missing)."
      });
    }

    // 3. Construct the System Prompt
    const systemPrompt = `
You are the SmartBite AI Advisor, an expert food consultant for the SmartBite food delivery app.
Your goal is to help users find the best food based on their needs: trending items, health, diet, or specific health conditions.

Here is the current SmartBite Menu Context:
${foodContext}

Trending items today (High rated): ${trendingItems || 'All our items are popular!'}

Guidelines for your response:
1. "Trending": Mention high-rated items like ${trendingItems || 'the items on our menu'}.
2. "Health/Healthy": Recommend light meals, salads, or nutritious options from our menu.
3. "Diet" (Weight loss, Keto, etc.): Suggest matching items from our menu.
4. "Health Issues" (Diabetes, BP, etc.): Give general helpful advice and recommend the safest/lightest options from our menu.
5. Be polite, professional, and use emojis (🍎, 🥗, 🍔, ✨).
6. Keep responses short and sweet (2-4 sentences).
7. ONLY suggest items from the menu context provided above.
`;

    // 4. Call Groq API (Llama 3.3 70B)
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const aiReply = response.data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. How else can I help you?";

    return res.json({
      success: true,
      reply: aiReply.trim()
    });

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);

    // Fallback message if Groq fails or times out
    return res.status(500).json({
      success: false,
      reply: "I'm having a bit of trouble thinking right now. Please try again in a moment! 🍎"
    });
  }
};


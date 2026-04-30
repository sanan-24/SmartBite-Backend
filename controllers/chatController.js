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
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, reply: 'Please send a message.' });
    }

    // 1. Fetch available food items for context
    let foods = [];
    try {
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

    // 2. Fetch Real-time Weather (wttr.in) - No API Key needed
    let weatherInfo = "Pleasant";
    try {
      const weatherResponse = await axios.get('https://wttr.in/Pakistan?format=%C+%t', { timeout: 3000 });
      weatherInfo = weatherResponse.data;
    } catch (wErr) {
      console.log('Weather fetch failed, using default.');
    }

    // 3. Time-aware Context (Pakistan Specific)
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-PK', { weekday: 'long', timeZone: 'Asia/Karachi' });
    const currentTime = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });

    const options = {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const pkDateTime = new Intl.DateTimeFormat('en-PK', options).format(now);


    // 4. Groq API Details
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.json({
        success: false,
        reply: "AI Advisor is currently offline (API key missing)."
      });
    }

    // 5. Construct the System Prompt
    const systemPrompt = `
You are the SmartBite AI Advisor, a friendly, intelligent, and helpful food consultant for the SmartBite app.

CURRENT CONTEXT (FOR YOUR REFERENCE ONLY):
- Time & Date in Pakistan: ${pkDateTime}
- Current Weather: ${weatherInfo}

GUIDELINES FOR YOUR BEHAVIOR:
1. "General Conversation": If the user asks general questions like "How are you?", "What's up?", or "Who are you?", answer warmly and naturally. You are a helpful assistant who loves food! 😊
2. "Smart Time Usage": DO NOT mention the current time or date in every message. ONLY provide it if:
   - The user explicitly asks for it.
   - It is relevant to a recommendation (e.g., "Since it's ${currentDay} evening, how about some crispy fries?").
3. "Weather Integration": Only mention the weather if the user asks or if it helps your suggestion (e.g., "It's a ${weatherInfo} day, perfect for a fresh salad!").
4. "Menu Knowledge": Always suggest 1-2 items from the SmartBite Menu Context below when appropriate:
${foodContext}
5. "Conciseness": Keep your responses engaging, friendly, and short (2-4 sentences).
6. "Language": Use English but feel free to mix in Urdu words (like "Salam", "G", "Theek") if the user does.

Example Interactions:
- User: "Hi, how are you?" -> AI: "Hello! I'm doing great and feeling hungry for some good food! ✨ How is your day going so far? 😊"
- User: "What's the time?" -> AI: "Currently in Pakistan, it's ${currentTime} on ${currentDay}. 🕒 Is there anything I can help you order?"
`;



    // 6. Prepare Messages
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // 7. Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 400
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


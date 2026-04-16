// // Simple rule-based chatbot controller with optional OpenAI proxy
// const axios = require('axios');

// exports.chat = async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message || !message.trim()) {
//       return res.status(400).json({ success: false, reply: 'Please send a message.' });
//     }

//     // If OPENAI_API_KEY is provided, proxy to OpenAI Chat API (optional)
//     if (process.env.OPENAI_API_KEY) {
//       try {
//         const response = await axios.post(
//           'https://api.openai.com/v1/chat/completions',
//           {
//             model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
//             messages: [{ role: 'user', content: message }],
//             max_tokens: 400,
//             temperature: 0.7
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         const reply = response.data.choices?.[0]?.message?.content || 'Sorry, I could not generate a reply.';
//         return res.json({ success: true, reply });
//       } catch (err) {
//         // fallback to local responder if OpenAI call fails
//         console.error('OpenAI error:', err.message);
//       }
//     }

//     // Simple fallback rule-based replies
//     const text = message.toLowerCase();
//     let reply = "I'm here to help! You can ask about the menu, orders, or your account.";

//     if (/hi|hello|hey/.test(text)) {
//       reply = 'Hello! How can I assist you today?';
//     } else if (/menu|food|dishes|items/.test(text)) {
//       reply = 'You can browse our menu at /menu. Want recommendations for popular dishes?';
//     } else if (/order|status|track/.test(text)) {
//       reply = 'To check order status go to Orders (protected). Provide your order id and I can try to help.';
//     } else if (/review|rating|feedback/.test(text)) {
//       reply = 'You can leave a review from your delivered order details. Which product would you like to review?';
//     } else if (/help|support/.test(text)) {
//       reply = 'For urgent issues contact support@example.com or check the app docs.';
//     } else if (text.length < 20) {
//       reply = "I didn't understand fully — could you provide a bit more detail?";
//     } else {
//       // gentle echo for longer messages
//       reply = `Thanks for the message. You said: "${message.slice(0, 200)}". How would you like me to help?`;
//     }

//     res.json({ success: true, reply });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, reply: 'Server error' });
//   }
// };



// controllers/chatbotController.js
const axios = require('axios');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, reply: 'Please send a message.' });
    }

    if (process.env.GROQ_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.groq.com/v1/llm/completions',
          {
            model: process.env.GROQ_MODEL || 'llama3-8b-8192',
            input: `You are a helpful assistant for a food delivery app. A user asked: "${message}". Give advice about food choices, especially regarding health issues like stomach ache or headache, and recommend safe options. Keep reply short and friendly.`,
            max_output_tokens: 200
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const reply = response.data.output?.[0]?.content?.[0]?.text || "Sorry, I couldn't generate a reply.";
        return res.json({ success: true, reply });
      } catch (err) {
        console.error('GROQ API error:', err.message);
      }
    }

    // Rule-based fallback
    res.json({ success: true, reply: "I'm here to help! Could you give me more detail?" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, reply: 'Server error' });
  }
};


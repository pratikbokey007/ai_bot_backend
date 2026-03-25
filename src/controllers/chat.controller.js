const { generateChatReply } = require("../services/gemini.service");

async function chat(req, res) {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "A valid message is required.",
    });
  }

  try {
    const reply = await generateChatReply(message);
    return res.json({ reply });
  } catch (error) {
    console.error("Chat controller error:", error.message);
    return res.status(500).json({
      error: "Failed to generate response.",
    });
  }
}

module.exports = {
  chat,
};

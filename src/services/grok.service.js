const Groq = require("groq-sdk");

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

async function generateGroqReply(prompt) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.");
    }
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful e-commerce assistant. Use only English to reply."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: DEFAULT_GROQ_MODEL,
      temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq Service Error:", error);
    throw new Error(`Groq model failed. ${error?.message || ""}`.trim());
  }
}

module.exports = { generateGroqReply };

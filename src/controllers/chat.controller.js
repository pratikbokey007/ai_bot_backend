const { generateChatReply } = require("../services/gemini.service");
const { generateGroqReply } = require("../services/grok.service");
const { getUrgencyContext, SYSTEM_INSTRUCTION } = require("../config/prompt");
const Order = require("../models/order.model");

async function chat(req, res) {
  // Step 1: Read the user's message from the request body.
  const { message } = req.body;

  // Step 2: Validate input before doing any DB or AI work.
  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "A valid message is required.",
    });
  }
  let context = "";

  try {
    // Step 3: Try to detect an order id like ORD123 or ORD-123 from the message.
    const orderIdMatch = message.match(/ORD[\s-]*\d+/i);

    if (orderIdMatch) {
      // Step 4: Normalize the extracted order id to a consistent format.
      const orderId = orderIdMatch[0].replace(/[\s-]+/g, "").toUpperCase();

      // Step 5: Fetch matching order data from MongoDB using the Order model.
      // Similar SQL idea: SELECT * FROM orders WHERE orderId = 'ORD123' LIMIT 1;
      const orderData = await Order.findOne({ orderId }).lean();

      // Step 6: Build extra context for the AI based on whether the order exists.
      if (orderData) {
        context = `[DATABASE INFO]: Order ${orderId} status is ${
          orderData.status
        }. Expected delivery: ${
          orderData.deliveryDate
            ? new Date(orderData.deliveryDate).toDateString()
            : "TBD"
        }. Product: ${orderData.product}.`;
      } else {
        context = `[DATABASE INFO]: Order ${orderId} is not found in the system.`;
      }
    }

    // Step 7: Combine system prompt, DB context, urgency hint, and user question.
    const finalPrompt = `
      ${SYSTEM_INSTRUCTION}
      ${context}
      ${getUrgencyContext(message)}
      User Question: ${message}
    `;

    try {
      // Step 8: First try Gemini for the response.
      const reply = await generateChatReply(finalPrompt);
      return res.json({ reply, provider: "gemini" });
    } catch (geminiError) {
      console.error("Gemini fallback triggered:", geminiError.message);

      // Step 9: If Gemini fails, fall back to Groq.
      const groqReply = await generateGroqReply(finalPrompt);
      return res.json({ reply: groqReply, provider: "groq" });
    }
  } catch (error) {
    // Step 10: Handle any unexpected controller/database/provider errors.
    console.error("Chat controller error:", error.message);

    return res.status(500).json({
      error: "Failed to generate response from both Gemini and Groq.",
    });
  }
}

module.exports = {
  chat,
};

const path = require('path');
const { generateChatReply } = require("../services/gemini.service");

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const reply = await generateChatReply("Maza ORD101 kuthay?");
  console.log(reply);
}
async function handleChat(userMessage) {
    let context = "";
    
    // १. युजरच्या मेसेजमधून Order ID शोधणे (Regex)
    const orderIdMatch = userMessage.match(/ORD\d+/i);
    
    if (orderIdMatch) {
        const orderId = orderIdMatch[0].toUpperCase();
        
        // २. इथे आपण MongoDB मध्ये शोधल्याचे नाटक (Mock) करत आहोत
        // नंतर इथे actual Mongoose query येईल: await Order.findOne({ orderId })
        const mockDatabase = {
            "ORD101": { status: "Shipped", date: "28 March" },
            "ORD102": { status: "Delivered", date: "20 March" }
        };

        const data = mockDatabase[orderId];
        if (data) {
            context = `[DATABASE INFO]: Order ${orderId} is currently ${data.status}. Expected delivery: ${data.date}.`;
        } else {
            context = `[DATABASE INFO]: Order ${orderId} not found in our system.`;
        }
    }

    // ३. Gemini ला दिलेली 'Special Instruction'
    const prompt = `
    Role: You are "ShopAssist", an expert E-commerce Support AI.
    Instructions:
    - Use the [DATABASE INFO] provided below to answer user questions.
    - If no database info is provided, ask the user for their Order ID (starting with ORD).
    - Be polite and reply in a mix of Marathi and English (Hinglish).
    
    ${context}
    
    User Question: ${userMessage}
    `;

    const result = await model.generateContent(prompt);
    console.log("ShopAssist:", result.response.text());
}

main();

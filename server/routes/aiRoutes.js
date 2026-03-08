const express = require("express");
const axios = require("axios");
const router = express.Router();

const NVIDIA_API_KEY = "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";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// AI Command Processing Endpoint
router.post("/command", async (req, res) => {
  try {
    const { message, availableFields = [], fieldOptions = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const hasFormContext = availableFields.length > 0;
    let optionsDescription = "";
    if (hasFormContext && Object.keys(fieldOptions).length > 0) {
      optionsDescription = "\n\nOptions for dropdown/select fields (use these exact values when updating):\n" +
        Object.entries(fieldOptions)
          .filter(([, opts]) => Array.isArray(opts) && opts.length > 0)
          .map(([field, opts]) => `  ${field}: ${opts.join(", ")}`)
          .join("\n");
    }

    const systemPrompt = hasFormContext
      ? `You are a friendly, interactive AI assistant for a farming form. The user can ask questions or give commands.

Available form fields: ${availableFields.join(", ")}${optionsDescription}

Respond ONLY with valid JSON, one of these formats:

1) To set a field value:
{"action": "update_field", "field": "field_name", "value": "exact_option_or_value"}

2) When the user asks what options they have for a field (e.g. "what options for rice type?", "what can I pick for category?"):
{"action": "list_options", "field": "field_name", "options": ["option1", "option2", ...], "message": "Friendly sentence listing the options and asking them to pick one."}

3) For general questions or when you're just answering (no form update):
{"action": "response", "message": "Your helpful reply here."}

4) When the request is unclear or field doesn't exist:
{"action": "error", "message": "Short explanation."}

Rules:
- For dropdown/select fields, use ONLY values from the options list above.
- If the user asks "what options do I have for [field]?" or "what can I choose for [field]?", respond with list_options and include the options array and a friendly message.
- Be conversational: e.g. "You can choose: Raw Rice, Parboiled Rice, Brown Rice, or Sella Rice. Which one would you like?"`
      : `You are an AI assistant for a farming application. Respond helpfully to farmer questions about crops, farming, and the application. Use only: {"action": "response", "message": "your reply"}.`;

    const payload = {
      model: "qwen/qwen3.5-122b-a10b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      top_p: 0.95,
      stream: false
    };

    const response = await axios.post(NVIDIA_URL, payload, {
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const aiResponse = response.data.choices[0].message.content.trim();

    try {
      // Try to parse as JSON first
      let parsedResponse = JSON.parse(aiResponse);
      // Ensure list_options has correct options from our fieldOptions
      if (parsedResponse.action === "list_options" && parsedResponse.field && fieldOptions[parsedResponse.field]) {
        parsedResponse.options = fieldOptions[parsedResponse.field];
        if (!parsedResponse.message) {
          parsedResponse.message = `You can choose: ${parsedResponse.options.join(", ")}. Which one would you like?`;
        }
      }
      res.json(parsedResponse);
    } catch (e) {
      // If not JSON, return as text response
      res.json({ action: "response", message: aiResponse });
    }

  } catch (error) {
    console.error("AI API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "AI service unavailable",
      message: "Sorry, I'm having trouble processing your request right now."
    });
  }
});

// Voice synthesis endpoint (placeholder for future TTS)
router.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    // For now, return the text as-is
    // In production, you'd integrate with a TTS service
    res.json({
      audioUrl: null,
      text: text,
      message: "TTS not implemented yet"
    });
  } catch (error) {
    res.status(500).json({ error: "TTS service unavailable" });
  }
});

module.exports = router;

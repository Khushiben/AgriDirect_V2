const axios = require('axios');

const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
const stream = false; // Set to false for testing

const headers = {
  "Authorization": "Bearer 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",
  "Accept": stream ? "text/event-stream" : "application/json"
};

const payload = {
  "model": "qwen/qwen3.5-122b-a10b",
  "messages": [{"role":"user","content":"Hello, can you respond with 'AI is working!'?"}],
  "max_tokens": 100,
  "temperature": 0.60,
  "top_p": 0.95,
  "stream": stream,
  "chat_template_kwargs": {"enable_thinking":true}
};

console.log("🧪 Testing Openai API...");

axios.post(invokeUrl, payload, {
  headers: headers,
  responseType: stream ? 'stream' : 'json'
})
.then(response => {
  console.log("✅ AI API Response:");
  if (stream) {
    response.data.on('data', (chunk) => {
      console.log(chunk.toString());
    });
  } else {
    console.log(JSON.stringify(response.data, null, 2));
  }
})
.catch(error => {
  console.error("❌ AI API Error:");
  if (error.response) {
    console.error(`HTTP ${error.response.status}`);
    if (error.response.data?.on) {
      error.response.data.on('data', (chunk) => console.error(chunk.toString()));
    } else {
      console.error(error.response.data);
    }
  } else {
    console.error(error);
  }
});

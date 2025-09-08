export const API_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    maxTokens: 4000,
    temperature: 0.7,
  },
  endpoints: {
    generatePrompt: "/api/generate-prompt",
    verifyPrompt: "/api/verify-prompt",
  },
}

export const validateApiKey = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required")
  }
}

export const getOpenAIHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
})

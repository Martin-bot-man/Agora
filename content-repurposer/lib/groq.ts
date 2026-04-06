// lib/groq.ts
import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing in .env.local");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getGroqCompletion = async (prompt: string): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",      // good quality + speed (free tier)
      // Alternatives (also free):
      // "mixtral-8x7b-32768"
      // "gemma2-9b-it"
      temperature: 0.7,
      max_tokens: 2500,
      top_p: 0.9,
    });

    return completion.choices[0]?.message?.content || "No response generated";
  } catch (err) {
    console.error("Groq completion error:", err);
    throw err; // let route.ts catch it
  }
};
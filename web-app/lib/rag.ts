import { Index } from "@upstash/vector";
import { Groq } from "groq-sdk";

function getIndex() {
  const url = process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Vector environment variables. Set NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN."
    );
  }

  return new Index({ url, token });
}

function getGroqClient() {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Groq API key. Set NEXT_PUBLIC_GROQ_API_KEY in environment variables."
    );
  }

  return new Groq({ apiKey });
}

export async function queryVectorDatabase(question: string) {
  try {
    const index = getIndex();
    const results = await index.query({
      data: question,
      topK: 5,
      includeMetadata: true,
      includeData: true,
    });

    return results.map((result: any) => ({
      id: result.metadata?.id || "unknown",
      text: result.data,
      metadata: result.metadata,
    }));
  } catch (error) {
    console.error("Vector search error:", error);
    throw error;
  }
}

export async function generateAnswer(
  question: string,
  context: string,
  model: string = "llama-3.1-8b-instant"
) {
  try {
    const groq = getGroqClient();
    const prompt = `You are a knowledgeable food expert. Use the following context to answer the user's question about food.

Context:
${context}

Question: ${question}

Provide a helpful, accurate answer based on the context provided. If the context doesn't contain enough information, say so and provide general knowledge about the topic.`;

    const message = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return (
      message.choices[0]?.message?.content || "Unable to generate response"
    );
  } catch (error) {
    console.error("Groq API error:", error);
    throw error;
  }
}

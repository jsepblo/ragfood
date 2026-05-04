import { NextRequest, NextResponse } from "next/server";
import { queryVectorDatabase, generateAnswer } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    const { question, model } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Search vector database
    const searchResults = await queryVectorDatabase(question);
    const context = searchResults.map((r: any) => r.text).join("\n");

    // Generate answer using Groq
    const answer = await generateAnswer(question, context, model);

    return NextResponse.json({
      question,
      answer,
      sources: searchResults,
      model,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process query" },
      { status: 500 }
    );
  }
}

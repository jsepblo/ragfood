"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, Zap } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: any[];
  model?: string;
}

const MODELS = [
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B" },
];

const EXAMPLE_QUERIES = [
  "What are healthy Mediterranean dishes?",
  "Show me spicy Asian comfort foods",
  "Find vegetarian high-protein meals",
  "What traditional foods have cultural stories?",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Welcome to Food RAG! Ask me anything about food. I can help you discover cuisines, find healthy options, learn about cultural dishes, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, model: selectedModel }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.answer,
        sources: data.sources,
        model: selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Error: ${err.message}. Please check your environment variables and try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Food RAG Assistant</h1>
          </div>
          <p className="text-orange-100">
            Powered by Upstash Vector + Groq API
          </p>
        </div>
      </div>

      {/* Model Selector */}
      <div className="bg-slate-800 border-b border-slate-700 p-3 shadow">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <label className="text-slate-300 font-medium">Model:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 hover:border-orange-500 transition"
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-2xl p-4 rounded-lg ${
                  message.type === "user"
                    ? "bg-orange-600 text-white rounded-br-none"
                    : "bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-sm font-semibold text-slate-300 mb-2">
                      Sources:
                    </p>
                    <div className="space-y-1 text-sm">
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-slate-400 p-2 bg-slate-800 rounded"
                        >
                          <strong>ID {source.id}:</strong>{" "}
                          {source.text.substring(0, 100)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 p-4 rounded-lg rounded-bl-none border border-slate-600">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Example Queries */}
      {messages.length === 1 && !loading && (
        <div className="bg-slate-800 border-t border-slate-700 p-4 shadow">
          <div className="max-w-4xl mx-auto">
            <p className="text-slate-300 text-sm font-medium mb-3">
              Try these queries:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {EXAMPLE_QUERIES.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleQuery(query)}
                  className="text-left text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 p-2 rounded border border-slate-600 hover:border-orange-500 transition"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border-t border-red-700 p-3 shadow">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-red-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-slate-800 border-t border-slate-700 p-4 shadow">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food, recipes, cuisines..."
              disabled={loading}
              className="flex-1 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-orange-500 focus:outline-none disabled:opacity-50 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import os
import json
import time
from typing import List, Dict, Any
from upstash_vector import Index
from dotenv import load_dotenv
import requests

# Paths
CLOUD_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(CLOUD_DIR, os.pardir))
DOTENV_PATH = os.path.join(REPO_ROOT, ".env")

# Load environment variables from repo root .env first, then fall back to local directory
load_dotenv(DOTENV_PATH, override=True)
load_dotenv(os.path.join(CLOUD_DIR, ".env"), override=True)

def load_env_manually(env_path: str) -> None:
    """Read key=value pairs from .env if load_dotenv fails."""
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value and os.getenv(key) is None:
                os.environ[key] = value

load_env_manually(DOTENV_PATH)

# Constants
COLLECTION_NAME = "foods"
JSON_FILE = os.path.join(CLOUD_DIR, "foods.json")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
UPSTASH_URL = os.getenv("UPSTASH_VECTOR_REST_URL")
UPSTASH_TOKEN = os.getenv("UPSTASH_VECTOR_REST_TOKEN")

# Validate environment variables
if not all([GROQ_API_KEY, UPSTASH_URL, UPSTASH_TOKEN]):
    raise ValueError("Missing required environment variables. Please check your .env file.")

# Initialize Upstash Vector client
index = Index(url=UPSTASH_URL, token=UPSTASH_TOKEN)

def load_food_data() -> List[Dict[str, Any]]:
    """Load food data from JSON file."""
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def initialize_vector_database(food_data: List[Dict[str, Any]]) -> None:
    """Initialize the vector database with food data."""
    print(f"Initializing Upstash Vector Database with {len(food_data)} food items...")

    # Clear existing data (optional - remove if you want to preserve existing data)
    try:
        # Note: Upstash doesn't have a direct clear method, but we can reset by re-uploading
        vectors = []
        for item in food_data:
            # Create enriched text for better embeddings
            enriched_text = item["text"]
            if "region" in item:
                enriched_text += f" This food is popular in {item['region']}."
            if "type" in item:
                enriched_text += f" It is a type of {item['type']}."
            if "dietary_tags" in item:
                enriched_text += f" Dietary information: {', '.join(item['dietary_tags'])}."
            if "nutrition" in item:
                enriched_text += f" Nutritional profile: {item['nutrition']}."
            if "cultural_story" in item:
                enriched_text += f" Cultural significance: {item['cultural_story']}."

            vectors.append({
                "id": item["id"],
                "data": enriched_text,
                "metadata": item
            })

        # Upsert vectors to Upstash (it will handle embeddings automatically)
        index.upsert(vectors=vectors)
        print("Successfully uploaded food data to Upstash Vector Database")

    except Exception as e:
        print(f"[ERROR] Error initializing database: {e}")
        raise

def query_groq_api(prompt: str, max_retries: int = 3) -> str:
    """Query Groq API with retry logic."""
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
        "temperature": 0.7
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            response.raise_for_status()

            result = response.json()
            return result["choices"][0]["message"]["content"].strip()

        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise Exception(f"Failed to query Groq API after {max_retries} attempts: {e}")
            print(f"Groq API attempt {attempt + 1} failed, retrying...")
            time.sleep(2 ** attempt)  # Exponential backoff

def rag_query(question: str) -> str:
    """Perform RAG query using Upstash Vector and Groq API."""
    start_time = time.time()

    try:
        # Step 1: Query vector database for relevant context
        print("\nRetrieving relevant information from cloud vector database...")

        query_result = index.query(
            data=question,
            top_k=5,  # Get more results for better context
            include_metadata=True,
            include_data=True
        )

        # Extract relevant documents and metadata
        top_docs = []
        top_ids = []
        sources_info = []

        for match in query_result:
            doc_data = match.data
            metadata = match.metadata or {}

            top_docs.append(doc_data)
            top_ids.append(metadata.get('id', 'unknown'))

            # Create source information
            source_info = f"Source {len(sources_info) + 1} (ID: {metadata.get('id', 'unknown')})"
            if metadata.get('region'):
                source_info += f" - Region: {metadata['region']}"
            if metadata.get('type'):
                source_info += f" - Type: {metadata['type']}"
            sources_info.append(source_info)

        # Display retrieved sources
        print("\nRetrieved relevant information:")
        for info in sources_info:
            print(info)
        print()

        # Step 2: Build context from retrieved documents
        context = "\n".join(top_docs)

        # Step 3: Create prompt for Groq
        prompt = f"""You are a knowledgeable food expert. Use the following context to answer the user's question about food.

Context:
{context}

Question: {question}

Provide a helpful, accurate answer based on the context provided. If the context doesn't contain enough information, say so and provide general knowledge about the topic."""

        # Step 4: Query Groq API
        print("Generating answer using Groq AI...")
        answer = query_groq_api(prompt)

        # Step 5: Calculate and display performance metrics
        end_time = time.time()
        response_time = end_time - start_time
        print(f"Response time: {response_time:.2f} seconds")
        return answer

    except Exception as e:
        error_msg = f"[ERROR] Error during RAG query: {str(e)}"
        print(error_msg)
        return error_msg

def main():
    """Main function to run the cloud RAG system."""
    print("Welcome to Cloud RAG-Food System!")
    print("=====================================")
    print("Using Upstash Vector Database + Groq AI")
    print()

    # Load and initialize data
    try:
        food_data = load_food_data()
        print(f"Loaded {len(food_data)} food items from database")

        # Initialize vector database (only needed first time)
        initialize_vector_database(food_data)

    except Exception as e:
        print(f"[ERROR] Failed to initialize system: {e}")
        return

    # Interactive query loop
    print("\nCloud RAG is ready! Ask questions about food (type 'exit' to quit):")
    print("Try queries like:")
    print("- 'What are some healthy Mediterranean dishes?'")
    print("- 'Show me comfort foods with cultural stories'")
    print("- 'What Thai dishes can I make at home?'")
    print()

    while True:
        try:
            question = input("You: ").strip()
            if question.lower() in ["exit", "quit", "bye"]:
                print("\nGoodbye!")
                break

            if not question:
                continue

            answer = rag_query(question)
            print(f"\nAnswer: {answer}\n")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")
            continue

if __name__ == "__main__":
    main()

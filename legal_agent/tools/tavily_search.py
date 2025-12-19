import os
import json
from dotenv import load_dotenv

load_dotenv()

# Safe Import
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False
    print("WARNING: 'tavily' package not found. Web search will be disabled.")

import concurrent.futures

def search_web(query: str) -> str:
    """
    Searches the web using Tavily API for recent legal cases, news, or judgments.
    Useful for finding info not in the static PDFs.
    """
    if not TAVILY_AVAILABLE:
        return "Web search is unavailable because the 'tavily' package is not installed."

    try:
        # Initialize Tavily client with your API key
        tavily_api_key = os.getenv("TAVILY_API_KEY") or "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"
        client = TavilyClient(api_key=tavily_api_key)

        def _do_search():
             return client.search(
                query=query,
                search_depth="advanced",
                max_results=5,
                include_answer=True,
                include_images=False
            )

        # Enforce 10s timeout
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(_do_search)
            try:
                response = future.result(timeout=10)
            except concurrent.futures.TimeoutError:
                return "Error: Web search timed out after 10 seconds."

        if not response or not response.get('results'):
            return "No results found."

        # Format the results
        formatted_results = []

        # Add the AI answer if available
        if response.get('answer'):
            formatted_results.append(f"AI Summary: {response['answer']}")
            formatted_results.append("=" * 50)

        # Add search results
        for i, result in enumerate(response['results'], 1):
            formatted_results.append(f"Result {i}:")
            formatted_results.append(f"Title: {result['title']}")
            formatted_results.append(f"URL: {result['url']}")
            formatted_results.append(f"Snippet: {result['content']}")
            formatted_results.append("-" * 50)

        return "\n".join(formatted_results)

    except Exception as e:
        return f"Tavily search failed: {str(e)}"


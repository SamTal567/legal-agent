import os
import weaviate
from weaviate.auth import AuthApiKey
# from langchain_ollama import OllamaEmbeddings (Lazy load instead)
from dotenv import load_dotenv

load_dotenv()

# Global init for efficiency (Lazy loaded)
embeddings = None

def get_embeddings():
    global embeddings
    if embeddings is None:
        try:
            from langchain_ollama import OllamaEmbeddings
            embeddings = OllamaEmbeddings(model="nomic-embed-text")
        except ImportError:
            print("WARNING: langchain-ollama not found (unexpected). Using Mock.")
            class MockEmbeddings:
                def embed_query(self, text): return [0.0] * 768
            embeddings = MockEmbeddings()
    return embeddings

def get_client():
    return weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=AuthApiKey(os.getenv("WEAVIATE_API_KEY"))
    )

def retrieve_legal_info(query: str) -> dict:
    """
    Search the government database for laws, acts, and rights.
    Args:
        query: The user's question (e.g., "rights for defective goods").
    """
    print(f"DEBUG: Starting retrieval for {query}...")
    client = get_client()
    try:
        collection = client.collections.get("LegalDocs")
        
        # 1. Vectorize Query Locally (Ollama)
        print("DEBUG: Embedding query...")
        query_vector = get_embeddings().embed_query(query)
        print("DEBUG: Embedding done.")
        
        # 2. Search Cloud
        print("DEBUG: Querying Weaviate...")
        response = collection.query.near_vector(
            near_vector=query_vector,
            limit=5,
            return_metadata=["distance"]
        )
        print("DEBUG: Weaviate query done.")
        
        results = []
        for obj in response.objects:
            results.append({
                "text": obj.properties.get("text"),
                "source": obj.properties.get("source"),
                "score": round(1 - obj.metadata.distance, 2)
            })
            
        print(f"DEBUG: Found {len(results)} docs.")
        return {"results": results} if results else {"message": "No docs found."}
    except Exception as e:
        print(f"DEBUG: Error in retrieval: {e}")
        return {"error": str(e)}
    finally:
        client.close()
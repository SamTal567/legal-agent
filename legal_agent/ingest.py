import os
import weaviate
import weaviate.classes.config as wc
from weaviate.auth import AuthApiKey
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from dotenv import load_dotenv

load_dotenv()

def ingest():
    print("--- Starting Ingestion ---")
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    
    # Connect
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=AuthApiKey(os.getenv("WEAVIATE_API_KEY"))
    )
    
    try:
        # 1. Reset Collection
        if client.collections.exists("LegalDocs"):
            client.collections.delete("LegalDocs")
            
        client.collections.create(
            name="LegalDocs",
            properties=[
                wc.Property(name="text", data_type=wc.DataType.TEXT),
                wc.Property(name="source", data_type=wc.DataType.TEXT),
            ],
            vectorizer_config=wc.Configure.Vectorizer.none() # Own vectors
        )
        
        collection = client.collections.get("LegalDocs")
        
        # 2. Process PDFs
        # We look for the 'data' folder relative to this script
        base_path = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(base_path, "data")
        
        if not os.path.exists(data_path):
            os.makedirs(data_path)
            print(f"Created {data_path}. Add PDFs and rerun.")
            return

        for file in os.listdir(data_path):
            if file.endswith(".pdf"):
                print(f"Processing {file}...")
                loader = PyPDFLoader(os.path.join(data_path, file))
                chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(loader.load())
                
                with collection.batch.dynamic() as batch:
                    for chunk in chunks:
                        vector = embeddings.embed_query(chunk.page_content)
                        batch.add_object(
                            properties={"text": chunk.page_content, "source": file},
                            vector=vector
                        )
                print(f"Uploaded {file}")
                
    finally:
        client.close()
        print("--- Done ---")

if __name__ == "__main__":
    ingest()
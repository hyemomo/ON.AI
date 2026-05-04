import chromadb
from chromadb.utils import embedding_functions


def get_collection(db_path: str, collection_name: str, model_name: str):
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=model_name)
    client = chromadb.PersistentClient(path=db_path)
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
    return client.create_collection(name=collection_name, embedding_function=ef)


def save_chunks(collection, chunks: list, batch_size: int = 100):
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        collection.add(
            documents=[c["text"] for c in batch],
            metadatas=[c["metadata"] for c in batch],
            ids=[f"chunk_{i + j}" for j in range(len(batch))],
        )

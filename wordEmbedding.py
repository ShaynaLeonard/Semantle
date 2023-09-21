from gensim.models import KeyedVectors
import json

# Load the pre-trained Word2Vec model (provide the actual path to the model)
model_path = 'path/to/word2vec_model.bin'
model = KeyedVectors.load_word2vec_format(model_path, binary=True)

# Convert the embeddings to a JSON format
embeddings = {}
for word in model.vocab:
    embeddings[word] = model[word].tolist()

# Save the embeddings to a JSON file
with open('word_embeddings.json', 'w') as outfile:
    json.dump(embeddings, outfile)

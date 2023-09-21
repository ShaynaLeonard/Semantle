import sys
import spacy

# Load the spaCy model
nlp = spacy.load("en_core_web_md")

def calculate_similarity(word1, word2):
    try:
        # Calculate semantic similarity using spaCy
        similarity_score = nlp(word1).similarity(nlp(word2))
        print(similarity_score)
    except Exception as e:
        print(str(e))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python myScript.py <word1> <word2>')
        sys.exit(1)

    word1 = sys.argv[1]
    word2 = sys.argv[2]
    calculate_similarity(word1, word2)

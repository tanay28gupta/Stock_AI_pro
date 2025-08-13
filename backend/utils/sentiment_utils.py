from huggingface_hub import InferenceClient
from config import HUGGINGFACE_TOKEN

try:
    finbert_client = InferenceClient(model="ProsusAI/finbert", token=HUGGINGFACE_TOKEN)
except Exception as e:
    print(f"❌ Error initializing FinBERT client: {e}")
    finbert_client = None

def analyze_sentiment(text):
    if not text or text.strip() == "":
        return []
    if finbert_client is None:
        print("❌ FinBERT client not available")
        return []
    try:
        result = finbert_client.text_classification(text)
        print(f"✅ Sentiment analysis completed for text: {text[:50]}...")
        return result
    except Exception as e:
        print(f"❌ Error in sentiment analysis: {e}")
        return []

def compute_scalar_score(result):
    if not result:
        return 0.0
    score_map = {'positive': 0.0, 'neutral': 0.0, 'negative': 0.0}
    for item in result:
        label = item['label'].lower()
        if label in score_map:
            score_map[label] = item['score']
    score = round(score_map['positive'] - score_map['negative'], 4)
    print(f"📊 Computed score: {score} (pos: {score_map['positive']}, neg: {score_map['negative']})")
    return score

def compute_average_sentiment(scores):
    if not scores:
        return 0.0
    avg = round(sum(scores) / len(scores), 4)
    print(f"📈 Average sentiment: {avg} from {len(scores)} scores")
    return avg 
import os
import sys
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report, accuracy_score
import nltk
from nltk.tokenize import RegexpTokenizer

def train():
    # 1. Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, "malicious_phish.csv")
    output_backend_path = os.path.join(script_dir, "..", "backend", "phishing.pkl")

    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        sys.exit(1)

    print("=" * 60)
    print("Phishing URL Detector - Model Training")
    print("=" * 60)

    # 2. Load dataset
    print(f"\n[1/5] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"Total rows loaded: {len(df):,}")
    print("\nOriginal label distribution:")
    print(df['type'].value_counts())

    # 3. Clean and map labels
    # backend/main.py expects:
    # index 0 = 'bad' (Phishing / Malicious)
    # index 1 = 'good' (Legitimate)
    print("\n[2/5] Mapping labels to 'bad' (malicious) and 'good' (benign)...")
    # benign -> good, everything else (phishing, defacement, malware) -> bad
    df = df.dropna(subset=['url', 'type'])
    df['label'] = df['type'].apply(lambda x: 'good' if str(x).strip().lower() == 'benign' else 'bad')

    print("Mapped label distribution:")
    print(df['label'].value_counts())

    # 4. Train/Test Split
    print("\n[3/5] Splitting data into train (80%) and test (20%)...")
    X = df['url']
    y = df['label']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training samples: {len(X_train):,}")
    print(f"Testing samples:  {len(X_test):,}")

    # 5. Build Pipeline
    print("\n[4/5] Building ML Pipeline (CountVectorizer + LogisticRegression)...")
    from sklearn.feature_extraction import text
    stop_words = list(text.ENGLISH_STOP_WORDS.union({'http', 'https', 'www'}))

    pipeline = make_pipeline(
        CountVectorizer(
            token_pattern=r'[A-Za-z]+',
            stop_words=stop_words
        ),
        LogisticRegression(max_iter=1000, random_state=42)
    )

    print("Training model (this might take 1-3 minutes)...")
    pipeline.fit(X_train, y_train)

    # 6. Evaluation
    print("\n[5/5] Evaluating model on test set...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    # Verify classes order for backend/main.py
    classes = pipeline.classes_
    print(f"Model classes: {classes}")
    if classes[0] != 'bad':
        print("WARNING: classes[0] is not 'bad'. backend/main.py assumes index 0 is 'bad'!")
    else:
        print("Verified: classes[0] == 'bad' (matches backend/main.py prob_phishing = proba[0])")

    # 7. Quick Sanity Check
    test_samples = [
        "https://www.google.com",
        "https://github.com",
        "http://paypal-security-update-account.tk/login.php",
        "http://bankofamerica-verify-login.com"
    ]
    print("\nSanity Check with sample URLs:")
    sample_probas = pipeline.predict_proba(test_samples)
    for sample_url, proba in zip(test_samples, sample_probas):
        prob_bad = proba[0]
        status = "Phishing" if prob_bad > 0.5 else "Legitimate"
        print(f"  - {sample_url} -> {status} (Bad prob: {prob_bad:.4f})")

    # 8. Save Model
    os.makedirs(os.path.dirname(output_backend_path), exist_ok=True)
    print(f"\nSaving trained model to: {output_backend_path}")
    with open(output_backend_path, "wb") as f:
        pickle.dump(pipeline, f)
    print("Model saved successfully!")
    print("=" * 60)

if __name__ == "__main__":
    train()

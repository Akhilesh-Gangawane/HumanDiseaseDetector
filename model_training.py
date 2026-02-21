import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import numpy as np

df = pd.read_csv("dataset/Training.csv")
def add_noise(X, noise_rate=0.05):
    X_noisy= X.copy()
    for col in X_noisy.columns:
        mask = np.random.rand(len(X_noisy)) < noise_rate
        X_noisy.loc[mask, col] = 1 - X_noisy.loc[mask, col]

    return X_noisy



X_original = df.drop("prognosis", axis=1)
X = add_noise(X_original, noise_rate=0.07)   # 7% noise
y = df["prognosis"]


# Random Forest
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

rf = RandomForestClassifier(n_estimators=200)
rf.fit(X_train, y_train)

rf_pred = rf.predict(X_test)

# XGBoost
le = LabelEncoder()
y_train_enc = le.fit_transform(y_train)
y_test_enc = le.transform(y_test)

xgb = XGBClassifier()
xgb.fit(X_train, y_train_enc)

xgb_pred = xgb.predict(X_test)

for rate in [0.02, 0.05, 0.10, 0.15,0.20]:
    X_noisy = add_noise(X_original, noise_rate=rate)

    X_train, X_test, y_train, y_test = train_test_split(
        X_noisy, y, test_size=0.2, random_state=42
    )

    rf.fit(X_train, y_train)
    preds = rf.predict(X_test)

    print(f"\nNoise Rate: {rate}")
    print(classification_report(y_test, preds))


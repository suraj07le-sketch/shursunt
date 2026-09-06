import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

class CryptoXGB:
    def __init__(self, mode='classifier'):
        """
        mode: 'classifier' for direction, 'regressor' for price
        """
        self.mode = mode
        if mode == 'classifier':
            self.model = xgb.XGBClassifier(
                objective='binary:logistic',
                n_estimators=200,
                max_depth=5,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                eval_metric='logloss',
                use_label_encoder=False
            )
        else:
            self.model = xgb.XGBRegressor(
                objective='reg:squarederror',
                n_estimators=200,
                max_depth=5,
                learning_rate=0.05
            )

    def train(self, X_train, y_train):
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_train, y_train)],
            verbose=False
        )

    def predict(self, X):
        if self.mode == 'classifier':
            return self.model.predict_proba(X)[:, 1]  # Probability of class 1 (up)
        return self.model.predict(X)

    def get_feature_importance(self):
        return self.model.feature_importances_

    def save(self, filepath):
        self.model.save_model(filepath)

    def load(self, filepath):
        self.model.load_model(filepath)

if __name__ == "__main__":
    # Test classifier mode
    X = np.random.rand(200, 20)
    y = np.random.randint(0, 2, 200)
    
    xgb_model = CryptoXGB(mode='classifier')
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    xgb_model.train(X_train, y_train)
    preds = xgb_model.predict(X_test)
    acc = accuracy_score(y_test, (preds > 0.5).astype(int))
    print(f"Accuracy: {acc:.2%}")
    print(f"Feature importance (top 5): {np.argsort(xgb_model.get_feature_importance())[-5:]}")

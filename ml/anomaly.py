from sklearn.ensemble import IsolationForest


def fit_anomaly_model(X):
    model = IsolationForest(contamination=0.01, random_state=42)
    model.fit(X)
    scores = -model.decision_function(X)
    return model, scores

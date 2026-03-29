import shap


def explain(model, x):
    explainer = shap.Explainer(model)
    values = explainer(x)
    return values.values

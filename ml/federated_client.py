def local_train(model, data):
    """Train model on local private data and return updated weights."""
    for x, y in data:
        pred = model(x)
        loss = (pred - y) ** 2
        loss.backward()
    return model.weights

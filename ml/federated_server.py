import numpy as np


def aggregate(updates):
    """Aggregate model updates by averaging them."""
    if len(updates) == 0:
        raise ValueError("updates must not be empty")
    return np.mean(updates, axis=0)


def apply(global_model, updates):
    """Apply averaged delta to global model weights."""
    delta = aggregate(updates)
    return global_model + delta

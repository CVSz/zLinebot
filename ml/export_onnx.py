import hashlib
import os
from pathlib import Path

import torch
from train import RankNet


MODEL_PATH = Path("model.pt")


def _verify_model_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")

    expected_sha256 = os.getenv("MODEL_PT_SHA256")
    if not expected_sha256:
        return

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != expected_sha256:
        raise ValueError("model.pt checksum mismatch")


def export_onnx() -> None:
    _verify_model_file(MODEL_PATH)

    model = RankNet(384)
    state_dict = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()

    dummy_q = torch.randn(1, 384)
    dummy_u = torch.randn(1, 384)
    dummy_s = torch.randn(1, 384)

    torch.onnx.export(
        model,
        (dummy_q, dummy_u, dummy_s),
        "rank.onnx",
        input_names=["q", "u", "s"],
        output_names=["output"],
        dynamic_axes={
            "q": {0: "batch"},
            "u": {0: "batch"},
            "s": {0: "batch"},
            "output": {0: "batch"},
        },
    )


if __name__ == "__main__":
    export_onnx()

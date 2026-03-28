import torch

from train import RankNet


def export_onnx():
    model = RankNet(384)
    model.load_state_dict(torch.load("model.pt", map_location="cpu"))
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

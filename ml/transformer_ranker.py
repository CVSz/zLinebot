import torch
import torch.nn as nn
from transformers import BertModel


class Ranker(nn.Module):
    def __init__(self):
        super().__init__()
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        self.fc = nn.Linear(768, 1)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls = output.last_hidden_state[:, 0, :]
        return self.fc(cls)

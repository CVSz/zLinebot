import os

import torch
import torch.nn as nn
from transformers import BertModel


BERT_MODEL_ID = "bert-base-uncased"
BERT_MODEL_REVISION = os.getenv(
    "BERT_MODEL_REVISION", "86b5e0934494bd15c9632b12f734a8a67f723594"
)


class Ranker(nn.Module):
    def __init__(self):
        super().__init__()
        self.bert = BertModel.from_pretrained(
            BERT_MODEL_ID,
            revision=BERT_MODEL_REVISION,
            trust_remote_code=False,
        )
        self.fc = nn.Linear(768, 1)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls = output.last_hidden_state[:, 0, :]
        return self.fc(cls)

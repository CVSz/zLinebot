import json
import os
import time

import redis
import requests

REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
WORKER_INFER_URL = os.getenv("WORKER_INFER_URL", "http://127.0.0.1:8000/infer")

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)


while True:
    item = r.brpop("ai_tasks", timeout=10)
    if not item:
        continue

    _, raw_data = item

    try:
        task = json.loads(raw_data)
        res = requests.post(WORKER_INFER_URL, json=task, timeout=15)
        res.raise_for_status()
        print(res.json())
    except Exception as exc:
        print(f"worker consumer error: {exc}")
        time.sleep(1)

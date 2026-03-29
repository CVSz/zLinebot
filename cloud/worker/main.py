from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Task(BaseModel):
    prompt: str


@app.post("/infer")
async def infer(task: Task):
    return {"result": task.prompt[::-1]}

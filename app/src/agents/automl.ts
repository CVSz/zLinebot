import { exec as execCb } from "node:child_process";
import { cp } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execCb);

interface AutoMLConfig {
  trainCommand?: string;
  evalCommand?: string;
  modelSource?: string;
  modelTarget?: string;
  minUplift?: number;
}

export async function runAutoML(config: AutoMLConfig = {}) {
  const trainCommand = config.trainCommand ?? "python3 ml/train.py";
  const evalCommand = config.evalCommand ?? "python3 ml/eval.py";
  const modelSource = config.modelSource ?? "ml/model.onnx";
  const modelTarget = config.modelTarget ?? "models/current.onnx";
  const minUplift = config.minUplift ?? threshold();

  await exec(trainCommand);
  const score = await evalModel(evalCommand);

  if (score > minUplift) {
    await cp(modelSource, modelTarget, { force: true });
    return { deployed: true, score, threshold: minUplift };
  }

  return { deployed: false, score, threshold: minUplift };
}

export async function evalModel(command = "python3 ml/eval.py") {
  const { stdout } = await exec(command);
  const score = Number.parseFloat(stdout.trim());

  if (!Number.isFinite(score)) {
    throw new Error(`Invalid model score output: ${stdout}`);
  }

  return score;
}

export function threshold() {
  return 0.05;
}

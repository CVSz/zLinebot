export async function secureCompute(data: unknown) {
  return fetch("http://tee-enclave/run", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

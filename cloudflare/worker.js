export default {
  async fetch(req, env) {
    const { prompt } = await req.json();
    const res = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", { prompt });
    return new Response(JSON.stringify(res), {
      headers: { "content-type": "application/json" }
    });
  }
};

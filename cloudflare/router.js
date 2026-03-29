export default {
  async fetch(req, env) {
    const geo = req.cf?.country;
    if (geo === "TH") {
      return fetch(env.ASIA_AI, req);
    }
    return fetch(env.US_AI, req);
  }
};

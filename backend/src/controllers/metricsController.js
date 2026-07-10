import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "agrivo_backend_",
});

export async function metrics(req, res) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

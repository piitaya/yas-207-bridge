import fastify from "fastify";
import controller from "./controller";

const PORT = Number(process.env.PORT) || 9207;
const app = fastify();

app.register(controller);
app.listen(PORT, '0.0.0.0');

console.log(`🚀 YAS 207 bridge running on port ${PORT}`);

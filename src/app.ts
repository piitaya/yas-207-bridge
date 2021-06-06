import fastify from "fastify";
import controller from "./controller";

const server = fastify();

server.register(controller);

export default server;

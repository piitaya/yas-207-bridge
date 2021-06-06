import { FastifyInstance } from "fastify";
import Yas207Bluetooth from "./yas207/yas207-bluetooth";

const YAS_207_PATH = "/dev/tty.YAS-207Yamaha-SPPDev";

const controller = async (fastify: FastifyInstance) => {
  const yas207 = new Yas207Bluetooth(YAS_207_PATH);

  fastify.get("/status", async (_request, reply) => {
    try {
      const status = await yas207.getStatus();

      reply.send(status);
    } catch (err) {
      reply.status(400).send({
        err: err.message,
      });
    }
  });

  fastify.get<{
    Querystring: { command: string };
  }>("/send_command", async (request, reply) => {
    const { command } = request.query;

    try {
      await yas207.sendCommand(command);

      reply.send({
        message: "Command sent",
      });
    } catch (err) {
      reply.status(400).send({
        err: err.message,
      });
    }
  });
};

export default controller;

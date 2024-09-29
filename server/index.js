import fs from "node:fs";
import Fastify from "fastify";
import cors from "@fastify/cors";
import applicationAuth from "./routes.js";

const fastify = Fastify({
    http2: true,
    https: {
        allowHTTP1: true,
        key: fs.readFileSync("localhost-privkey.pem"),
        cert: fs.readFileSync("localhost-cert.pem"),
    },
    logger: true,
});
await fastify.register(cors, {
    // origin: "*",
    credentials: true,
});
await fastify.register(applicationAuth, { prefix: "api" });
// async function redirectify(fastify, opts) {
//     fastify.get("/:id", {
//         handler: async function (request, reply) {
//             reply.redirect(
//                 "https://stackoverflow.com/questions/73112300/how-passing-props-to-component-dynamic-routing",
//             );
//         },
//     });
// }
// await fastify.register(redirectify);

fastify.listen(
    { port: process.env.SERVER_PORT, host: process.env.SERVER_HOST },
    (err, address) => {
        if (err) {
            fastify.log.error(err);
        }
        console.log(`app running on ${process.env.SERVER_PORT} yay2"`);
    },
);

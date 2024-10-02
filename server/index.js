// import fs from "node:fs";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import applicationAuth from "./routes.js";
import pool from "./db.js";

const fastify = Fastify({
    // http2: true, // https://github.com/vercel/next.js/discussions/10842
    // https: {
    //     allowHTTP1: true,
    //     key: fs.readFileSync("localhost-privkey.pem"),
    //     cert: fs.readFileSync("localhost-cert.pem"),
    // },
    logger: true,
});
await fastify.register(rateLimit, { global: true, max: 30, timeWindow: 1000 * 60 * 60 })

await fastify.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true,
});

async function root(fastify, opts) {
    fastify.get("/", {
        handler: async function rootHandler(request, reply) {
            reply.type("text/html").send("<h1>Hello</h1>");
        },
    });
}
fastify.register(root);
//
async function short(fastify, opts) {
    fastify.get("/:short(^[a-zA-Z0-9_]{6,7})", {
        handler: async function shortHandler(request, reply) {
            try {
                console.log("ttttttt");
                const { short } = request.params;
                const long = await pool.query(
                    "select long_url from short_url where short_url = $1",
                    [short],
                );
                reply.code(301).redirect(long.rows[0].long_url);
            } catch (err) {
                console.error(err);
                reply.code(500).send("Internal Server Error");
            }
        },
    });
}
fastify.register(short);

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

export default async function handler(req, reply) {
    await fastify.ready();
    fastify.server.emit("request", req, reply);
}

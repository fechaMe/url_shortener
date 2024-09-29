import { strict as assert } from "node:assert";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { jwtVerify, SignJWT } from "jose";
import pool from "../db.js";

const genHash = async (password, salt, keylen = 32) => {
    return (
        await promisify(scrypt)(password, salt, keylen, {
            N: 2 ** 15,
            maxmem: 2 ** 26,
        })
    ).toString("base64url");
};

export default async function applicationAuth(fastify, opts) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const signupSchema = {
        $id: "schema:auth:signup",
        type: "object",
        required: ["username", "password"],
        properties: {
            username: {
                type: "string",
                pattern: "^[a-zA-Z0-9_]{6,32}$",
                minLength: 6,
                maxLength: 32,
            },
            password: {
                type: "string",
                minLength: 8,
                maxLength: 64,
            },
        },
    };

    fastify.post("/signup", {
        schema: { body: signupSchema },
        handler: async function signupHandler(request, reply) {
            try {
                const user = await pool.query(
                    "select username from users where username = $1",
                    [request.body.username],
                );

                if (user.rowCount > 0) {
                    return reply.code(401).send("Unauthorized");
                }
                const salt = randomBytes(20).toString("base64url");
                const hash = await genHash(
                    await genHash(request.body.password, salt),
                    process.env.API_PEPPER,
                );

                const newUser = await pool.query(
                    "insert into users (username, password) values ($1, $2)",
                    [request.body.username, salt + "." + hash],
                );

                reply.code(201).send("Created");
            } catch (err) {
                console.error(err);
                reply.code(500).send("Internal Server Error");
            }
        },
    });

    const tokenSchema = {
        type: "object",
        $id: "schema:auth:token",
        additionalProperties: false,
        properties: {
            token: {
                type: "string",
            },
        },
    };

    async function refreshHandler(request, reply) {
        try {
            const userFingerprint = randomBytes(20).toString("base64url");
            const userFingerprintHash = await genHash(
                userFingerprint,
                process.env.API_PEPPER,
            );

            const now = Math.floor(new Date().getTime() / 1000);

            const token = await new SignJWT({ fgp: userFingerprintHash })
                .setProtectedHeader({ alg: "HS256", typ: "jwt" })
                .setIssuedAt(now)
                .setNotBefore(now)
                .setIssuer(process.env.JWT_ISSUER)
                .setAudience(process.env.JWT_AUDIENCE)
                .setExpirationTime(process.env.JWT_EXPIRE_IN)
                .setSubject(request.body.username)
                .sign(secret);
            console.log;
            return (
                reply
                    // .header("Access-Control-Allow-Credentials", "true")
                    .header(
                        "Set-Cookie",
                        "__Secure-Fgp=" +
                            userFingerprint +
                            "; SameSite=None; HttpOnly; Secure",
                        // "; SameSite=Strict; HttpOnly; Secure",
                    )
                    .send({ token })
            );
        } catch {
            console.error(err);
            reply.code(500).send("Internal Server Error");
        }
    }

    async function verifyHandler(request, reply) {
        try {
            const cookies = request.headers.cookie
                .split("; ")
                .reduce((prev, curr) => {
                    const [cookie, value] = curr.split("=");
                    prev[cookie] = value;
                    return prev;
                }, {});
            const userFingerprintHash = await genHash(
                cookies["__Secure-Fgp"],
                process.env.API_PEPPER,
            );
            const jwtToken = await jwtVerify(
                request.headers.authorization.split(" ")[1],
                secret,
                {
                    algorithms: ["HS256"],
                    type: "jwt",
                    audience: process.env.JWT_AUDIENCE,
                    issuer: process.env.JWT_ISSUER,
                },
            );
            console.log(jwtToken);
            // https://github.com/panva/jose/discussions/238
            assert.equal(jwtToken.payload["fgp"], userFingerprintHash);
            request.user = jwtToken.payload.sub;
        } catch (err) {
            console.error(err);
            reply.code(500).send("Token Invalid.");
        }
    }

    const headerSchema = {
        type: "object",
        $id: "schema:auth:token_header",
        properties: {
            authorization: {
                type: "string",
                pattern: "^Bearer [a-zA-Z0-9-._~+/]+=*$",
            },
        },
    };

    fastify.post("/refresh", {
        onRequest: verifyHandler,
        schema: {
            headers: headerSchema,
            response: { 200: tokenSchema },
        },
        handler: refreshHandler,
    });

    fastify.post("/urls", {
        onRequest: verifyHandler,
        schema: {
            headers: headerSchema,
            // response: { 200: tokenSchema },
        },
        handler: async function userShortUrlsHandler(request, reply) {
            try {

                const short = await genHash(request.body.url, process.env.API_PEPPER, 5);
                console.log(request.user, short);

                const newShortUrl = await pool.query(
                    "insert into short_url (short_url, long_url, username) values ($1, $2, $3)",
                    [short, request.body.url, request.user],
                );
                console.log(newShortUrl);
                reply.code(201).send({short});
            } catch (err) {
                console.error(err);
                reply.code(500).send("Internal Server Error");
            }
        },
    });

    fastify.get("/urls", {
        onRequest: verifyHandler,
        schema: {
            headers: headerSchema,
            // response: { 200: tokenSchema },
        },
        handler: async function userShortUrlsHandler(request, reply) {
            try {
                const user = await pool.query(
                    "select short_url, long_url from short_url where username = $1",
                    [request.user],
                );

                reply.send(user.rows);
            } catch (err) {
                console.error(err);
                reply.code(500).send("Internal Server Error");
            }
        },
    });

    fastify.post("/login", {
        schema: {
            body: signupSchema,
            response: { 200: tokenSchema },
        },
        handler: async function loginHandler(request, reply) {
            try {
                const user = await pool.query(
                    "select username, password from users where username = $1",
                    [request.body.username],
                );
                const [salt, hash] = user.rows[0].password.split(".");
                const userHash = await genHash(
                    await genHash(request.body.password, salt),
                    process.env.API_PEPPER,
                );

                if (user.rowCount === 0 || hash !== userHash) {
                    return reply
                        .code(401)
                        .send("Incorrect username or password.");
                }

                return refreshHandler(request, reply);
            } catch (err) {
                console.error(err);
                reply.code(500).send("Internal Server Error");
            }
        },
    });
}

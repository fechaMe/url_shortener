import pg from "pg";

// https://github.com/docker-library/redmine/issues/194
// https://forums.docker.com/t/unable-to-run-psql-inside-a-postgres-container/90623/9

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: true,
});

export default pool;

// const res = await pool.query(
//     "select name, type from users where name = $1", ["Lelvs"]
// );

import dotenv from "dotenv";

dotenv.config();

export const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    debug: process.env.DEBUG,
    db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT!, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    }
}
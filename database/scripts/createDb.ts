// create Database

import { Pool } from "pg";
import { config } from "../../src/config";
import fs from "fs";

const pool = new Pool(
    { ...config.db, database: 'postgres' });

async function createDb() {
    // create database
    let pool = new Pool(
        { ...config.db, database: 'postgres' });
    await pool.query('CREATE DATABASE route_planner_db');
    await pool.end();
    // connect to new database and run db.sql
    pool = new Pool(config.db);
    const dbSql = fs.readFileSync('database/db.sql', 'utf8');
    await pool.query(dbSql);
    await pool.end();
}

createDb();
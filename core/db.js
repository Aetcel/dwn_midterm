// db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create or open DB in the current folder
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

module.exports = db;

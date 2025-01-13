const sqlLite3 = require("sqlite3").verbose();

const db = new sqlLite3.Database("./db.sqlite3", (err) => {
  if (err) {
    console.error(err.message);
    return;
  }

  console.log("Connected to the database.");
  global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
  return;
});

module.exports = db;

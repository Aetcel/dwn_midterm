/**
 * index.js
 * This is your main app entry point
 */

// Set up express, bodyparser and EJS
// const express = require("express");
const app = require("./app");
const port = 3001;

// var bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: true }));
// app.set("view engine", "ejs"); // set the app to use ejs for rendering
// app.use(express.static(__dirname + "/public")); // set location of static files

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
// const sqlite3 = require("sqlite3").verbose();
// global.db = new sqlite3.Database("./database.db", function (err) {
//   if (err) {
//     console.error(err);
//     process.exit(1); // bail out we can't connect to the DB
//   } else {
//     console.log("Database connected");
//     global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
//   }
// });

// Handle requests to the home page
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Add all the route handlers in usersRoutes to the app under the path /users
// const usersRoutes = require("./routes/users");
// app.use("/users", usersRoutes);
// const routes = require("./routes/index");

// Make the web application listen for HTTP requests
const server = app.listen(port, () => {
    console.log("Server running on port 3000");
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const express = require("express");
const path = require("path");
const db = require("./core/db"); // import your db instance
//const app = express();

//cleconst app = express();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const organiserRoutes = require("./routes/organiser");
const attendeeRoutes = require("./routes/attendee");

// Use routes
app.use("/organiser", organiserRoutes);
app.use("/attendee", attendeeRoutes);

// Main Home Page route
app.get("/", (req, res) => {
    res.render("mainHome"); // just has links to /organiser and /attendee
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Export db if you need it across modules
module.exports = db;

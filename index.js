// index.js
const express = require("express");
const path = require("path");
const db = require("./db"); // Our SQLite db instance
const app = express();

// Middleware for body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, client-side JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const organiserRoutes = require("./routes/organiser");
const attendeeRoutes = require("./routes/attendee");

// Use routes
app.use("/organiser", organiserRoutes);
app.use("/attendee", attendeeRoutes);

// Main Home Page
// Purpose: Show a basic landing with links to organiser and attendee
// Inputs: None
// Outputs: Renders mainHome.ejs
app.get("/", (req, res) => {
    res.render("mainHome");
});

// Start server
const PORT = 3000; // or process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

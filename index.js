// index.js
const express = require("express");
const path = require("path");
const db = require("./core/db"); // ensure ./db.js exists
const app = express();

// Set up Body Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (for CSS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const organiserRoutes = require("./routes/organiser");
const attendeeRoutes = require("./routes/attendee");

// Use routes
app.use("/organiser", organiserRoutes);
app.use("/attendee", attendeeRoutes);

// Main page
app.get("/", (req, res) => {
    // Renders views/mainHome.ejs
    res.render("mainHome");
});

// Start server
const PORT = 3000; // or process.env.PORT
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

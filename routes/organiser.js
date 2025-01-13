// routes/organiser.js
const express = require("express");
const router = express.Router();
const db = require("../core/db");  // important: import from db.js

// GET /organiser
// Show organiser home page with site settings, published events, draft events
router.get("/", (req, res) => {
    // Step 1: get site settings
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }

        // Step 2: get published events
        db.all("SELECT * FROM events WHERE status='published'", (err2, published) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send("Database error");
            }

            // Step 3: get draft events
            db.all("SELECT * FROM events WHERE status='draft'", (err3, draft) => {
                if (err3) {
                    console.error(err3);
                    return res.status(500).send("Database error");
                }

                // Render organiserHome (views/organiser/home.ejs)
                res.render("organiser/home", {
                    siteSettings,
                    publishedEvents: published,
                    draftEvents: draft
                });
            });
        });
    });
});

// POST /organiser/create
// Create a new event as draft
router.post("/create", (req, res) => {
    const now = new Date().toISOString();

    const sql = `
    INSERT INTO events
      (title, description, full_price_count, full_price_price,
       concession_count, concession_price, created_at, modified_at, event_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    db.run(sql, [
        "New Event",
        "No description",
        0,     // full_price_count
        0.0,   // full_price_price
        0,     // concession_count
        0.0,   // concession_price
        now,
        now,
        "2025-01-01",  // default event date
        "draft"
    ], function (err) {
        if (err) {
            console.error(err);
            return res.redirect("/organiser");
        }
        res.redirect(`/organiser/edit/${this.lastID}`);
    });
});

// GET /organiser/edit/:id
router.get("/edit/:id", (req, res) => {
    const eventId = req.params.id;
    db.get("SELECT * FROM events WHERE id=?", [eventId], (err, event) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.render("organiser/editEvent", { event });
    });
});

// POST /organiser/edit/:id
router.post("/edit/:id", (req, res) => {
    const eventId = req.params.id;
    const now = new Date().toISOString();

    const {
        title,
        description,
        full_price_count,
        full_price_price,
        concession_count,
        concession_price,
        event_date
    } = req.body;

    const sql = `
    UPDATE events
      SET title=?,
          description=?,
          full_price_count=?,
          full_price_price=?,
          concession_count=?,
          concession_price=?,
          modified_at=?,
          event_date=?
      WHERE id=?
  `;

    db.run(sql, [
        title,
        description,
        full_price_count,
        full_price_price,
        concession_count,
        concession_price,
        now,
        event_date,
        eventId
    ], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.redirect("/organiser");
    });
});

// POST /organiser/publish/:id
router.post("/publish/:id", (req, res) => {
    const eventId = req.params.id;
    const now = new Date().toISOString();

    const sql = `
    UPDATE events
      SET status='published',
          published_at=?
      WHERE id=?
  `;
    db.run(sql, [now, eventId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error publishing event");
        }
        res.redirect("/organiser");
    });
});

// POST /organiser/delete/:id
router.post("/delete/:id", (req, res) => {
    const eventId = req.params.id;

    db.run("DELETE FROM events WHERE id=?", [eventId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error deleting event");
        }
        res.redirect("/organiser");
    });
});

// GET /organiser/settings
router.get("/settings", (req, res) => {
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.render("organiser/settings", { siteSettings });
    });
});

// POST /organiser/settings
router.post("/settings", (req, res) => {
    const { siteName, siteDescription } = req.body;

    // You might want some minimal validation here
    if (!siteName || !siteDescription) {
        return res.status(400).send("All fields required");
    }

    const sql = `UPDATE siteSettings SET siteName=?, siteDescription=? WHERE id=1`;
    db.run(sql, [siteName, siteDescription], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error updating site settings");
        }
        res.redirect("/organiser");
    });
});

module.exports = router;

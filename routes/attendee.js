// routes/attendee.js
const express = require("express");
const router = express.Router();
const db = require("../core/db");

// GET /attendee
// Show list of published events
router.get("/", (req, res) => {
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        const sql = `SELECT * FROM events WHERE status='published' ORDER BY event_date ASC`;
        db.all(sql, (err2, publishedEvents) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send("Database error");
            }
            res.render("attendee/home", { siteSettings, publishedEvents });
        });
    });
});

// GET /attendee/event/:id
// Show single event detail
router.get("/event/:id", (req, res) => {
    const eventId = req.params.id;

    db.get("SELECT * FROM events WHERE id=? AND status='published'", [eventId], (err, event) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        if (!event) {
            return res.status(404).send("Event not found or not published");
        }
        res.render("attendee/singleEvent", { event });
    });
});

// POST /attendee/event/:id/book
// Book tickets
router.post("/event/:id/book", (req, res) => {
    const eventId = req.params.id;
    const { attendee_name, full_price_count, concession_count } = req.body;
    const now = new Date().toISOString();

    db.get("SELECT * FROM events WHERE id=? AND status='published'", [eventId], (err, event) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        if (!event) {
            return res.status(404).send("Event not found or not published");
        }

        // Convert to integer or 0 if blank
        const fpRequested = parseInt(full_price_count) || 0;
        const cRequested = parseInt(concession_count) || 0;

        // Check availability
        if (fpRequested > event.full_price_count || cRequested > event.concession_count) {
            return res.status(400).send("Not enough tickets available");
        }

        // Insert booking
        const bookingSql = `
      INSERT INTO bookings (event_id, attendee_name, full_price_booked, concession_booked, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
        db.run(bookingSql, [event.id, attendee_name, fpRequested, cRequested, now], function (err2) {
            if (err2) {
                console.error(err2);
                return res.status(500).send("Error creating booking");
            }

            // Decrement from events table
            const updateSql = `
        UPDATE events
          SET full_price_count=full_price_count-?,
              concession_count=concession_count-?
          WHERE id=?
      `;
            db.run(updateSql, [fpRequested, cRequested, event.id], (err3) => {
                if (err3) {
                    console.error(err3);
                    return res.status(500).send("Error updating ticket counts");
                }
                // success
                res.redirect("/attendee");
            });
        });
    });
});

module.exports = router;

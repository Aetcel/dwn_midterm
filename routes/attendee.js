// routes/attendee.js

/**
 * Attendee routes for viewing published events and making bookings.
 */

const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /attendee
 * Purpose: Displays Attendee Home Page with a list of published events
 * Inputs: None
 * Outputs: Renders attendee/home.ejs with siteSettings, publishedEvents
 */
router.get("/", (req, res) => {
    // 1) Get site settings
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error: siteSettings");
        }
        // 2) Get published events, ordered by date ascending
        const sql = `SELECT * FROM events WHERE status='published' ORDER BY event_date ASC`;
        db.all(sql, (err2, publishedEvents) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send("Database error: publishedEvents");
            }
            res.render("attendee/home", { siteSettings, publishedEvents });
        });
    });
});

/**
 * GET /attendee/event/:id
 * Purpose: Show a single published event with booking form
 * Inputs: :id (event id)
 * Outputs: Renders attendee/singleEvent.ejs
 */
router.get("/event/:id", (req, res) => {
    const eventId = req.params.id;
    const sql = `SELECT * FROM events WHERE id=? AND status='published'`;
    db.get(sql, [eventId], (err, event) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error retrieving event");
        }
        if (!event) {
            return res.status(404).send("Event not found or not published");
        }
        res.render("attendee/singleEvent", { event });
    });
});

/**
 * POST /attendee/event/:id/book
 * Purpose: Book tickets for an event
 * Inputs: :id (event id), plus form fields (attendee_name, full_price_count, concession_count)
 * Outputs: Redirect to /attendee upon success, or error message if not enough tickets
 */
router.post("/event/:id/book", (req, res) => {
    const eventId = req.params.id;
    const { attendee_name, full_price_count, concession_count } = req.body;
    const now = new Date().toISOString();

    // Basic validation
    if (!attendee_name) {
        return res.status(400).send("Name is required to book tickets.");
    }

    db.get("SELECT * FROM events WHERE id=? AND status='published'", [eventId], (err, event) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error retrieving event");
        }
        if (!event) {
            return res.status(404).send("Event not found or not published");
        }

        // Convert counts to integer or 0
        const fpRequested = parseInt(full_price_count) || 0;
        const cRequested = parseInt(concession_count) || 0;

        // Check availability
        if (fpRequested > event.full_price_count || cRequested > event.concession_count) {
            return res.status(400).send("Not enough tickets available");
        }

        // Insert booking
        const insertSql = `
      INSERT INTO bookings (event_id, attendee_name, full_price_booked, concession_booked, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
        db.run(insertSql, [eventId, attendee_name, fpRequested, cRequested, now], function (err2) {
            if (err2) {
                console.error(err2);
                return res.status(500).send("Error creating booking");
            }

            // Decrement tickets
            const updateSql = `
        UPDATE events
        SET full_price_count = full_price_count - ?,
            concession_count = concession_count - ?
        WHERE id=?
      `;
            db.run(updateSql, [fpRequested, cRequested, eventId], (err3) => {
                if (err3) {
                    console.error(err3);
                    return res.status(500).send("Error updating ticket counts");
                }
                // Success
                res.redirect("/attendee");
            });
        });
    });
});

module.exports = router;

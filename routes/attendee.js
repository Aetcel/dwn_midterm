// routes/attendee.js
// Purpose: Handling the attendee home, event pages, bookings, etc.

const express = require("express");
const router = express.Router();
const db = require("../core/db"); // or ../path/to/db.js

router.get("/", (req, res) => {
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send(row);
    });
});

// GET /attendee
// Show the attendee homepage with a list of published events
router.get("/", (req, res) => {
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) { /* handle error */ }
        const sql = `
      SELECT * FROM events
      WHERE status='published'
      ORDER BY event_date ASC
    `;
        db.all(sql, (err, publishedEvents) => {
            if (err) { /* handle error */ }
            res.render("attendee/attendeeHome", { siteSettings, publishedEvents });
        });
    });
});


// GET /attendee/event/:id
// Show details for one event with booking form
router.get("/event/:id", (req, res) => {
    const eventId = req.params.id;
    db.get("SELECT * FROM events WHERE id=? AND status='published'", eventId, (err, event) => {
        if (err) { /* handle error */ }
        if (!event) {
            return res.send("Event not found or not published.");
        }
        res.render("attendee/attendeeEvent", { event });
    });
});


// POST /attendee/event/:id/book
// Handle booking creation
router.post("/event/:id/book", (req, res) => {
    const eventId = req.params.id;
    const { attendee_name, full_price_count, concession_count } = req.body;
    const now = new Date().toISOString();

    // 1) check current event ticket availability
    db.get("SELECT * FROM events WHERE id=? AND status='published'", eventId, (err, event) => {
        if (err || !event) {
            return res.send("Error or event not found");
        }

        const requestedFull = parseInt(full_price_count) || 0;
        const requestedConc = parseInt(concession_count) || 0;

        if (requestedFull > event.full_price_tix_count || requestedConc > event.concession_tix_count) {
            return res.send("Not enough tickets available");
        }

        // 2) create booking
        const insertBookingSql = `
      INSERT INTO bookings (event_id, attendee_name, full_price_tix_booked, concession_tix_booked, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
        db.run(insertBookingSql, [eventId, attendee_name, requestedFull, requestedConc, now], function(err2) {
            if (err2) return res.send("Error booking tickets");

            // 3) decrement event tickets
            const updateEventSql = `
        UPDATE events
           SET full_price_tix_count=full_price_tix_count-?,
               concession_tix_count=concession_tix_count-?
         WHERE id=?
      `;
            db.run(updateEventSql, [requestedFull, requestedConc, eventId], function(err3) {
                if (err3) {
                    return res.send("Error updating tickets");
                }
                // success
                res.redirect("/attendee");
            });
        });
    });
});


module.exports = router;

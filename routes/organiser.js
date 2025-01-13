// routes/organiser.js

/**
 * Organiser routes for creating, editing, publishing, deleting events,
 * plus site settings and the extension: viewing all bookings.
 */

const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /organiser
 * Purpose: Display the Organiser Home Page
 * Inputs: None
 * Outputs: Renders the organiser/home.ejs template with siteSettings,
 *          publishedEvents, draftEvents.
 */
router.get("/", (req, res) => {
    // 1) Fetch site settings
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error: siteSettings");
        }
        // 2) Fetch published events
        db.all("SELECT * FROM events WHERE status='published'", (err2, publishedEvents) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send("Database error: publishedEvents");
            }
            // 3) Fetch draft events
            db.all("SELECT * FROM events WHERE status='draft'", (err3, draftEvents) => {
                if (err3) {
                    console.error(err3);
                    return res.status(500).send("Database error: draftEvents");
                }
                res.render("organiser/home", {
                    siteSettings,
                    publishedEvents,
                    draftEvents
                });
            });
        });
    });
});

/**
 * POST /organiser/create
 * Purpose: Creates a new event in draft status, then redirects to its edit page.
 * Inputs: None (uses default placeholders)
 * Outputs: Redirect to the new event's edit page
 */
router.post("/create", (req, res) => {
    const now = new Date().toISOString();

    const sql = `
    INSERT INTO events
      (title, description, full_price_count, full_price_price,
       concession_count, concession_price, created_at, modified_at, event_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    db.run(
        sql,
        [
            "New Event",
            "No description",
            0,   // full_price_count
            0.0, // full_price_price
            0,   // concession_count
            0.0, // concession_price
            now,
            now,
            "2025-01-01", // default event date
            "draft"
        ],
        function (err) {
            if (err) {
                console.error(err);
                return res.redirect("/organiser");
            }
            // Redirect to edit page for the newly created event
            res.redirect(`/organiser/edit/${this.lastID}`);
        }
    );
});

/**
 * GET /organiser/edit/:id
 * Purpose: Show the edit form for a single event
 * Inputs: :id (event id)
 * Outputs: Renders organiser/editEvent.ejs with event data
 */
router.get("/edit/:id", (req, res) => {
    const eventId = req.params.id;
    db.get("SELECT * FROM events WHERE id=?", [eventId], (err, event) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error retrieving event");
        }
        res.render("organiser/editEvent", { event });
    });
});

/**
 * POST /organiser/edit/:id
 * Purpose: Saves changes to an event
 * Inputs: :id (event id), plus form fields
 * Outputs: Redirect back to /organiser
 */
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
    SET 
      title=?,
      description=?,
      full_price_count=?,
      full_price_price=?,
      concession_count=?,
      concession_price=?,
      modified_at=?,
      event_date=?
    WHERE id=?
  `;

    db.run(
        sql,
        [
            title,
            description,
            full_price_count,
            full_price_price,
            concession_count,
            concession_price,
            now,
            event_date,
            eventId
        ],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error updating event");
            }
            res.redirect("/organiser");
        }
    );
});

/**
 * POST /organiser/publish/:id
 * Purpose: Publishes a draft event
 * Inputs: :id (event id)
 * Outputs: Redirect back to /organiser
 */
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

/**
 * POST /organiser/delete/:id
 * Purpose: Deletes an event
 * Inputs: :id (event id)
 * Outputs: Redirect back to /organiser
 */
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

/**
 * GET /organiser/settings
 * Purpose: Show the site settings page
 * Inputs: None
 * Outputs: Renders organiser/settings.ejs
 */
router.get("/settings", (req, res) => {
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error getting site settings");
        }
        res.render("organiser/settings", { siteSettings });
    });
});

/**
 * POST /organiser/settings
 * Purpose: Update the site settings
 * Inputs: siteName, siteDescription from form
 * Outputs: Redirect back to /organiser
 */
router.post("/settings", (req, res) => {
    const { siteName, siteDescription } = req.body;

    // Basic validation
    if (!siteName || !siteDescription) {
        return res.status(400).send("Both fields are required.");
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

/**
 * GET /organiser/bookings
 * (EXTENSION) Purpose: Show all bookings across all events
 * Inputs: None
 * Outputs: Renders organiser/bookings.ejs with a list of bookings + event info
 */
router.get("/bookings", (req, res) => {
    // We'll JOIN bookings with events to get event title, date, etc.
    const sql = `
    SELECT 
      bookings.id as booking_id,
      bookings.attendee_name,
      bookings.full_price_booked,
      bookings.concession_booked,
      bookings.created_at as booked_at,
      events.title as event_title,
      events.event_date as event_date
    FROM bookings
    JOIN events ON bookings.event_id = events.id
    ORDER BY bookings.created_at DESC
  `;
    db.all(sql, [], (err, bookings) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error retrieving bookings");
        }
        res.render("organiser/bookings", { bookings });
    });
});

module.exports = router;

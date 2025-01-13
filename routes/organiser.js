// routes/organiser.js
// Purpose: Handling all organiser pages (home, settings, edit event, etc.)

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

module.exports = router;

// GET /organiser
// Show the organiser home page with lists of draft/published events
router.get("/", (req, res) => {
    // 1) Get site settings
    db.get("SELECT * FROM siteSettings LIMIT 1", (err, siteSettings) => {
        if (err) { /* handle error */ }

        // 2) Get published events
        db.all("SELECT * FROM events WHERE status = 'published'", (err, publishedEvents) => {
            if (err) { /* handle error */ }

            // 3) Get draft events
            db.all("SELECT * FROM events WHERE status = 'draft'", (err, draftEvents) => {
                if (err) { /* handle error */ }

                res.render("organiser/organiserHome", {
                    siteSettings,
                    publishedEvents,
                    draftEvents
                });
            });
        });
    });
});


// POST /organiser/create-event
// Creates a new draft event, then redirects to the edit page
router.post("/create-event", (req, res) => {
    const now = new Date().toISOString();
    const sql = `
    INSERT INTO events (title, description, full_price_tix_count, full_price_tix_price, 
                        concession_tix_count, concession_tix_price, created_at, modified_at, event_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        sql,
        [
            "Untitled",            // default
            "No description",      // default
            0,                     // default
            0.0,                   // default
            0,                     // default
            0.0,                   // default
            now,
            now,
            "2025-01-01",         // or some default
            "draft"
        ],
        function (err) {
            if (err) {
                console.error(err);
                return res.redirect("/organiser");
            }
            // The newly created row ID is available via 'this.lastID'
            res.redirect(`/organiser/edit/${this.lastID}`);
        }
    );
});


// GET /organiser/edit/:id
// Show the edit form for a single event
router.get("/edit/:id", async (req, res) => {
    // 1) SELECT * FROM events WHERE id = ?
    // 2) Render the edit event page
});

// POST /organiser/edit/:id
// Save changes for an event
router.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const now = new Date().toISOString();
    const {
        title,
        description,
        full_price_tix_count,
        full_price_tix_price,
        concession_tix_count,
        concession_tix_price,
        event_date
    } = req.body;

    const sql = `
    UPDATE events
       SET title=?,
           description=?,
           full_price_tix_count=?,
           full_price_tix_price=?,
           concession_tix_count=?,
           concession_tix_price=?,
           modified_at=?,
           event_date=?
     WHERE id=?`;

    db.run(
        sql,
        [
            title,
            description,
            full_price_tix_count,
            full_price_tix_price,
            concession_tix_count,
            concession_tix_price,
            now,
            event_date,
            id
        ],
        (err) => {
            if (err) {
                console.error(err);
            }
            res.redirect("/organiser");
        }
    );
});


// POST /organiser/publish/:id
// Publish an event (status -> 'published', published_at -> now)
router.post("/publish/:id", (req, res) => {
    const id = req.params.id;
    const now = new Date().toISOString();

    const sql = `
    UPDATE events
       SET status='published',
           published_at=?
     WHERE id=?`;

    db.run(sql, [now, id], (err) => {
        if (err) {
            console.error(err);
        }
        res.redirect("/organiser");
    });
});


// POST /organiser/delete/:id
// Delete event
router.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM events WHERE id = ?", id, (err) => {
        if (err) console.error(err);
        res.redirect("/organiser");
    });
});


// GET /organiser/settings
// Show site settings form
router.get("/settings", async (req, res) => {
    // 1) SELECT * from siteSettings
    // 2) Render organiserSettings.ejs
});

// POST /organiser/settings
// Save site settings
router.post("/settings", async (req, res) => {
    // 1) UPDATE siteSettings
    // 2) redirect to /organiser
});

module.exports = router;

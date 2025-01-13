
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_accounts (
    email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL,
    user_id  INT, --the user that the email account belongs to
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Insert default data (if necessary here)

-- Set up three users
INSERT INTO users ('user_name') VALUES ('Simon Star');
INSERT INTO users ('user_name') VALUES ('Dianne Dean');
INSERT INTO users ('user_name') VALUES ('Harry Hilbert');

-- Give Simon two email addresses and Diane one, but Harry has none
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@gmail.com', 1); 
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@hotmail.com', 1); 
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('dianne@yahoo.co.uk', 2); 

COMMIT;

-- Table: siteSettings
DROP TABLE IF EXISTS siteSettings;
CREATE TABLE siteSettings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siteName TEXT NOT NULL,
  siteDescription TEXT NOT NULL
);

-- Possibly other tables: events, bookings, etc.

-- Optionally, insert a default row:
INSERT INTO siteSettings (siteName, siteDescription)
VALUES ('My Default Site', 'This is a default site description');

-- Table: events
DROP TABLE IF EXISTS events;
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    full_price_tix_count INTEGER NOT NULL DEFAULT 0,
    full_price_tix_price REAL NOT NULL DEFAULT 0,
    concession_tix_count INTEGER NOT NULL DEFAULT 0,
    concession_tix_price REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    modified_at TEXT NOT NULL,
    published_at TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    event_date TEXT NOT NULL
);

-- Table: bookings
DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    attendee_name TEXT NOT NULL,
    full_price_tix_booked INTEGER NOT NULL DEFAULT 0,
    concession_tix_booked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(event_id) REFERENCES events(id)
);


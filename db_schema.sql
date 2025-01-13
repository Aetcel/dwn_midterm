-- db_schema.sql

-- Drop existing tables
DROP TABLE IF EXISTS siteSettings;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS bookings;

-- Create siteSettings table
CREATE TABLE siteSettings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siteName TEXT NOT NULL,
  siteDescription TEXT NOT NULL
);

-- Create events table
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_price_count INTEGER NOT NULL DEFAULT 0,
  full_price_price REAL NOT NULL DEFAULT 0.0,
  concession_count INTEGER NOT NULL DEFAULT 0,
  concession_price REAL NOT NULL DEFAULT 0.0,
  created_at TEXT NOT NULL,
  modified_at TEXT NOT NULL,
  published_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  event_date TEXT NOT NULL
);

-- Create bookings table
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  attendee_name TEXT NOT NULL,
  full_price_booked INTEGER NOT NULL DEFAULT 0,
  concession_booked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(event_id) REFERENCES events(id)
);

-- Insert default site settings row
INSERT INTO siteSettings (siteName, siteDescription)
VALUES ('My Default Site', 'This is a default site description');

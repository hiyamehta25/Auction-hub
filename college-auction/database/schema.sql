-- Online Auction Hub — MySQL schema
-- Run in MySQL Workbench: create database, then run this script.
-- Default local credentials (as requested): user root, password 0000

CREATE DATABASE IF NOT EXISTS auction_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE auction_hub;

DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_plain VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  seller_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE auctions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id INT UNSIGNED NOT NULL,
  starting_price DECIMAL(12,2) NOT NULL,
  current_price DECIMAL(12,2) NOT NULL,
  ends_at DATETIME NOT NULL,
  status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
  winner_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auctions_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_auctions_winner FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE bids (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auction_id INT UNSIGNED NOT NULL,
  bidder_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bids_auction FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  CONSTRAINT fk_bids_bidder FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Demo users (password: demo)
INSERT INTO users (username, email, password_plain) VALUES
  ('alice', 'alice@example.com', 'demo'),
  ('bob', 'bob@example.com', 'demo');

INSERT INTO items (title, description, seller_id) VALUES
  ('Vintage camera', 'Fully working 35mm film camera.', 1),
  ('Wireless keyboard', 'Mechanical, RGB backlight.', 1);

INSERT INTO auctions (item_id, starting_price, current_price, ends_at, status) VALUES
  (1, 50.00, 55.00, DATE_ADD(NOW(), INTERVAL 7 DAY), 'OPEN'),
  (2, 25.00, 25.00, DATE_ADD(NOW(), INTERVAL 3 DAY), 'OPEN');

INSERT INTO bids (auction_id, bidder_id, amount) VALUES
  (1, 2, 55.00);

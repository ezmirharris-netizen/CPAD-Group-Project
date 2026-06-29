-- ============================================================
--  SkillSwap — MySQL Database Schema
--  Run this script once to create all tables.
--  Compatible with MySQL 5.7+ and MariaDB 10.3+
-- ============================================================

CREATE DATABASE IF NOT EXISTS SkillSwap
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE SkillSwap;

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS User (
    id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    name          VARCHAR(150)     NOT NULL,
    email         VARCHAR(255)     NOT NULL UNIQUE,
    password_hash VARCHAR(255)     NOT NULL,
    faculty       VARCHAR(150)     NOT NULL DEFAULT '',
    photo_url     VARCHAR(500)     NOT NULL DEFAULT '',
    role          ENUM('admin','tutor','tutee') NOT NULL DEFAULT 'tutee',
    bio           TEXT,
    created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user_email (email),
    INDEX idx_user_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Skills ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Skill (
    id       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name     VARCHAR(100)  NOT NULL,
    category VARCHAR(100)  NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    INDEX idx_skill_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── UserSkill (Tutor ↔ Skill mapping) ──────────────────────
CREATE TABLE IF NOT EXISTS UserSkill (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED    NOT NULL,
    skill_id    INT UNSIGNED    NOT NULL,
    hourly_rate DECIMAL(8,2)   NOT NULL DEFAULT 0.00,
    level       ENUM('Beginner','Intermediate','Advanced','Expert') NOT NULL DEFAULT 'Intermediate',
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_skill (user_id, skill_id),
    CONSTRAINT fk_us_user  FOREIGN KEY (user_id)  REFERENCES User(id)  ON DELETE CASCADE,
    CONSTRAINT fk_us_skill FOREIGN KEY (skill_id) REFERENCES Skill(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Bookings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Booking (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    learner_id    INT UNSIGNED    NOT NULL,
    tutor_id      INT UNSIGNED    NOT NULL,
    skill_id      INT UNSIGNED    NOT NULL,
    schedule_time DATETIME        NOT NULL,
    status        ENUM('pending','accepted','declined','completed') NOT NULL DEFAULT 'pending',
    price         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_booking_learner (learner_id),
    INDEX idx_booking_tutor   (tutor_id),
    INDEX idx_booking_status  (status),
    CONSTRAINT fk_b_learner FOREIGN KEY (learner_id) REFERENCES User(id)  ON DELETE CASCADE,
    CONSTRAINT fk_b_tutor   FOREIGN KEY (tutor_id)   REFERENCES User(id)  ON DELETE CASCADE,
    CONSTRAINT fk_b_skill   FOREIGN KEY (skill_id)   REFERENCES Skill(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Review (
    id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    booking_id INT UNSIGNED  NOT NULL UNIQUE,
    rating     TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_r_booking FOREIGN KEY (booking_id) REFERENCES Booking(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Messages ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Message (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    sender_id   INT UNSIGNED  NOT NULL,
    receiver_id INT UNSIGNED  NOT NULL,
    body        TEXT          NOT NULL,
    sent_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_msg_sender   (sender_id),
    INDEX idx_msg_receiver (receiver_id),
    CONSTRAINT fk_m_sender   FOREIGN KEY (sender_id)   REFERENCES User(id) ON DELETE CASCADE,
    CONSTRAINT fk_m_receiver FOREIGN KEY (receiver_id) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

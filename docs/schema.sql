-- ============================================================
-- SkillSwap Database Schema (HeidiSQL / MariaDB Compatible)
-- This version drops the database first and uses automatic
-- foreign key names to avoid duplicate constraint errors.
-- ============================================================

-- NOTE: this script now runs against whichever database you already
-- have selected in HeidiSQL (e.g. Railway's default  database)
-- instead of forcing everything into a database called SkillSwap.
--
-- This file is safe to run over and over: it drops the tables
-- first (if they exist) and recreates + reseeds everything from
-- scratch. Just run this whole file whenever you want to reset
-- the database to a clean, working state.

-- ============================================================
-- DROP EXISTING TABLES (children first, respecting foreign keys)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `content_reports`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `user_skills`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `faculty` VARCHAR(150) NOT NULL DEFAULT '',
    `course` VARCHAR(150) NOT NULL DEFAULT '',
    `year` TINYINT UNSIGNED NULL DEFAULT NULL,
    `photo_url` VARCHAR(500) NOT NULL DEFAULT '',
    `role` ENUM('admin','tutor','tutee') NOT NULL DEFAULT 'tutee',
    `bio` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`),
    KEY `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SKILLS
-- ============================================================
CREATE TABLE `skills` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`),
    KEY `idx_skill_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- USER SKILLS
-- ============================================================
CREATE TABLE `user_skills` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `skill_id` INT UNSIGNED NOT NULL,
    `hourly_rate` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `level` ENUM('Beginner','Intermediate','Advanced','Expert')
        NOT NULL DEFAULT 'Intermediate',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_skill` (`user_id`, `skill_id`),

    FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`skill_id`)
        REFERENCES `skills` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE `bookings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `learner_id` INT UNSIGNED NOT NULL,
    `tutor_id` INT UNSIGNED NOT NULL,
    `skill_id` INT UNSIGNED NOT NULL,
    `schedule_time` DATETIME NOT NULL,
    `status` ENUM('pending','accepted','declined','completed')
        NOT NULL DEFAULT 'pending',
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),

    KEY `idx_booking_learner` (`learner_id`),
    KEY `idx_booking_tutor` (`tutor_id`),
    KEY `idx_booking_status` (`status`),

    FOREIGN KEY (`learner_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`tutor_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`skill_id`)
        REFERENCES `skills` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE `reviews` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `booking_id` INT UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_booking_review` (`booking_id`),

    FOREIGN KEY (`booking_id`)
        REFERENCES `bookings` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE `messages` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sender_id` INT UNSIGNED NOT NULL,
    `receiver_id` INT UNSIGNED NOT NULL,
    `body` TEXT NOT NULL,
    `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),

    KEY `idx_msg_sender` (`sender_id`),
    KEY `idx_msg_receiver` (`receiver_id`),

    FOREIGN KEY (`sender_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`receiver_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CONTENT MODERATION (reported content: messages, reviews, profiles, etc.)
-- ============================================================
CREATE TABLE `content_reports` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `content_type` ENUM('message','review','profile','session') NOT NULL,
    `content_id` INT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `reported_by` INT UNSIGNED NOT NULL,
    `reason` VARCHAR(255) NOT NULL DEFAULT '',
    `status` ENUM('pending','resolved','dismissed') NOT NULL DEFAULT 'pending',
    `resolved_by` INT UNSIGNED NULL,
    `resolved_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_report_status` (`status`),
    KEY `idx_report_content` (`content_type`, `content_id`),

    FOREIGN KEY (`reported_by`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,

    FOREIGN KEY (`resolved_by`)
        REFERENCES `users` (`id`)
        ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- AUDIT LOG (records every admin action for accountability)
-- ============================================================
CREATE TABLE `audit_log` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_id` INT UNSIGNED NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `target_type` VARCHAR(50) NOT NULL DEFAULT '',
    `target_id` INT UNSIGNED NULL,
    `details` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_audit_admin` (`admin_id`),
    KEY `idx_audit_created` (`created_at`),

    FOREIGN KEY (`admin_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAMPLE DATA
-- These match the demo accounts hardcoded in the frontend
-- (Frontend/src/stores/auth.js -> demo account switcher), so
-- logging in with them works immediately after running this
-- script — no separate /api/seed call needed.
--
--   admin@skillswap.com   / admin123     (admin)
--   sarah@skillswap.com   / 123456       (tutor)
--   tutor@skillswap.com   / 123456       (tutor)
--   demo@skillswap.com    / password123  (tutee)
--
-- Password hashes below are real bcrypt hashes (PASSWORD_BCRYPT
-- compatible) generated for the plaintext passwords above, so
-- password_verify() in AuthController will work out of the box.
-- ============================================================

INSERT INTO `users`
(`name`, `email`, `password_hash`, `faculty`, `course`, `year`,
 `photo_url`, `role`, `bio`)
VALUES
('System Admin','admin@skillswap.com',
'$2y$12$JNP9XRU9oOeYVHdyJfAg8OVqlUAoq6eD9AWfZH0wKbg2K9vezOcN2',
'Administration','',NULL,'','admin',
'Platform administrator.'),

('Sarah Lim','sarah@skillswap.com',
'$2y$12$VqVnYW7HEVkpfJcAy.ZjbO.sCYOOmZtYfaYpYerxv.atxVLZkM7Jm',
'Faculty of Computing','Software Engineering',4,'','tutor',
'Passionate Vue.js & web dev tutor with 3 years experience.'),

('Jason Tan','jason@skillswap.com',
'$2y$12$HLQGo/9VCPDaDiRwiXpjBuMOtaO7oYOmZ8HBcaCnRuUqyKa9Rm2Y.',
'Faculty of Engineering','Mechanical Engineering',3,'','tutor',
'Mathematics tutor specialising in calculus and linear algebra.'),

('Nur Aina','nuraina@skillswap.com',
'$2y$12$HLQGo/9VCPDaDiRwiXpjBuMOtaO7oYOmZ8HBcaCnRuUqyKa9Rm2Y.',
'Faculty of Science','Biochemistry',3,'','tutor',
'Chemistry and biology tutor, love making science fun.'),

('Alicia Wong','alicia@skillswap.com',
'$2y$12$HLQGo/9VCPDaDiRwiXpjBuMOtaO7oYOmZ8HBcaCnRuUqyKa9Rm2Y.',
'Faculty of Business','Accounting & Finance',4,'','tutor',
'Accounting & finance tutor helping students ace their exams.'),

('John Tutor','tutor@skillswap.com',
'$2y$12$qIb.q1aSytWoDh5AIH2KnOfvy8jPajWSNnXiuBxLz7AtUONeTX1KW',
'Faculty of Computing','Computer Science',4,'','tutor',
'Full-stack developer teaching Java, Python and Data Structures.'),

('Demo Student','demo@skillswap.com',
'$2y$12$HLQGo/9VCPDaDiRwiXpjBuMOtaO7oYOmZ8HBcaCnRuUqyKa9Rm2Y.',
'Faculty of Computing','Computer Science',2,'','tutee',
NULL),

('Ali Ahmad','ali@skillswap.com',
'$2y$12$HLQGo/9VCPDaDiRwiXpjBuMOtaO7oYOmZ8HBcaCnRuUqyKa9Rm2Y.',
'Faculty of Engineering','Civil Engineering',1,'','tutee',
NULL),

('Priya Nair','priya@skillswap.com',
'$2y$12$HLQGo/9VCPDaDiRwiXpjBuMOtaO7oYOmZ8HBcaCnRuUqyKa9Rm2Y.',
'Faculty of Science','Biology',2,'','tutee',
NULL);

INSERT INTO `skills` (`name`, `category`) VALUES
('Vue.js','Web Development'),
('React.js','Web Development'),
('Mathematics','Science'),
('Chemistry','Science'),
('Accounting','Business'),
('Java','Programming'),
('Python','Programming'),
('Data Structures','Programming'),
('Database Design','Computing'),
('Linear Algebra','Mathematics');

INSERT INTO `user_skills`
(`user_id`,`skill_id`,`hourly_rate`,`level`)
VALUES
(2,1,40.00,'Advanced'),
(2,2,40.00,'Advanced'),
(3,3,35.00,'Advanced'),
(3,10,35.00,'Advanced'),
(4,4,50.00,'Expert'),
(5,5,60.00,'Expert'),
(6,6,35.00,'Advanced'),
(6,7,35.00,'Advanced'),
(6,8,35.00,'Advanced'),
(6,9,35.00,'Advanced');

INSERT INTO `bookings`
(`learner_id`,`tutor_id`,`skill_id`,
`schedule_time`,`status`,`price`)
VALUES
(7,2,1,'2026-06-25 20:00:00','accepted',80.00),
(7,3,3,'2026-06-28 19:00:00','completed',70.00),
(7,6,6,'2026-06-30 21:00:00','pending',70.00),
(8,4,4,'2026-06-26 18:00:00','accepted',100.00),
(9,5,5,'2026-06-27 15:00:00','completed',120.00);

INSERT INTO `reviews`
(`booking_id`,`rating`,`comment`)
VALUES
(2,5,'Jason explained calculus so clearly. Highly recommend!'),
(5,5,'Alicia is an excellent accounting tutor. Very patient.');

INSERT INTO `messages`
(`sender_id`,`receiver_id`,`body`,`sent_at`)
VALUES
(7,2,'Hi Sarah! Is your Vue.js session still available?','2026-07-01 09:00:00'),
(2,7,'Yes! I have slots on Thursday 8PM. Does that work?','2026-07-01 09:05:00'),
(7,2,'Perfect, I will book that slot. Thanks!','2026-07-01 09:07:00'),
(7,6,'Hello John, I need help with Data Structures for my exam.','2026-07-01 10:00:00'),
(6,7,'Sure! I can help. When are you free?','2026-07-01 10:05:00'),
(7,6,'How about this Friday at 9PM?','2026-07-01 10:07:00');

INSERT INTO `content_reports`
(`content_type`,`content_id`,`title`,`reported_by`,`reason`,`status`)
VALUES
('message',1,'Inappropriate language in chat',8,'Used offensive language towards a tutor.','pending'),
('review',1,'Suspicious 5-star review',7,'Possible fake review, no real session took place.','pending'),
('profile',4,'Misleading bio claims',9,'Profile claims credentials that cannot be verified.','resolved');

INSERT INTO `audit_log`
(`admin_id`,`action`,`target_type`,`target_id`,`details`)
VALUES
(1,'User Suspended','user',7,'Suspended after repeated content report.'),
(1,'Report Resolved','content_report',3,'Reviewed bio claim, tutor provided certificate.'),
(1,'Tutor Approved','user',2,'Approved Sarah Lim as a tutor after document check.');
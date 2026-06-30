-- ============================================================
-- SkillSwap Database Schema (HeidiSQL / MariaDB Compatible)
-- This version drops the database first and uses automatic
-- foreign key names to avoid duplicate constraint errors.
-- ============================================================

DROP DATABASE IF EXISTS `SkillSwap`;

CREATE DATABASE `SkillSwap`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `SkillSwap`;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `faculty` VARCHAR(150) NOT NULL DEFAULT '',
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
-- ============================================================

INSERT INTO `users`
(`name`, `email`, `password_hash`, `faculty`,
 `photo_url`, `role`, `bio`)
VALUES
('Aisha Rahman','aisha.rahman@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000001',
'Faculty of Computer Science',
'https://example.com/photos/aisha.jpg',
'admin',
'Platform administrator and CS lecturer.'),

('Daniel Lim','daniel.lim@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000002',
'Faculty of Computer Science',
'https://example.com/photos/daniel.jpg',
'tutor',
'Final-year CS student specializing in web development.'),

('Priya Nair','priya.nair@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000003',
'Faculty of Mathematics',
'https://example.com/photos/priya.jpg',
'tutor',
'Math tutor with a passion for calculus and statistics.'),

('Wei Cheng','wei.cheng@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000004',
'Faculty of Languages',
'https://example.com/photos/wei.jpg',
'tutor',
'Native Mandarin speaker offering conversational practice.'),

('Sofia Hernandez','sofia.hernandez@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000005',
'Faculty of Fine Arts',
'https://example.com/photos/sofia.jpg',
'tutor',
'Guitar and music theory tutor, 5 years teaching experience.'),

('Marcus Tan','marcus.tan@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000006',
'Faculty of Computer Science',
'',
'tutee',
'Learning to code, interested in frontend development.'),

('Nur Aina','nur.aina@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000007',
'Faculty of Business',
'',
'tutee',
'Looking to improve my public speaking and Spanish.'),

('James O''Brien','james.obrien@example.edu',
'$2y$10$placeholderhash000000000000000000000000000000000008',
'Faculty of Engineering',
'',
'tutee',
'Want to pick up guitar as a hobby.');

INSERT INTO `skills` (`name`, `category`) VALUES
('Web Development','Technology'),
('Python Programming','Technology'),
('Calculus','Mathematics'),
('Statistics','Mathematics'),
('Mandarin Conversation','Language'),
('Spanish Conversation','Language'),
('Guitar Lessons','Music'),
('Music Theory','Music');

INSERT INTO `user_skills`
(`user_id`,`skill_id`,`hourly_rate`,`level`)
VALUES
(2,1,25.00,'Advanced'),
(2,2,20.00,'Intermediate'),
(3,3,18.00,'Expert'),
(3,4,18.00,'Advanced'),
(4,5,15.00,'Expert'),
(5,7,22.00,'Advanced'),
(5,8,20.00,'Intermediate');

INSERT INTO `bookings`
(`learner_id`,`tutor_id`,`skill_id`,
`schedule_time`,`status`,`price`)
VALUES
(6,2,1,'2026-07-05 14:00:00','accepted',25.00),
(7,4,5,'2026-07-06 10:00:00','completed',15.00),
(8,5,7,'2026-07-08 16:30:00','pending',22.00),
(6,3,3,'2026-06-20 09:00:00','completed',18.00),
(7,3,4,'2026-06-15 11:00:00','declined',18.00);

INSERT INTO `reviews`
(`booking_id`,`rating`,`comment`)
VALUES
(2,5,'Wei was patient and made conversational practice fun and easy to follow.'),
(4,4,'Priya explained calculus concepts clearly, would book again.');

INSERT INTO `messages`
(`sender_id`,`receiver_id`,`body`,`sent_at`)
VALUES
(6,2,'Hi Daniel, is the 2pm slot on Friday still available for the web dev session?','2026-07-01 09:15:00'),
(2,6,'Yes, that works for me. See you then!','2026-07-01 09:20:00'),
(7,4,'Thank you for the great Mandarin session yesterday!','2026-07-07 08:00:00'),
(8,5,'Hi Sofia, looking forward to my first guitar lesson next week.','2026-07-02 19:45:00');

INSERT INTO `content_reports`
(`content_type`,`content_id`,`title`,`reported_by`,`reason`,`status`)
VALUES
('message',3,'Inappropriate language in chat',6,'Used offensive language towards tutor','pending'),
('review',1,'Suspicious 5-star review','7','Possible fake review, no real session took place','pending'),
('profile',4,'Misleading bio claims',8,'Tutor bio claims credentials that cannot be verified','resolved');

INSERT INTO `audit_log`
(`admin_id`,`action`,`target_type`,`target_id`,`details`)
VALUES
(1,'User Suspended','user',6,'Suspended after repeated content report.'),
(1,'Report Resolved','content_report',3,'Reviewed bio claim, tutor provided certificate, marked resolved.'),
(1,'Tutor Approved','user',4,'Approved Wei Cheng as a tutor after document check.');
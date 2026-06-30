-- ============================================================
-- SkillSwap: Clear placeholder data before re-seeding
-- Run this against the SkillSwap database, then visit
-- http://localhost:5000/api/seed in your browser.
-- ============================================================
USE `SkillSwap`;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `audit_log`;
TRUNCATE TABLE `content_reports`;
TRUNCATE TABLE `messages`;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `user_skills`;
TRUNCATE TABLE `skills`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

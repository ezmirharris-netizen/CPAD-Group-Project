-- ============================================================
-- Migration: add `course` and `year` to `users`
-- Safe to run against an EXISTING SkillSwap database — it does
-- NOT drop any data (unlike schema.sql, which recreates the DB
-- from scratch). Run this once if your database was created
-- before these columns were added.
-- ============================================================

USE `SkillSwap`;

ALTER TABLE `users`
    ADD COLUMN `course` VARCHAR(150) NOT NULL DEFAULT '' AFTER `faculty`,
    ADD COLUMN `year` TINYINT UNSIGNED NULL DEFAULT NULL AFTER `course`;

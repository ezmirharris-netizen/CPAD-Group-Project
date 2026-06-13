CREATE DATABASE IF NOT EXISTS SkillSwap
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE SkillSwap;

DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Skill;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS UserSkill;
DROP TABLE IF EXISTS Message;

CREATE TABLE User(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    faculty VARCHAR(200) NOT NULL,
    photo_url VARCHAR(200) NOT NULL,
    bio TEXT
) ENGINE=InnoDB;

CREATE TABLE Booking(
    id INT AUTO_INCREMENT PRIMARY KEY,
    learner_id INT NOT NULL,
    tutor_id INT NOT NULL,
    skill_id INT NOT NULL,
    schedule_time DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',

    CONSTRAINT fk_User_Learner_Booking
    FOREIGN KEY (learner_id) REFERENCES User(id)
    ON DELETE CASCADE,

    CONSTRAINT fK_User_Tutor_Booking
    FOREIGN KEY (tutor_id) REFERENCES User(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_Skill_Booking
    FOREIGN KEY (skill_id) REFERENCES Skill(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Skill(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Review(
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT;
    created_at DATETIME NOT NULL

    CONSTRAINT fk_Review_Booking
    FOREIGN KEY (booking_id) REFERENCES Booking(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE UserSkill(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    hourly_rate INT NOT NULL,
    level VARCHAR(100) NOT NULL

    CONSTRAINT fk_User_UserSkill
    FOREIGN KEY (user_id) REFERENCES User(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_Skill_UserSkill
    FOREIGN KEY (skill_id) REFERENCES Skill(id)
) ENGINE=InnoDB;

CREATE TABLE Message(
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    body TEXT,
    sent_at DATETIME NOT NULL

    CONSTRAINT fk_MessagesSender_User
    FOREIGN KEY (sender_id) REFERENCES User(id);
    ON DELETE CASCADE,

    CONSTRAINT fk_MessageReceiver_User
    FOREIGN KEY (receiver_id) REFERENCES User(id);
    ON DELETE CASCADE
) ENGINE=InnoDB;

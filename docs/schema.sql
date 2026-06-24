CREATE DATABASE IF NOT EXISTS SkillSwap
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE SkillSwap;

DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS UserSkill;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Skill;
DROP TABLE IF EXISTS User;

CREATE TABLE User(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    faculty VARCHAR(200) NOT NULL,
    photo_url VARCHAR(200) NOT NULL,
    role VARCHAR(100) NOT NULL,
    bio TEXT
) ENGINE=InnoDB;

CREATE TABLE Skill(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL
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

CREATE TABLE Review(
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,                     -- Fixed: changed ; to ,
    created_at DATETIME NOT NULL,     -- Fixed: added missing comma

    CONSTRAINT fk_Review_Booking
    FOREIGN KEY (booking_id) REFERENCES Booking(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE UserSkill(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    hourly_rate INT NOT NULL,
    level VARCHAR(100) NOT NULL,      -- Fixed: added missing comma

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
    sent_at DATETIME NOT NULL,        -- Fixed: added missing comma

    CONSTRAINT fk_MessagesSender_User
    FOREIGN KEY (sender_id) REFERENCES User(id) ON DELETE CASCADE, -- Fixed: removed stray ;

    CONSTRAINT fk_MessageReceiver_User
    FOREIGN KEY (receiver_id) REFERENCES User(id) ON DELETE CASCADE  -- Fixed: removed stray ;
) ENGINE=InnoDB;

INSERT INTO User (name, email, password_hash, faculty, photo_url, role, bio) VALUES
('Alice Smith', 'alice.smith@university.edu', '<Paste Password Hash Here', 'Faculty of Science', 'https://example.com/photos/alice.jpg', 'Student', 'Undergraduate physics major passionate about quantum computing and astrophysics.'),
('Dr. Robert Chen', 'robert.chen@university.edu', '<Paste Password Hash Here', 'Faculty of Engineering', 'https://example.com/photos/rchen.jpg', 'Professor', 'Associate Professor of Computer Science specializing in Machine Learning and Robotics.'),
('Sarah Jenkins', 'sarah.j@university.edu', '<Paste Password Hash Here', 'Faculty of Arts', 'https://example.com/photos/sarahj.jpg', 'Student', 'Digital Media student, freelance graphic designer, and coffee enthusiast.'),
('Michael Chang', 'm.chang@university.edu', '<Paste Password Hash Here', 'Faculty of Business', 'https://example.com/photos/mchang.jpg', 'Student', 'MBA candidate focusing on fintech startups and venture capital.'),
('Dr. Emily Taylor', 'emily.taylor@university.edu', '<Paste Password Hash Here', 'Faculty of Medicine', 'https://example.com/photos/etaylor.jpg', 'Professor', 'Lead researcher at the Biomedical Imaging Lab with 10+ years of clinical experience.'),
('Admin Tech', 'admin.portal@university.edu', '<Paste Password Hash Here', 'Information Technology', 'https://example.com/photos/admin.jpg', 'Administrator', 'System administrator for the student portal. Contact for technical support issues.');

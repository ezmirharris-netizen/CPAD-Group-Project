<?php

namespace App\Data;

use PDO;

/**
 * SeedData — populates the database with demo users, skills, bookings,
 * reviews, and messages for development and testing.
 *
 * Usage (from a route or CLI script):
 *   $seeder = new SeedData($pdo);
 *   $seeder->run();
 */
final class SeedData
{
    public function __construct(private PDO $pdo) {}

    /**
     * Run the full seed. Returns a summary array.
     * Safe to call multiple times — checks if data exists first.
     */
    public function run(): array
    {
        $count = (int) $this->pdo->query('SELECT COUNT(*) FROM "User"')->fetchColumn();
        if ($count > 0) {
            return ['message' => 'Already seeded', 'users' => $count];
        }

        $hash123   = password_hash('password123', PASSWORD_DEFAULT);
        $hashAdmin = password_hash('admin123',     PASSWORD_DEFAULT);
        $hash456   = password_hash('123456',        PASSWORD_DEFAULT);

        // ── Users ──────────────────────────────────────────────
        $insertUser = $this->pdo->prepare(
            'INSERT INTO "User" (name, email, password_hash, faculty, photo_url, role, bio) VALUES (?,?,?,?,?,?,?)'
        );
        $users = [
            ['System Admin',  'admin@skillswap.com',   $hashAdmin, 'Administration',         '', 'admin', 'Platform administrator.'],
            ['Sarah Lim',     'sarah@skillswap.com',   $hash456,   'Faculty of Computing',   '', 'tutor', 'Passionate Vue.js & web dev tutor with 3 years experience.'],
            ['Jason Tan',     'jason@skillswap.com',   $hash123,   'Faculty of Engineering', '', 'tutor', 'Mathematics tutor specialising in calculus and linear algebra.'],
            ['Nur Aina',      'nuraina@skillswap.com', $hash123,   'Faculty of Science',     '', 'tutor', 'Chemistry and biology tutor, love making science fun.'],
            ['Alicia Wong',   'alicia@skillswap.com',  $hash123,   'Faculty of Business',    '', 'tutor', 'Accounting & finance tutor helping students ace their exams.'],
            ['John Tutor',    'tutor@skillswap.com',   $hash456,   'Faculty of Computing',   '', 'tutor', 'Full-stack developer teaching Java, Python and Data Structures.'],
            ['Demo Student',  'demo@skillswap.com',    $hash123,   'Faculty of Computing',   '', 'tutee', null],
            ['Ali Ahmad',     'ali@skillswap.com',     $hash123,   'Faculty of Engineering', '', 'tutee', null],
            ['Priya Nair',    'priya@skillswap.com',   $hash123,   'Faculty of Science',     '', 'tutee', null],
        ];
        foreach ($users as $u) $insertUser->execute($u);

        // ── Skills ─────────────────────────────────────────────
        $insertSkill = $this->pdo->prepare('INSERT INTO "Skill" (name, category) VALUES (?,?)');
        $skills = [
            ['Vue.js',          'Web Development'],
            ['React.js',        'Web Development'],
            ['Mathematics',     'Science'],
            ['Chemistry',       'Science'],
            ['Accounting',      'Business'],
            ['Java',            'Programming'],
            ['Python',          'Programming'],
            ['Data Structures', 'Programming'],
            ['Database Design', 'Computing'],
            ['Linear Algebra',  'Mathematics'],
        ];
        foreach ($skills as $s) $insertSkill->execute($s);

        // ── UserSkills ─────────────────────────────────────────
        $insertUS = $this->pdo->prepare(
            'INSERT INTO "UserSkill" (user_id, skill_id, hourly_rate, level) VALUES (?,?,?,?)'
        );
        $userSkills = [
            [2, 1, 40, 'Advanced'], [2, 2, 40, 'Advanced'],
            [3, 3, 35, 'Advanced'], [3, 10, 35, 'Advanced'],
            [4, 4, 50, 'Expert'],
            [5, 5, 60, 'Expert'],
            [6, 6, 35, 'Advanced'], [6, 7, 35, 'Advanced'],
            [6, 8, 35, 'Advanced'], [6, 9, 35, 'Advanced'],
        ];
        foreach ($userSkills as $us) $insertUS->execute($us);

        // ── Bookings ───────────────────────────────────────────
        $insertB = $this->pdo->prepare(
            'INSERT INTO "Booking" (learner_id, tutor_id, skill_id, schedule_time, status, price) VALUES (?,?,?,?,?,?)'
        );
        $bookings = [
            [7, 2, 1, '2026-06-25 20:00:00', 'accepted',  80.00],
            [7, 3, 3, '2026-06-28 19:00:00', 'completed', 70.00],
            [7, 6, 6, '2026-06-30 21:00:00', 'pending',   70.00],
            [8, 4, 4, '2026-06-26 18:00:00', 'accepted',  100.00],
            [9, 5, 5, '2026-06-27 15:00:00', 'completed', 120.00],
        ];
        foreach ($bookings as $b) $insertB->execute($b);

        // ── Reviews ────────────────────────────────────────────
        $insertR = $this->pdo->prepare(
            'INSERT INTO "Review" (booking_id, rating, comment, created_at) VALUES (?,?,?,NOW())'
        );
        $reviews = [
            [2, 5, 'Jason explained calculus so clearly. Highly recommend!'],
            [5, 5, 'Alicia is an excellent accounting tutor. Very patient.'],
        ];
        foreach ($reviews as $r) $insertR->execute($r);

        // ── Messages ───────────────────────────────────────────
        $insertM = $this->pdo->prepare(
            'INSERT INTO "Message" (sender_id, receiver_id, body, sent_at) VALUES (?,?,?,NOW())'
        );
        $messages = [
            [7, 2, 'Hi Sarah! Is your Vue.js session still available?'],
            [2, 7, 'Yes! I have slots on Thursday 8PM. Does that work?'],
            [7, 2, 'Perfect, I will book that slot. Thanks!'],
            [7, 6, 'Hello John, I need help with Data Structures for my exam.'],
            [6, 7, 'Sure! I can help. When are you free?'],
            [7, 6, 'How about this Friday at 9PM?'],
        ];
        foreach ($messages as $m) $insertM->execute($m);

        return ['message' => 'Seed completed successfully!', 'users' => count($users)];
    }
}

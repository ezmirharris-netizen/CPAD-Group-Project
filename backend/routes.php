<?php

use Slim\App;
use App\Config\Database;
use App\Models\UserModels;
use App\Models\SkillModels;
use App\Models\BookingModels;
use App\Models\ReviewModels;
use App\Controllers\AuthController;
use App\Controllers\TutorController;
use App\Controllers\BookingController;
use App\Controllers\ReviewController;
use App\Middleware\JwtAuthMiddleware;

return function(App $app) {

    $pdo = Database::get();
    $settings = require __DIR__ . '/config/settings.php';

    $userModel    = new UserModels($pdo);
    $skillModel   = new SkillModels($pdo);
    $bookingModel = new BookingModels($pdo);
    $reviewModel  = new ReviewModels($pdo);

    $authController    = new AuthController($userModel, $settings['jwt_secret']);
    $tutorController   = new TutorController($userModel, $skillModel);
    $bookingController = new BookingController($bookingModel);
    $reviewController  = new ReviewController($reviewModel);

    // ─── AUTH ────────────────────────────────────────────
    $app->post('/api/register', [$authController, 'register']);
    $app->post('/api/login',    [$authController, 'login']);

    // ─── PROFILE ─────────────────────────────────────────
    $app->get('/api/profile', function($request, $response) {
        $user = $request->getAttribute('user');
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    $app->put('/api/profile', [$authController, 'updateProfile'])->add(new JwtAuthMiddleware());

    // ─── TUTORS ──────────────────────────────────────────
    $app->get('/api/tutors',          [$tutorController, 'getAllTutors']);
    $app->get('/api/tutors/search',   [$tutorController, 'searchTutor']);
    $app->get('/api/tutors/{id}/reviews', [$reviewController, 'getTutorReviews']);

    // ─── BOOKINGS ────────────────────────────────────────
    $app->post('/api/bookings',              [$bookingController, 'createBooking'])->add(new JwtAuthMiddleware());
    $app->get('/api/bookings',               [$bookingController, 'getBookings'])->add(new JwtAuthMiddleware());
    $app->patch('/api/bookings/{id}/status', [$bookingController, 'updateStatus'])->add(new JwtAuthMiddleware());
    $app->delete('/api/bookings/{id}',       [$bookingController, 'cancelBooking'])->add(new JwtAuthMiddleware());

    // ─── REVIEWS ─────────────────────────────────────────
    $app->post('/api/reviews', [$reviewController, 'createReview'])->add(new JwtAuthMiddleware());

    // ─── MESSAGES / CHAT ─────────────────────────────────
    $app->get('/api/messages/conversations', function($request, $response) use ($userModel) {
        $user = $request->getAttribute('user');
        $conversations = $userModel->getConversations((int)$user['id']);
        $response->getBody()->write(json_encode($conversations));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    $app->get('/api/messages/{userId}', function($request, $response, $args) use ($userModel) {
        $me = $request->getAttribute('user');
        $messages = $userModel->getMessages((int)$me['id'], (int)$args['userId']);
        $response->getBody()->write(json_encode($messages));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    $app->post('/api/messages', function($request, $response) use ($userModel) {
        $me   = $request->getAttribute('user');
        $data = $request->getParsedBody();
        $id   = $userModel->sendMessage((int)$me['id'], (int)$data['receiver_id'], $data['body']);
        $response->getBody()->write(json_encode(['id' => $id]));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    // ─── SEED (one-time demo data setup) ─────────────────
    $app->get('/api/seed', function($request, $response) use ($pdo) {
        // Only seed if no users exist
        $count = $pdo->query('SELECT COUNT(*) FROM User')->fetchColumn();
        if ((int)$count > 0) {
            $response->getBody()->write(json_encode(['message' => 'Already seeded', 'users' => (int)$count]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $hash123    = password_hash('password123', PASSWORD_DEFAULT);
        $hashAdmin  = password_hash('admin123',    PASSWORD_DEFAULT);
        $hash456    = password_hash('123456',       PASSWORD_DEFAULT);

        // Insert users
        $insertUser = $pdo->prepare(
            'INSERT INTO User (name, email, password_hash, faculty, photo_url, role, bio) VALUES (?,?,?,?,?,?,?)'
        );

        $users = [
            ['System Admin',   'admin@skillswap.com',   $hashAdmin, 'Administration',           '', 'admin',  'Platform administrator.'],
            ['Sarah Lim',      'sarah@skillswap.com',   $hash456,   'Faculty of Computing',      '', 'tutor',  'Passionate Vue.js & web dev tutor with 3 years experience.'],
            ['Jason Tan',      'jason@skillswap.com',   $hash123,   'Faculty of Engineering',    '', 'tutor',  'Mathematics tutor specialising in calculus and linear algebra.'],
            ['Nur Aina',       'nuraina@skillswap.com', $hash123,   'Faculty of Science',        '', 'tutor',  'Chemistry and biology tutor, love making science fun.'],
            ['Alicia Wong',    'alicia@skillswap.com',  $hash123,   'Faculty of Business',       '', 'tutor',  'Accounting & finance tutor helping students ace their exams.'],
            ['John Tutor',     'tutor@skillswap.com',   $hash456,   'Faculty of Computing',      '', 'tutor',  'Full-stack developer teaching Java, Python and Data Structures.'],
            ['Demo Student',   'demo@skillswap.com',    $hash123,   'Faculty of Computing',      '', 'tutee',  null],
            ['Ali Ahmad',      'ali@skillswap.com',     $hash123,   'Faculty of Engineering',    '', 'tutee',  null],
            ['Priya Nair',     'priya@skillswap.com',   $hash123,   'Faculty of Science',        '', 'tutee',  null],
        ];
        foreach ($users as $u) {
            $insertUser->execute($u);
        }

        // Insert skills
        $insertSkill = $pdo->prepare('INSERT INTO Skill (name, category) VALUES (?,?)');
        $skills = [
            ['Vue.js',             'Web Development'],
            ['React.js',           'Web Development'],
            ['Mathematics',        'Science'],
            ['Chemistry',          'Science'],
            ['Accounting',         'Business'],
            ['Java',               'Programming'],
            ['Python',             'Programming'],
            ['Data Structures',    'Programming'],
            ['Database Design',    'Computing'],
            ['Linear Algebra',     'Mathematics'],
        ];
        foreach ($skills as $s) {
            $insertSkill->execute($s);
        }

        // UserSkills (tutor id => [skill_id, rate, level])
        $insertUS = $pdo->prepare('INSERT INTO UserSkill (user_id, skill_id, hourly_rate, level) VALUES (?,?,?,?)');
        $userSkills = [
            [2, 1, 40, 'Advanced'],    // Sarah → Vue.js
            [2, 2, 40, 'Advanced'],    // Sarah → React.js
            [3, 3, 35, 'Advanced'],    // Jason → Mathematics
            [3, 10, 35, 'Advanced'],   // Jason → Linear Algebra
            [4, 4, 50, 'Expert'],      // Nur Aina → Chemistry
            [5, 5, 60, 'Expert'],      // Alicia → Accounting
            [6, 6, 35, 'Advanced'],    // John → Java
            [6, 7, 35, 'Advanced'],    // John → Python
            [6, 8, 35, 'Advanced'],    // John → Data Structures
            [6, 9, 35, 'Advanced'],    // John → Database Design
        ];
        foreach ($userSkills as $us) {
            $insertUS->execute($us);
        }

        // Bookings (learner 7 = Demo Student, 8 = Ali, 9 = Priya)
        $insertB = $pdo->prepare(
            'INSERT INTO Booking (learner_id, tutor_id, skill_id, schedule_time, status, price) VALUES (?,?,?,?,?,?)'
        );
        $bookings = [
            [7, 2, 1, '2026-06-25 20:00:00', 'accepted',  80.00],
            [7, 3, 3, '2026-06-28 19:00:00', 'completed', 70.00],
            [7, 6, 6, '2026-06-30 21:00:00', 'pending',   70.00],
            [8, 4, 4, '2026-06-26 18:00:00', 'accepted',  100.00],
            [9, 5, 5, '2026-06-27 15:00:00', 'completed', 120.00],
        ];
        foreach ($bookings as $b) {
            $insertB->execute($b);
        }

        // Reviews for completed bookings (booking id 2 and 5)
        $insertR = $pdo->prepare('INSERT INTO Review (booking_id, rating, comment, created_at) VALUES (?,?,?,NOW())');
        $reviews = [
            [2, 5, 'Jason explained calculus so clearly. Highly recommend!'],
            [5, 5, 'Alicia is an excellent accounting tutor. Very patient.'],
        ];
        foreach ($reviews as $r) {
            $insertR->execute($r);
        }

        // Messages
        $insertM = $pdo->prepare('INSERT INTO Message (sender_id, receiver_id, body, sent_at) VALUES (?,?,?,NOW())');
        $messages = [
            [7, 2, 'Hi Sarah! Is your Vue.js session still available?'],
            [2, 7, 'Yes! I have slots on Thursday 8PM. Does that work?'],
            [7, 2, 'Perfect, I will book that slot. Thanks!'],
            [7, 6, 'Hello John, I need help with Data Structures for my exam.'],
            [6, 7, 'Sure! I can help. When are you free?'],
            [7, 6, 'How about this Friday at 9PM?'],
        ];
        foreach ($messages as $m) {
            $insertM->execute($m);
        }

        $response->getBody()->write(json_encode(['message' => 'Seed completed successfully!']));
        return $response->withHeader('Content-Type', 'application/json');
    });
};

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

    // Skills currently on the authenticated user's own profile (used to
    // repopulate the Profile page after a refresh/re-login — previously
    // nothing read this back, so added skills only appeared until the
    // next page load even though they were saved to user_skills).
    $app->get('/api/profile/skills', function($request, $response) use ($skillModel) {
        $user = $request->getAttribute('user');
        $response->getBody()->write(json_encode($skillModel->getUserSkills((int)$user['id'])));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    // ─── SKILLS ──────────────────────────────────────────
    // List all skills (for dropdowns / discovery)
    $app->get('/api/skills', function($request, $response) use ($skillModel) {
        $response->getBody()->write(json_encode($skillModel->findAll()));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Add a skill to the authenticated user's profile.
    // Body: { name, category, hourly_rate?, level? }
    // Creates the skill in the skills table if it doesn't exist yet,
    // then inserts/updates the user_skills join row.
    $app->post('/api/skills', function($request, $response) use ($skillModel) {
        $user = $request->getAttribute('user');
        $data = $request->getParsedBody();

        $name     = trim($data['name']     ?? '');
        $category = trim($data['category'] ?? '');

        if ($name === '') {
            $response->getBody()->write(json_encode(['error' => 'Skill name is required']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Upsert into skills table
        $skill = $skillModel->findOrCreate($name, $category);

        // Upsert into user_skills join table
        $hourlyRate = isset($data['hourly_rate']) ? (float)$data['hourly_rate'] : 0.00;
        $level      = $data['level'] ?? 'Intermediate';
        $userSkillId = $skillModel->addUserSkill((int)$user['id'], (int)$skill['id'], $hourlyRate, $level);

        $response->getBody()->write(json_encode([
            'message'      => 'Skill added to profile',
            'skill'        => $skill,
            'user_skill_id'=> $userSkillId,
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    })->add(new JwtAuthMiddleware());

    // Remove a skill from the authenticated user's profile
    $app->delete('/api/skills/{skillId}', function($request, $response, $args) use ($skillModel) {
        $user = $request->getAttribute('user');
        $skillModel->removeUserSkill((int)$user['id'], (int)$args['skillId']);
        $response->getBody()->write(json_encode(['message' => 'Skill removed from profile']));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

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

    // ─── ADMIN ───────────────────────────────────────────
    $app->get('/api/admin/users', function($request, $response) use ($pdo) {
        $user = $request->getAttribute('user');
        if ($user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Forbidden']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }
        $rows = $pdo->query('SELECT id, name, email, role, faculty, created_at FROM `users` ORDER BY id')->fetchAll();
        $response->getBody()->write(json_encode($rows));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    $app->patch('/api/admin/users/{id}/status', function($request, $response, $args) use ($pdo) {
        $user = $request->getAttribute('user');
        if ($user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Forbidden']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }
        $data   = $request->getParsedBody();
        $action = $data['action'] ?? '';
        if ($action === 'suspend') {
            $pdo->prepare('UPDATE `users` SET role = role WHERE id = ?')->execute([$args['id']]);
            // We track suspension in a separate flag — for now mark in bio
        }
        $pdo->prepare('INSERT INTO `audit_log` (admin_id, action, target_type, target_id, details) VALUES (?,?,?,?,?)')
            ->execute([
                (int)$user['id'],
                $action === 'suspend' ? 'User Suspended' : 'User Activated',
                'user',
                (int)$args['id'],
                'Status changed via admin panel.'
            ]);
        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    // ─── ADMIN: CONTENT MODERATION ────────────────────────
    $app->get('/api/admin/reports', function($request, $response) use ($pdo) {
        $user = $request->getAttribute('user');
        if ($user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Forbidden']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }
        $rows = $pdo->query(
            'SELECT cr.id, cr.content_type, cr.content_id, cr.title, cr.reason, cr.status,
                    cr.created_at, u.name AS reportedBy
             FROM `content_reports` cr
             JOIN `users` u ON u.id = cr.reported_by
             ORDER BY cr.created_at DESC'
        )->fetchAll();
        $response->getBody()->write(json_encode($rows));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    $app->patch('/api/admin/reports/{id}/resolve', function($request, $response, $args) use ($pdo) {
        $user = $request->getAttribute('user');
        if ($user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Forbidden']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }
        $pdo->prepare('UPDATE `content_reports` SET status = "resolved", resolved_by = ?, resolved_at = NOW() WHERE id = ?')
            ->execute([(int)$user['id'], $args['id']]);

        $titleRow = $pdo->prepare('SELECT title FROM `content_reports` WHERE id = ?');
        $titleRow->execute([$args['id']]);
        $title = $titleRow->fetchColumn() ?: ('#' . $args['id']);

        $pdo->prepare('INSERT INTO `audit_log` (admin_id, action, target_type, target_id, details) VALUES (?,?,?,?,?)')
            ->execute([(int)$user['id'], 'Report Resolved', 'content_report', (int)$args['id'], "Resolved report: {$title}"]);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    // ─── ADMIN: AUDIT LOG ──────────────────────────────────
    $app->get('/api/admin/logs', function($request, $response) use ($pdo) {
        $user = $request->getAttribute('user');
        if ($user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Forbidden']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }
        $rows = $pdo->query(
            'SELECT al.id, al.action, al.target_type, al.target_id, al.details, al.created_at AS date,
                    u.name AS admin
             FROM `audit_log` al
             JOIN `users` u ON u.id = al.admin_id
             ORDER BY al.created_at DESC'
        )->fetchAll();
        $response->getBody()->write(json_encode($rows));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());

    $app->post('/api/admin/logs', function($request, $response) use ($pdo) {
        $user = $request->getAttribute('user');
        if ($user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Forbidden']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }
        $data = $request->getParsedBody();
        $pdo->prepare('INSERT INTO `audit_log` (admin_id, action, target_type, target_id, details) VALUES (?,?,?,?,?)')
            ->execute([
                (int)$user['id'],
                $data['action'] ?? 'Unknown Action',
                $data['target_type'] ?? '',
                isset($data['target_id']) ? (int)$data['target_id'] : null,
                $data['details'] ?? ''
            ]);
        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    })->add(new JwtAuthMiddleware());


    // ─── SEED (one-time demo data setup) ─────────────────
    $app->get('/api/seed', function($request, $response) use ($pdo) {
        $seeder = new \App\Data\SeedData($pdo);
        $result = $seeder->run();
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    });
};
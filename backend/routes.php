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
        $seeder = new \App\Data\SeedData($pdo);
        $result = $seeder->run();
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    });
};

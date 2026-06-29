<?php

namespace App\Controllers;

use App\Models\BookingModels;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class BookingController
{
    public function __construct(
        private BookingModels $bookingModel
    ) {}

    public function createBooking(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $user = $request->getAttribute('user');

        if (empty($data['tutor_id']) || empty($data['skill_id']) || empty($data['schedule_time'])) {
            $response->getBody()->write(json_encode(['error' => 'tutor_id, skill_id and schedule_time are required']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $bookingId = $this->bookingModel->create([
            'learner_id'    => $user['id'],
            'tutor_id'      => (int)$data['tutor_id'],
            'skill_id'      => (int)$data['skill_id'],
            'schedule_time' => $data['schedule_time'],
            'price'         => $data['price'] ?? 0,
            'status'        => 'pending',
        ]);

        $response->getBody()->write(json_encode([
            'message'    => 'Booking created',
            'booking_id' => $bookingId
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function getBookings(Request $request, Response $response): Response
    {
        $user   = $request->getAttribute('user');
        $params = $request->getQueryParams();
        $role   = $params['role'] ?? 'learner';

        $bookings = $this->bookingModel->findByUserId((int)$user['id'], $role);

        $response->getBody()->write(json_encode($bookings));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateStatus(Request $request, Response $response, array $args): Response
    {
        $data   = $request->getParsedBody();
        $status = $data['status'] ?? '';

        $allowed = ['pending', 'accepted', 'declined', 'completed'];
        if (!in_array($status, $allowed)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid status']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $updated = $this->bookingModel->updateStatus((int)$args['id'], $status);

        $response->getBody()->write(json_encode(['success' => $updated]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function cancelBooking(Request $request, Response $response, array $args): Response
    {
        $deleted = $this->bookingModel->delete((int)$args['id']);

        $response->getBody()->write(json_encode(['success' => $deleted]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}

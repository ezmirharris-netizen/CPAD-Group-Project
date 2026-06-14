<?php

namespace App\Controllers;

use App\Models\BookingModel;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class BookingController
{
    public function __construct(
        private BookingModel $bookingModel
    ) {}

    public function createBooking(
        Request $request,
        Response $response
    ) {
        $data = $request->getParsedBody();

        $bookingId =
            $this->bookingModel->create($data);

        $response->getBody()->write(
            json_encode([
                'message' => 'Booking created',
                'booking_id' => $bookingId
            ])
        );

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            )
            ->withStatus(201);
    }

    public function getBookings(
        Request $request,
        Response $response
    ) {
        $user = $request->getAttribute('user');

        $role =
            $request->getQueryParams()['role']
            ?? 'learner';

        $bookings =
            $this->bookingModel->findById(
                $user['id'],
                $role
            );

        $response->getBody()->write(
            json_encode($bookings)
        );

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            );
    }

    public function cancelBooking(
        Request $request,
        Response $response,
        array $args
    ) {
        $deleted =
            $this->bookingModel->delete(
                (int)$args['id']
            );

        $response->getBody()->write(
            json_encode([
                'success' => $deleted
            ])
        );

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            );
    }
}
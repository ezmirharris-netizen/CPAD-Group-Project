<?php

namespace App\Controllers;

use App\Models\ReviewModels;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ReviewController
{
    public function __construct(
        private ReviewModels $reviewModel
    ) {}

    public function createReview(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        if (empty($data['booking_id']) || empty($data['rating'])) {
            $response->getBody()->write(json_encode(['error' => 'booking_id and rating are required']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $reviewId = $this->reviewModel->create([
            'booking_id' => (int)$data['booking_id'],
            'rating'     => (int)$data['rating'],
            'comment'    => $data['comment'] ?? '',
        ]);

        $response->getBody()->write(json_encode([
            'message'   => 'Review submitted',
            'review_id' => $reviewId
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function getTutorReviews(Request $request, Response $response, array $args): Response
    {
        $reviews = $this->reviewModel->findByTutor((int)$args['id']);

        $response->getBody()->write(json_encode($reviews));
        return $response->withHeader('Content-Type', 'application/json');
    }
}

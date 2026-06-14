<?php

namespace App\Controllers;

use App\Models\ReviewModel;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ReviewController
{
    public function __construct(
        private ReviewModel $reviewModel
    ) {}

    public function createReview(
        Request $request,
        Response $response
    ) {
        $data = $request->getParsedBody();

        $reviewId =
            $this->reviewModel->create($data);

        $response->getBody()->write(
            json_encode([
                'message' => 'Review submitted',
                'review_id' => $reviewId
            ])
        );

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            )
            ->withStatus(201);
    }

    public function getTutorReviews(
        Request $request,
        Response $response,
        array $args
    ) {
        $reviews =
            $this->reviewModel->findByTutor(
                (int)$args['id']
            );

        $response->getBody()->write(
            json_encode($reviews)
        );

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            );
    }
}
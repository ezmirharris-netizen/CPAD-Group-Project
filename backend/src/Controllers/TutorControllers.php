<?php

namespace App\Controllers;

use App\Models\SkillModel;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TutorController
{
    public function __construct(
        private SkillModel $skillModel
    ) {}

    public function getAllTutors(
        Request $request,
        Response $response
    ) {
        $skills = $this->skillModel->all();

        $response->getBody()->write(
            json_encode($skills)
        );

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            );
    }

    public function searchTutor(
        Request $request,
        Response $response
    ) {
        $params = $request->getQueryParams();

        $keyword = $params['keyword'] ?? '';

        $skills = $this->skillModel->search(
            $keyword
        );

        $response->getBody()->write(
            json_encode($skills)
        );

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            );
    }
}
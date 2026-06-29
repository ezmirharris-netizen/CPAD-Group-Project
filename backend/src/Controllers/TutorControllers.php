<?php

namespace App\Controllers;

use App\Models\UserModels;
use App\Models\SkillModels;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TutorController
{
    public function __construct(
        private UserModels $userModel,
        private SkillModels $skillModel
    ) {}

    public function getAllTutors(Request $request, Response $response): Response
    {
        $tutors = $this->userModel->getAllTutors();

        $response->getBody()->write(json_encode($tutors));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function searchTutor(Request $request, Response $response): Response
    {
        $params  = $request->getQueryParams();
        $keyword = $params['keyword'] ?? '';
        $faculty = $params['faculty'] ?? '';

        $tutors = $this->userModel->getAllTutors($keyword, $faculty);

        $response->getBody()->write(json_encode($tutors));
        return $response->withHeader('Content-Type', 'application/json');
    }
}

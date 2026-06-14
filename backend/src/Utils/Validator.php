<?php

namespace App\Utils;

use Respect\Validation\Validator as v;

class Validator
{
    public static function validateRegistration(
        array $data
    ): array {
        $errors = [];

        if (
            !v::email()->validate(
                $data['email'] ?? ''
            )
        ) {
            $errors['email'] =
                'Invalid email address';
        }

        if (
            !v::length(6, null)
            ->validate(
                $data['password'] ?? ''
            )
        ) {
            $errors['password'] =
                'Password must be at least 6 characters';
        }

        if (
            !v::stringType()
            ->length(2, 100)
            ->validate(
                $data['name'] ?? ''
            )
        ) {
            $errors['name'] =
                'Invalid name';
        }

        return $errors;
    }

    public static function validateBooking(
        array $data
    ): array {
        $errors = [];

        if (
            empty($data['tutor_id'])
        ) {
            $errors['tutor_id'] =
                'Tutor required';
        }

        if (
            empty($data['skill_id'])
        ) {
            $errors['skill_id'] =
                'Skill required';
        }

        if (
            empty($data['schedule_time'])
        ) {
            $errors['schedule_time'] =
                'Schedule required';
        }

        return $errors;
    }
}
<?php

namespace App\Utils;

class Sanitizer
{
    public static function cleanString(
        ?string $value
    ): string {
        return htmlspecialchars(
            trim($value ?? ''),
            ENT_QUOTES,
            'UTF-8'
        );
    }

    public static function cleanArray(
        array $data
    ): array {
        $cleaned = [];

        foreach (
            $data as $key => $value
        ) {
            if (is_string($value)) {
                $cleaned[$key] =
                    self::cleanString(
                        $value
                    );
            } else {
                $cleaned[$key] =
                    $value;
            }
        }

        return $cleaned;
    }
}